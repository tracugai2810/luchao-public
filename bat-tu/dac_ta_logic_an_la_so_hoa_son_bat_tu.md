# Đặc Tả Kỹ Thuật & Logic An Lá Số Web App "Hoa Sơn Bát Tự" (Chu Thần Bân)

Tài liệu này là bản đặc tả kỹ thuật đầy đủ (Technical Specification & Prompt) để gửi trực tiếp cho AI Coding Agent (Antigravity) xây dựng trang web an lá số Bát Tự theo chuẩn **Toàn Chân Phái Hoa Sơn Bát Tự Học** của tác giả **Chu Thần Bân**, kết hợp bố cục và bảng màu truyền thống từ mẫu giao diện tham khảo.

> **LƯU Ý QUAN TRỌNG CHO AI CODER (ANTIGRAVITY):**
> Hệ thống **Hoa Sơn Bát Tự (Chu Thần Bân)** có hệ quy chiếu Thập Thần và quy tắc Sinh Khắc **KHÁC BIỆT CỐT LÕI** so với Bát Tự Tử Bình truyền thống:
> 1. **KHÔNG sử dụng Tàng Can (Địa chi tàng can)** trên giao diện chính.
> 2. **Đảo ngược định nghĩa Chính Tài và Thiên Tài** so với truyền thống (Ta khắc cùng giới = Chính Tài; Ta khắc khác giới = Thiên Tài).
> 3. **Tách biệt hoàn toàn công thức tính Thập Thần trên Thiên Can (tầng Vô hình) và dưới Địa Chi (tầng Hữu hình)** thành 2 bảng tra độc lập.
> 4. **Quy tắc sinh khắc Thiên Can, Địa Chi và Can Chi đồng trụ** phải tuân thủ 100% các ma trận dữ liệu được định nghĩa trong tài liệu này, tuyệt đối không dùng hàm tính Thập Thần mặc định của các thư viện Tử Bình thông thường.

## 1. Đặc Tả Giao Diện (UI/UX) & Bảng Màu Tham Chiếu

### 1.1. Bảng màu tổng thể (Theme & Ngũ Hành Colors)
Giao diện mô phỏng phong cách trang nhã, cổ điển của bảng lá số mẫu (`Nguhanh.net`) nhưng tối ưu hóa cho cấu trúc không Tàng Can của phái Hoa Sơn:

| Thành phần giao diện | Mã màu chuẩn (Hex) | Ghi chú áp dụng |
| :--- | :--- | :--- |
| **Nền chính của Lá số (Background)** | `#FDF8EE` | Màu giấy kem cổ điển, dịu mắt, có thể đặt watermark hình Bát Quái / Rồng mờ (`opacity: 0.06`) ở chính giữa. |
| **Viền bảng & Đường kẻ ô (Border)** | `#7DA7D9` | Viền ngoài khung đôi (`double border` hoặc `2px solid`), đường kẻ ô bên trong `1px solid #9BBCE0`. |
| **Nền cột nhãn bên trái & Header** | `#F2F6FA` | Chữ in hoa đậm màu `#1E293B`. |
| **Nền ô đang kích hoạt (Active Cell)** | `#FCE4B8` | Dùng để tô nổi bật cột **Đại Vận hiện tại** và ô **Lưu Niên năm hiện tại** (ví dụ: năm 2026). |
| **Hành KIM** (`Canh, Tân, Thân, Dậu`) | `#7A7A7A` | Màu xám bạc đậm (chữ đậm `font-weight: 700`). |
| **Hành MỘC** (`Giáp, Ất, Dần, Mão`) | `#15803D` | Màu xanh lá cây đậm. |
| **Hành THỦY** (`Nhâm, Quý, Hợi, Tý`) | `#1E3A8A` | Màu xanh dương đậm (Navy). |
| **Hành HỎA** (`Bính, Đinh, Tỵ, Ngọ`) | `#DC2626` | Màu đỏ tươi đậm. |
| **Hành THỔ** (`Mậu, Kỷ, Thìn, Tuất, Sửu, Mùi`) | `#854D0E` | Màu nâu đất / vàng đồng đậm. |

### 1.2. Bố cục chi tiết của Lá Số (Từ trên xuống dưới)

#### Khối 1: Header Thông Tin Đương Số
* **Góc trái:** Logo Bát Quái / Hoa Sơn + Tiêu đề lớn: `LÁ SỐ HOA SƠN BÁT TỰ` (Phụ đề: `Toàn Chân Phái Hoa Sơn Bát Tự Học - Chu Thần Bân`).
* **Góc phải (Thông tin cá nhân dạng 2 cột):**
  * `Họ và tên`: (Ví dụ: VÔ DANH KHÁCH)
  * `Giới tính`: `Dương Nam` | `Âm Nam` | `Dương Nữ` | `Âm Nữ` (Tự động xác định Âm/Dương theo Thiên Can năm sinh).
  * `Dương lịch`: `HH:mm DD/MM/YYYY`
  * `Âm lịch`: `HH:mm DD/MM/YYYY (Năm Can Chi)`
  * `Nạp âm Nhật trụ` (hoặc Niên trụ): Hiển thị tên Nạp âm (ví dụ: `Lộ Bàng Thổ`, `Thành Đầu Thổ`).

#### Khối 2: Bảng Tứ Trụ Chính (5 Cột: 1 Cột Nhãn + 4 Cột Trụ)
Vì Hoa Sơn Bát Tự **bỏ hàng Tàng Ẩn và Phó Tinh**, bảng Tứ Trụ sẽ gồm **6 hàng** cực kỳ cân đối và giàu thông tin chuyên môn của phái Hoa Sơn:

| Nhãn Hàng (Cột 1) | TRỤ NĂM (Cột 2) | TRỤ THÁNG (Cột 3) | TRỤ NGÀY - MỆNH (Cột 4) | TRỤ GIỜ (Cột 5) |
| :--- | :---: | :---: | :---: | :---: |
| **DƯƠNG LỊCH** | `YYYY` (VD: 1990) | `MM` (VD: 03) | `DD` (VD: 01) | `HH:mm` (VD: 02:00) |
| **THIÊN TINH (THẬP THẦN CAN)** | Tên Thập Thần Niên Can (VD: `Ấn`, `Tài`, `Quan`...) | Tên Thập Thần Nguyệt Can | **`NHẬT CHỦ`** *(Chữ đỏ in đậm)* | Tên Thập Thần Thời Can |
| **BÁT TỰ (THIÊN CAN & ĐỊA CHI)** | **NIÊN CAN** *(Cỡ chữ 28px)*<br>**NIÊN CHI** *(Cỡ chữ 28px)* | **NGUYỆT CAN**<br>**NGUYỆT CHI** | **NHẬT CAN**<br>**NHẬT CHI** | **THỜI CAN**<br>**THỜI CHI** |
| **ĐỊA TINH (THẬP THẦN CHI)** *(Thay cho Tàng Can)* | Tên Thập Thần Niên Chi *(Tra từ Bảng Địa Chi tr. 73)* | Tên Thập Thần Nguyệt Chi *(Nguyệt Lệnh)* | Tên Thập Thần Nhật Chi *(Cung Hôn Nhân)* | Tên Thập Thần Thời Chi *(Cung Tử Tức)* |
| **QUAN HỆ ĐỒNG TRỤ (CAN CHI LIÊN)** | Hiển thị tác dụng dọc Can-Chi (VD: `Can khắc Chi`, `Chi sinh Can`...) | Hiển thị tác dụng dọc Can-Chi cột Tháng | Hiển thị tác dụng dọc Can-Chi cột Ngày | Hiển thị tác dụng dọc Can-Chi cột Giờ |
| **THẦN SÁT & KHÔNG MỘ** | Danh sách Thần Sát, Không Vong, Lộc, Nhận tại Niên chi | Danh sách Thần Sát, Không Vong, Lộc, Nhận tại Nguyệt chi | Danh sách Thần Sát, Không Vong, Lộc, Nhận tại Nhật chi | Danh sách Thần Sát, Không Vong, Lộc, Nhận tại Thời chi |

#### Khối 3: Bảng Đại Vận (10 Cột Đại Vận)
* **Thanh thông tin khởi vận:** Hiển thị `Số tính đại vận = ...; Nhập đại vận lúc X tuổi Y tháng. Tiết khí [Tên tiết khí] bắt đầu DD-MM-YYYY HH:mm và kết thúc DD-MM-YYYY HH:mm`.
* **Hàng `ĐẠI VẬN` (Chia 10 cột tương ứng 10 Đại vận từ 1 đến 10):**
  * Trong mỗi cột hiển thị:
    1. **Thiên Can Đại Vận** & **Địa Chi Đại Vận** (tô màu Ngũ hành).
    2. **Thập Thần Can / Chi** của Đại vận đó theo chuẩn Hoa Sơn (hiển thị dạng `CanTinh / ChiTinh`, ví dụ: `Thương / Quan`, hoặc hiển thị Thập Thần chính và phụ dưới chân).
    3. **Độ tuổi** (ví dụ: `2-11t`, `12-21t`, `22-31t`...).
    4. **Năm Dương lịch bắt đầu** (ví dụ: `1991`, `2001`, `2011`...).
  * *Tương tác:* Mặc định tô màu nền `#FCE4B8` vào Đại vận chứa năm hiện tại; cho phép người dùng **click vào bất kỳ cột Đại vận nào** để xem 20 năm Lưu Niên tương ứng bên dưới.

#### Khối 4: Bảng Lưu Niên (2 Hàng x 10 Cột = 20 Năm Lưu Niên)
* **Hàng Lưu Niên 1:** 10 năm thuộc Đại vận đang được chọn (từ năm thứ 1 đến năm thứ 10 của Đại vận đó).
* **Hàng Lưu Niên 2:** 10 năm thuộc Đại vận kế tiếp ngay sau đó.
* Mỗi ô Lưu Niên hiển thị:
  1. **Thiên Can & Địa Chi của năm** (tô màu Ngũ hành).
  2. **Năm Dương lịch** (ví dụ: `2026`).
  3. **Tuổi của đương số** (ví dụ: `37t`).
  4. **Thập Thần Thiên Can** (và/hoặc Địa Chi) của Lưu niên đó theo chuẩn Hoa Sơn.

#### Khối 5: Bảng Tóm Tắt Cấu Trúc "3 Liên" & Tỷ Lệ Ngũ Hành (Đặc trưng Hoa Sơn)
Ngay dưới bảng Lưu Niên, hiển thị một khung tóm tắt tự động gồm 3 mục:
1. **Thống kê Tỷ lệ Ngũ Hành (trên 8 chữ nguyên cục):** Đếm số lượng `Kim`, `Mộc`, `Thủy`, `Hỏa`, `Thổ` (ví dụ: `Thổ: 3 | Mộc: 2 | Kim: 2 | Hỏa: 1 | Thủy: 0 [Khuyết Thủy]`). Đánh dấu hành **Cực đoan (nhiều nhất)** và hành **Khuyết (0 chữ)**.
2. **Tương tác Thiên Can Liên (Mặt cầu):** Liệt kê các cặp Tương Sinh, Tương Khắc, Tương Hợp, Tương Xung, Đồng Tài giữa 3 Thiên Can khách thể (`Niên - Nguyệt - Thời`).
3. **Tương tác Địa Chi Liên (Trụ cầu):** Liệt kê các cặp Lục Hợp, Lục Xung, Đồng Tài, Tam Hội Cục, Tam Hợp Cục giữa 4 Địa Chi (`Niên - Nguyệt - Nhật - Thời`).

## 2. Đặc Tả Logic Toán Học: Lập Tứ Trụ & Đại Vận

### 2.1. Quy ước Mảng Cơ Sở (0-indexed)
* **10 Thiên Can (`CAN`):**
  `0: Giáp`, `1: Ất`, `2: Bính`, `3: Đinh`, `4: Mậu`, `5: Kỷ`, `6: Canh`, `7: Tân`, `8: Nhâm`, `9: Quý`
  * **Phân loại Âm / Dương:** Index chẵn (`0, 2, 4, 6, 8`: Giáp, Bính, Mậu, Canh, Nhâm) là **Dương**; Index lẻ (`1, 3, 5, 7, 9`: Ất, Đinh, Kỷ, Tân, Quý) là **Âm**.
* **12 Địa Chi (`CHI`):**
  `0: Tý`, `1: Sửu`, `2: Dần`, `3: Mão`, `4: Thìn`, `5: Tỵ`, `6: Ngọ`, `7: Mùi`, `8: Thân`, `9: Dậu`, `10: Tuất`, `11: Hợi`
  * **Phân loại Âm / Dương Địa Chi (Trang 35 `bát tự.pdf`):**
    * **Dương Chi** (Index chẵn `0, 2, 4, 6, 8, 10`): `Tý, Dần, Thìn, Ngọ, Thân, Tuất`.
    * **Âm Chi** (Index lẻ `1, 3, 5, 7, 9, 11`): `Sửu, Mão, Tỵ, Mùi, Dậu, Hợi`.
  * **Ngũ hành của 12 Địa Chi (Trang 35 `bát tự.pdf`):**
    * `Dần, Mão`: **Mộc**
    * `Tỵ, Ngọ`: **Hỏa**
    * `Thìn, Tuất, Sửu, Mùi`: **Thổ** *(Tuyệt đối giữ nguyên thuộc tính Thổ thuần túy, không quy đổi theo Tàng Can)*
    * `Thân, Dậu`: **Kim**
    * `Hợi, Tý`: **Thủy**

### 2.2. Thuật toán xác định 4 Trụ (Niên, Nguyệt, Nhật, Thời)
> **Khuyến nghị thư viện cho AI Coder:** Có thể sử dụng thư viện lịch thiên văn chuẩn như `lunar-javascript` (hoặc thuật toán VSOP87 tính kinh độ Mặt Trời `solarLongitude`) **NHƯNG CHỈ DÙNG ĐỂ LẤY 8 CHỮ CAN CHI VÀ THỜI ĐIỂM TIẾT KHÍ**, toàn bộ phần Thập Thần và Sinh Khắc bên dưới bắt buộc phải tự tính bằng bảng của Hoa Sơn Bát Tự!

1. **Trụ Năm (Niên Trụ - Trang 21–22):**
   * Ranh giới chuyển năm là thời điểm chính xác tới từng phút của tiết **Lập Xuân** (kinh độ Mặt Trời = `315°`, thường rơi vào ngày 04 hoặc 05 tháng 2 Dương lịch).
   * Nếu thời điểm sinh `< thời điểm Lập Xuân` của năm Dương lịch `Y`, thì tính theo năm `Y - 1`. Nếu `>= thời điểm Lập Xuân`, tính theo năm `Y`.
   * Công thức tính từ năm đã hiệu chỉnh `Y_adj`:
     * `canNam = (Y_adj + 6) % 10`
     * `chiNam = (Y_adj + 8) % 12`

2. **Trụ Tháng (Nguyệt Trụ - Trang 22–23):**
   * Ranh giới tháng được chia theo **12 Tiết Khí** (không dùng tháng Âm lịch thông thường):
     * Tháng 1 (**Dần** - `chiThang = 2`): Từ **Lập Xuân** (`315°`) đến trước **Kinh Trập** (`345°`)
     * Tháng 2 (**Mão** - `chiThang = 3`): Từ **Kinh Trập** (`345°`) đến trước **Thanh Minh** (`15°`)
     * Tháng 3 (**Thìn** - `chiThang = 4`): Từ **Thanh Minh** (`15°`) đến trước **Lập Hạ** (`45°`)
     * Tháng 4 (**Tỵ** - `chiThang = 5`): Từ **Lập Hạ** (`45°`) đến trước **Mang Chủng** (`75°`)
     * Tháng 5 (**Ngọ** - `chiThang = 6`): Từ **Mang Chủng** (`75°`) đến trước **Tiểu Thử** (`105°`)
     * Tháng 6 (**Mùi** - `chiThang = 7`): Từ **Tiểu Thử** (`105°`) đến trước **Lập Thu** (`135°`)
     * Tháng 7 (**Thân** - `chiThang = 8`): Từ **Lập Thu** (`135°`) đến trước **Bạch Lộ** (`165°`)
     * Tháng 8 (**Dậu** - `chiThang = 9`): Từ **Bạch Lộ** (`165°`) đến trước **Hàn Lộ** (`195°`)
     * Tháng 9 (**Tuất** - `chiThang = 10`): Từ **Hàn Lộ** (`195°`) đến trước **Lập Đông** (`225°`)
     * Tháng 10 (**Hợi** - `chiThang = 11`): Từ **Lập Đông** (`225°`) đến trước **Đại Tuyết** (`255°`)
     * Tháng 11 (**Tý** - `chiThang = 0`): Từ **Đại Tuyết** (`255°`) đến trước **Tiểu Hàn** (`285°`)
     * Tháng 12 (**Sửu** - `chiThang = 1`): Từ **Tiểu Hàn** (`285°`) đến trước **Lập Xuân** (`315°`)
   * **Công thức tìm Thiên Can tháng (Ngũ Hổ Độn):**
     * Gọi `monthOrder` là thứ tự tháng tiết khí từ `1` (tháng Dần) đến `12` (tháng Sửu):
       `canThangDau (tháng Dần) = ((canNam % 5) * 2 + 2) % 10`
       `canThang = (canThangDau + (monthOrder - 1)) % 10`

3. **Trụ Ngày (Nhật Trụ):**
   * Tính số Ngày Julius (`JDN`) từ ngày Dương lịch `DD/MM/YYYY`:
     ```javascript
     function getJDN(day, month, year) {
       const a = Math.floor((14 - month) / 12);
       const y = year + 4800 - a;
       const m = month + 12 * a - 3;
       return day + Math.floor((153 * m + 2) / 5) + 365 * y + Math.floor(y / 4) - Math.floor(y / 100) + Math.floor(y / 400) - 32045;
     }
     // Index trong 60 Hoa Giáp (0 = Giáp Tý, ..., 59 = Quý Hợi):
     const jiaziIndex = (jdn + 49) % 60;
     const canNgay = jiaziIndex % 10;
     const chiNgay = jiaziIndex % 12;
     ```
   * *(Tuỳ chọn trên UI: Cho phép checkbox "Đổi ngày từ 23:00 giờ Tý đêm" hoặc "Đổi ngày lúc 00:00", mặc định chuẩn hiện đại đổi ngày lúc `00:00` như ảnh mẫu).*

4. **Trụ Giờ (Thời Trụ):**
   * Xác định `chiGio` từ giờ sinh (`hour`, `minute`):
     * `23:00 - 00:59`: Tý (`0`) | `01:00 - 02:59`: Sửu (`1`) | `03:00 - 04:59`: Dần (`2`) | `05:00 - 06:59`: Mão (`3`)
     * `07:00 - 08:59`: Thìn (`4`) | `09:00 - 10:59`: Tỵ (`5`) | `11:00 - 12:59`: Ngọ (`6`) | `13:00 - 14:59`: Mùi (`7`)
     * `15:00 - 16:59`: Thân (`8`) | `17:00 - 18:59`: Dậu (`9`) | `19:00 - 20:59`: Tuất (`10`) | `21:00 - 22:59`: Hợi (`11`)
   * **Công thức tìm Thiên Can giờ (Ngũ Thử Độn):**
     `canGioTy = (canNgay % 5) * 2`
     `canGio = (canGioTy + chiGio) % 10`

### 2.3. Thuật toán Tính Đại Vận & Số Tuổi Khởi Vận (Trang 26–29)
1. **Xác định chiều Thuận / Nghịch:**
   * **Dương Nam** (`canNam` chẵn & giới tính Nam) hoặc **Âm Nữ** (`canNam` lẻ & giới tính Nữ) $ightarrow$ **THUẬN HÀNH (`direction = +1`)**.
   * **Âm Nam** (`canNam` lẻ & giới tính Nam) hoặc **Dương Nữ** (`canNam` chẵn & giới tính Nữ) $ightarrow$ **NGHỊCH HÀNH (`direction = -1`)**.
2. **Tính thời gian khởi Đại vận:**
   * Nếu **Thuận hành**: Tính khoảng thời gian `deltaMinutes` từ thời điểm sinh đến **Tiết khí đầu tháng tiếp theo**.
   * Nếu **Nghịch hành**: Tính khoảng thời gian `deltaMinutes` từ thời điểm sinh lùi về **Tiết khí đầu tháng hiện tại (vừa qua)**.
   * Quy đổi theo tỷ lệ chuẩn (`3 ngày = 1 năm`, tức `4320 phút = 1 năm`, `360 phút = 1 tháng`, `12 phút = 1 ngày`):
     ```javascript
     const exactYears = deltaMinutes / 4320;
     const startYears = Math.floor(deltaMinutes / 4320);
     const remMinutes = deltaMinutes % 4320;
     const startMonths = Math.floor(remMinutes / 360);
     // Số tuổi hiển thị trên bảng Đại vận (làm tròn như mẫu):
     const startAgeDisplay = startMonths >= 6 ? startYears + 1 : Math.max(1, startYears);
     ```
3. **Lập 10 cột Đại Vận:**
   * Bắt đầu từ `Nguyệt Trụ (canThang, chiThang)`, cộng/trừ `direction` cho từng Đại vận `i` (từ `1` đến `10`):
     `canDaiVan[i] = (canThang + i * direction + 100) % 10`
     `chiDaiVan[i] = (chiThang + i * direction + 120) % 12`

## 3. Logic Cốt Lõi Độc Quyền Của Chu Thần Bân: Ma Trận Thập Thần 2 Tầng

> **CẢNH BÁO BẮT BUỘC:** Đây là phần làm nên giá trị của web app Hoa Sơn Bát Tự. Phải cài đặt chính xác 2 bảng tra dưới đây (dựa trên Trang 34, 35, 59–67, 71, 73 của sách `bát tự.pdf`).

### 3.1. Bảng 1: Ma Trận Thập Thần THIÊN CAN (Tầng Vô Hình - Trang 34, 59–67)
* **Nguyên lý gốc của Hoa Sơn trên Thiên Can:**
  * Sinh Ta: Khác giới = **Chính Ấn (`Ấn`)**, Cùng giới = **Kiêu Thần (`Kiêu`)**.
  * Khắc Ta: Khác giới = **Chính Quan (`Quan`)**, Cùng giới = **Thất Sát (`Sát`)**.
  * Đồng hành với Ta: Cùng giới = **Tỷ Kiên (`Tỷ`)**, Khác giới = **Kiếp Tài (`Kiếp`)**.
  * Ta sinh: Khác giới = **Thương Quan (`Thương`)**, Cùng giới = **Thực Thần (`Thực`)**.
  * **Ta khắc (ĐẢO NGƯỢC VỚI TỬ BÌNH TRUYỀN THỐNG!):**
    * **Cùng giới** Ta khắc (Dương khắc Dương, Âm khắc Âm) = **Chính Tài (`Tài`)**!
    * **Khác giới** Ta khắc (Dương khắc Âm, Âm khắc Dương) = **Thiên Tài (`T.Tài`)**!

Bảng tra trực tiếp `THAP_THAN_THIEN_CAN[nhatCan][targetCan]`:

| Nhật Can \ Can Khác | Giáp | Ất | Bính | Đinh | Mậu | Kỷ | Canh | Tân | Nhâm | Quý |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **Giáp** | Tỷ Kiên (`Tỷ`) | Kiếp Tài (`Kiếp`) | Thực Thần (`Thực`) | Thương Quan (`Thương`) | **Chính Tài (`Tài`)** | **Thiên Tài (`T.Tài`)** | Thất Sát (`Sát`) | Chính Quan (`Quan`) | Kiêu Thần (`Kiêu`) | Chính Ấn (`Ấn`) |
| **Ất** | Kiếp Tài (`Kiếp`) | Tỷ Kiên (`Tỷ`) | Thương Quan (`Thương`) | Thực Thần (`Thực`) | **Thiên Tài (`T.Tài`)** | **Chính Tài (`Tài`)** | Chính Quan (`Quan`) | Thất Sát (`Sát`) | Chính Ấn (`Ấn`) | Kiêu Thần (`Kiêu`) |
| **Bính** | Kiêu Thần (`Kiêu`) | Chính Ấn (`Ấn`) | Tỷ Kiên (`Tỷ`) | Kiếp Tài (`Kiếp`) | Thực Thần (`Thực`) | Thương Quan (`Thương`) | **Chính Tài (`Tài`)** | **Thiên Tài (`T.Tài`)** | Thất Sát (`Sát`) | Chính Quan (`Quan`) |
| **Đinh** | Chính Ấn (`Ấn`) | Kiêu Thần (`Kiêu`) | Kiếp Tài (`Kiếp`) | Tỷ Kiên (`Tỷ`) | Thương Quan (`Thương`) | Thực Thần (`Thực`) | **Thiên Tài (`T.Tài`)** | **Chính Tài (`Tài`)** | Chính Quan (`Quan`) | Thất Sát (`Sát`) |
| **Mậu** | Thất Sát (`Sát`) | Chính Quan (`Quan`) | Kiêu Thần (`Kiêu`) | Chính Ấn (`Ấn`) | Tỷ Kiên (`Tỷ`) | Kiếp Tài (`Kiếp`) | Thực Thần (`Thực`) | Thương Quan (`Thương`) | **Chính Tài (`Tài`)** | **Thiên Tài (`T.Tài`)** |
| **Kỷ** | Chính Quan (`Quan`) | Thất Sát (`Sát`) | Chính Ấn (`Ấn`) | Kiêu Thần (`Kiêu`) | Kiếp Tài (`Kiếp`) | Tỷ Kiên (`Tỷ`) | Thương Quan (`Thương`) | Thực Thần (`Thực`) | **Thiên Tài (`T.Tài`)** | **Chính Tài (`Tài`)** |
| **Canh** | **Chính Tài (`Tài`)** | **Thiên Tài (`T.Tài`)** | Thất Sát (`Sát`) | Chính Quan (`Quan`) | Kiêu Thần (`Kiêu`) | Chính Ấn (`Ấn`) | Tỷ Kiên (`Tỷ`) | Kiếp Tài (`Kiếp`) | Thực Thần (`Thực`) | Thương Quan (`Thương`) |
| **Tân** | **Thiên Tài (`T.Tài`)** | **Chính Tài (`Tài`)** | Chính Quan (`Quan`) | Thất Sát (`Sát`) | Chính Ấn (`Ấn`) | Kiêu Thần (`Kiêu`) | Kiếp Tài (`Kiếp`) | Tỷ Kiên (`Tỷ`) | Thương Quan (`Thương`) | Thực Thần (`Thực`) |
| **Nhâm** | Thực Thần (`Thực`) | Thương Quan (`Thương`) | **Chính Tài (`Tài`)** | **Thiên Tài (`T.Tài`)** | Thất Sát (`Sát`) | Chính Quan (`Quan`) | Kiêu Thần (`Kiêu`) | Chính Ấn (`Ấn`) | Tỷ Kiên (`Tỷ`) | Kiếp Tài (`Kiếp`) |
| **Quý** | Thương Quan (`Thương`) | Thực Thần (`Thực`) | **Thiên Tài (`T.Tài`)** | **Chính Tài (`Tài`)** | Chính Quan (`Quan`) | Thất Sát (`Sát`) | Chính Ấn (`Ấn`) | Kiêu Thần (`Kiêu`) | Kiếp Tài (`Kiếp`) | Tỷ Kiên (`Tỷ`) |

### 3.2. Bảng 2: Ma Trận Thập Thần ĐỊA CHI (Tầng Hữu Hình - Trang 71, 72, 73)
* **Nguyên lý gốc của Hoa Sơn dưới Địa Chi (Trang 71–72):**
  Vì Địa Chi là vật chất hữu hình, lực tác dụng "Hình và Thực" giữa Địa Chi với Nhật Can tuân theo quy luật **Cùng giới mới tương sinh khắc thực chất**:
  * **Địa chi cùng giới sinh Nhật can = Chính Ấn (`Ấn`)**; Địa chi khác giới sinh Nhật can = **Kiêu Thần (`Kiêu`)**.
  * **Địa chi cùng giới khắc Nhật can = Thất Sát (`Sát`)**; Địa chi khác giới khắc Nhật can = **Chính Quan (`Quan`)**.
  * **Nhật can sinh Địa chi cùng giới = Thương Quan (`Thương`)**; Nhật can sinh Địa chi khác giới = **Thực Thần (`Thực`)**.
  * **Nhật can khắc Địa chi cùng giới = Chính Tài (`Tài`)**; Nhật can khắc Địa chi khác giới = **Thiên Tài (`T.Tài`)**.
  * **Địa chi cùng hành cùng giới với Nhật can = Tỷ Kiên (`Tỷ`)**; Địa chi cùng hành khác giới = **Kiếp Tài (`Kiếp`)**.

Bảng tra trực tiếp `THAP_THAN_DIA_CHI[nhatCan][targetChi]` (Sao chép chính xác 100% từ **Bảng Trang 73** của sách `bát tự.pdf`):

| Nhật Can \ Địa Chi | Tý *(Dương Thủy)* | Sửu *(Âm Thổ)* | Dần *(Dương Mộc)* | Mão *(Âm Mộc)* | Thìn *(Dương Thổ)* | Tỵ *(Âm Hỏa)* | Ngọ *(Dương Hỏa)* | Mùi *(Âm Thổ)* | Thân *(Dương Kim)* | Dậu *(Âm Kim)* | Tuất *(Dương Thổ)* | Hợi *(Âm Thủy)* |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **Giáp** | Chính Ấn (`Ấn`) | Thiên Tài (`T.Tài`) | Tỷ Kiên (`Tỷ`) | Kiếp Tài (`Kiếp`) | Chính Tài (`Tài`) | Thực Thần (`Thực`) | Thương Quan (`Thương`) | Thiên Tài (`T.Tài`) | Thất Sát (`Sát`) | Chính Quan (`Quan`) | Chính Tài (`Tài`) | Kiêu Thần (`Kiêu`) |
| **Ất** | Kiêu Thần (`Kiêu`) | Chính Tài (`Tài`) | Kiếp Tài (`Kiếp`) | Tỷ Kiên (`Tỷ`) | Thiên Tài (`T.Tài`) | Thương Quan (`Thương`) | Thực Thần (`Thực`) | Chính Tài (`Tài`) | Chính Quan (`Quan`) | Thất Sát (`Sát`) | Thiên Tài (`T.Tài`) | Chính Ấn (`Ấn`) |
| **Bính** | Thất Sát (`Sát`) | Thực Thần (`Thực`) | Chính Ấn (`Ấn`) | Kiêu Thần (`Kiêu`) | Thương Quan (`Thương`) | Kiếp Tài (`Kiếp`) | Tỷ Kiên (`Tỷ`) | Thực Thần (`Thực`) | Chính Tài (`Tài`) | Thiên Tài (`T.Tài`) | Thương Quan (`Thương`) | Chính Quan (`Quan`) |
| **Đinh** | Chính Quan (`Quan`) | Thương Quan (`Thương`) | Kiêu Thần (`Kiêu`) | Chính Ấn (`Ấn`) | Thực Thần (`Thực`) | Tỷ Kiên (`Tỷ`) | Kiếp Tài (`Kiếp`) | Thương Quan (`Thương`) | Thiên Tài (`T.Tài`) | Chính Tài (`Tài`) | Thực Thần (`Thực`) | Thất Sát (`Sát`) |
| **Mậu** | Chính Tài (`Tài`) | Kiếp Tài (`Kiếp`) | Thất Sát (`Sát`) | Chính Quan (`Quan`) | Tỷ Kiên (`Tỷ`) | Kiêu Thần (`Kiêu`) | Chính Ấn (`Ấn`) | Kiếp Tài (`Kiếp`) | Thương Quan (`Thương`) | Thực Thần (`Thực`) | Tỷ Kiên (`Tỷ`) | Thiên Tài (`T.Tài`) |
| **Kỷ** | Thiên Tài (`T.Tài`) | Tỷ Kiên (`Tỷ`) | Chính Quan (`Quan`) | Thất Sát (`Sát`) | Kiếp Tài (`Kiếp`) | Chính Ấn (`Ấn`) | Kiêu Thần (`Kiêu`) | Tỷ Kiên (`Tỷ`) | Thực Thần (`Thực`) | Thương Quan (`Thương`) | Kiếp Tài (`Kiếp`) | Chính Tài (`Tài`) |
| **Canh** | Thương Quan (`Thương`) | Kiêu Thần (`Kiêu`) | Chính Tài (`Tài`) | Thiên Tài (`T.Tài`) | Chính Ấn (`Ấn`) | Chính Quan (`Quan`) | Thất Sát (`Sát`) | Kiêu Thần (`Kiêu`) | Tỷ Kiên (`Tỷ`) | Kiếp Tài (`Kiếp`) | Chính Ấn (`Ấn`) | Thực Thần (`Thực`) |
| **Tân** | Thực Thần (`Thực`) | Chính Ấn (`Ấn`) | Thiên Tài (`T.Tài`) | Chính Tài (`Tài`) | Kiêu Thần (`Kiêu`) | Thất Sát (`Sát`) | Chính Quan (`Quan`) | Chính Ấn (`Ấn`) | Kiếp Tài (`Kiếp`) | Tỷ Kiên (`Tỷ`) | Kiêu Thần (`Kiêu`) | Thương Quan (`Thương`) |
| **Nhâm** | Tỷ Kiên (`Tỷ`) | Chính Quan (`Quan`) | Thương Quan (`Thương`) | Thực Thần (`Thực`) | Thất Sát (`Sát`) | Thiên Tài (`T.Tài`) | Chính Tài (`Tài`) | Chính Quan (`Quan`) | Chính Ấn (`Ấn`) | Kiêu Thần (`Kiêu`) | Thất Sát (`Sát`) | Kiếp Tài (`Kiếp`) |
| **Quý** | Kiếp Tài (`Kiếp`) | Thất Sát (`Sát`) | Thực Thần (`Thực`) | Thương Quan (`Thương`) | Chính Quan (`Quan`) | Chính Tài (`Tài`) | Thiên Tài (`T.Tài`) | Thất Sát (`Sát`) | Kiêu Thần (`Kiêu`) | Chính Ấn (`Ấn`) | Chính Quan (`Quan`) | Tỷ Kiên (`Tỷ`) |

## 4. Logic Tự Động Phân Tích "3 Liên" (Thiên Can Liên – Địa Chi Liên – Can Chi Liên)

Để trang web hỗ trợ người xem phân tích đúng phương pháp Hoa Sơn Bát Tự (Trang 33–37, 41–43, 176), hệ thống cần cài đặt các quy tắc kiểm tra tương tác sau:

### 4.1. Quy tắc 1: Tác dụng Dọc trong từng cột (`Can Chi Liên` - Trang 36–37, 176)
Trong mỗi cột (`Niên, Nguyệt, Nhật, Thời`), kiểm tra cặp `(Can, Chi)` đồng trụ theo đúng khẩu quyết âm dương của Hoa Sơn (chỉ những cặp dưới đây mới sinh/khắc trực tiếp với nhau):

* **Can Chi Đồng Khí (Cùng Ngũ Hành - "Can chi gánh" vững chắc):**
  `Giáp Dần`, `Ất Mão`, `Bính Ngọ`, `Đinh Tỵ`, `Mậu Thìn`, `Mậu Tuất`, `Kỷ Sửu`, `Kỷ Mùi`, `Canh Thân`, `Tân Dậu`, `Nhâm Tý`, `Quý Hợi` (và các cặp cùng hành khác giới như `Giáp Mão`, `Ất Dần`, `Bính Tỵ`, `Đinh Ngọ`, `Mậu Sửu`, `Mậu Mùi`, `Kỷ Thìn`, `Kỷ Tuất`, `Canh Dậu`, `Tân Thân`, `Nhâm Hợi`, `Quý Tý`).
* **Địa Chi Sinh Thiên Can Đồng Trụ ("Chi sinh Can" - Đắc căn vững chắc - Trang 36–37):**
  * `Giáp Tý` (*Tý thủy sinh Giáp mộc*)
  * `Ất Hợi` (*Hợi thủy sinh Ất mộc*)
  * `Bính Dần` (*Dần mộc sinh Bính hỏa*)
  * `Đinh Mão` (*Mão mộc sinh Đinh hỏa*)
  * `Mậu Ngọ` (*Ngọ hỏa sinh Mậu thổ*)
  * `Kỷ Tỵ` (*Tỵ hỏa sinh Kỷ thổ*)
  * `Canh Thìn`, `Canh Tuất` (*Thìn Tuất thổ sinh Canh kim*)
  * `Tân Sửu`, `Tân Mùi` (*Sửu Mùi thổ sinh Tân kim*)
  * `Nhâm Thân` (*Thân kim sinh Nhâm thủy*)
  * `Quý Dậu` (*Dậu kim sinh Quý thủy*)
* **Thiên Can Sinh Địa Chi Đồng Trụ ("Can sinh Chi" - Trang 36–37):**
  * `Giáp Ngọ` (*Giáp mộc sinh Ngọ hỏa*), `Ất Tỵ` (*Ất mộc sinh Tỵ hỏa*)
  * `Bính Thìn`, `Bính Tuất` (*Bính hỏa sinh Thìn Tuất thổ*), `Đinh Sửu`, `Đinh Mùi` (*Đinh hỏa sinh Sửu Mùi thổ*)
  * `Mậu Thân` (*Mậu thổ sinh Thân kim*), `Kỷ Dậu` (*Kỷ thổ sinh Dậu kim*)
  * `Canh Tý` (*Canh kim sinh Tý thủy*), `Tân Hợi` (*Tân kim sinh Hợi thủy*)
  * `Nhâm Dần` (*Nhâm thủy sinh Dần mộc*), `Quý Mão` (*Quý thủy sinh Mão mộc*)
* **Địa Chi Khắc Ngược Thiên Can Đồng Trụ ("Chi khắc Can" - Căn cơ bị đả thương - Trang 37, 187):**
  * `Giáp Thân` (*Thân kim khắc Giáp mộc*), `Ất Dậu` (*Dậu kim khắc Ất mộc*)
  * `Bính Tý` (*Tý thủy khắc Bính hỏa*), `Đinh Hợi` (*Hợi thủy khắc Đinh hỏa*)
  * `Mậu Dần` (*Dần mộc khắc Mậu thổ*), `Kỷ Mão` (*Kỷ mộc khắc Kỷ thổ*)
  * `Canh Ngọ` (*Ngọ hỏa khắc Canh kim*), `Tân Tỵ` (*Tỵ hỏa khắc Tân kim*)
  * `Nhâm Thìn`, `Nhâm Tuất` (*Thìn Tuất thổ khắc Nhâm thủy*)
  * `Quý Sửu`, `Quý Mùi` (*Sửu Mùi thổ khắc Quý thủy*)
* **Thiên Can Khắc Địa Chi Đồng Trụ ("Can khắc Chi" - Trang 37):**
  * `Giáp Thìn`, `Giáp Tuất` (*Giáp mộc khắc Thìn Tuất thổ*), `Ất Sửu`, `Ất Mùi` (*Ất mộc khắc Sửu Mùi thổ*)
  * `Bính Thân` (*Bính hỏa khắc Thân kim*), `Đinh Dậu` (*Đinh hỏa khắc Dậu kim*)
  * `Mậu Tý` (*Mậu thổ khắc Tý thủy*), `Kỷ Hợi` (*Kỷ thổ khắc Hợi thủy*)
  * `Canh Dần` (*Canh kim khắc Dần mộc*), `Tân Mão` (*Tân kim khắc Mão mộc*)
  * `Nhâm Ngọ` (*Nhâm thủy khắc Ngọ hỏa*), `Quý Tỵ` (*Quý thủy khắc Tỵ hỏa*)
* *(Các tổ hợp Can Chi còn lại không cùng cực tương ứng theo trang 36–37 được hiển thị là `Khác phái (Ít tác dụng trực tiếp)`).*

### 4.2. Quy tắc 2: Tác dụng Ngang giữa các Thiên Can (`Thiên Can Liên` - Trang 33–34)
* **5 Cặp Thiên Can Tương Hợp:** `Giáp – Kỷ`, `Ất – Canh`, `Bính – Tân`, `Đinh – Nhâm`, `Mậu – Quý`.
* **4 Cặp Thiên Can Tương Xung:** `Giáp – Canh`, `Ất – Tân`, `Bính – Nhâm`, `Đinh – Quý`.
* **10 Cặp Thiên Can Tương Sinh (Khác giới tương sinh):**
  `Giáp -> Đinh`, `Ất -> Bính`, `Bính -> Kỷ`, `Đinh -> Mậu`, `Mậu -> Tân`, `Kỷ -> Canh`, `Canh -> Quý`, `Tân -> Nhâm`, `Nhâm -> Ất`, `Quý -> Giáp`.
* **10 Cặp Thiên Can Tương Khắc (Cùng giới tương khắc):**
  `Giáp -> Mậu`, `Ất -> Kỷ`, `Bính -> Canh`, `Đinh -> Tân`, `Mậu -> Nhâm`, `Kỷ -> Quý`, `Canh -> Giáp`, `Tân -> Ất`, `Nhâm -> Bính`, `Quý -> Đinh`.

### 4.3. Quy tắc 3: Tác dụng Ngang giữa các Địa Chi (`Địa Chi Liên` - Trang 35, 37, 176, 186)
> **Lưu ý:** Giữa 4 Địa Chi **KHÔNG xét ngũ hành sinh khắc ngang**, chỉ kiểm tra các quan hệ làm **Cường thế (Vững chắc)** hoặc **Yếu thế (Dao động)** sau:
* **6 Cặp Lục Hợp (Tương Hợp $ightarrow$ Vững chắc):**
  `Tý – Sửu`, `Dần – Hợi`, `Mão – Tuất`, `Thìn – Dậu`, `Tỵ – Thân`, `Ngọ – Mùi`.
* **Đồng Tài (2 Địa Chi giống hệt nhau $ightarrow$ Vững chắc):** Ví dụ `Dần – Dần`, `Tuất – Tuất`.
* **4 Tổ hợp Tam Hội Cục (Mạnh nhất dưới Địa Chi - Trang 37, 186):**
  * `Dần – Mão – Thìn`: Tam hội Mộc cục
  * `Tỵ – Ngọ – Mùi`: Tam hội Hỏa cục
  * `Thân – Dậu – Tuất`: Tam hội Kim cục
  * `Hợi – Tý – Sửu`: Tam hội Thủy cục
* **4 Tổ hợp Tam Hợp Cục (Trang 37, 176):**
  * `Tỵ – Dậu – Sửu`: Tam hợp Dậu Kim cục
  * `Dần – Ngọ – Tuất`: Tam hợp Ngọ Hỏa cục
  * `Thân – Tý – Thìn`: Tam hợp Tý Thủy cục
  * `Hợi – Mão – Mùi`: Tam hợp Mão Mộc cục
* **6 Cặp Lục Xung (Tương Xung $ightarrow$ Dao động, Yếu thế - Trang 35, 176):**
  `Tý – Ngọ`, `Sửu – Mùi`, `Dần – Thân`, `Mão – Dậu`, `Thìn – Tuất`, `Tỵ – Hợi`.

## 5. Bảng Tra Phụ Trợ: Lục Thân, Không Vong, Lộc Nhận, Quý Nhân & Nạp Âm

### 5.1. Bảng Định Vị Lục Thân Chuẩn Hoa Sơn (Trang 101 `bát tự.pdf`)
Có thể hiển thị dạng Tooltip hoặc bảng chú giải nhanh bên dưới lá số theo giới tính của Mệnh chủ:

| Thập Thần | Ý nghĩa Lục Thân cho NAM MỆNH | Ý nghĩa Lục Thân cho NỮ MỆNH |
| :--- | :--- | :--- |
| **Chính Ấn (`Ấn`)** | Mẹ, Bà | Mẹ, Bà |
| **Kiêu Thần (`Kiêu`)** | Mẹ kế, Cô giáo, **Mẹ vợ** | Mẹ kế, Cô giáo, Nữ quản gia |
| **Chính Tài (`Tài`)** | **Bố**, Ông, Cụ, **Vợ** | **Bố**, Ông, Cụ |
| **Thiên Tài (`T.Tài`)** | Bố dượng, Thầy giáo, **Bố vợ**, Tình nhân | Bố dượng, Thầy giáo, Anh |
| **Chính Quan (`Quan`)** | **Trưởng nữ (Con gái đầu)** | **Chồng**, **Con trai trưởng (Con trai đầu)** |
| **Thất Sát (`Sát`)** | **Con trai trưởng (Con trai đầu)** | Tình nhân, **Trưởng nữ (Con gái đầu)** |
| **Thực Thần (`Thực`)** | **Con trai út / thứ**, Học trò nam | **Con gái út / thứ**, Học trò nữ |
| **Thương Quan (`Thương`)** | **Con gái út / thứ**, Học trò nữ | **Con trai út / thứ**, Học trò nam |
| **Tỷ Kiên (`Tỷ`)** | Anh chị em ruột | Anh chị em ruột |
| **Kiếp Tài (`Kiếp`)** | Anh chị em họ cùng thế hệ | Anh chị em họ cùng thế hệ |

### 5.2. Công thức Tính Không Vong, Lộc Thần, Dương Nhận &Thần Sát Cơ Bản
1. **Tuần Không (Không Vong) tính từ Nhật Trụ (và Niên Trụ):**
   * Công thức tìm 2 Địa Chi Không Vong của một trụ `(can, chi)`:
     `kv1 = (chi - can + 10 + 12) % 12`
     `kv2 = (chi - can + 11 + 12) % 12`
   * Cụ thể 6 tuần Giáp:
     * Tuần *Giáp Tý*: Không vong tại **Tuất, Hợi**
     * Tuần *Giáp Tuất*: Không vong tại **Thân, Dậu**
     * Tuần *Giáp Thân*: Không vong tại **Ngọ, Mùi**
     * Tuần *Giáp Ngọ*: Không vong tại **Thìn, Tỵ**
     * Tuần *Giáp Thìn*: Không vong tại **Dần, Mão**
     * Tuần *Giáp Dần*: Không vong tại **Tý, Sửu**
2. **Lộc Thần & Dương Nhận (Kình Dương) theo Nhật Can:**
   * `Giáp`: Lộc tại **Dần**, Nhận tại **Mão**
   * `Ất`: Lộc tại **Mão**, Nhận tại **Dần**
   * `Bính, Mậu`: Lộc tại **Tỵ**, Nhận tại **Ngọ**
   * `Đinh, Kỷ`: Lộc tại **Ngọ**, Nhận tại **Tỵ**
   * `Canh`: Lộc tại **Thân**, Nhận tại **Dậu**
   * `Tân`: Lộc tại **Dậu**, Nhận tại **Thân**
   * `Nhâm`: Lộc tại **Hợi**, Nhận tại **Tý**
   * `Quý`: Lộc tại **Tý**, Nhận tại **Hợi**
3. **Các Thần Sát thông dụng (giống mẫu ảnh tham khảo):**
   * **Thiên Ất Quý Nhân** (theo Nhật Can / Niên Can):
     * `Giáp, Mậu, Canh`: **Sửu, Mùi**
     * `Ất, Kỷ`: **Tý, Thân**
     * `Bính, Đinh`: **Hợi, Dậu**
     * `Nhâm, Quý`: **Mão, Tỵ**
     * `Tân`: **Dần, Ngọ**
   * **Văn Xương Quý Nhân** (theo Nhật Can / Niên Can):
     `Giáp -> Tỵ`, `Ất -> Ngọ`, `Bính/Mậu -> Thân`, `Đinh/Kỷ -> Dậu`, `Canh -> Hợi`, `Tân -> Tý`, `Nhâm -> Dần`, `Quý -> Mão`.
   * **Đào Hoa / Hoa Cái / Dịch Mã / Tướng Tinh** (tra theo Tam hợp Niên Chi và Nhật Chi):
     * Nhóm `Thân – Tý – Thìn`: Đào Hoa = **Dậu**, Hoa Cái = **Thìn**, Dịch Mã = **Dần**, Tướng Tinh = **Tý**.
     * Nhóm `Dần – Ngọ – Tuất`: Đào Hoa = **Mão**, Hoa Cái = **Tuất**, Dịch Mã = **Thân**, Tướng Tinh = **Ngọ**.
     * Nhóm `Tỵ – Dậu – Sửu`: Đào Hoa = **Ngọ**, Hoa Cái = **Sửu**, Dịch Mã = **Hợi**, Tướng Tinh = **Dậu**.
     * Nhóm `Hợi – Mão – Mùi`: Đào Hoa = **Tý**, Hoa Cái = **Mùi**, Dịch Mã = **Tỵ**, Tướng Tinh = **Mão**.

### 5.3. Bảng 60 Hoa Giáp Nạp Âm (30 Cặp Nạp Âm)
```javascript
const NAP_AM_30 = [
  "Hải Trung Kim", "Lô Trung Hỏa", "Đại Lâm Mộc", "Lộ Bàng Thổ", "Kiếm Phong Kim",
  "Sơn Đầu Hỏa", "Giản Hạ Thủy", "Thành Đầu Thổ", "Bạch Lạp Kim", "Dương Liễu Mộc",
  "Tuyền Trung Thủy", "Ốc Thượng Thổ", "Tích Lịch Hỏa", "Tùng Bách Mộc", "Trường Lưu Thủy",
  "Sa Trung Kim", "Sơn Hạ Hỏa", "Bình Địa Mộc", "Bích Thượng Thổ", "Kim Bạch Kim",
  "Phú Đăng Hỏa", "Thiên Hà Thủy", "Đại Trạch Thổ", "Thoa Xuyến Kim", "Tang Đố Mộc",
  "Đại Khê Thủy", "Sa Trung Thổ", "Thiên Thượng Hỏa", "Thạch Lựu Mộc", "Đại Hải Thủy"
];
// Với jiaziIndex (0..59), Nạp âm là: NAP_AM_30[Math.floor(jiaziIndex / 2)]
```

## 6. Test Case Chuẩn Để Kiểm Thử (Unit Test Cho AI Coder)

Sau khi code xong, hãy yêu cầu AI Coder chạy kiểm thử với lá số trong ảnh mẫu (**Dương Nam: 02:00 ngày 01/03/1990 Dương lịch**):
* **Tứ Trụ phải ra đúng:**
  * Niên trụ: **Canh Ngọ**
  * Nguyệt trụ: **Mậu Dần**
  * Nhật trụ: **Ất Sửu** (Nhật chủ: **Ất Mộc** - Nạp âm: **Hải Trung Kim** cho Ất Sửu, hoặc **Lộ Bàng Thổ** cho năm Canh Ngọ)
  * Thời trụ: **Đinh Sửu**
* **Thập Thần Thiên Can (chuẩn Hoa Sơn - so với Nhật chủ Ất Mộc):**
  * `Canh` (Niên can) = **Chính Quan (`Quan`)**
  * `Mậu` (Nguyệt can) = **Thiên Tài (`T.Tài`)** *(Chú ý: Tử Bình gọi Mậu là Chính Tài, nhưng Hoa Sơn bắt buộc hiển thị là **Thiên Tài** vì Ất Âm Mộc khắc Mậu Dương Thổ khác giới!)*
  * `Ất` (Nhật can) = **NHẬT CHỦ**
  * `Đinh` (Thời can) = **Thực Thần (`Thực`)**
* **Thập Thần Địa Chi (chuẩn Hoa Sơn Bảng trang 73 - so với Nhật chủ Ất Mộc):**
  * `Ngọ` (Niên chi) = **Thực Thần (`Thực`)**
  * `Dần` (Nguyệt chi) = **Kiếp Tài (`Kiếp`)**
  * `Sửu` (Nhật chi) = **Chính Tài (`Tài`)**
  * `Sửu` (Thời chi) = **Chính Tài (`Tài`)**
* **Quan hệ Can Chi đồng trụ (Can Chi Liên):**
  * Cột Năm (`Canh Ngọ`): `Chi khắc Can (Ngọ hỏa khắc Canh kim)`
  * Cột Tháng (`Mậu Dần`): `Chi khắc Can (Dần mộc khắc Mậu thổ)`
  * Cột Ngày (`Ất Sửu`): `Can khắc Chi (Ất mộc khắc Sửu thổ)`
  * Cột Giờ (`Đinh Sửu`): `Can sinh Chi (Đinh hỏa sinh Sửu thổ)`
