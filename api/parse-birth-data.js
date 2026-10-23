const MODEL = "gemini-3.1-flash-lite";

function normalizeTimeStr(raw) {
  if (typeof raw !== "string") return null;
  const match = raw.trim().match(/^(\d{1,2})\s*[:hH]\s*(\d{1,2})?$/);
  if (!match) return null;
  const hh = Number(match[1]);
  const mm = match[2] !== undefined ? Number(match[2]) : 0;
  if (hh < 0 || hh > 23 || mm < 0 || mm > 59) return null;
  return `${String(hh).padStart(2, "0")}:${String(mm).padStart(2, "0")}`;
}

module.exports = async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
  res.setHeader("Pragma", "no-cache");
  res.setHeader("Expires", "0");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Chỉ hỗ trợ phương thức POST." });
  }

  try {
    const body = typeof req.body === "string" ? JSON.parse(req.body || "{}") : (req.body || {});
    const rawText = typeof body.rawText === "string" ? body.rawText.trim() : "";
    let imageBase64 = typeof body.imageBase64 === "string" ? body.imageBase64.trim() : "";
    const mimeType = typeof body.mimeType === "string" && body.mimeType.startsWith("image/")
      ? body.mimeType
      : "image/jpeg";

    if (imageBase64.includes(",")) {
      imageBase64 = imageBase64.split(",")[1].trim();
    }

    if (!rawText && !imageBase64) {
      return res.status(400).json({
        error: "Vui lòng nhập văn bản hoặc tải lên / dán hình ảnh lá số.",
      });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({
        error: "Hệ thống chưa được cấu hình GEMINI_API_KEY.",
      });
    }

    const systemPrompt = `Bạn là trợ lý chuyên bóc tách thông tin lập lá số Tử Vi và Bát Tự từ văn bản thô tiếng Việt hoặc hình ảnh lá số (như ảnh lá số từ tuvivietnam.vn, lyso.vn, tuvi.vn, nguhanh.net, luchao.io.vn, hoặc ảnh chụp thông tin ngày sinh).
Nhiệm vụ của bạn là đọc kỹ văn bản và/hoặc hình ảnh được cung cấp và trích xuất chính xác các trường dữ liệu sau:

- fullName: Tên đương số (chuỗi ký tự, lấy tại mục "Họ tên" hoặc "Họ và tên" nếu là ảnh lá số; nếu không tìm thấy thì để "Đương số").
- gender: Giới tính "Nam" hoặc "Nữ":
  * Nếu ảnh ghi "Dương Nữ", "Âm Nữ", "Nữ" hoặc văn bản có từ chị, bà, nữ, gái, cô, em gái... -> "Nữ".
  * Nếu ảnh ghi "Dương Nam", "Âm Nam", "Nam" hoặc văn bản có từ anh, ông, nam, chú, trai, em trai... -> "Nam".
  * Nếu không rõ mặc định "Nam".
- calendarType: "solar" hoặc "lunar":
  * QUY TẮC QUAN TRỌNG KHI ĐỌC ẢNH LÁ SỐ TỬ VI / BÁT TỰ:
    - Ở phần Thiên Bàn (ô trung tâm của lá số Tử Vi như tuvivietnam.vn, luchao.io.vn...), các dòng Năm / Tháng / Ngày thường ghi dạng:
      Năm: 1994 Giáp Tuất
      Tháng: 6 (5) Canh Ngọ
      Ngày: 16 (8) Quý Dậu
      Trong cách ghi "ngoài ngoặc (trong ngoặc)" này: SỐ BÊN NGOÀI NGOẶC là DƯƠNG LỊCH (Tháng 6, Ngày 16), còn SỐ TRONG NGOẶC ĐƠN là ÂM LỊCH (Tháng 5, Ngày 8).
    - Khi ảnh lá số hiển thị cả Dương lịch và Âm lịch (dạng "6 (5)", "16 (8)" hoặc có dòng "Dương lịch:" riêng), BẮT BUỘC đặt calendarType = "solar" và trích xuất ngày, tháng, năm theo DƯƠNG LỊCH (số bên ngoài ngoặc).
  * Đối với văn bản thô: nếu có nhắc đến âm, âm lịch, al... (mà không có ngày dương lịch tương ứng) thì là "lunar"; nếu ghi dương, dương lịch, dl hoặc không ghi gì thì mặc định "solar".
- birthDay: số ngày sinh (số nguyên từ 1 đến 31).
- birthMonth: số tháng sinh (số nguyên từ 1 đến 12).
- birthYear: số năm sinh (số nguyên 4 chữ số, ví dụ 85 -> 1985, 94 -> 1994, 03 -> 2003, 1994 -> 1994).
- birthTime: giờ sinh chuẩn 24h định dạng "HH:mm" (luôn đủ 2 chữ số giờ và 2 chữ số phút, ví dụ: "05:02", "23:30", "09:15", "15:45"):
  * Nếu trên ảnh lá số ghi "Giờ: 5 : 2" hoặc "5:2" hoặc "5 giờ 2 phút" -> chuẩn hóa thành "05:02".
  * Nếu ghi buổi sáng/chiều/tối/đêm thì quy đổi đúng chuẩn 24h (ví dụ: "9h tối" -> "21:00", "11 rưỡi đêm" -> "23:30", "2h chiều" -> "14:00").
  * Nếu chỉ nhắc tới giờ 12 con giáp (Địa Chi) mà không có số giờ phút cụ thể:
    - giờ Tý -> "00:00" (nếu ghi Tý đêm / 11h-12h đêm thì "23:30")
    - giờ Sửu -> "02:00"
    - giờ Dần -> "04:00"
    - giờ Mão -> "06:00"
    - giờ Thìn -> "08:00"
    - giờ Tị / Tỵ -> "10:00"
    - giờ Ngọ -> "12:00"
    - giờ Mùi -> "14:00"
    - giờ Thân -> "16:00"
    - giờ Dậu -> "18:00"
    - giờ Tuất -> "20:00"
    - giờ Hợi -> "22:00"
  * Nếu hoàn toàn không nhắc tới giờ sinh, mặc định "00:00".
- isLeapMonth: boolean (true nếu đang dùng calendarType = "lunar" và là tháng nhuận âm lịch, ngược lại false).
- timeZone: số nguyên đại diện cho múi giờ nơi sinh (mặc định 7).
  * Quy tắc suy luận múi giờ theo địa điểm sinh:
    - Hàn Quốc, Nhật Bản, Seoul, Tokyo -> 9
    - Đài Loan, Trung Quốc, Singapore, Malaysia, Hong Kong -> 8
    - Mỹ Tây (California, Cali, Los Angeles, San Francisco, Seattle, Washington state...) -> -8
    - Mỹ Đông (New York, Washington DC, Florida, Miami, Boston, Atlanta...) -> -5
    - Mỹ Trung (Texas, Chicago, Houston, Dallas...) -> -6
    - Mỹ Núi (Denver, Arizona, Colorado...) -> -7
    - Úc (Sydney, Melbourne, Brisbane...) -> 10
    - Châu Âu (Đức, Pháp, Ý, Ba Lan, Berlin, Paris...) -> 1
    - Anh (London, UK, UTC 0) -> 0
    - Việt Nam hoặc hoàn toàn không nhắc đến địa danh nơi sinh -> 7
- provinceId: ID tỉnh thành Việt Nam nơi sinh nếu có nhắc đến (dùng chữ thường gạch nối không dấu, ví dụ: "ha-noi", "ho-chi-minh", "da-nang", "khanh-hoa", "hai-phong", "nghe-an", "thanh-hoa", "can-tho", "quang-ninh", "lam-dong"... Nếu sinh ở nước ngoài hoặc không nhắc rõ tỉnh thành thì để chuỗi rỗng "").
- calcYear: số năm xem hạn (số nguyên 4 chữ số) nếu trong ảnh hoặc văn bản có mục "Năm xem", "Năm xem hạn", "Thời gian xem hạn" (ví dụ ảnh ghi "Năm xem: 10/2026" hoặc "Năm xem: 2026" -> 2026). Nếu không có thì để null.
- calcMonth: số tháng xem hạn (số nguyên từ 1 đến 12) nếu có ghi tháng xem hạn (ví dụ "Năm xem: 10/2026" -> 10). Nếu không có thì để null.
- calcDay: số ngày xem hạn (số nguyên từ 1 đến 31) nếu có ghi ngày xem hạn cụ thể. Nếu không có thì để null.

Trả về duy nhất định dạng JSON theo đúng cấu trúc trên.`;

    const userParts = [];
    if (imageBase64) {
      userParts.push({
        inline_data: {
          mime_type: mimeType,
          data: imageBase64,
        },
      });
    }
    if (rawText) {
      userParts.push({ text: rawText });
    } else {
      userParts.push({
        text: "Hãy đọc hình ảnh này và bóc tách chính xác thông tin ngày tháng năm sinh, giờ sinh, giới tính, họ tên, năm xem hạn (nếu có) theo đúng cấu trúc JSON yêu cầu.",
      });
    }

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          system_instruction: {
            parts: [{ text: systemPrompt }],
          },
          contents: [
            {
              parts: userParts,
            },
          ],
          generationConfig: {
            response_mime_type: "application/json",
            temperature: 0.1,
          },
        }),
      }
    );

    if (!response.ok) {
      const errText = await response.text();
      console.error("Gemini API Error:", errText);
      return res.status(502).json({
        error: "Lỗi kết nối tới Gemini API để bóc tách dữ liệu.",
      });
    }

    const data = await response.json();
    const candidateText = data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!candidateText) {
      return res.status(422).json({
        error: "AI không trích xuất được thông tin hợp lệ.",
      });
    }

    const parsed = JSON.parse(candidateText);
    if (parsed && parsed.birthTime) {
      const normTime = normalizeTimeStr(parsed.birthTime);
      if (normTime) parsed.birthTime = normTime;
    }

    return res.status(200).json({ success: true, data: parsed });
  } catch (error) {
    console.error("API Route Error:", error);
    return res.status(500).json({
      error: "Có lỗi xảy ra trong quá trình xử lý dữ liệu.",
    });
  }
};
