# Website Tra Cứu & Gợi Ý SIM Phong Thủy Lục Hào - Kinh Dịch

Website ứng dụng thuật toán Dịch học Lục Hào để tự động gợi ý và xếp hạng các dãy số SIM điện thoại Đại Cát Tường dựa trên Ngày Tháng Năm Sinh & 5 Nhu Cầu cầu việc (Cầu tài, Cầu quan, Sức khỏe, Con cái, Hôn nhân).

## 🚀 Hướng dẫn Upload thủ công lên Vercel

1. **Cách 1: Upload thư mục trực tiếp qua Vercel Dashboard (Kéo thả)**
   - Đăng nhập vào [vercel.com](https://vercel.com).
   - Chọn **Add New...** -> **Project**.
   - Kéo thả toàn bộ thư mục `sim-phong-thuy` này vào Vercel.
   - Nhấn **Deploy** (không cần cấu hình build command nào cả vì đây là Web tĩnh HTML/CSS/JS).

2. **Cách 2: Deploy qua Vercel CLI (Dòng lệnh)**
   - Mở cửa sổ Terminal tại thư mục `sim-phong-thuy`.
   - Chạy lệnh:
     ```bash
     npx vercel
     ```
   - Chọn các tùy chọn mặc định để hoàn tất deploy.

3. **Cách 3: Đẩy lên GitHub & Liên kết Vercel**
   - Đẩy thư mục này lên một Repository riêng trên GitHub.
   - Kết nối GitHub Repository đó vào Vercel để tự động Deploy mỗi khi cập nhật file.

## 🛠 Cấu trúc Dự án
- `index.html`: Giao diện chính với bộ điền 10 ô vuông số điện thoại (UI chuẩn như mẫu).
- `css/styles.css`: Giao diện phong cách Obsidian & Dark Gold Luxury.
- `js/luchao-core.js`: Core engine tính Can Chi, Lịch Âm/Dương, Nạp Giáp & Quẻ Lục Hào.
- `js/sim-engine.js`: Algorithim kiểm tra Hào Thế không bị Nhật/Nguyệt khắc & đánh giá Dụng Thần Vượng.
- `js/app.js`: Xử lý tương tác Form, chuyển focus tự động ô chữ số, render lá quẻ & nút sao chép Zalo.
- `vercel.json`: Cấu hình routing cho Vercel.
