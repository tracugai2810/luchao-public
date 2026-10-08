/**
 * ============================================================
 * Huyền Không Phi Tinh - Phong Thủy Rules Engine & Luận Giải
 * ============================================================
 */
(function() {
  'use strict';

  /**
   * Phân tích Tinh Bàn theo toàn bộ bộ quy tắc phong thủy nhà ở
   * @param {Object} chartResult - Kết quả từ FlyingStar.calculateChart()
   * @returns {Object} Dữ liệu phân tích chi tiết cho 6 không gian và 9 cung
   */
  function analyzeFengShui(chartResult) {
    if (!chartResult || !chartResult.palaces) return null;

    const vanTrach = chartResult.van || 9;
    const palaces = chartResult.palaces;
    const isKiem = chartResult.chartType === 'THE_QUAI' || chartResult.chartType === 'kiem';
    const isKhongVong = chartResult.isKhongVong || chartResult.chartType === 'DAI_KHONG_VONG' || chartResult.chartType === 'TIEU_KHONG_VONG' || chartResult.chartType === 'KHONG_VONG';
    const khongVongInfo = chartResult.khongVongInfo || null;
    const facingDegree = chartResult.facingDegree || 0;

    const phanPhucNgam = chartResult.phanPhucNgam || (window.FlyingStar && window.FlyingStar.analyzePhanPhucNgam ? window.FlyingStar.analyzePhanPhucNgam(palaces, vanTrach) : null);
    const nhapTu = chartResult.nhapTu || (window.FlyingStar && window.FlyingStar.analyzeNhapTu ? window.FlyingStar.analyzeNhapTu(palaces, vanTrach) : null);
    const hopThap = chartResult.hopThap || (window.FlyingStar && window.FlyingStar.analyzeHopThap ? window.FlyingStar.analyzeHopThap(palaces) : null);
    const tamBanQuai = chartResult.tamBanQuai || (window.FlyingStar && window.FlyingStar.analyzeTamBanQuai ? window.FlyingStar.analyzeTamBanQuai(palaces) : null);
    const thatTinhDaKiep = chartResult.thatTinhDaKiep || (window.FlyingStar && window.FlyingStar.analyzeThatTinhDaKiep ? window.FlyingStar.analyzeThatTinhDaKiep(palaces, chartResult.facingMountain ? chartResult.facingMountain.palace : null, vanTrach) : null);

    // 1. Phân loại Cát - Hung của các Sao theo Vận Trạch hiện tại
    const saoVuongKhi = vanTrach;
    const saoSinhKhi_1 = (vanTrach % 9) + 1;
    const saoSinhKhi_2 = (saoSinhKhi_1 % 9) + 1;
    const saoCatTinh = [1, 6, 8, 9];
    const saoBaoSat = [2, 5]; // Nhị Hắc & Ngũ Hoàng luôn là hung sát

    // Các sao suy tử: không phải vượng/sinh và không thuộc cát tinh
    const saoSuyTu = [1, 2, 3, 4, 5, 6, 7, 8, 9].filter(
      s => s !== saoVuongKhi && s !== saoSinhKhi_1 && !saoCatTinh.includes(s)
    );

    // Kiểm tra Lệnh tinh nhập tù ở Trung Cung (Palace 5)
    const isHuongTinhNhapTu = nhapTu ? nhapTu.isHuongNhapTuCurrent : (palaces[5] && palaces[5].huong === vanTrach);
    const isSonTinhNhapTu = nhapTu ? nhapTu.isSonNhapTuCurrent : (palaces[5] && palaces[5].son === vanTrach);

    // Phân tích theo từng không gian chức năng
    const analysis = {
      meta: {
        vanTrach,
        saoVuongKhi,
        saoSinhKhi_1,
        saoSinhKhi_2,
        saoBaoSat,
        saoCatTinh,
        saoSuyTu,
        isKiem,
        isKhongVong,
        khongVongInfo,
        phanPhucNgam,
        nhapTu,
        hopThap,
        tamBanQuai,
        thatTinhDaKiep,
        facingDegree,
        isHuongTinhNhapTu,
        isSonTinhNhapTu
      },
      doors: [],       // 1. Cửa chính (Đại Môn)
      livingRooms: [], // 2. Phòng khách
      balconies: [],   // 3. Ban công / Cửa sổ lớn
      bedrooms: [],    // 4. Phòng ngủ & Giường
      kitchens: [],    // 5. Nhà bếp
      stairs: [],      // 6. Cầu thang & Giếng trời
      toilets: [],     // 7. Nhà vệ sinh & Bể phốt
      studies: [],     // 8. Bàn học (Văn Xương)
      altars: [],      // 8. Bàn thờ (Thần Vị)
      palaceSummaries: {} // Tóm tắt 9 cung
    };

    // Duyệt qua 8 cung hướng (1-4, 6-9) và Trung Cung (5)
    for (let p = 1; p <= 9; p++) {
      const pal = palaces[p];
      if (!pal) continue;

      const son = pal.son;
      const huong = pal.huong;
      const van = pal.van;
      const name = pal.palaceName;
      const dir = pal.palaceDirection;
      const isCenter = (p === 5);

      // --- CÁC ĐẶC TÍNH NÂNG CAO CỦA CUNG p ---
      const isSonPhuc = (son === p);
      const isSonPhan = (son + p === 10);
      const isSonPhanPhuc = (isSonPhuc || isSonPhan);
      const isSonPhanPhucVuong = (isSonPhanPhuc && son === saoVuongKhi);

      const isHuongPhuc = (huong === p);
      const isHuongPhan = (huong + p === 10);
      const isHuongPhanPhuc = (isHuongPhuc || isHuongPhan);
      const isHuongPhanPhucVuong = (isHuongPhanPhuc && huong === saoVuongKhi);

      const isDaKiepPalace = thatTinhDaKiep && thatTinhDaKiep.hasThatTinhDaKiep &&
        thatTinhDaKiep.linkedPalaces && thatTinhDaKiep.linkedPalaces.some(lp => lp.palace === p);

      const hasToanBanHopThap = hopThap && hopThap.hasHopThap;
      const isSonHuongHT = hopThap && hopThap.isSonHuongHopThap;
      const isSonVanHT = hopThap && hopThap.isSonVanHopThap;
      const isHuongVanHT = hopThap && hopThap.isHuongVanHopThap;
      const isFacingPalace = (chartResult.facingMountain && chartResult.facingMountain.palace === p);

      // --- 1. CỬA CHÍNH (ĐẠI MÔN / KHÍ KHẨU CHÍNH) ---
      if (!isCenter) {
        let doorRating = 'Bình';
        let doorScore = 50;
        let doorDesc = '';
        let doorBadges = [];

        if (huong === saoVuongKhi) {
          doorRating = 'Xuất Sắc';
          doorScore = 100;
          doorDesc = `Hướng tinh nạp <strong>Vượng Khí (${huong})</strong> của Vận ${vanTrach}. Cực kỳ đắc tài đắc lộc, gia đạo hưng thịnh, kinh doanh đại phát.`;
          doorBadges.push({ text: 'Ưu tiên số 1', type: 'success' });
        } else if (huong === saoSinhKhi_1) {
          doorRating = 'Tốt';
          doorScore = 85;
          doorDesc = `Hướng tinh nạp <strong>Sinh Khí (${huong})</strong> kế cận. Tài vận tăng tiến bền vững, phát triển lâu dài.`;
          doorBadges.push({ text: 'Ưu tiên số 2', type: 'primary' });
        } else if (saoBaoSat.includes(huong)) {
          doorRating = 'Đại Kỵ';
          doorScore = 10;
          doorDesc = `Hướng tinh phạm <strong>${huong === 2 ? 'Nhị Hắc Bệnh Phù (2)' : 'Ngũ Hoàng Đại Sát (5)'}</strong>. Khí khẩu nạp sát khí nặng, gia chủ dễ đau ốm, hao tài, tai họa. Cần hóa giải bằng chuông gió đồng 6 ống hoặc hồ lô đồng.`;
          doorBadges.push({ text: 'Tránh mở cửa', type: 'danger' });
        } else if (saoCatTinh.includes(huong)) {
          doorRating = 'Cát';
          doorScore = 75;
          doorDesc = `Hướng tinh cát lành (${huong}). Nạp sinh khí tốt cho tài lộc và gia đạo.`;
          doorBadges.push({ text: 'Khá tốt', type: 'success' });
        } else {
          doorRating = 'Bình';
          doorScore = 50;
          doorDesc = `Hướng tinh (${huong}) đã suy thoái khí. Nạp khí bình thường, cần giữ cửa luôn sáng sủa, thông thoáng.`;
        }

        // Tác động Phản / Phục Ngâm Hướng
        if (isHuongPhanPhuc) {
          if (isHuongPhanPhucVuong) {
            doorDesc += ` <span class="rule-good-inline">🌟 Hướng tinh đắc Vượng Khí Vận ${vanTrach} (${isHuongPhan ? 'Phản' : 'Phục'} Ngâm đắc cách): Nếu trước mặt có Minh Đường rộng thoáng, hồ nước hoặc ngã ba ngã tư sẽ cát hóa hung, đại phát tài lộc.</span>`;
            doorBadges.unshift({ text: 'Vượng Tinh Đắc Cách', type: 'success' });
          } else {
            doorScore -= 40;
            doorRating = (doorScore <= 20) ? `Đại Kỵ (Phạm ${isHuongPhan ? 'Phản' : 'Phục'} Ngâm)` : `Cần Hóa Giải (Phạm ${isHuongPhan ? 'Phản' : 'Phục'} Ngâm)`;
            doorDesc += ` <span class="rule-warn-inline">⚠️ Hướng Tinh (${huong}) phạm ${isHuongPhan ? 'Phản' : 'Phục'} Ngâm: Khí khẩu nạp tài đối xung với Địa bàn Lạc Thư, dễ hao tổn tiền của, kinh doanh bế tắc. Bắt buộc đặt vật phẩm Ngũ Hành thông quan để hóa giải.</span>`;
            doorBadges.unshift({ text: `Phạm ${isHuongPhan ? 'Phản' : 'Phục'} Ngâm`, type: 'danger' });
          }
        }

        // Tác động Thất Tinh Đả Kiếp
        if (isDaKiepPalace) {
          doorScore = Math.max(doorScore, 98);
          doorRating = 'Đại Cát (Khí Khẩu Đả Kiếp)';
          doorDesc = `⭐ <strong>Cung Khí Khẩu Đả Kiếp (${thatTinhDaKiep.label}):</strong> ` + doorDesc + ` Rất tốt để mở đại môn nạp khí thiên cơ của tương lai!`;
          doorBadges.unshift({ text: 'Khí Khẩu Đả Kiếp', type: 'success' });
        }

        // Tác động Hợp Thập
        if (isHuongVanHT || isSonHuongHT) {
          doorDesc += ` <span class="rule-good-inline">✨ Đắc Toàn Bàn Hợp Thập cứu giải thông khí thiên địa.</span>`;
          if (doorScore < 70) {
            doorScore += 15;
            if (doorRating === 'Bình') doorRating = 'Cát (Được Hợp Thập Cứu)';
          }
        }

        if (isKiem) {
          doorDesc += ` <span class="rule-warn-inline">⚠️ Nhà kiêm hướng: Cửa chính dễ bị tạp khí, cần an vị cửa chuẩn độ số chính hướng.</span>`;
          doorScore -= 15;
        }

        if (isFacingPalace && isKhongVong && khongVongInfo) {
          doorDesc += ` <span class="rule-warn-inline">🚨 Hướng cửa đè tuyến ${khongVongInfo.label}: Bắt buộc xoay lệch khuôn cửa 2° - 3° về phía Chính Sơn thuần khí để tránh đại hung.</span>`;
          doorBadges.unshift({ text: `Phạm ${khongVongInfo.label}`, type: 'danger' });
        }

        if (isFacingPalace && isHuongTinhNhapTu) {
          doorDesc += ` <span class="rule-warn-inline">💡 Trạch bàn bị Tài Tù trong Vận ${vanTrach}: Trước cửa chính cần có Minh Đường rộng, tụ thủy để "Hướng thượng hữu thủy, tù bất trụ" giải phóng tài lộc.</span>`;
        }

        analysis.doors.push({
          palace: p, name, dir, son, huong, van,
          rating: doorRating, score: doorScore, desc: doorDesc, badges: doorBadges
        });
      }

      // --- 2. PHÒNG KHÁCH (KHÔNG GIAN ĐỘNG / SINH HOẠT CHUNG) ---
      if (!isCenter) {
        let lrRating = 'Bình';
        let lrScore = 50;
        let lrDesc = '';
        let lrBadges = [];

        const has25Combination = (son === 2 && huong === 5) || (son === 5 && huong === 2);

        if (has25Combination) {
          lrRating = 'Đại Kỵ';
          lrScore = 10;
          lrDesc = `Cung vị phạm tổ hợp <strong>Nhị Hắc - Ngũ Hoàng [2-5]</strong> cực độc. Bố trí phòng khách tại đây sẽ kích hoạt sát khí khi cả nhà tụ họp, gây tranh chấp, bất hòa, đau ốm triền miên.`;
          lrBadges.push({ text: 'Tránh đặt', type: 'danger' });
        } else if (huong === saoVuongKhi) {
          lrRating = 'Xuất Sắc';
          lrScore = 100;
          lrDesc = `Hướng tinh nạp <strong>Vượng Khí (${huong})</strong> của Vận ${vanTrach}. Không gian phòng khách động khí sẽ kích hoạt tài lộc tối đa, thu hút quý nhân và khách quý.`;
          lrBadges.push({ text: 'Đắc tài lộc', type: 'success' });
        } else if (huong === saoSinhKhi_1) {
          lrRating = 'Tốt';
          lrScore = 85;
          lrDesc = `Hướng tinh nạp <strong>Sinh Khí (${huong})</strong>. Phòng khách sinh khí dồi dào, gia đình vui vẻ, sự nghiệp phát triển.`;
          lrBadges.push({ text: 'Nên đặt', type: 'primary' });
        } else if (saoBaoSat.includes(huong)) {
          lrRating = 'Xấu (Phạm Sát Tinh)';
          lrScore = 25;
          lrDesc = `Hướng tinh phạm ${huong === 2 ? 'Nhị Hắc (2)' : 'Ngũ Hoàng (5)'}. Cần đặt vật phẩm hành Kim (hồ lô đồng, đèn đồng) để hóa giải sát khí.`;
          lrBadges.push({ text: 'Cần hóa giải', type: 'danger' });
        } else if (saoCatTinh.includes(huong)) {
          lrRating = 'Cát';
          lrScore = 75;
          lrDesc = `Hướng tinh cát lành (${huong}). Phù hợp bố trí phòng khách sáng sủa, ấm cúng.`;
          lrBadges.push({ text: 'Tốt', type: 'success' });
        } else {
          lrRating = 'Bình';
          lrScore = 50;
          lrDesc = `Hướng tinh (${huong}) thoái khí. Bố trí phòng khách cần tăng cường ánh sáng tự nhiên và cây xanh hợp mệnh.`;
        }

        // Tác động Phản / Phục Ngâm Hướng
        if (isHuongPhanPhuc && !isHuongPhanPhucVuong) {
          lrScore -= 35;
          lrRating = (lrScore <= 25) ? `Xấu (Phạm ${isHuongPhan ? 'Phản' : 'Phục'} Ngâm)` : `Cần Hóa Giải (Phạm ${isHuongPhan ? 'Phản' : 'Phục'} Ngâm)`;
          lrDesc += ` <span class="rule-warn-inline">⚠️ Hướng Tinh (${huong}) phạm ${isHuongPhan ? 'Phản' : 'Phục'} Ngâm: Không gian động dễ kích động sát khí tài chính, cần đặt vật phẩm thông quan chuyển hóa.</span>`;
          lrBadges.unshift({ text: `Phạm ${isHuongPhan ? 'Phản' : 'Phục'} Ngâm`, type: 'warning' });
        }

        // Tác động Đả Kiếp
        if (isDaKiepPalace) {
          lrScore = Math.max(lrScore, 95);
          lrRating = 'Xuất Sắc (Cung Đả Kiếp)';
          lrDesc = `⭐ <strong>Thuộc Tam Giác Khí Đả Kiếp:</strong> ` + lrDesc;
          lrBadges.unshift({ text: 'Cung Đả Kiếp', type: 'success' });
        }

        // Tác động Hợp Thập
        if (isHuongVanHT || isSonHuongHT) {
          lrDesc += ` <span class="rule-good-inline">✨ Được Hợp Thập toàn bàn thông khí che chở.</span>`;
        }

        analysis.livingRooms.push({
          palace: p, name, dir, son, huong, van,
          rating: lrRating, score: lrScore, desc: lrDesc, badges: lrBadges
        });
      }

      // --- 3. BAN CÔNG / CỬA SỔ LỚN (KHÍ KHẨU PHỤ / VIEW CHÍNH) ---
      if (!isCenter) {
        let balRating = 'Bình';
        let balScore = 50;
        let balDesc = '';
        let balBadges = [];

        if (huong === saoVuongKhi) {
          balRating = 'Xuất Sắc';
          balScore = 100;
          balDesc = `Đón trọn <strong>Vượng Khí (${huong})</strong> của Vận ${vanTrach}. Ban công/cửa sổ lớn mở tại đây sẽ đón nắng, gió và tài lộc cực vượng vào nhà (đặc biệt quan trọng với chung cư, nhà phố).`;
          balBadges.push({ text: 'Đón đại tài', type: 'success' });
        } else if (huong === saoSinhKhi_1) {
          balRating = 'Tốt';
          balScore = 85;
          balDesc = `Đón <strong>Sinh Khí (${huong})</strong> cát lành. Không gian thoáng đãng, mang lại sinh khí tươi mới và sức sống bền vững.`;
          balBadges.push({ text: 'Rất tốt', type: 'primary' });
        } else if (saoBaoSat.includes(huong)) {
          balRating = 'Đại Kỵ';
          balScore = 15;
          balDesc = `Phương vị có sát tinh <strong>${huong === 2 ? 'Nhị Hắc (2)' : 'Ngũ Hoàng (5)'}</strong>. Mở ban công lớn/cửa sổ tại đây dễ hút uế khí, sát khí vào nhà. Nên buông rèm hoặc treo chuông gió đồng 6 ống để hóa giải.`;
          balBadges.push({ text: 'Hút sát khí', type: 'danger' });
        } else if (saoCatTinh.includes(huong)) {
          balRating = 'Cát';
          balScore = 75;
          balDesc = `Đón cát tinh (${huong}). Ban công đón gió mát, vượng khí cho phòng sinh hoạt.`;
          balBadges.push({ text: 'Khá tốt', type: 'success' });
        } else {
          balRating = 'Bình';
          balScore = 50;
          balDesc = `Hướng tinh (${huong}) thoái khí. Mở cửa sổ đón sáng bình thường, nên trồng cây cảnh lọc khí.`;
        }

        // Tác động Phản / Phục Ngâm Hướng
        if (isHuongPhanPhuc && !isHuongPhanPhucVuong) {
          balScore -= 35;
          balRating = (balScore <= 25) ? `Hạn Chế (Phạm ${isHuongPhan ? 'Phản' : 'Phục'} Ngâm)` : `Cần Hóa Giải (Phạm ${isHuongPhan ? 'Phản' : 'Phục'} Ngâm)`;
          balDesc += ` <span class="rule-warn-inline">⚠️ Hướng Tinh (${huong}) phạm ${isHuongPhan ? 'Phản' : 'Phục'} Ngâm: Khí nạp qua ban công đối xung Lạc Thư, nên buông rèm hoặc đặt vật phẩm thông quan.</span>`;
          balBadges.unshift({ text: `Phạm ${isHuongPhan ? 'Phản' : 'Phục'} Ngâm`, type: 'warning' });
        }

        // Tác động Đả Kiếp
        if (isDaKiepPalace) {
          balScore = Math.max(balScore, 95);
          balRating = 'Đại Cát (Khí Khẩu Đả Kiếp)';
          balDesc = `⭐ <strong>Khí Khẩu Đả Kiếp (${thatTinhDaKiep.label}):</strong> Ban công/cửa sổ mở tại đây kết nối trục dẫn khí tương lai cực vượng!`;
          balBadges.unshift({ text: 'Khí Khẩu Đả Kiếp', type: 'success' });
        }

        // Tác động Hợp Thập
        if (isHuongVanHT || isSonHuongHT) {
          balDesc += ` <span class="rule-good-inline">✨ Được Toàn Bàn Hợp Thập cứu giải thông khí.</span>`;
        }

        analysis.balconies.push({
          palace: p, name, dir, son, huong, van,
          rating: balRating, score: balScore, desc: balDesc, badges: balBadges
        });
      }

      // --- 4. PHÒNG NGỦ & ĐẦU GIƯỜNG (CHỦ VỊ / SÀNG VỊ - TĨNH KHÍ) ---
      if (!isCenter) {
        let bedRating = 'Bình';
        let bedScore = 50;
        let bedDesc = '';
        let bedBadges = [];

        if (son === saoVuongKhi || son === saoSinhKhi_1) {
          bedRating = 'Rất Tốt';
          bedScore = 95;
          bedDesc = `Sơn tinh <strong>${son === saoVuongKhi ? 'Vượng Khí' : 'Sinh Khí'} (${son})</strong> chủ về nhân đinh, sức khỏe an khang, gia đạo hòa hợp, con cái hiếu thuận và vượng tài.`;
          bedBadges.push({ text: 'Đắc địa', type: 'success' });
        } else if (saoBaoSat.includes(son)) {
          bedRating = 'Rất Xấu';
          bedScore = 15;
          bedDesc = `Sơn tinh phạm <strong>${son === 2 ? 'Nhị Hắc Bệnh Phù (2)' : 'Ngũ Hoàng Sát (5)'}</strong>. Người ngủ tại cung này dễ ốm đau triền miên, mất ngủ, thần kinh căng thẳng. Cần đặt hồ lô đồng hóa giải.`;
          bedBadges.push({ text: 'Đại kỵ', type: 'danger' });
        } else if (saoCatTinh.includes(son)) {
          bedRating = 'Tốt';
          bedScore = 80;
          bedDesc = `Sơn tinh cát lành (${son}). Rất phù hợp bố trí phòng ngủ cho gia chủ và các thành viên.`;
          bedBadges.push({ text: 'Nên đặt', type: 'primary' });
        } else {
          bedRating = 'Bình';
          bedScore = 50;
          bedDesc = `Sơn tinh (${son}) thoái khí. Cần kê đầu giường tựa vào vách tường kiên cố, tránh gió lùa.`;
        }

        // Tác động Phản / Phục Ngâm Sơn
        if (isSonPhanPhuc && !isSonPhanPhucVuong) {
          bedScore -= 35;
          bedRating = (bedScore <= 25) ? `Rất Xấu (Phạm ${isSonPhan ? 'Phản' : 'Phục'} Ngâm Sơn)` : `Lưu Ý (Phạm ${isSonPhan ? 'Phản' : 'Phục'} Ngâm Sơn)`;
          bedDesc += ` <span class="rule-warn-inline">⚠️ Sơn Tinh (${son}) phạm ${isSonPhan ? 'Phản' : 'Phục'} Ngâm: Dễ gây bất an gia đạo, người nằm ngủ dễ đau ốm, thị phi. Cần giữ không gian tối tĩnh và đặt vật phẩm Ngũ Hành thông quan để hóa giải.</span>`;
          bedBadges.unshift({ text: `Phạm ${isSonPhan ? 'Phản' : 'Phục'} Ngâm`, type: 'warning' });
        }

        // Tác động Hợp Thập
        if (isSonVanHT || isSonHuongHT) {
          bedDesc += ` <span class="rule-good-inline">✨ Đắc Toàn Bàn Sơn Vận Hợp Thập: Sức khỏe, gia đạo được hòa hợp che chở.</span>`;
        }

        analysis.bedrooms.push({
          palace: p, name, dir, son, huong, van,
          rating: bedRating, score: bedScore, desc: bedDesc, badges: bedBadges
        });
      }

      // --- 5. NHÀ BẾP (TÁO VỊ - THUỘC HỎA) ---
      if (!isCenter) {
        let kitchenRating = 'Bình';
        let kitchenScore = 50;
        let kitchenDesc = '';
        let kitchenBadges = [];

        // Kiểm tra Hỏa thiêu thiên môn ở Cung Càn
        const isHoaThieuThienMon = (name === 'Càn') && (son === 9 || huong === 9 || van === 9);

        if (isHoaThieuThienMon) {
          kitchenRating = 'Đại Kỵ (Hỏa Thiêu Thiên Môn)';
          kitchenScore = 5;
          kitchenDesc = `Phạm thế <strong>"Hỏa thiêu thiên môn"</strong> (Hỏa của bếp nung đốt Kim cung Càn - Tây Bắc). Cực kỳ bất lợi cho sức khỏe người cha/trưởng nam (bệnh đầu, phổi, huyết áp) và cản trở sự nghiệp. Tuyệt đối không đặt bếp tại đây!`;
          kitchenBadges.push({ text: 'Cấm đặt', type: 'danger' });
        } else if (saoBaoSat.includes(son)) {
          kitchenRating = 'Đại Kỵ';
          kitchenScore = 15;
          kitchenDesc = `Sơn tinh tọa bếp phạm <strong>${son === 2 ? 'Nhị Hắc (2)' : 'Ngũ Hoàng (5)'}</strong>. Lửa bếp sẽ nung nấu kích hoạt sát khí bệnh tật phát tác dữ dội. Tránh đặt bếp!`;
          kitchenBadges.push({ text: 'Đại kỵ', type: 'danger' });
        } else if ([1, 3, 4, 8, 9].includes(son)) {
          kitchenRating = 'Tốt';
          kitchenScore = 85;
          kitchenDesc = `Sơn tinh (${son}) cát lành hỗ trợ nhân đinh, gia đình hòa thuận, vượng tài lộc ấm no.`;
          kitchenBadges.push({ text: 'Nên đặt', type: 'success' });
        } else {
          kitchenRating = 'Bình';
          kitchenScore = 50;
          kitchenDesc = `Sơn tinh (${son}) trung bình. Có thể đặt bếp nếu các cung tốt khác đã ưu tiên cho phòng ngủ.`;
        }

        // Tác động Phản / Phục Ngâm Sơn
        if (isSonPhanPhuc && !isSonPhanPhucVuong) {
          kitchenScore -= 20;
          if (kitchenRating === 'Tốt') kitchenRating = `Lưu Ý (Phạm ${isSonPhan ? 'Phản' : 'Phục'} Ngâm)`;
          kitchenDesc += ` <span class="rule-warn-inline">⚠️ Tọa vị bếp có Sơn Tinh phạm ${isSonPhan ? 'Phản' : 'Phục'} Ngâm: Cần giữ bếp luôn sạch sẽ, tránh động khí mạnh.</span>`;
          kitchenBadges.push({ text: `Phạm ${isSonPhan ? 'Phản' : 'Phục'} Ngâm`, type: 'warning' });
        }

        // Đánh giá hướng bếp (Hướng lưng người nấu nhìn về hướng tinh)
        let huongBepAdvice = '';
        if (huong === 1) {
          huongBepAdvice = `🌟 <strong>Hướng bếp cực cát:</strong> Quay lưng về hướng ${dir} (Hướng tinh 1 - Nhất Bạch Thủy) đạt thế <em>"Thủy Hỏa Ký Tế"</em> âm dương cân bằng hoàn hảo.`;
        } else if ([3, 4].includes(huong)) {
          huongBepAdvice = `🌿 <strong>Hướng bếp cát lành:</strong> Quay lưng về hướng ${dir} (Hướng tinh ${huong} - Mộc) được Mộc sinh Hỏa, bếp lửa ấm cúng, tài vận dồi dào.`;
        }

        analysis.kitchens.push({
          palace: p, name, dir, son, huong, van,
          rating: kitchenRating, score: kitchenScore, desc: kitchenDesc,
          huongAdvice: huongBepAdvice, badges: kitchenBadges
        });
      }

      // --- 6. CẦU THANG & GIẾNG TRỜI (ĐỘNG KHÍ LIÊN TẦNG & TRỤC DẪN KHÍ) ---
      let stairRating = 'Bình';
      let stairScore = 50;
      let stairDesc = '';
      let stairBadges = [];

      if (isCenter) {
        // Trung Cung
        const hasDauNguuSat = (son === 3 && huong === 2) || (son === 2 && huong === 3);
        const hasXuyenTamSat = (son === 3 && huong === 7) || (son === 7 && huong === 3);
        const has25Sat = (son === 2 && huong === 5) || (son === 5 && huong === 2);

        if (has25Sat || hasDauNguuSat || hasXuyenTamSat) {
          stairRating = 'Đại Kỵ';
          stairScore = 10;
          stairDesc = `Trung Cung phạm <strong>${has25Sat ? 'Nhị Hắc - Ngũ Hoàng [2-5]' : hasDauNguuSat ? 'Đấu Ngưu Sát [3-2]' : 'Xuyên Tâm Sát [3-7]'}</strong>. Đặt cầu thang/giếng trời ở giữa nhà sẽ tán phát sát khí, tranh chấp, bệnh tật lan tỏa đi khắp các tầng.`;
          stairBadges.push({ text: 'Đại kỵ', type: 'danger' });
        } else if (isHuongTinhNhapTu || isSonTinhNhapTu) {
          stairRating = 'Xuất Sắc (Động Khí Giải Tù)';
          stairScore = 100;
          stairDesc = `⭐ <strong>ĐỘNG KHÍ GIẢI TÙ QUYẾT:</strong> Trạch bàn đang bị Lệnh Tinh Nhập Tù (Vận ${vanTrach}). Đặt cầu thang thông tầng hoặc giếng trời lớn tại Trung Cung là phương án cứu tinh số 1 để đối lưu giải thoát vượng khí lan tỏa khắp nhà!`;
          stairBadges = [{ text: 'Động Khí Giải Tù', type: 'success' }, { text: 'Ưu tiên số 1', type: 'success' }];
        } else {
          stairRating = 'Lưu Ý';
          stairScore = 50;
          stairDesc = `Trung Cung nên giữ tĩnh và ổn định. Tránh đặt cầu thang xoắn ốc xuyên thẳng tim nhà làm phân tán khí lực.`;
        }
      } else {
        if (huong === saoVuongKhi || huong === saoSinhKhi_1) {
          stairRating = 'Rất Tốt';
          stairScore = 95;
          stairDesc = `Cầu thang/thông tầng động khí tại cung Hướng tinh sinh vượng <strong>(${huong})</strong> sẽ khuếch tán vượng khí tài lộc đi khắp các tầng trong nhà.`;
          stairBadges.push({ text: 'Đắc tài khí', type: 'success' });
        } else if (saoBaoSat.includes(huong)) {
          stairRating = 'Cực Hung';
          stairScore = 15;
          stairDesc = `Hướng tinh phạm sát tinh <strong>${huong === 2 ? 'Nhị Hắc (2)' : 'Ngũ Hoàng (5)'}</strong>. Cầu thang động khí sẽ phát tán sát khí bệnh tật, tai ách lan tỏa khắp các phòng. Tránh đặt cầu thang tại đây!`;
          stairBadges.push({ text: 'Cực hung', type: 'danger' });
        } else {
          stairRating = 'Bình';
          stairScore = 50;
          stairDesc = `Hướng tinh (${huong}) trung bình. Bố trí cầu thang gọn gàng, đón sáng tốt.`;
        }

        // Tác động Phản / Phục Ngâm Hướng
        if (isHuongPhanPhuc && !isHuongPhanPhucVuong) {
          stairScore = 15;
          stairRating = `Cực Hung (Phạm ${isHuongPhan ? 'Phản' : 'Phục'} Ngâm)`;
          stairDesc += ` <span class="rule-warn-inline">⚠️ Hướng Tinh phạm ${isHuongPhan ? 'Phản' : 'Phục'} Ngâm: Trục dẫn khí liên tầng sẽ phát tán sát khí bế tắc tài lộc đi khắp các tầng. Tuyệt đối tránh đặt cầu thang tại đây!</span>`;
          stairBadges.unshift({ text: `Phạm ${isHuongPhan ? 'Phản' : 'Phục'} Ngâm`, type: 'danger' });
        }

        // Tác động Đả Kiếp
        if (isDaKiepPalace) {
          stairScore = Math.max(stairScore, 95);
          stairRating = 'Đại Cát (Trục Dẫn Khí Đả Kiếp)';
          stairDesc = `⭐ <strong>Trục Dẫn Khí Đả Kiếp (${thatTinhDaKiep.label}):</strong> Cầu thang/thông tầng đặt tại đây sẽ luân chuyển liên tục dòng khí tương lai đi khắp nhà!`;
          stairBadges.unshift({ text: 'Khí Khẩu Đả Kiếp', type: 'success' });
        }
      }

      analysis.stairs.push({
        palace: p, name, dir, son, huong, van,
        rating: stairRating, score: stairScore, desc: stairDesc, badges: stairBadges
      });

      // --- 7. NHÀ VỆ SINH & BỂ PHỐT (UẾ KHÍ) ---
      let wcRating = 'Bình';
      let wcScore = 50;
      let wcDesc = '';
      let wcBadges = [];

      const isVanXuong = (son === 1 && huong === 4) || (son === 4 && huong === 1);

      if (isCenter) {
        wcRating = 'Cấm Tuyệt Đối';
        wcScore = 0;
        wcDesc = `<strong>Đại kỵ số 1 trong phong thủy:</strong> Nhà vệ sinh đặt tại Trung Cung (giữa nhà) làm ô uế tim nhà, phát tán xú khí khắp 8 cung, gây tổn hại nặng nề đến sức khỏe và tài vận của cả gia đình.`;
        wcBadges.push({ text: 'Tuyệt đối cấm', type: 'danger' });
      } else if (isDaKiepPalace) {
        wcRating = 'Cấm (Phạm Cung Đả Kiếp)';
        wcScore = 5;
        wcDesc = `⚠️ <strong>Cung thuộc Tam Giác Khí Thất Tinh Đả Kiếp:</strong> Cấm tuyệt đối đặt nhà vệ sinh hoặc bể phốt tại đây vì sẽ làm ô uế trục dẫn khí tương lai, phá vỡ toàn bộ thế trận Đả Kiếp!`;
        wcBadges.unshift({ text: 'Phá Thế Đả Kiếp', type: 'danger' });
      } else if (isVanXuong) {
        wcRating = 'Cấm (Ô Uế Văn Xương)';
        wcScore = 5;
        wcDesc = `Cung vị đắc tổ hợp <strong>Văn Xương cát khí [1-4]</strong>. Đặt WC tại đây sẽ làm ô uế cung học hành, thi cử, danh tiếng của con cái bị suy bại.`;
        wcBadges.push({ text: 'Cấm đặt', type: 'danger' });
      } else if (name === 'Càn') {
        wcRating = 'Không Khuyến Khích';
        wcScore = 30;
        wcDesc = `Cung Càn là Thiên Môn đại diện cho người cha và vận khí chủ nhà. Đặt WC tại Càn dễ gây tổn hại sức khỏe và tài vận người đàn ông trụ cột.`;
        wcBadges.push({ text: 'Hạn chế', type: 'warning' });
      } else if (name === 'Khôn') {
        wcRating = 'Không Khuyến Khích';
        wcScore = 30;
        wcDesc = `Cung Khôn đại diện cho người mẹ/phụ nữ trong nhà. Đặt WC tại Khôn dễ ảnh hưởng tiêu cực đến sức khỏe người phụ nữ.`;
        wcBadges.push({ text: 'Hạn chế', type: 'warning' });
      } else if (saoSuyTu.includes(son) && saoSuyTu.includes(huong)) {
        wcRating = 'Rất Tốt (Dĩ Độc Trị Độc)';
        wcScore = 95;
        wcDesc = `Sơn tinh (${son}) và Hướng tinh (${huong}) đều là sao suy tử/thoái khí. Đặt WC tại đây dùng nước thải cuốn trôi sát khí ra ngoài, <em>"Dĩ độc trị độc"</em> biến hung thành cát.`;
        wcBadges.push({ text: 'Rất hợp đặt', type: 'success' });
      } else if (saoBaoSat.includes(son) || saoBaoSat.includes(huong)) {
        wcRating = 'Tốt (Đè Nén Hung Tinh)';
        wcScore = 80;
        wcDesc = `Cung vị có sát tinh (${son === 2 || huong === 2 ? 'Nhị Hắc' : 'Ngũ Hoàng'}). Đặt WC tại đây để trấn áp, triệt tiêu hung khí của sát tinh.`;
        wcBadges.push({ text: 'Trấn sát', type: 'success' });
      } else {
        wcRating = 'Bình';
        wcScore = 50;
        wcDesc = `Cần giữ gìn nhà vệ sinh luôn khô ráo, sạch sẽ và có quạt hút gió đóng kín cửa.`;
      }

      analysis.toilets.push({
        palace: p, name, dir, son, huong, van,
        rating: wcRating, score: wcScore, desc: wcDesc, badges: wcBadges
      });

      // --- 8. PHÒNG HỌC, LÀM VIỆC & PHÒNG THỜ ---
      if (!isCenter) {
        // Phòng học / Bàn làm việc (Văn Xương)
        let studyRating = 'Bình';
        let studyScore = 50;
        let studyDesc = '';
        let studyBadges = [];

        if (isVanXuong) {
          studyRating = 'Văn Xương Đắc Vị';
          studyScore = 100;
          studyDesc = `Cung vị đắc tổ hợp <strong>Văn Xương [1-4]</strong> tuyệt hảo. Bố trí bàn học, bàn làm việc, tủ sách tại đây sẽ kích hoạt trí tuệ hanh thông, thi cử đỗ đạt, công danh thăng tiến rực rỡ.`;
          studyBadges.push({ text: 'Văn Xương Đắc Vị', type: 'success' });
        } else if ([1, 4].includes(son) || [1, 4].includes(huong)) {
          studyRating = 'Tốt';
          studyScore = 80;
          studyDesc = `Cung vị có sao Trí tuệ (${[1, 4].filter(s => s === son || s === huong).join(', ')}). Rất tốt cho việc học tập, làm việc tập trung và tư duy sáng tạo.`;
          studyBadges.push({ text: 'Cát lợi', type: 'primary' });
        } else if (son === 6 || huong === 6) {
          studyRating = 'Khá Tốt';
          studyScore = 75;
          studyDesc = `Cung vị có sao Lục Bạch Kim (6) chủ về công danh, kỷ luật và sự nghiệp.`;
          studyBadges.push({ text: 'Vượng công danh', type: 'primary' });
        } else if (saoBaoSat.includes(son) || saoBaoSat.includes(huong)) {
          studyRating = 'Không Tốt (Phạm Sát)';
          studyScore = 25;
          studyDesc = `Cung vị phạm sát tinh (${son === 2 || huong === 2 ? 'Nhị Hắc' : 'Ngũ Hoàng'}). Người ngồi học dễ mệt mỏi, phân tâm, thành tích giảm sút.`;
          studyBadges.push({ text: 'Tránh đặt', type: 'danger' });
        } else {
          studyRating = 'Bình';
          studyScore = 50;
          studyDesc = `Cung vị trung bình, có thể bố trí bàn học nếu các cung tốt hơn đã ưu tiên cho phòng ngủ.`;
        }

        // Tác động Phản / Phục Ngâm Sơn
        if (isSonPhanPhuc && !isSonPhanPhucVuong) {
          studyScore -= 25;
          if (studyRating === 'Tốt' || studyRating === 'Khá Tốt') studyRating = `Lưu Ý (Phạm ${isSonPhan ? 'Phản' : 'Phục'} Ngâm)`;
          studyDesc += ` <span class="rule-warn-inline">⚠️ Sơn Tinh phạm ${isSonPhan ? 'Phản' : 'Phục'} Ngâm gây phân tán tư tưởng, cần đặt tháp văn xương hoặc hồ lô hóa giải.</span>`;
          studyBadges.push({ text: `Phạm ${isSonPhan ? 'Phản' : 'Phục'} Ngâm`, type: 'warning' });
        }

        analysis.studies.push({
          palace: p, name, dir, son, huong, van,
          rating: studyRating, score: studyScore, desc: studyDesc, badges: studyBadges
        });

        // Phòng thờ (Cần thanh tịnh, tôn nghiêm)
        let altarRating = 'Bình';
        let altarScore = 50;
        let altarDesc = '';
        let altarBadges = [];

        if (son === saoVuongKhi) {
          altarRating = 'Xuất Sắc';
          altarScore = 95;
          altarDesc = `Sơn tinh <strong>Vượng Khí (${son})</strong>. Linh khí gia tiên che chở, phúc đức dồi dào, gia đạo an khang thịnh vượng.`;
          altarBadges.push({ text: 'Tối ưu nhất', type: 'success' });
        } else if (saoCatTinh.includes(son)) {
          altarRating = 'Tốt';
          altarScore = 80;
          altarDesc = `Sơn tinh cát lành (${son}) mang lại năng lượng thanh tịnh, tôn nghiêm và êm ấm cho gia đình.`;
          altarBadges.push({ text: 'Thanh tịnh', type: 'primary' });
        } else if (saoBaoSat.includes(son)) {
          altarRating = 'Tránh Đặt';
          altarScore = 20;
          altarDesc = `Sơn tinh phạm sát tinh (${son === 2 ? 'Nhị Hắc' : 'Ngũ Hoàng'}). Không nên đặt bàn thờ tại đây để tránh uế tạp nơi thờ cúng.`;
          altarBadges.push({ text: 'Tránh đặt', type: 'danger' });
        } else {
          altarRating = 'Bình';
          altarScore = 50;
          altarDesc = `Vị trí trung bình. Bàn thờ cần đặt nơi cao ráo, thanh tịnh, tránh đối diện WC hoặc bếp lò.`;
        }

        // Tác động Phản / Phục Ngâm Sơn
        if (isSonPhanPhuc && !isSonPhanPhucVuong) {
          altarScore -= 30;
          altarRating = (altarScore <= 30) ? `Hạn Chế (Phạm ${isSonPhan ? 'Phản' : 'Phục'} Ngâm)` : `Lưu Ý (Phạm ${isSonPhan ? 'Phản' : 'Phục'} Ngâm)`;
          altarDesc += ` <span class="rule-warn-inline">⚠️ Sơn Tinh phạm ${isSonPhan ? 'Phản' : 'Phục'} Ngâm: Nơi thờ tự dễ bị giao động trường khí, cần giữ tối tĩnh và đặt vật phẩm ngũ hành thông quan tương sinh.</span>`;
          altarBadges.unshift({ text: `Phạm ${isSonPhan ? 'Phản' : 'Phục'} Ngâm`, type: 'warning' });
        }

        analysis.altars.push({
          palace: p, name, dir, son, huong, van,
          rating: altarRating, score: altarScore, desc: altarDesc, badges: altarBadges
        });
      }

      // --- TỔNG HỢP CUNG VỊ ---
      analysis.palaceSummaries[p] = {
        palace: p, name, dir, son, huong, van, isCenter,
        isPhanNgamSon: isSonPhan && !isSonPhanPhucVuong,
        isPhucNgamSon: isSonPhuc && !isSonPhanPhucVuong,
        isPhanNgamHuong: isHuongPhan && !isHuongPhanPhucVuong,
        isPhucNgamHuong: isHuongPhuc && !isHuongPhanPhucVuong,
        isDaKiep: isDaKiepPalace,
        isHopThap: hasToanBanHopThap,
        door: analysis.doors.find(d => d.palace === p),
        livingRoom: analysis.livingRooms.find(lr => lr.palace === p),
        balcony: analysis.balconies.find(b => b.palace === p),
        bedroom: analysis.bedrooms.find(b => b.palace === p),
        kitchen: analysis.kitchens.find(k => k.palace === p),
        stair: analysis.stairs.find(s => s.palace === p),
        toilet: analysis.toilets.find(t => t.palace === p),
        study: analysis.studies.find(st => st.palace === p),
        altar: analysis.altars.find(a => a.palace === p)
      };
    }

    // Sắp xếp các danh sách theo điểm số giảm dần để người dùng dễ nhìn vị trí tốt nhất
    const sortByScore = (a, b) => b.score - a.score;
    analysis.doors.sort(sortByScore);
    analysis.livingRooms.sort(sortByScore);
    analysis.balconies.sort(sortByScore);
    analysis.bedrooms.sort(sortByScore);
    analysis.kitchens.sort(sortByScore);
    analysis.stairs.sort(sortByScore);
    analysis.toilets.sort(sortByScore);
    analysis.studies.sort(sortByScore);
    analysis.altars.sort(sortByScore);

    return analysis;
  }

  /**
   * Tạo HTML hiển thị toàn bộ phần luận giải bố cục phong thủy
   * @param {Object} analysis - Kết quả từ analyzeFengShui()
   * @returns {string} HTML string
   */
  function renderInterpretationHTML(analysis) {
    if (!analysis) return '';

    const meta = analysis.meta;
    const v = meta.vanTrach;
    const sVuong = meta.saoVuongKhi;
    const sSinh = meta.saoSinhKhi_1;
    const sSat = meta.saoBaoSat.join(' & ');
    const sSuy = meta.saoSuyTu.join(', ');
    const sCat = meta.saoCatTinh ? meta.saoCatTinh.join(', ') : '1, 6, 8, 9';

    const phanPhuc = meta.phanPhucNgam;
    const nhapTu = meta.nhapTu;
    const hopThap = meta.hopThap;
    const tamBanQuai = meta.tamBanQuai;
    const thatTinhDaKiep = meta.thatTinhDaKiep;
    const kvInfo = meta.khongVongInfo;

    const hasSpecialCát = (hopThap && hopThap.hasHopThap) || (tamBanQuai && tamBanQuai.hasTamBanQuai) || (thatTinhDaKiep && thatTinhDaKiep.hasThatTinhDaKiep);

    return `
      <div class="interp-header">
        <div class="interp-title-group">
          <span class="interp-badge-tag">Huyền Không Phi Tinh</span>
          <h3 class="interp-main-title">🏛️ Luận Giải & Bố Cục Phong Thủy Nhà Ở</h3>
          <p class="interp-subtitle">Hệ thống đánh giá cát hung 8 phương hướng theo Tinh Bàn Vận ${v}</p>
        </div>
      </div>

      <!-- Tóm tắt Khí Vận của Trạch Nhà (Tự động tính theo Vận) -->
      <div class="interp-overview-bar">
        <div class="interp-stat-card stat-vuong">
          <span class="stat-icon">🌟</span>
          <div class="stat-info">
            <span class="stat-label">Vượng Khí (Tài Lộc Đỉnh Cao)</span>
            <strong class="stat-val">Sao ${sVuong} (Vận ${v})</strong>
          </div>
        </div>
        <div class="stat-divider"></div>
        <div class="interp-stat-card stat-sinh">
          <span class="stat-icon">🌿</span>
          <div class="stat-info">
            <span class="stat-label">Sinh Khí (Phát Triển Bền Vững)</span>
            <strong class="stat-val">Sao ${sSinh}</strong>
          </div>
        </div>
        <div class="stat-divider"></div>
        <div class="interp-stat-card stat-sat">
          <span class="stat-icon">⚠️</span>
          <div class="stat-info">
            <span class="stat-label">Đại Hung Sát (Bệnh Tật, Tai Họa)</span>
            <strong class="stat-val">Sao ${sSat}</strong>
          </div>
        </div>
      </div>

      <!-- BANNER ĐẠI CÁT CÁCH (NẾU ĐẮC CÁCH) -->
      ${hasSpecialCát ? `
        <div class="interp-alert-box alert-gold special-formation-banner">
          <span class="alert-icon">✨</span>
          <div class="alert-content">
            <div class="special-banner-title">🎉 TRẠCH NHÀ ĐẮC THẾ TRẬN ĐẠI CÁT: ${[
              hopThap && hopThap.hasHopThap ? hopThap.label : '',
              tamBanQuai && tamBanQuai.hasTamBanQuai ? tamBanQuai.label : '',
              thatTinhDaKiep && thatTinhDaKiep.hasThatTinhDaKiep ? thatTinhDaKiep.label : ''
            ].filter(Boolean).join(' | ')}</div>
            <p class="special-banner-desc">Ngôi nhà sở hữu cách cục cát lành thượng thừa (chuyển bại thành thắng, thông khí thiên địa). Hãy bấm tab <strong>"✨ Đại Cát Cách"</strong> bên dưới để xem chi tiết hướng dẫn kích hoạt Loan Đầu.</p>
          </div>
        </div>
      ` : ''}

      <!-- CẢNH BÁO ĐẠI KHÔNG VONG / TIỂU KHÔNG VONG -->
      ${meta.isKhongVong && kvInfo ? `
        <div class="interp-alert-box alert-danger khong-vong-banner">
          <span class="alert-icon">🚨</span>
          <div class="alert-content">
            <div class="kv-banner-title">CẢNH BÁO ĐẠI HÙNG SÁT: ĐỘ SỐ PHẠM ${kvInfo.label.toUpperCase()}</div>
            <p class="kv-banner-desc">${kvInfo.desc}</p>
            <div class="kv-banner-advice">
              💡 <strong>LỜI KHUYÊN HÓA GIẢI THỰC TẾ:</strong> Trục Không Vong là ranh giới giao thoa hai dòng khí đối kháng khiến trường khí nhà bị hỗn loạn, quái dị, đại bại. Gia chủ bắt buộc phải <strong>xoay lệch khuôn cửa chính / hướng cửa đi 2° - 3°</strong> (về phía Chính Sơn thuần khí) để triệt để thoát khỏi đường Không Vong trước khi bài trí nội thất.
            </div>
          </div>
        </div>
      ` : ''}

      ${meta.isKiem && !meta.isKhongVong ? `
        <div class="interp-alert-box alert-warn">
          <span class="alert-icon">⚠️</span>
          <div class="alert-content">
            <strong>Nhà phạm tuyến Kiêm Hướng (Thế Quái):</strong> Khí trường có sự pha tạp nhẹ giữa 2 sơn. Cần chú ý an vị cửa chính và phòng ngủ đúng phương vị chính cung để thu nạp thuần khí.
          </div>
        </div>
      ` : ''}

      ${phanPhuc && (phanPhuc.hasPhucNgam || phanPhuc.hasPhanNgam) ? `
        <div class="interp-alert-box alert-warn">
          <span class="alert-icon">⚡</span>
          <div class="alert-content">
            <strong>Tinh Bàn Phạm Thế Cục Phản Ngâm / Phục Ngâm:</strong> Có ${phanPhuc.items.length} vị trí sao Sơn/Hướng phạm đại kỵ trùng khít hoặc đối xung với Địa bàn Lạc Thư. Hãy bấm vào tab <strong>"⚡ Phản & Phục Ngâm"</strong> bên dưới để xem chi tiết ảnh hưởng và cách hóa giải thông quan.
          </div>
        </div>
      ` : ''}

      ${nhapTu && nhapTu.isNhapTuCurrent ? `
        <div class="interp-alert-box alert-info">
          <span class="alert-icon">🔒</span>
          <div class="alert-content">
            <strong>Trạch bàn bị "Lệnh Tinh Nhập Tù" trong Vận ${v}:</strong> ${nhapTu.currentTitle}. Hãy bấm vào tab <strong>"🔒 Lệnh Tinh Nhập Tù"</strong> bên dưới để xem phương án <em>Giải Tù Quyết</em> (Minh đường tụ thủy / Giếng trời thông tầng).
          </div>
        </div>
      ` : ''}

      <!-- Bộ lọc Tabs chuyển đổi các khu vực phong thủy -->
      <div class="interp-tabs-container">
        <div class="interp-tabs-scroll">
          <button type="button" class="interp-tab active" data-tab="doors">🚪 Cửa Chính</button>
          <button type="button" class="interp-tab" data-tab="living">🛋️ Phòng Khách</button>
          <button type="button" class="interp-tab" data-tab="balcony">🌅 Ban Công / Cửa Sổ</button>
          <button type="button" class="interp-tab" data-tab="bedrooms">🛏️ Phòng Ngủ</button>
          <button type="button" class="interp-tab" data-tab="kitchens">🍳 Nhà Bếp</button>
          <button type="button" class="interp-tab" data-tab="stairs">🪜 Cầu Thang / Giếng Trời</button>
          <button type="button" class="interp-tab" data-tab="toilets">🚿 Nhà Vệ Sinh</button>
          <button type="button" class="interp-tab" data-tab="studies">📚 Bàn Học / Làm Việc</button>
          <button type="button" class="interp-tab" data-tab="altars">🕯️ Phòng Thờ / Bàn Thờ</button>
          <button type="button" class="interp-tab" data-tab="dai-cat">✨ Đại Cát Cách</button>
          <button type="button" class="interp-tab" data-tab="phan-phuc">⚡ Phản & Phục Ngâm</button>
          <button type="button" class="interp-tab" data-tab="nhap-tu">🔒 Lệnh Tinh Nhập Tù</button>
          <button type="button" class="interp-tab" data-tab="all">🧭 Tổng Hợp 8 Cung</button>
        </div>
      </div>

      <!-- Tab 1: Cửa Chính -->
      <div class="interp-tab-panel active" id="tab-doors">
        <div class="interp-guide-tip">
          🎯 <strong>Nguyên lý (Vận ${v}):</strong> Cửa chính (Đại Môn) là Khí Khẩu chính nạp 70% tài vận. Cần đặt tại cung có <strong>Hướng Tinh Vượng Khí (Sao ${sVuong})</strong> hoặc <strong>Sinh Khí (Sao ${sSinh})</strong>. Đại kỵ mở cửa tại cung có Hướng Tinh là <strong>Sao ${sSat}</strong> (Sát khí) hoặc cung phạm Không Vong.
        </div>
        <div class="interp-cards-grid">
          ${analysis.doors.map(d => renderCardItem(d, 'Cửa Chính', `Hướng Tinh [${d.huong}]`)).join('')}
        </div>
      </div>

      <!-- Tab 2: Phòng Khách -->
      <div class="interp-tab-panel" id="tab-living">
        <div class="interp-guide-tip">
          🎯 <strong>Nguyên lý (Vận ${v}):</strong> Phòng khách là không gian sinh hoạt chung, người đi lại nhiều → thuộc trạng thái <strong>Động</strong>. Ưu tiên đặt tại cung có <strong>Hướng Tinh Vượng Khí (Sao ${sVuong})</strong> hoặc <strong>Sinh Khí (Sao ${sSinh})</strong> để kích hoạt tài lộc. Đại kỵ đặt tại cung có cặp sát tinh <strong>[2-5] hoặc [5-2]</strong> (gây bất hòa, đau ốm cho cả nhà).
        </div>
        <div class="interp-cards-grid">
          ${analysis.livingRooms.map(lr => renderCardItem(lr, 'Phòng Khách', `Hướng Tinh [${lr.huong}]`)).join('')}
        </div>
      </div>

      <!-- Tab 3: Ban Công / Cửa Sổ Lớn -->
      <div class="interp-tab-panel" id="tab-balcony">
        <div class="interp-guide-tip">
          🎯 <strong>Nguyên lý (Vận ${v}):</strong> Ban công và cửa sổ lớn là <strong>Khí Khẩu Phụ</strong> (nơi nạp sáng, đón gió và view chính, đặc biệt quan trọng với chung cư & nhà phố). Nên mở ở cung có <strong>Hướng Tinh Vượng Khí (Sao ${sVuong})</strong> hoặc <strong>Sinh Khí (Sao ${sSinh})</strong> để đón cát khí; tránh mở lớn tại cung có <strong>Sao ${sSat}</strong> để không hút sát khí.
        </div>
        <div class="interp-cards-grid">
          ${analysis.balconies.map(b => renderCardItem(b, 'Ban Công', `Hướng Tinh [${b.huong}]`)).join('')}
        </div>
      </div>

      <!-- Tab 4: Phòng Ngủ -->
      <div class="interp-tab-panel" id="tab-bedrooms">
        <div class="interp-guide-tip">
          🎯 <strong>Nguyên lý (Vận ${v}):</strong> <em>"Sơn quản nhân đinh, Thủy quản tài lộc"</em>. Phòng ngủ và vị trí đầu giường thuộc <strong>Tĩnh Khí</strong>, ưu tiên đặt tại cung có <strong>Sơn Tinh Vượng (Sao ${sVuong})</strong> hoặc <strong>Sinh Khí (Sao ${sSinh})</strong> để bồi bổ sức khỏe, gia đạo êm ấm. Đại kỵ đặt giường tại cung có Sơn Tinh là <strong>Sao ${sSat}</strong>.
        </div>
        <div class="interp-cards-grid">
          ${analysis.bedrooms.map(b => renderCardItem(b, 'Phòng Ngủ', `Sơn Tinh [${b.son}]`)).join('')}
        </div>
      </div>

      <!-- Tab 5: Nhà Bếp -->
      <div class="interp-tab-panel" id="tab-kitchens">
        <div class="interp-guide-tip">
          🎯 <strong>Nguyên lý (Vận ${v}):</strong> Bếp mang Hỏa khí nung nấu. Tọa độ đặt bếp (Tọa bếp) cần nằm ở cung Sơn Tinh cát lành (1, 3, 4, 8, 9); đại kỵ cung Càn (Hỏa thiêu thiên môn) và cung có Sơn Tinh <strong>Sao ${sSat}</strong>. Hướng bếp quay về Hướng Tinh <strong>Sao 1 (Thủy Hỏa Ký Tế)</strong> hoặc <strong>Sao 3, 4 (Mộc Sinh Hỏa)</strong> là đại cát.
        </div>
        <div class="interp-cards-grid">
          ${analysis.kitchens.map(k => renderCardItem(k, 'Nhà Bếp', `Tọa Sơn [${k.son}]`, k.huongAdvice)).join('')}
        </div>
      </div>

      <!-- Tab 6: Cầu Thang & Giếng Trời -->
      <div class="interp-tab-panel" id="tab-stairs">
        <div class="interp-guide-tip">
          🎯 <strong>Nguyên lý (Vận ${v}):</strong> Cầu thang & giếng trời là trục dẫn khí theo chiều thẳng đứng (Động khí liên tầng). Bố trí tại cung có <strong>Hướng Tinh Vượng Khí (Sao ${sVuong}, ${sSinh})</strong> để khuếch tán tài lộc; tránh Hướng Tinh <strong>Sao ${sSat}</strong>. Nếu đặt ở giữa nhà (Trung Cung), rất tốt khi cần giải thế <em>"Lệnh Tinh Nhập Tù"</em>, nhưng đại kỵ nếu Trung Cung phạm [2-5], [3-2] Đấu ngưu sát hay [3-7] Xuyên tâm sát.
        </div>
        <div class="interp-cards-grid">
          ${analysis.stairs.map(s => renderCardItem(s, 'Cầu Thang / Giếng Trời', `Hướng Tinh [${s.huong}]`)).join('')}
        </div>
      </div>

      <!-- Tab 7: Nhà Vệ Sinh -->
      <div class="interp-tab-panel" id="tab-toilets">
        <div class="interp-guide-tip">
          🎯 <strong>Nguyên lý (Vận ${v}):</strong> <em>"Dĩ độc trị độc"</em> – Nhà vệ sinh nên đặt tại các cung có cả Sơn Tinh & Hướng Tinh đều thuộc <strong>Sao Suy Tử (${sSuy})</strong> trong Vận ${v} để dòng nước cuốn trôi sát khí. Cấm tuyệt đối đặt giữa nhà (Trung Cung), cấm cung Văn Xương [1-4, 4-1] và hạn chế cung Càn (hại cha), Khôn (hại mẹ).
        </div>
        <div class="interp-cards-grid">
          ${analysis.toilets.map(t => renderCardItem(t, 'Nhà Vệ Sinh', `Sơn [${t.son}] - Hướng [${t.huong}]`)).join('')}
        </div>
      </div>

      <!-- Tab 8: Bàn Học & Phòng Làm Việc (Văn Xương) -->
      <div class="interp-tab-panel" id="tab-studies">
        <div class="interp-guide-tip">
          🎯 <strong>Nguyên lý:</strong> Bàn học / làm việc cần đặt tại phương vị <strong>Văn Xương Tinh [1-4] hoặc [4-1]</strong> để kích hoạt trí tuệ, đỗ đạt, công danh thăng tiến. Tránh đặt tại cung có sát tinh <strong>Sao ${sSat}</strong> làm phân tâm, giảm sút hiệu quả.
        </div>
        <div class="interp-cards-grid">
          ${analysis.studies.map(st => renderCardItem(st, 'Góc Học Tập', `Tổ hợp sao [${st.son}-${st.huong}]`)).join('')}
        </div>
      </div>

      <!-- Tab 9: Phòng Thờ / Bàn Thờ (Thần Vị) -->
      <div class="interp-tab-panel" id="tab-altars">
        <div class="interp-guide-tip">
          🎯 <strong>Nguyên lý:</strong> Bàn thờ (Thần Vị) là nơi linh thiêng tôn nghiêm, cần không gian tối tĩnh, tọa tại cung có <strong>Sơn Tinh cát lành (Sao ${sVuong} hoặc ${sCat})</strong> để gia đạo an khang, linh khí tổ tiên chở che. Tuyệt đối tránh nhìn thẳng hoặc tựa lưng vào nhà vệ sinh, bếp lò.
        </div>
        <div class="interp-cards-grid">
          ${analysis.altars.map(a => renderCardItem(a, 'Bàn Thờ', `Sơn Tinh [${a.son}]`)).join('')}
        </div>
      </div>

      <!-- Tab 10: Đại Cát Cách (Hợp Thập / Tam Ban Quái / Thất Tinh Đả Kiếp) -->
      <div class="interp-tab-panel" id="tab-dai-cat">
        ${renderDaiCatTab(meta, v)}
      </div>

      <!-- Tab 11: Phản Ngâm & Phục Ngâm -->
      <div class="interp-tab-panel" id="tab-phan-phuc">
        ${renderPhanPhucNgamTab(phanPhuc, v)}
      </div>

      <!-- Tab 12: Lệnh Tinh Nhập Tù -->
      <div class="interp-tab-panel" id="tab-nhap-tu">
        ${renderNhapTuTab(nhapTu, v)}
      </div>

      <!-- Tab 13: Tổng Hợp 8 Cung -->
      <div class="interp-tab-panel" id="tab-all">
        <div class="interp-all-grid">
          ${[1, 2, 3, 4, 6, 7, 8, 9].map(p => renderPalaceOverview(analysis.palaceSummaries[p])).join('')}
        </div>
      </div>
    `;
  }

  function renderDaiCatTab(meta, v) {
    const hopThap = meta.hopThap;
    const tamBanQuai = meta.tamBanQuai;
    const thatTinhDaKiep = meta.thatTinhDaKiep;

    return `
      <div class="interp-guide-tip">
        🎯 <strong>Nguyên Lý Đại Cát Cách:</strong> Trong Huyền Không Phi Tinh, khi trạch nhà đắc các thế trận đặc biệt như <em>Hợp Thập (Thiên Tâm Thập Đạo)</em>, <em>Tam Ban Quái</em> hoặc <em>Thất Tinh Đả Kiếp</em>, ngôi nhà sẽ được thông khí thiên địa, có thể <strong>chuyển bại thành thắng</strong>, hóa giải cả thế cục xấu như Thượng sơn hạ thủy để đón nhận cát khí vượng phát dài lâu.
      </div>

      <div class="dai-cat-sections-container">
        <!-- 1. PHÉP HỢP THẬP (THIÊN TÂM THẬP ĐẠO) -->
        <div class="dai-cat-card ${hopThap && hopThap.hasHopThap ? 'card-dac-cach' : 'card-khong-dac'}">
          <div class="dc-head">
            <span class="dc-icon">${hopThap && hopThap.hasHopThap ? '🌟' : '⚪'}</span>
            <div class="dc-title-group">
              <span class="dc-badge">${hopThap && hopThap.hasHopThap ? 'ĐẮC THẾ TRẬN' : 'KHÔNG ĐẮC CÁCH'}</span>
              <h4 class="dc-title">1. Phép Hợp Thập (Thiên Tâm Thập Đạo)</h4>
            </div>
          </div>
          <div class="dc-body">
            ${hopThap && hopThap.hasHopThap ? `
              <div class="dc-dac-box">
                <strong class="dc-dac-title">🎉 ${hopThap.label}</strong>
                <p class="dc-dac-scope">🎯 <strong>Phạm vi tác dụng:</strong> ${hopThap.scope}</p>
                <p class="dc-dac-desc">${hopThap.desc}</p>
              </div>
            ` : `
              <p class="dc-desc">Hợp Thập là hiện tượng tổng số các sao (Sơn+Vận, Hướng+Vận hoặc Sơn+Hướng) tại các cung đều bằng 10. Trạch bàn hiện tại không đắc toàn bàn Hợp Thập.</p>
            `}
          </div>
        </div>

        <!-- 2. TAM BAN QUÁI (LIÊN CHÂU & XẢO QUÁI) -->
        <div class="dai-cat-card ${tamBanQuai && tamBanQuai.hasTamBanQuai ? 'card-dac-cach' : 'card-khong-dac'}">
          <div class="dc-head">
            <span class="dc-icon">${tamBanQuai && tamBanQuai.hasTamBanQuai ? '💫' : '⚪'}</span>
            <div class="dc-title-group">
              <span class="dc-badge">${tamBanQuai && tamBanQuai.hasTamBanQuai ? 'ĐẮC THẾ TRẬN' : 'KHÔNG ĐẮC CÁCH'}</span>
              <h4 class="dc-title">2. Tam Ban Quái (Khí Mạch Xuyên Suốt)</h4>
            </div>
          </div>
          <div class="dc-body">
            ${tamBanQuai && tamBanQuai.hasTamBanQuai ? `
              <div class="dc-dac-box">
                <strong class="dc-dac-title">🎉 ${tamBanQuai.label}</strong>
                <p class="dc-dac-desc">${tamBanQuai.desc}</p>
              </div>
            ` : `
              <p class="dc-desc">Tam Ban Quái gồm <em>Liên Châu</em> (3 số liên tiếp 1-2-3, 2-3-4...) hoặc <em>Tam Ban Xảo Quái</em> (1-4-7, 2-5-8, 3-6-9) tại cả 9 cung để tạo ống dẫn khí toàn diện. Trạch bàn hiện tại không đắc Tam Ban Quái.</p>
            `}
          </div>
        </div>

        <!-- 3. THẤT TINH ĐẢ KIẾP (MƯỢN KHÍ TƯƠNG LAI) -->
        <div class="dai-cat-card ${thatTinhDaKiep && thatTinhDaKiep.hasThatTinhDaKiep ? 'card-dac-cach' : 'card-khong-dac'}">
          <div class="dc-head">
            <span class="dc-icon">${thatTinhDaKiep && thatTinhDaKiep.hasThatTinhDaKiep ? '⚡' : '⚪'}</span>
            <div class="dc-title-group">
              <span class="dc-badge">${thatTinhDaKiep && thatTinhDaKiep.hasThatTinhDaKiep ? 'ĐẮC THẾ TRẬN' : 'KHÔNG ĐẮC CÁCH'}</span>
              <h4 class="dc-title">3. Thất Tinh Đả Kiếp (Bí Pháp Cướp Khí Thiên Cơ)</h4>
            </div>
          </div>
          <div class="dc-body">
            ${thatTinhDaKiep && thatTinhDaKiep.hasThatTinhDaKiep ? `
              <div class="dc-dac-box">
                <strong class="dc-dac-title">🎉 ${thatTinhDaKiep.label}</strong>
                <p class="dc-dac-desc">${thatTinhDaKiep.desc}</p>
                <div class="dc-linked-palaces">
                  <span class="lp-label">🔗 <strong>Tam giác khí liên kết:</strong></span>
                  <div class="lp-chips">
                    ${thatTinhDaKiep.linkedPalaces.map(lp => `
                      <span class="lp-chip">${lp.dir} (${lp.name}) - Hướng Tinh [${lp.huongStar}]</span>
                    `).join(' ➔ ')}
                  </div>
                </div>
                <div class="dc-loandau-tip">
                  🛡️ <strong>${thatTinhDaKiep.loanDauAdvice}</strong>
                </div>
              </div>
            ` : `
              <p class="dc-desc">Thất Tinh Đả Kiếp yêu cầu điều kiện tiên quyết là <strong>Song Tinh Đáo Hướng</strong> (cả Sơn và Hướng tinh tại đầu hướng đều là sao đương vận Vận ${v}) kết hợp tam giác khí Ly-Chấn-Càn (Đả kiếp thật) hoặc Khảm-Đoài-Tốn (Đả kiếp giả). Trạch bàn hiện tại không đắc cách.</p>
            `}
          </div>
        </div>
      </div>
    `;
  }

  function renderPhanPhucNgamTab(phanPhuc, van) {
    if (!phanPhuc || (!phanPhuc.hasPhucNgam && !phanPhuc.hasPhanNgam)) {
      return `
        <div class="interp-guide-tip">
          🎯 <strong>Nguyên lý:</strong> Phản Ngâm & Phục Ngâm là đại kỵ trong Huyền Không Phi Tinh. <em>Phục Ngâm</em> là sao Sơn/Hướng trùng khít với số Lạc Thư của cung; <em>Phản Ngâm</em> là sao đối xung (tổng số sao + số cung = 10).
        </div>
        <div class="interp-clean-card">
          <span class="clean-icon">🟢</span>
          <div class="clean-content">
            <h4>Tinh Bàn Thanh Thuần - Không Phạm Phản/Phục Ngâm</h4>
            <p>Toàn bộ 8 cung vị của trạch bàn không bị trùng lặp hoặc đối xung với Địa bàn Lạc Thư. Trường khí lưu chuyển hanh thông, không lo đại kỵ ngầm.</p>
          </div>
        </div>
      `;
    }

    return `
      <div class="interp-guide-tip">
        🎯 <strong>Nguyên lý & Ảnh hưởng:</strong> <em>Phục Ngâm</em> là sao Sơn/Hướng trùng số Lạc Thư; <em>Phản Ngâm</em> là sao đối xung (tổng = 10).<br>
        • <strong>Sơn tinh phạm:</strong> Chủ về gia đạo lục đục, hao tổn nhân đinh, người trong nhà dễ đau ốm, thị phi.<br>
        • <strong>Hướng tinh phạm:</strong> Chủ về làm ăn trắc trở, thương trường thất bại, tiêu tán tài lộc, hao tài tốn của.
      </div>

      ${phanPhuc.isToanBanPhucNgam ? `
        <div class="interp-alert-box alert-danger">
          <span class="alert-icon">🚨</span>
          <div class="alert-content">
            <strong>CẢNH BÁO: TOÀN BÀN PHỤC NGÂM!</strong> Toàn bộ 8 cung vị đều có sao trùng số Lạc Thư (Sao 5 nhập trung bay thuận). Cực hung nếu không đắc cách ngoại cục.
          </div>
        </div>
      ` : ''}

      ${phanPhuc.isToanBanPhanNgam ? `
        <div class="interp-alert-box alert-danger">
          <span class="alert-icon">🚨</span>
          <div class="alert-content">
            <strong>CẢNH BÁO: TOÀN BÀN PHẢN NGÂM!</strong> Toàn bộ 8 cung vị đều có sao đối xung Hợp Thập (Sao 5 nhập trung bay nghịch). Khí trường biến động dữ dội.
          </div>
        </div>
      ` : ''}

      <div class="interp-cards-grid">
        ${phanPhuc.items.map(item => {
          const isSon = (item.starType === 'Sơn Tinh');
          let remedyAdvice = '';
          if (item.isVuong) {
            remedyAdvice = `🌟 <strong>Đắc cách Vượng Khí:</strong> Sao ${item.star} là Vượng Khí Vận ${van}. Nếu ${isSon ? 'ngoại cục có Sơn/nhà cao che chắn' : 'ngoại cục có Thủy/đường thoáng/minh đường rộng'} → Cát hóa hung, không lo hung sát.`;
          } else {
            remedyAdvice = `🛡️ <strong>Hóa giải thông quan:</strong> ${isSon ? 'Giữ không gian tĩnh, đặt vật phẩm Ngũ Hành tương sinh thông quan để làm dịu sát khí.' : 'Tránh mở cửa nạp khí động tại cung này, đặt vật phẩm Ngũ Hành thông quan để chuyển hóa năng lượng.'}`;
          }

          return `
            <div class="interp-card ${item.isVuong ? 'rate-cat' : 'rate-xau'}">
              <div class="card-top">
                <div class="card-loc">
                  <span class="card-dir-name">${item.dir}</span>
                  <span class="card-pal-name">(${item.name})</span>
                </div>
                <div class="card-stars-tag">${item.starType} [${item.star}]</div>
                <div class="card-rating-badge">
                  <span class="rate-dot">${item.isVuong ? '🔵' : '🔴'}</span>
                  <span class="rate-text">${item.typeLabel}</span>
                </div>
              </div>
              <div class="card-body">
                <p class="card-desc"><strong>Phạm vi ảnh hưởng:</strong> ${item.scope}.</p>
                <div class="card-extra-advice">${remedyAdvice}</div>
              </div>
              <div class="card-footer-badges">
                <span class="badge-pill ${item.isVuong ? 'badge-primary' : 'badge-danger'}">${item.typeLabel}</span>
                <span class="badge-pill ${isSon ? 'badge-pill-son' : 'badge-pill-huong'}">${item.starType}</span>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    `;
  }

  function renderNhapTuTab(nhapTu, van) {
    if (!nhapTu) return '<p>Chưa có dữ liệu Nhập Tù.</p>';

    return `
      <div class="interp-guide-tip">
        🎯 <strong>Nguyên lý Lệnh Tinh Nhập Tù:</strong> Một ngôi nhà dù vượng đến đâu, khi sao vượng khí (Lệnh Tinh) bị rơi vào <strong>Trung Cung (Cung số 5)</strong> thì gọi là <em>Nhập Tù</em> (bị giam cầm). Hướng tinh nhập tù → <strong>Tài Tù</strong> (tài lộc bế tắc); Sơn tinh nhập tù → <strong>Đinh Tù</strong> (nhân đinh suy bại).
      </div>

      <!-- Trạng thái hiện tại -->
      <div class="nhap-tu-status-card ${nhapTu.isNhapTuCurrent ? 'status-danger-box' : 'status-good-box'}">
        <div class="nt-status-header">
          <span class="nt-status-icon">${nhapTu.isNhapTuCurrent ? '🔒' : '🟢'}</span>
          <div class="nt-status-info">
            <span class="nt-status-label">Trạng Thái Vận Hiện Tại (Vận ${van})</span>
            <h4 class="nt-status-title">${nhapTu.currentTitle}</h4>
          </div>
        </div>
        <p class="nt-status-desc">
          ${nhapTu.isNhapTuCurrent 
            ? `Sao Vượng Khí (${van}) đang nằm tại Trung Cung [Sơn: ${nhapTu.sonCenter} | Hướng: ${nhapTu.huongCenter}]. Cần áp dụng giải pháp <em>Giải Tù Quyết</em> bên dưới để khai thông vượng khí.` 
            : `Sao Vượng Khí Vận ${van} đang phân bổ ở các cung hướng bên ngoài, trạch nhà không bị bế khí.`}
        </p>
      </div>

      <!-- Bộ Giải Pháp Giải Tù Quyết -->
      <div class="nhap-tu-remedies-grid">
        <div class="nt-remedy-card">
          <div class="nt-rem-head">
            <span class="nt-rem-icon">🌊</span>
            <strong class="nt-rem-title">1. Giải Tù Ngoại Cục (Hướng Thượng Hữu Thủy)</strong>
          </div>
          <p class="nt-rem-text">
            Cổ quyết dạy: <em>"Hướng thượng hữu thủy, tù bất trụ"</em>. Nếu phía trước mặt nhà (đầu hướng) có <strong>ao hồ, sông suối, hồ bơi, hoặc ngã ba ngã tư rộng thoáng (Minh đường tụ thủy)</strong> → Động khí của nước và giao lộ sẽ dẫn dắt vượng khí thoát khỏi trung cung, <strong>Giải Tù Thành Công</strong>.
          </p>
        </div>

        <div class="nt-remedy-card">
          <div class="nt-rem-head">
            <span class="nt-rem-icon">🪜</span>
            <strong class="nt-rem-title">2. Giải Tù Nội Thất (Động Khí Trung Cung)</strong>
          </div>
          <p class="nt-rem-text">
            Tại khu vực giữa nhà (Trung Cung), thiết kế <strong>Cầu thang thông tầng hoặc Giếng trời lớn</strong> → Trục đối lưu không khí thẳng đứng từ dưới đất lên mái nhà làm tiêu tan sự tù hãm, đưa vượng khí lan tỏa khắp các tầng, <strong>Giải Tù Thành Công</strong>.
          </p>
        </div>
      </div>

      <!-- Bảng Dự Báo Nhập Tù 9 Vận -->
      <div class="nhap-tu-forecast-section">
        <h4 class="forecast-title">📅 Bảng Dự Báo Vận Nhập Tù Của Trạch Nhà (9 Vận)</h4>
        <div class="forecast-table-wrapper">
          <table class="forecast-table">
            <thead>
              <tr>
                <th>Vận</th>
                <th>Thời Gian</th>
                <th>Sơn Tinh (Trung Cung)</th>
                <th>Hướng Tinh (Trung Cung)</th>
                <th>Trạng Thái</th>
              </tr>
            </thead>
            <tbody>
              ${nhapTu.forecast.map(item => `
                <tr class="${item.isCurrent ? 'row-current-van' : ''} ${item.statusType === 'danger' ? 'row-danger' : ''}">
                  <td><strong>Vận ${item.van}</strong> ${item.isCurrent ? '<span class="badge-cur-van">Hiện tại</span>' : ''}</td>
                  <td>${item.years}</td>
                  <td><span class="star-pill-son">${nhapTu.sonCenter}</span></td>
                  <td><span class="star-pill-huong">${nhapTu.huongCenter}</span></td>
                  <td>
                    <span class="forecast-status-badge ${item.statusType === 'danger' ? 'badge-danger' : 'badge-success'}">
                      ${item.status}
                    </span>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  }

  function renderCardItem(item, category, starLabel, extraAdvice) {
    let ratingClass = 'rate-binh';
    let ratingIcon = '⚪';

    if (item.rating.includes('Xuất Sắc') || item.rating.includes('Rất Tốt') || item.rating.includes('Cực Tốt') || item.rating.includes('Dĩ Độc Trị Độc')) {
      ratingClass = 'rate-tot';
      ratingIcon = '🟢';
    } else if (item.rating.includes('Tốt') || item.rating.includes('Cát')) {
      ratingClass = 'rate-cat';
      ratingIcon = '🔵';
    } else if (item.rating.includes('Lưu Ý') || item.rating.includes('Không Khuyến Khích') || item.rating.includes('Hạn Chế')) {
      ratingClass = 'rate-warn';
      ratingIcon = '🟡';
    } else if (item.rating.includes('Đại Kỵ') || item.rating.includes('Rất Xấu') || item.rating.includes('Cực Hung') || item.rating.includes('Cấm')) {
      ratingClass = 'rate-xau';
      ratingIcon = '🔴';
    }

    return `
      <div class="interp-card ${ratingClass}">
        <div class="card-top">
          <div class="card-loc">
            <span class="card-dir-name">${item.dir}</span>
            <span class="card-pal-name">(${item.name})</span>
          </div>
          <div class="card-stars-tag">${starLabel}</div>
          <div class="card-rating-badge">
            <span class="rate-dot">${ratingIcon}</span>
            <span class="rate-text">${item.rating}</span>
          </div>
        </div>
        
        <div class="card-body">
          <p class="card-desc">${item.desc}</p>
          ${extraAdvice ? `<div class="card-extra-advice">${extraAdvice}</div>` : ''}
        </div>

        ${item.badges && item.badges.length > 0 ? `
          <div class="card-footer-badges">
            ${item.badges.map(b => `<span class="badge-pill badge-${b.type}">${b.text}</span>`).join('')}
          </div>
        ` : ''}
      </div>
    `;
  }

  function renderPalaceOverview(pal) {
    if (!pal) return '';

    const flags = [];
    if (pal.isPhanNgamSon) flags.push('<span class="pal-flag-pill flag-danger" title="Sơn tinh phạm Phản Ngâm">⚡ Phản Ngâm Sơn</span>');
    if (pal.isPhucNgamSon) flags.push('<span class="pal-flag-pill flag-danger" title="Sơn tinh phạm Phục Ngâm">⚡ Phục Ngâm Sơn</span>');
    if (pal.isPhanNgamHuong) flags.push('<span class="pal-flag-pill flag-danger" title="Hướng tinh phạm Phản Ngâm">⚡ Phản Ngâm Hướng</span>');
    if (pal.isPhucNgamHuong) flags.push('<span class="pal-flag-pill flag-danger" title="Hướng tinh phạm Phục Ngâm">⚡ Phục Ngâm Hướng</span>');
    if (pal.isDaKiep) flags.push('<span class="pal-flag-pill flag-gold" title="Thuộc tam giác khí Thất Tinh Đả Kiếp">⭐ Cung Đả Kiếp</span>');
    if (pal.isHopThap) flags.push('<span class="pal-flag-pill flag-gold" title="Đắc Hợp Thập thông khí">✨ Hợp Thập</span>');

    return `
      <div class="palace-overview-card">
        <div class="pal-card-header">
          <div class="pal-title-row">
            <strong class="pal-dir-tag">${pal.dir} (${pal.name})</strong>
            <div class="pal-stars-display">
              <span class="star-pill-son" title="Sơn Tinh">Sơn: ${pal.son}</span>
              <span class="star-pill-huong" title="Hướng Tinh">Hướng: ${pal.huong}</span>
              <span class="star-pill-van" title="Vận Tinh">Vận: ${pal.van}</span>
            </div>
          </div>
          ${flags.length > 0 ? `<div class="pal-flags-row">${flags.join(' ')}</div>` : ''}
        </div>
        
        <div class="pal-items-list">
          ${pal.door ? `<div class="pal-item-row"><span class="item-name">🚪 Cửa chính:</span> <span class="item-status ${getStatusClass(pal.door.rating)}">${pal.door.rating}</span></div>` : ''}
          ${pal.livingRoom ? `<div class="pal-item-row"><span class="item-name">🛋️ Phòng khách:</span> <span class="item-status ${getStatusClass(pal.livingRoom.rating)}">${pal.livingRoom.rating}</span></div>` : ''}
          ${pal.balcony ? `<div class="pal-item-row"><span class="item-name">🌅 Ban công / Cửa sổ:</span> <span class="item-status ${getStatusClass(pal.balcony.rating)}">${pal.balcony.rating}</span></div>` : ''}
          ${pal.bedroom ? `<div class="pal-item-row"><span class="item-name">🛏️ Phòng ngủ:</span> <span class="item-status ${getStatusClass(pal.bedroom.rating)}">${pal.bedroom.rating}</span></div>` : ''}
          ${pal.kitchen ? `<div class="pal-item-row"><span class="item-name">🍳 Bếp nấu:</span> <span class="item-status ${getStatusClass(pal.kitchen.rating)}">${pal.kitchen.rating}</span></div>` : ''}
          ${pal.stair ? `<div class="pal-item-row"><span class="item-name">🪜 Cầu thang:</span> <span class="item-status ${getStatusClass(pal.stair.rating)}">${pal.stair.rating}</span></div>` : ''}
          ${pal.toilet ? `<div class="pal-item-row"><span class="item-name">🚿 Vệ sinh:</span> <span class="item-status ${getStatusClass(pal.toilet.rating)}">${pal.toilet.rating}</span></div>` : ''}
          ${pal.study ? `<div class="pal-item-row"><span class="item-name">📚 Bàn học:</span> <span class="item-status ${getStatusClass(pal.study.rating)}">${pal.study.rating}</span></div>` : ''}
          ${pal.altar ? `<div class="pal-item-row"><span class="item-name">🕯️ Bàn thờ:</span> <span class="item-status ${getStatusClass(pal.altar.rating)}">${pal.altar.rating}</span></div>` : ''}
        </div>
      </div>
    `;
  }

  function getStatusClass(rating) {
    if (!rating) return '';
    if (rating.includes('Đại Cát') || rating.includes('Xuất Sắc') || rating.includes('Rất Tốt') || rating.includes('Cực Tốt') || rating.includes('Văn Xương') || rating.includes('Dĩ Độc Trị Độc') || rating.includes('Giải Lệnh Tinh') || rating.includes('Động Khí Giải Tù')) return 'status-good';
    if (rating.includes('Tốt') || rating.includes('Cát') || rating.includes('Khá Tốt')) return 'status-primary';
    if (rating.includes('Lưu Ý') || rating.includes('Không Khuyến Khích') || rating.includes('Hạn Chế')) return 'status-warn';
    if (rating.includes('Đại Kỵ') || rating.includes('Rất Xấu') || rating.includes('Cực Hung') || rating.includes('Cấm') || rating.includes('Không Tốt') || rating.includes('Tránh Đặt') || rating.includes('Sát Tinh') || rating.includes('Phạm Sát') || rating.includes('Cần Hóa Giải') || rating.includes('Phản Ngâm') || rating.includes('Phục Ngâm')) return 'status-danger';
    return 'status-neutral';
  }

  /**
   * Khởi tạo và gắn sự kiện cho các tab trong phần luận giải
   */
  function initInterpretationTabs() {
    const tabButtons = document.querySelectorAll('.interp-tab');
    const tabPanels = document.querySelectorAll('.interp-tab-panel');

    tabButtons.forEach(btn => {
      btn.addEventListener('click', function() {
        const targetId = this.dataset.tab;
        
        tabButtons.forEach(b => b.classList.remove('active'));
        tabPanels.forEach(p => p.classList.remove('active'));

        this.classList.add('active');
        const targetPanel = document.getElementById('tab-' + targetId);
        if (targetPanel) {
          targetPanel.classList.add('active');
        }
      });
    });
  }

  // Xuất module ra phạm vi toàn cục
  window.FengShuiRules = {
    analyze: analyzeFengShui,
    renderHTML: renderInterpretationHTML,
    initTabs: initInterpretationTabs
  };

})();
