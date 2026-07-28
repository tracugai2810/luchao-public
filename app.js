/* ========================================
   LỤC HÀO WEBAPP - JAVASCRIPT
   All divination logic and UI interactions
   ======================================== */

// --- Anti-cheat / Anti-copy Security ---
document.addEventListener('keydown', function (event) {
    // Chặn F12
    if (event.keyCode === 123) {
        event.preventDefault();
        return false;
    }
    // Chặn Ctrl+Shift+I, J (DevTools)
    if (event.ctrlKey && event.shiftKey && (event.keyCode === 73 || event.keyCode === 74)) {
        event.preventDefault();
        return false;
    }
    // Chặn Ctrl+U (View Source)
    if (event.ctrlKey && event.keyCode === 85) {
        event.preventDefault();
        return false;
    }
});

// ============================================
// CONSTANTS & DATA
// ============================================

// 10 Thiên Can
const CAN = ['Giáp', 'Ất', 'Bính', 'Đinh', 'Mậu', 'Kỷ', 'Canh', 'Tân', 'Nhâm', 'Quý'];

// 12 Địa Chi
const CHI = ['Tý', 'Sửu', 'Dần', 'Mão', 'Thìn', 'Tỵ', 'Ngọ', 'Mùi', 'Thân', 'Dậu', 'Tuất', 'Hợi'];

// Ngũ hành của từng Chi
const NGU_HANH_CHI = {
    'Hợi': 'Thủy', 'Tý': 'Thủy',
    'Dần': 'Mộc', 'Mão': 'Mộc',
    'Tỵ': 'Hỏa', 'Ngọ': 'Hỏa',
    'Thân': 'Kim', 'Dậu': 'Kim',
    'Thìn': 'Thổ', 'Tuất': 'Thổ', 'Sửu': 'Thổ', 'Mùi': 'Thổ'
};

// Ngũ hành của 8 quái
const NGU_HANH_QUAI = {
    'Càn': 'Kim', 'Đoài': 'Kim',
    'Ly': 'Hỏa',
    'Chấn': 'Mộc', 'Tốn': 'Mộc',
    'Khảm': 'Thủy',
    'Cấn': 'Thổ', 'Khôn': 'Thổ'
};

// 8 Quái đơn với mã nhị phân
const QUAI_SO = [
    { name: 'Khôn', bin: '000', hanh: 'Thổ' },
    { name: 'Cấn', bin: '001', hanh: 'Thổ' },
    { name: 'Khảm', bin: '010', hanh: 'Thủy' },
    { name: 'Tốn', bin: '011', hanh: 'Mộc' },
    { name: 'Chấn', bin: '100', hanh: 'Mộc' },
    { name: 'Ly', bin: '101', hanh: 'Hỏa' },
    { name: 'Đoài', bin: '110', hanh: 'Kim' },
    { name: 'Càn', bin: '111', hanh: 'Kim' }
];

// Bảng Mai Hoa (chuyển số sang 3 hào)
const MAI_HOA_BITS = {
    1: [1, 1, 1], 2: [1, 1, 2], 3: [1, 2, 1], 4: [1, 2, 2],
    5: [2, 1, 1], 6: [2, 1, 2], 7: [2, 2, 1], 8: [2, 2, 2], 0: [2, 2, 2]
};

// Bảng Nạp Giáp (6 chi cho mỗi quái)
const NAP_GIAP = {
    'Càn': ['Tý', 'Dần', 'Thìn', 'Ngọ', 'Thân', 'Tuất'],
    'Khảm': ['Dần', 'Thìn', 'Ngọ', 'Thân', 'Tuất', 'Tý'],
    'Cấn': ['Thìn', 'Ngọ', 'Thân', 'Tuất', 'Tý', 'Dần'],
    'Chấn': ['Tý', 'Dần', 'Thìn', 'Ngọ', 'Thân', 'Tuất'],
    'Tốn': ['Sửu', 'Hợi', 'Dậu', 'Mùi', 'Tỵ', 'Mão'],
    'Ly': ['Mão', 'Sửu', 'Hợi', 'Dậu', 'Mùi', 'Tỵ'],
    'Khôn': ['Mùi', 'Tỵ', 'Mão', 'Sửu', 'Hợi', 'Dậu'],
    'Đoài': ['Tỵ', 'Mão', 'Sửu', 'Hợi', 'Dậu', 'Mùi']
};

// Ma trận 64 quẻ: TEN_QUE[Ngoại quái][Nội quái]
const TEN_QUE = [
    ['Bát Thuần Khôn', 'Địa Sơn Khiêm', 'Địa Thủy Sư', 'Địa Phong Thăng', 'Địa Lôi Phục', 'Địa Hỏa Minh Di', 'Địa Trạch Lâm', 'Địa Thiên Thái'],
    ['Sơn Địa Bác', 'Bát Thuần Cấn', 'Sơn Thủy Mông', 'Sơn Phong Cổ', 'Sơn Lôi Di', 'Sơn Hỏa Bí', 'Sơn Trạch Tổn', 'Sơn Thiên Đại Súc'],
    ['Thủy Địa Tỷ', 'Thủy Sơn Kiển', 'Bát Thuần Khảm', 'Thủy Phong Tỉnh', 'Thủy Lôi Truân', 'Thủy Hỏa Ký Tế', 'Thủy Trạch Tiết', 'Thủy Thiên Nhu'],
    ['Phong Địa Quan', 'Phong Sơn Tiệm', 'Phong Thủy Hoán', 'Bát Thuần Tốn', 'Phong Lôi Ích', 'Phong Hỏa Gia Nhân', 'Phong Trạch Trung Phu', 'Phong Thiên Tiểu Súc'],
    ['Lôi Địa Dự', 'Lôi Sơn Tiểu Quá', 'Lôi Thủy Giải', 'Lôi Phong Hằng', 'Bát Thuần Chấn', 'Lôi Hỏa Phong', 'Lôi Trạch Quy Muội', 'Lôi Thiên Đại Tráng'],
    ['Hỏa Địa Tấn', 'Hỏa Sơn Lữ', 'Hỏa Thủy Vị Tế', 'Hỏa Phong Đỉnh', 'Hỏa Lôi Phệ Hạp', 'Bát Thuần Ly', 'Hỏa Trạch Khuê', 'Hỏa Thiên Đại Hữu'],
    ['Trạch Địa Tụy', 'Trạch Sơn Hàm', 'Trạch Thủy Khốn', 'Trạch Phong Đại Quá', 'Trạch Lôi Tùy', 'Trạch Hỏa Cách', 'Bát Thuần Đoài', 'Trạch Thiên Quải'],
    ['Thiên Địa Bĩ', 'Thiên Sơn Độn', 'Thiên Thủy Tụng', 'Thiên Phong Cấu', 'Thiên Lôi Vô Vọng', 'Thiên Hỏa Đồng Nhân', 'Thiên Trạch Lý', 'Bát Thuần Càn']
];

// Danh sách quẻ Lục Xung (ngoài Bát Thuần)
const LUC_XUNG_LIST = ['Thiên Lôi Vô Vọng', 'Lôi Thiên Đại Tráng'];

// Danh sách quẻ Lục Hợp
const LUC_HOP_LIST = [
    'Thiên Địa Bĩ', 'Địa Thiên Thái',
    'Thủy Trạch Tiết', 'Trạch Thủy Khốn',
    'Sơn Hỏa Bí', 'Hỏa Sơn Lữ',
    'Địa Lôi Phục', 'Lôi Địa Dự'
];

function getHexAttribute(hexName, type) {
    if (type === 'Du Hồn') return 'Du Hồn';
    if (type === 'Quy Hồn') return 'Quy Hồn';
    if (type === 'Bát Thuần' || LUC_XUNG_LIST.includes(hexName)) return 'Lục Xung';
    if (LUC_HOP_LIST.includes(hexName)) return 'Lục Hợp';
    return '';
}

// Các cặp Quái Phản Ngâm (xung nhau)
const PHAN_NGAM_PAIRS = {
    7: 3, 3: 7,  // Càn ↔ Tốn
    5: 2, 2: 5,  // Ly ↔ Khảm
    4: 6, 6: 4,  // Chấn ↔ Đoài
    1: 0, 0: 1   // Cấn ↔ Khôn
};

// Cặp Quái Phục Ngâm (Càn ↔ Chấn, cùng hệ nạp chi)
const PHUC_NGAM_PAIRS = {
    7: 4, 4: 7   // Càn ↔ Chấn
};

// Hàm kiểm tra Phản Ngâm / Phục Ngâm ở cấp độ Quẻ
function checkNgam(mainInIdx, mainOutIdx, changedInIdx, changedOutIdx) {
    let noiResult = '';
    let ngoaiResult = '';

    // Kiểm tra Nội quái (hào 1-3)
    if (mainInIdx !== changedInIdx) {
        if (PHUC_NGAM_PAIRS[mainInIdx] === changedInIdx) {
            noiResult = 'phuc';
        } else if (PHAN_NGAM_PAIRS[mainInIdx] === changedInIdx) {
            noiResult = 'phan';
        }
    }

    // Kiểm tra Ngoại quái (hào 4-6)
    if (mainOutIdx !== changedOutIdx) {
        if (PHUC_NGAM_PAIRS[mainOutIdx] === changedOutIdx) {
            ngoaiResult = 'phuc';
        } else if (PHAN_NGAM_PAIRS[mainOutIdx] === changedOutIdx) {
            ngoaiResult = 'phan';
        }
    }

    // Tổng hợp kết quả
    const results = [];

    // Toàn quẻ
    if (noiResult && ngoaiResult && noiResult === ngoaiResult) {
        if (noiResult === 'phan') results.push('Toàn Quẻ Phản Ngâm');
        else results.push('Toàn Quẻ Phục Ngâm');
        return results;
    }

    // Từng quái riêng lẻ
    if (ngoaiResult === 'phan') results.push('Ngoại Quái Phản Ngâm');
    else if (ngoaiResult === 'phuc') results.push('Ngoại Quái Phục Ngâm');

    if (noiResult === 'phan') results.push('Nội Quái Phản Ngâm');
    else if (noiResult === 'phuc') results.push('Nội Quái Phục Ngâm');

    return results;
}

// Bảng tra thông tin 64 quẻ (Họ quái, Thế hào, Loại)
const HEX_MAP = {};

function initHexMap() {
    const add = (o, i, p, shi, t) => {
        HEX_MAP[(o << 3) | i] = { p, shi, type: t };
    };
    // Càn cung
    add(7, 7, 7, 6, 'Bát Thuần'); add(7, 3, 7, 1, ''); add(7, 1, 7, 2, ''); add(7, 0, 7, 3, '');
    add(3, 0, 7, 4, ''); add(1, 0, 7, 5, ''); add(5, 0, 7, 4, 'Du Hồn'); add(5, 7, 7, 3, 'Quy Hồn');
    // Khảm cung
    add(2, 2, 2, 6, 'Bát Thuần'); add(2, 6, 2, 1, ''); add(2, 4, 2, 2, ''); add(2, 5, 2, 3, '');
    add(6, 5, 2, 4, ''); add(4, 5, 2, 5, ''); add(0, 5, 2, 4, 'Du Hồn'); add(0, 2, 2, 3, 'Quy Hồn');
    // Cấn cung
    add(1, 1, 1, 6, 'Bát Thuần'); add(1, 5, 1, 1, ''); add(1, 7, 1, 2, ''); add(1, 6, 1, 3, '');
    add(5, 6, 1, 4, ''); add(7, 6, 1, 5, ''); add(3, 6, 1, 4, 'Du Hồn'); add(3, 1, 1, 3, 'Quy Hồn');
    // Chấn cung
    add(4, 4, 4, 6, 'Bát Thuần'); add(4, 0, 4, 1, ''); add(4, 2, 4, 2, ''); add(4, 3, 4, 3, '');
    add(0, 3, 4, 4, ''); add(2, 3, 4, 5, ''); add(6, 3, 4, 4, 'Du Hồn'); add(6, 4, 4, 3, 'Quy Hồn');
    // Tốn cung
    add(3, 3, 3, 6, 'Bát Thuần'); add(3, 7, 3, 1, ''); add(3, 5, 3, 2, ''); add(3, 4, 3, 3, '');
    add(7, 4, 3, 4, ''); add(5, 4, 3, 5, ''); add(1, 4, 3, 4, 'Du Hồn'); add(1, 3, 3, 3, 'Quy Hồn');
    // Ly cung
    add(5, 5, 5, 6, 'Bát Thuần'); add(5, 1, 5, 1, ''); add(5, 3, 5, 2, ''); add(5, 2, 5, 3, '');
    add(1, 2, 5, 4, ''); add(3, 2, 5, 5, ''); add(7, 2, 5, 4, 'Du Hồn'); add(7, 5, 5, 3, 'Quy Hồn');
    // Khôn cung
    add(0, 0, 0, 6, 'Bát Thuần'); add(0, 4, 0, 1, ''); add(0, 6, 0, 2, ''); add(0, 7, 0, 3, '');
    add(4, 7, 0, 4, ''); add(6, 7, 0, 5, ''); add(2, 7, 0, 4, 'Du Hồn'); add(2, 0, 0, 3, 'Quy Hồn');
    // Đoài cung
    add(6, 6, 6, 6, 'Bát Thuần'); add(6, 2, 6, 1, ''); add(6, 0, 6, 2, ''); add(6, 1, 6, 3, '');
    add(2, 1, 6, 4, ''); add(0, 1, 6, 5, ''); add(4, 1, 6, 4, 'Du Hồn'); add(4, 6, 6, 3, 'Quy Hồn');
}
initHexMap();

// 12 cung Trường Sinh (viết tắt)
const LIFE_STAGES = ['T.Sinh', 'M.Dục', 'Q.Đới', 'L.Quan', 'Đ.Vượng', 'Suy', 'Bệnh', 'Tử', 'Mộ', 'Tuyệt', 'Thai', 'Dưỡng'];
const LS_START = { 'Hỏa': 2, 'Kim': 5, 'Mộc': 11, 'Thủy': 8, 'Thổ': 8 };

// Lục Thú theo Can ngày
const LUC_THU = {
    'Giáp': ['Thanh Long', 'Chu Tước', 'Câu Trần', 'Đằng Xà', 'Bạch Hổ', 'Huyền Vũ'],
    'Ất': ['Thanh Long', 'Chu Tước', 'Câu Trần', 'Đằng Xà', 'Bạch Hổ', 'Huyền Vũ'],
    'Bính': ['Chu Tước', 'Câu Trần', 'Đằng Xà', 'Bạch Hổ', 'Huyền Vũ', 'Thanh Long'],
    'Đinh': ['Chu Tước', 'Câu Trần', 'Đằng Xà', 'Bạch Hổ', 'Huyền Vũ', 'Thanh Long'],
    'Mậu': ['Câu Trần', 'Đằng Xà', 'Bạch Hổ', 'Huyền Vũ', 'Thanh Long', 'Chu Tước'],
    'Kỷ': ['Đằng Xà', 'Bạch Hổ', 'Huyền Vũ', 'Thanh Long', 'Chu Tước', 'Câu Trần'],
    'Canh': ['Bạch Hổ', 'Huyền Vũ', 'Thanh Long', 'Chu Tước', 'Câu Trần', 'Đằng Xà'],
    'Tân': ['Bạch Hổ', 'Huyền Vũ', 'Thanh Long', 'Chu Tước', 'Câu Trần', 'Đằng Xà'],
    'Nhâm': ['Huyền Vũ', 'Thanh Long', 'Chu Tước', 'Câu Trần', 'Đằng Xà', 'Bạch Hổ'],
    'Quý': ['Huyền Vũ', 'Thanh Long', 'Chu Tước', 'Câu Trần', 'Đằng Xà', 'Bạch Hổ'],
};

// Store generated image data URL
let currentImageDataUrl = null;
let currentHexData = null;
let currentTuViData = null;
let currentTabType = 'default';

// ============================================
// CALENDAR CALCULATION (Tính Can Chi)
// ============================================

function getSolarTerm(year) {
    const termInfo = [];
    for (let i = 0; i < 24; i++) {
        termInfo.push(calculateSolarTermDate(year, i));
    }
    return termInfo;
}

function calculateSolarTermDate(year, termIndex) {
    const baseDate = new Date(Date.UTC(year, 0, 1));
    const approxDays = termIndex * 15.218 + 5.5;
    let jd = (baseDate.getTime() / 86400000) + 2440587.5 + approxDays;
    let targetLong = (285 + termIndex * 15) % 360;

    for (let k = 0; k < 3; k++) {
        const t = (jd - 2451545.0) / 36525.0;
        const L0 = 280.46646 + 36000.76983 * t;
        const M = 357.52911 + 35999.05029 * t;
        const C = (1.914602 - 0.004817 * t) * Math.sin(M * Math.PI / 180) + (0.019993) * Math.sin(2 * M * Math.PI / 180);
        let trueLong = (L0 + C) % 360;
        if (trueLong < 0) trueLong += 360;
        let error = targetLong - trueLong;
        if (error > 180) error -= 360;
        if (error < -180) error += 360;
        jd += error / 0.9856;
    }

    const z = Math.floor(jd + 0.5);
    const f = jd + 0.5 - z;
    let alpha = Math.floor((z - 1867216.25) / 36524.25);
    const a = z + 1 + alpha - Math.floor(alpha / 4);
    const b = a + 1524;
    const c = Math.floor((b - 122.1) / 365.25);
    const d = Math.floor(365.25 * c);
    const e = Math.floor((b - d) / 30.6001);
    const day = b - d - Math.floor(30.6001 * e) + f;
    const month = e < 14 ? e - 1 : e - 13;
    const yy = month > 2 ? c - 4716 : c - 4715;
    const totalSec = Math.floor((day - Math.floor(day)) * 86400);

    return new Date(Date.UTC(yy, month - 1, Math.floor(day), Math.floor(totalSec / 3600), Math.floor((totalSec % 3600) / 60)));
}

function calculateCanChi(dateInput) {
    let d = new Date(dateInput);
    if (d.getHours() >= 23) d.setDate(d.getDate() + 1);

    const y = d.getFullYear();
    const a = Math.floor((14 - (d.getMonth() + 1)) / 12);
    const yJD = d.getFullYear() + 4800 - a;
    const mJD = (d.getMonth() + 1) + 12 * a - 3;
    const jd = d.getDate() + Math.floor((153 * mJD + 2) / 5) + 365 * yJD + Math.floor(yJD / 4) - Math.floor(yJD / 100) + Math.floor(yJD / 400) - 32045;

    const canNgayIdx = (jd + 9) % 10;
    const chiNgayIdx = (jd + 1) % 12;

    const terms = getSolarTerm(y);
    const termsPrev = getSolarTerm(y - 1);
    const lapXuan = terms[2];

    let solarYear = d < lapXuan ? y - 1 : y;
    let canNamIdx = (solarYear - 4) % 10;
    if (canNamIdx < 0) canNamIdx += 10;
    let chiNamIdx = (solarYear - 4) % 12;
    if (chiNamIdx < 0) chiNamIdx += 12;

    let chiThangIdx = 1;
    if (d >= termsPrev[22] && d < terms[0]) {
        chiThangIdx = 0;
    } else {
        const checkOrder = [22, 20, 18, 16, 14, 12, 10, 8, 6, 4, 2, 0];
        const mapping = { 2: 2, 4: 3, 6: 4, 8: 5, 10: 6, 12: 7, 14: 8, 16: 9, 18: 10, 20: 11, 22: 0, 0: 1 };
        for (let tIdx of checkOrder) {
            if (d >= terms[tIdx]) {
                chiThangIdx = mapping[tIdx];
                break;
            }
        }
    }

    const canThangIdx = ((canNamIdx * 2 + 2) + (chiThangIdx - 2 + 12)) % 10;

    let h = d.getHours();
    const chiGioIdx = (h >= 23 || h < 1) ? 0 : Math.floor((h + 1) / 2) % 12;
    const canGioIdx = (((canNgayIdx % 5) * 2) + chiGioIdx) % 10;

    const diff = (chiNgayIdx - canNgayIdx + 12) % 12;
    const tk1 = CHI[(diff - 2 + 12) % 12];
    const tk2 = CHI[(diff - 1 + 12) % 12];

    let dayOfYear = Math.floor((d - new Date(y, 0, 0)) / 86400000);
    const termNames = ['Tiểu Hàn', 'Đại Hàn', 'Lập Xuân', 'Vũ Thủy', 'Kinh Trập', 'Xuân Phân', 'Thanh Minh', 'Cốc Vũ', 'Lập Hạ', 'Tiểu Mãn', 'Mang Chủng', 'Hạ Chí', 'Tiểu Thử', 'Đại Thử', 'Lập Thu', 'Xử Thử', 'Bạch Lộ', 'Thu Phân', 'Hàn Lộ', 'Sương Giáng', 'Lập Đông', 'Tiểu Tuyết', 'Đại Tuyết', 'Đông Chí'];
    let tIdx = Math.floor(dayOfYear / 15.22);
    if (tIdx > 23) tIdx = 23;

    return {
        nam: { can: CAN[canNamIdx], chi: CHI[chiNamIdx] },
        thang: { can: CAN[canThangIdx], chi: CHI[chiThangIdx], hanh: NGU_HANH_CHI[CHI[chiThangIdx]] },
        ngay: { can: CAN[canNgayIdx], chi: CHI[chiNgayIdx], hanh: NGU_HANH_CHI[CHI[chiNgayIdx]] },
        gio: { can: CAN[canGioIdx], chi: CHI[chiGioIdx] },
        tuanKhong: [tk1, tk2],
        tietKhi: termNames[tIdx]
    };
}

// ============================================
// APP STATE & UI
// ============================================

let currentTab = 'coins';

function init() {
    // Load Vietnamese Calligraphy Font dynamically
    if (!document.getElementById('charm-font-link')) {
        const link = document.createElement('link');
        link.id = 'charm-font-link';
        link.rel = 'stylesheet';
        link.href = 'https://fonts.googleapis.com/css2?family=Charm:wght@400;700&display=swap';
        document.head.appendChild(link);
    }

    const container = document.getElementById('linesContainer');
    for (let i = 6; i >= 1; i--) {
        const div = document.createElement('div');
        div.className = 'line-row';
        div.innerHTML = `
            <div class="line-label">Hào ${i}</div>
            <select id="line-${i}" class="line-select">
                <option value="yang">─── Dương</option>
                <option value="yin">─ ─ Âm</option>
            </select>
            <label class="line-moving-label">
                <input type="checkbox" id="moving-${i}" class="line-moving-checkbox">
                <span class="moving-text">Động</span>
            </label>
        `;
        container.appendChild(div);
    }

    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    document.getElementById('inputDate').value = now.toISOString().slice(0, 16);
}

function switchTab(tab) {
    currentTab = tab;
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.tab === tab);
    });
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.toggle('active', content.id === `tab-${tab}`);
    });

    // Toggle Control Sections
    // For now we only have divination-controls as Tu Vi is removed
    const divControls = document.getElementById('divination-controls');
    if (divControls) divControls.style.display = 'block';
}

function tossCoins() {
    for (let i = 1; i <= 6; i++) {
        const r = Math.random();
        // Original probability: 0=12.5%, 1=37.5%, 2=37.5%, 3=12.5%
        // 0 = Lão Âm (Âm + Động), 1 = Thiếu Dương (Dương + Tĩnh)
        // 2 = Thiếu Âm (Âm + Tĩnh), 3 = Lão Dương (Dương + Động)
        let isYang, isMoving;
        if (r < 0.125) {
            // Lão Âm
            isYang = false;
            isMoving = true;
        } else if (r < 0.5) {
            // Thiếu Dương
            isYang = true;
            isMoving = false;
        } else if (r < 0.875) {
            // Thiếu Âm
            isYang = false;
            isMoving = false;
        } else {
            // Lão Dương
            isYang = true;
            isMoving = true;
        }

        document.getElementById(`line-${i}`).value = isYang ? 'yang' : 'yin';
        document.getElementById(`moving-${i}`).checked = isMoving;
    }
}

function cleanSerialInput(el) {
    el.value = el.value.replace(/[^0-9]/g, '');
}

function formatDate(isoStr) {
    if (!isoStr) return "";
    const d = new Date(isoStr);
    const p = n => n < 10 ? '0' + n : n;
    return `${p(d.getDate())}/${p(d.getMonth() + 1)}/${d.getFullYear()} - ${p(d.getHours())}:${p(d.getMinutes())}`;
}

// ============================================
// DIVINATION PROCESSING
// ============================================

function processDivination() {
    // Original Luc Hao Logic ONLY
    // No Tu Vi check here

    const dVal = document.getElementById('inputDate').value;
    if (!dVal) {
        alert("Vui lòng chọn ngày giờ gieo quẻ!");
        return;
    }

    const calendar = calculateCanChi(dVal);
    const formattedDate = formatDate(dVal);

    let lines = [];
    let methodText = "";

    currentTabType = 'default';

    if (currentTab === 'coins') {
        for (let i = 1; i <= 6; i++) {
            const lineType = document.getElementById(`line-${i}`).value;
            const isMoving = document.getElementById(`moving-${i}`).checked;
            const isYang = (lineType === 'yang');

            // Convert to original values: 0=Lão Âm, 1=Thiếu Dương, 2=Thiếu Âm, 3=Lão Dương
            let v;
            if (isYang && isMoving) v = 3;      // Lão Dương (Động)
            else if (isYang && !isMoving) v = 1; // Thiếu Dương (Tĩnh)
            else if (!isYang && isMoving) v = 0; // Lão Âm (Động)
            else v = 2;                          // Thiếu Âm (Tĩnh)

            lines.push(v);
        }
        methodText = "Lục hào";
    } else if (currentTab === 'serial') {
        const s = document.getElementById('serialInput').value;
        if (s.length < 2) {
            alert("Nhập ít nhất 2 số!");
            return;
        }

        const nums = s.split('').map(Number);
        const mid = Math.floor(nums.length / 2);
        const topSum = nums.slice(0, mid).reduce((a, b) => a + b, 0);
        const botSum = nums.slice(mid).reduce((a, b) => a + b, 0);
        const topMod = topSum % 8 || 8;
        const botMod = botSum % 8 || 8;
        const move = (topSum + botSum) % 6 || 6;

        lines = [...MAI_HOA_BITS[botMod], ...MAI_HOA_BITS[topMod]];

        const idx = move - 1;
        if (lines[idx] === 1) lines[idx] = 3;
        else lines[idx] = 0;

        methodText = `Seri tiền ${s}`;
    } else if (currentTab === 'number') {
        const n1 = parseInt(document.getElementById('num1').value);
        const n2 = parseInt(document.getElementById('num2').value);
        const n3 = parseInt(document.getElementById('num3').value);

        if (isNaN(n1) || isNaN(n2) || isNaN(n3)) {
            alert("Vui lòng nhập đủ 3 số!");
            return;
        }

        const topMod = n1 % 8 || 8;
        const botMod = n2 % 8 || 8;
        const move = n3 % 6 || 6;

        lines = [...MAI_HOA_BITS[botMod], ...MAI_HOA_BITS[topMod]];

        const idx = move - 1;
        // MAI_HOA_BITS: 1=Yang, 2=Yin
        // App logic: 0=Old Yin, 1=Young Yang, 2=Young Yin, 3=Old Yang

        // Logic:
        // Yang (1) + Moving -> Old Yang (3)
        // Yin (2) + Moving -> Old Yin (0)

        if (lines[idx] === 1) lines[idx] = 3;
        else lines[idx] = 0;

        methodText = `Chọn số: ${n1} - ${n2} - ${n3}`;
    }

    // Calculate hexagram data
    const isMaiHoa = (currentTab === 'serial' || currentTab === 'number');
    currentHexData = calculateHexagramData(lines, calendar, methodText, formattedDate, isMaiHoa);

    // Show loading
    document.getElementById('loading-overlay').classList.add('visible');

    // Render HTML for capture
    renderCaptureHTML(currentHexData);

    // Capture image after a short delay to ensure rendering
    // Capture image after a short delay to ensure rendering
    setTimeout(() => {
        captureAndDisplayImage();
    }, 100);
}




function getBit(val, changed) {
    if (!changed) {
        return (val === 1 || val === 3) ? '1' : '0';
    }
    return (val === 0 || val === 1) ? '1' : '0';
}

function getRelation(el, palaceEl) {
    const els = ['Kim', 'Thủy', 'Mộc', 'Hỏa', 'Thổ'];
    const pI = els.indexOf(palaceEl);
    const lI = els.indexOf(el);

    if (pI === lI) return "Huynh Đệ";
    if ((pI + 1) % 5 === lI) return "Tử Tôn";
    if ((lI + 1) % 5 === pI) return "Phụ Mẫu";
    if ((pI + 2) % 5 === lI) return "Thê Tài";
    if ((lI + 2) % 5 === pI) return "Quan Quỷ";
    return "";
}

function getLifeStage(el, baseChi) {
    const start = LS_START[el];
    const current = CHI.indexOf(baseChi);
    const diff = (current - start + 12) % 12;
    return LIFE_STAGES[diff];
}

function renderHexVisual(lines, isChanged) {
    const bits = lines.map(v => getBit(v, isChanged));
    let html = '';

    for (let i = 5; i >= 0; i--) {
        const isMoving = (lines[i] === 0 || lines[i] === 3);
        const moveClass = isMoving ? 'moving' : '';
        html += `<div class="gua-line ${bits[i] === '1' ? 'yang' : 'yin'} ${moveClass}"></div>`;
    }

    return `<div class="gua-container">${html}</div>`;
}

function renderCaptureHTML(data) {
    const {
        mainName, changedName, palaceName, info,
        mainAttr, changedPalaceName, changedAttr,
        linesData, shensha, dateInfo, methodText, lines, formattedDate, palaceEl
    } = data;

    // Construct HTML using the prepared data
    let rowsHtml = '';

    // Lines are stored 0-5 (Hào 1-6), display 6-1
    for (let i = 5; i >= 0; i--) {
        const line = linesData[i];
        const rowClass = line.isMoving ? 'row-moving' : 'row-static';

        let sym = (line.val === 1) ? '—' : (line.val === 2) ? '--' : (line.val === 3) ? 'O' : 'X';

        let sy = '';
        if (line.isShi) sy = `<span class="marker-the">Thế</span>`;
        if (line.isYing) sy = `<span class="marker-ung">Ứng</span>`;

        let phucHtml = '-';
        if (line.phucThan) {
            phucHtml = `<span class="phuc-than">${line.phucThan.rel} - ${line.phucThan.branch}</span>`;
        }

        const isTK = line.isTK ? 'K' : '-';
        const isCTK = line.isCTK ? 'K' : '-';

        // Changed part (Quẻ Biến)
        let cRel = line.changed ? line.changed.relation : getRelation(line.hanh, data.palaceEl); // Default to main if not moving/changed logic handled in calc
        // Actually, for static lines, the relation is same as main if we consider it doesn't change. 
        // But in the original code: 
        // const cTriName = (i <= 3) ? QUAI_SO[cInIdx].name : QUAI_SO[cOutIdx].name;
        // const cBranch = NAP_GIAP[cTriName][idx];
        // const cEl = NGU_HANH_CHI[cBranch];
        // const cRel = getRelation(cEl, palaceEl);
        // This logic runs for ALL lines in original code.
        // In my calc function I should preserve this.

        rowsHtml += `
        <tr class="${rowClass}">
            <td>${sym}</td>
            <td>${sy}</td>
            <td>${line.relation}</td>
            <td>${line.chi}-${line.hanh}</td>
            <td>${phucHtml}</td>
            <td>${isTK}</td>
            <td class="sep-col">${line.changed.relation}</td>
            <td>${line.changed.branch}-${line.changed.hanh}</td>
            <td>${line.lucThu}</td>
            <td>${isCTK}</td>
            <td>${line.tsNgay}</td>
            <td>${line.tsThang}</td>
        </tr>`;
    }

    // Render to hidden capture target
    const target = document.getElementById('captureTarget');
    target.innerHTML = `
        <div class="info-header">
            <div class="info-content">
                <div class="info-line"><strong>Ngày giờ:</strong> ${data.formattedDate} &nbsp;&nbsp;&nbsp;&nbsp; <strong>Phương pháp:</strong> ${methodText}</div>
                <div class="info-line"><strong>Can chi:</strong> ${dateInfo.fullCanChi}</div>
                <div class="info-line"><strong>Hào tâm:</strong> <span class="highlight">${dateInfo.haoTam}</span> &nbsp;&nbsp;&nbsp;&nbsp; <strong>Tuần Không:</strong> <span class="highlight">${dateInfo.tuanKhong}</span></div>
                <div class="info-line"><strong>Nhật Thần:</strong> <span class="highlight">${dateInfo.nhatThan}</span> &nbsp;&nbsp;&nbsp;&nbsp; <strong>Nguyệt Lệnh:</strong> <span class="highlight">${dateInfo.nguyetLenh}</span></div>
            </div>

        </div>
        
        <div class="hex-visual-section">
            <div class="hex-box">
                <div class="hex-title">${mainName}</div>
                ${renderHexVisual(data.lines, false)}
                <div class="hex-family">Họ ${palaceName}${mainAttr ? ' - ' + mainAttr : ''}</div>
            </div>
            ${data.hoData ? `
            <div class="hex-box hex-box-ho">
                <div class="hex-title">${data.hoData.name}</div>
                ${renderHexVisual(data.hoData.lines, false)}
                <div class="hex-family">Họ ${data.hoData.palaceName}${data.hoData.attr ? ' - ' + data.hoData.attr : ''}</div>
                ${data.ngamResult.length > 0 ? `<div class="hex-ngam-inline">${data.ngamResult.join(', ')}</div>` : ''}
            </div>` : `
            <div class="hex-ngam-indicator">${data.ngamResult.length > 0 ? data.ngamResult.map(t => `<span>${t}</span>`).join('') : ''}</div>
            `}
            <div class="hex-box">
                <div class="hex-title">${changedName}</div>
                ${renderHexVisual(data.lines, true)}
                <div class="hex-family">Họ ${changedPalaceName}${changedAttr ? ' - ' + changedAttr : ''}</div>
            </div>
        </div>
        </div>

        <table>
            <thead>
                <tr>
                    <th>Hào</th>
                    <th>T/Ư</th>
                    <th>Lục Thân</th>
                    <th>Can Chi</th>
                    <th>P.Thần</th>
                    <th>TK</th>
                    <th class="sep-col">Lục Thân</th>
                    <th>Can Chi</th>
                    <th>Lục Thú</th>
                    <th>TK</th>
                    <th>TS Ngày</th>
                    <th>TS Tháng</th>
                </tr>
            </thead>
            <tbody>${rowsHtml}</tbody>
        </table>
        
        <div class="shensha-section">
            <div class="shensha-title">Thần Sát</div>
            <div class="shensha-grid">
                ${(() => {
                    const movingBranches = data.linesData.filter(l => l.isMoving).flatMap(l => [l.chi, l.changed.branch]);
                    return shensha.map(s => {
                        let parts = s.split('</strong> ');
                        if (parts.length > 1) {
                            let values = parts[1];
                            let hasMoving = false;
                            movingBranches.forEach(b => {
                                if (values.includes(b)) hasMoving = true;
                                values = values.split(b).join(`<span style="color: red; font-weight: bold;">${b}</span>`);
                            });
                            let title = parts[0];
                            if (hasMoving) {
                                title = title.replace('<strong>', '<strong style="color: red;">');
                            }
                            return `<div class="ss-item">${title}</strong> ${values}</div>`;
                        }
                        return `<div class="ss-item">${s}</div>`;
                    }).join('');
                })()}
            </div>
        </div>

        <div class="capture-footer">
            <span>Quẻ được lập tại: <strong>luchao.io.vn</strong></span>
        </div>
    `;
}


function captureAndDisplayImage() {
    const captureArea = document.getElementById('captureArea');
    const target = document.getElementById('captureTarget');

    // Temporarily position capture area on screen for html2canvas
    captureArea.style.position = 'fixed';
    captureArea.style.left = '0';
    captureArea.style.top = '0';
    captureArea.style.zIndex = '-1';
    captureArea.style.opacity = '0.01';

    html2canvas(target, {
        scale: 1.5,
        useCORS: true,
        logging: false
    }).then(canvas => {
        // Hide capture area again
        captureArea.style.position = 'absolute';
        captureArea.style.left = '-9999px';
        captureArea.style.opacity = '1';

        // Convert to PNG
        currentImageDataUrl = canvas.toDataURL('image/png');

        // Display image
        const imageDisplay = document.getElementById('imageDisplay');
        imageDisplay.innerHTML = '';

        const img = document.createElement('img');
        img.src = currentImageDataUrl;
        img.alt = 'Kết quả quẻ Lục Hào';
        imageDisplay.appendChild(img);

        // Hide loading, show result
        document.getElementById('loading-overlay').classList.remove('visible');
        document.getElementById('resultSection').classList.add('visible');

        // Scroll to result
        document.getElementById('resultSection').scrollIntoView({ behavior: 'smooth', block: 'start' });

    }).catch(err => {
        console.error('html2canvas error:', err);

        // Hide capture area
        captureArea.style.position = 'absolute';
        captureArea.style.left = '-9999px';
        captureArea.style.opacity = '1';

        // Hide loading
        document.getElementById('loading-overlay').classList.remove('visible');

        alert('Có lỗi khi tạo ảnh. Vui lòng thử lại!');
    });
}



function calculateHoData(mBits) {
    // Quẻ Hỗ: Nội lấy hào 2,3,4 (index 1,2,3). Ngoại lấy hào 3,4,5 (index 2,3,4)
    // mBits: [hào 1, hào 2, hào 3, hào 4, hào 5, hào 6] -> 1=Dương, 0=Âm
    const hoInBin = `${mBits[1]}${mBits[2]}${mBits[3]}`;
    const hoOutBin = `${mBits[2]}${mBits[3]}${mBits[4]}`;
    
    const hoInIdx = QUAI_SO.findIndex(q => q.bin === hoInBin);
    const hoOutIdx = QUAI_SO.findIndex(q => q.bin === hoOutBin);
    
    const hexID = (hoOutIdx << 3) | hoInIdx;
    const info = HEX_MAP[hexID] || { p: 0, shi: 1, type: '' };
    
    const name = TEN_QUE[hoOutIdx][hoInIdx];
    const palaceName = QUAI_SO[info.p].name;
    const attr = getHexAttribute(name, info.type);
    
    // Create lines array formatted like the main hexagram for renderHexVisual
    // val: 1 (Yang) or 2 (Yin). mBits are strings ('1'/'0'), so compare with '1'
    const lines = [
        mBits[1] === '1' ? 1 : 2, // hào 1 hỗ (hào 2 chính)
        mBits[2] === '1' ? 1 : 2, // hào 2 hỗ (hào 3 chính)
        mBits[3] === '1' ? 1 : 2, // hào 3 hỗ (hào 4 chính)
        mBits[2] === '1' ? 1 : 2, // hào 4 hỗ (hào 3 chính)
        mBits[3] === '1' ? 1 : 2, // hào 5 hỗ (hào 4 chính)
        mBits[4] === '1' ? 1 : 2  // hào 6 hỗ (hào 5 chính)
    ];

    return {
        name,
        palaceName,
        attr,
        lines
    };
}

function calculateHexagramData(lines, cal, methodText, formattedDate, isMaiHoa) {
    const mBits = lines.map(v => getBit(v, false));
    const mInBin = mBits.slice(0, 3).join('');
    const mOutBin = mBits.slice(3, 6).join('');
    const mInIdx = QUAI_SO.findIndex(q => q.bin === mInBin);
    const mOutIdx = QUAI_SO.findIndex(q => q.bin === mOutBin);

    const hexID = (mOutIdx << 3) | mInIdx;
    const info = HEX_MAP[hexID] || { p: 0, shi: 1 };
    const mainName = TEN_QUE[mOutIdx][mInIdx];
    const palaceName = QUAI_SO[info.p].name;
    const palaceEl = NGU_HANH_QUAI[palaceName];

    // Xác định thuộc tính Quẻ Chính
    const mainAttr = getHexAttribute(mainName, info.type);

    const cBits = lines.map(v => getBit(v, true));
    const cInIdx = QUAI_SO.findIndex(q => q.bin === cBits.slice(0, 3).join(''));
    const cOutIdx = QUAI_SO.findIndex(q => q.bin === cBits.slice(3, 6).join(''));

    const hexIDChanged = (cOutIdx << 3) | cInIdx;
    const infoChanged = HEX_MAP[hexIDChanged] || { p: 0, shi: 1, type: '' }; // Fallback info
    const changedName = TEN_QUE[cOutIdx][cInIdx];
    const changedPalaceName = QUAI_SO[infoChanged.p].name;
    const changedAttr = getHexAttribute(changedName, infoChanged.type);

    // Kiểm tra Phản Ngâm / Phục Ngâm
    const ngamResult = checkNgam(mInIdx, mOutIdx, cInIdx, cOutIdx);

    const lucThuList = LUC_THU[cal.ngay.can];

    const presentRelations = new Set();
    // First pass to find present relations
    for (let i = 0; i < 6; i++) {
        const mTriName = (i + 1 <= 3) ? QUAI_SO[mInIdx].name : QUAI_SO[mOutIdx].name;
        const mBranch = NAP_GIAP[mTriName][i];
        const mEl = NGU_HANH_CHI[mBranch];
        const mRel = getRelation(mEl, palaceEl);
        presentRelations.add(mRel);
    }

    const linesData = [];
    const movingLines = [];

    for (let i = 0; i < 6; i++) { // 0 to 5 (Hào 1-6)
        const lineVal = lines[i];
        const isMoving = (lineVal === 0 || lineVal === 3);
        const idx = i;

        // Main Hexagram Line
        const mTriName = (i + 1 <= 3) ? QUAI_SO[mInIdx].name : QUAI_SO[mOutIdx].name;
        const mBranch = NAP_GIAP[mTriName][i];
        const mEl = NGU_HANH_CHI[mBranch];
        const mRel = getRelation(mEl, palaceEl); // Relation to Palace defined by Main Hexagram

        const tsNgay = getLifeStage(mEl, cal.ngay.chi);
        const tsThang = getLifeStage(mEl, cal.thang.chi);

        const shi = info.shi;
        const ying = (shi + 3) > 6 ? shi - 3 : shi + 3;
        const isShi = (shi === i + 1);
        const isYing = (ying === i + 1);

        let phucThan = null;
        if (!presentRelations.has("Tử Tôn") || !presentRelations.has("Thê Tài") ||
            !presentRelations.has("Quan Quỷ") || !presentRelations.has("Phụ Mẫu") ||
            !presentRelations.has("Huynh Đệ")) {
            const pureTri = QUAI_SO[info.p].name;
            const pureBranch = NAP_GIAP[pureTri][i];
            const pureEl = NGU_HANH_CHI[pureBranch];
            const pureRel = getRelation(pureEl, palaceEl);
            if (!presentRelations.has(pureRel)) {
                phucThan = {
                    rel: pureRel.split(' ')[0],
                    branch: pureBranch
                };
            }
        }

        const isTK = cal.tuanKhong.includes(mBranch);

        // Changed Hexagram Line
        const cTriName = (i + 1 <= 3) ? QUAI_SO[cInIdx].name : QUAI_SO[cOutIdx].name;
        const cBranch = NAP_GIAP[cTriName][i];
        const cEl = NGU_HANH_CHI[cBranch];
        const cRel = getRelation(cEl, palaceEl);
        // Note: Relation of changed line is usually also compared to the Palace Element of the Main Hexagram in many systems.
        // The original code used `palaceEl` which was `NGU_HANH_QUAI[palaceName]` (Main Palace).
        // So `cRel` is correct as per original code.

        const isCTK = cal.tuanKhong.includes(cBranch);

        linesData.push({
            val: lineVal,
            isMoving,
            relation: mRel,
            chi: mBranch,
            hanh: mEl,
            phucThan,
            isTK,
            isShi,
            isYing,
            lucThu: lucThuList[i],
            tsNgay,
            tsThang,
            changed: {
                relation: cRel,
                branch: cBranch,
                hanh: cEl
            },
            isCTK
        });

        if (isMoving) {
            movingLines.push(i + 1);
        }
    }

    const shensha = calculateShenSha(cal.ngay.can, cal.ngay.chi, cal.thang.chi);

    // Hào Tâm Niệm Logic
    const shiIdx = linesData.findIndex(l => l.isShi);
    const haoThe = linesData[shiIdx];
    const hao5 = linesData[4];

    const getTangHao = (idx) => {
        const pureTri = QUAI_SO[info.p].name;
        const pureBranch = NAP_GIAP[pureTri][idx];
        const pureEl = NGU_HANH_CHI[pureBranch];
        const pureRel = getRelation(pureEl, palaceEl);
        return {
            rel: pureRel,
            branch: pureBranch
        };
    };

    let haoTam = null;

    if (!haoThe.isMoving && haoThe.changed.relation !== haoThe.relation) {
        haoTam = { rel: haoThe.changed.relation, branch: haoThe.changed.branch };
    } else {
        const tangHaoThe = getTangHao(shiIdx);
        if (tangHaoThe.rel !== haoThe.relation) {
            haoTam = tangHaoThe;
        } else {
            if (hao5.relation === haoThe.relation || hao5.isMoving) {
                haoTam = getTangHao(4);
            } else {
                haoTam = { rel: hao5.relation, branch: hao5.chi };
            }
        }
    }

    function getShortRel(rel) {
        if (rel.startsWith('Tử Tôn')) return 'Tử';
        if (rel.startsWith('Thê Tài')) return 'Tài';
        if (rel.startsWith('Phụ Mẫu')) return 'Phụ';
        if (rel.startsWith('Huynh Đệ')) return 'Huynh';
        if (rel.startsWith('Quan Quỷ')) return 'Quan';
        return rel.split(' ')[0];
    }
    const haoTamStr = `${getShortRel(haoTam.rel)} - ${haoTam.branch}`;

    return {
        mainName,
        changedName,
        palaceName,
        palaceEl,
        mainAttr,
        changedPalaceName,
        changedAttr,
        info,
        lines,  // Raw lines array
        linesData,
        shensha,
        movingLines,
        ngamResult,
        hoData: isMaiHoa ? calculateHoData(mBits) : null,
        formattedDate,
        methodText,
        dateInfo: {
            fullCanChi: `Giờ ${cal.gio.can} ${cal.gio.chi}, Ngày ${cal.ngay.can} ${cal.ngay.chi}`,
            tietKhi: cal.tietKhi,
            haoTam: haoTamStr,
            tuanKhong: cal.tuanKhong.join(', '),
            nhatThan: `${cal.ngay.chi} - ${cal.ngay.hanh}`,
            nguyetLenh: `${cal.thang.chi} - ${cal.thang.hanh}`,
            nhatLenhShort: `${cal.ngay.can} ${cal.ngay.chi}`,
            nguyetLenhShort: `${cal.thang.can} ${cal.thang.chi}`,
            shenshaRaw: shensha
        }
    };
}

function generateCopyText(data) {
    const {
        mainName, changedName,
        linesData, movingLines,
        dateInfo, changedAttr, mainAttr
    } = data;

    let text = "";

    // 1. Intro (Removed as per user request)
    // text += "Mời chuyên gia Chu Thần Bân luận giải quẻ này theo đúng kỹ pháp của ngài. Luận giải kèm tượng thần sát mà tôi cung cấp\n\n";

    // 2. Nhat/Nguyet Lenh
    text += `- Nhật lệnh: ${dateInfo.nhatLenhShort}; Nguyệt lệnh: ${dateInfo.nguyetLenhShort}\n`;

    // 3. Than Sat
    // 3. Than Sat
    let ssText = "";
    if (Array.isArray(dateInfo.shenshaRaw)) {
        ssText = dateInfo.shenshaRaw.map(s => s.replace(/<[^>]*>/g, '')).filter(s => !s.endsWith('-')).join('; ');
    }
    text += `- Thần sát: [${ssText}]\n`;

    // 4. Tuan Khong
    text += `- Tuần không: ${dateInfo.tuanKhong}\n`;

    // 5. Ten Que - no instructional text
    // 5. Ten Que - no instructional text
    let queBienText = (movingLines.length > 0) ? changedName : "";
    if (movingLines.length > 0 && changedAttr) {
        queBienText += ` (${changedAttr})`;
    } else if (movingLines.length === 0) {
        queBienText = "Quẻ Tĩnh";
    }
    let dongHaoText = "";
    if (movingLines.length > 0) {
        dongHaoText = " [" + movingLines.map(h => `động hào ${h}`).join(', ') + "]";
    }
    text += `- Tên Quẻ Chủ: ${mainName} -> Tên Quẻ Biến: ${queBienText}${dongHaoText}\n`;

    // 6. Lines (6 to 1) - no header with instructional text
    for (let i = 5; i >= 0; i--) {
        const line = linesData[i];
        const lineNum = i + 1;

        // Build main hexagram part
        let mainPart = `${line.lucThu} - ${line.relation} ${line.chi} ${line.hanh}`;
        if (line.isShi) mainPart += " (Thế)";
        else if (line.isYing) mainPart += " (Ứng)";
        if (line.isTK) mainPart += " (Tuần Không)";

        // Build changed part if moving
        let changedPart = "";
        if (line.isMoving) {
            changedPart = ` -> Động Hóa ${line.changed.relation} ${line.changed.branch} ${line.changed.hanh}`;
            if (line.isCTK) changedPart += " (Tuần Không)";
        }

        // Build phuc than part if exists
        let phucPart = "";
        if (line.phucThan) {
            phucPart = ` (Phục thần: ${line.phucThan.rel} ${line.phucThan.branch})`;
        }

        text += `- Hào ${lineNum}: [${mainPart}]${changedPart}${phucPart};\n`;
    }

    return text;
}

function copyToClipboard() {
    if (currentTab === 'tuvi') {
        if (!currentTuViData) {
            alert("Vui lòng lập lá số trước!");
            return;
        }
        const text = generateTuViText(currentTuViData);
        copyTextToClipboard(text);
        return;
    }

    if (!currentHexData) {
        alert("Vui lòng lập quẻ trước!");
        return;
    }

    const text = generateCopyText(currentHexData);
    copyTextToClipboard(text);
}

function copyTextToClipboard(text) {
    // Try modern Clipboard API first
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(() => {
            showToast("Đã sao chép thành công!");
        }).catch(err => {
            console.error('Clipboard API failed, trying fallback: ', err);
            fallbackCopyText(text);
        });
    } else {
        // Fallback for older browsers and some mobile browsers
        fallbackCopyText(text);
    }
}

function fallbackCopyText(text) {
    // Create a temporary textarea element
    const textArea = document.createElement('textarea');
    textArea.value = text;

    // Ensure it's not visible but part of the DOM
    textArea.style.top = '0';
    textArea.style.left = '0';
    textArea.style.position = 'fixed';
    textArea.style.opacity = '0';
    textArea.setAttribute('readonly', ''); // Prevent keyboard on mobile

    document.body.appendChild(textArea);

    // iOS-specific selection
    if (navigator.userAgent.match(/ipad|ipod|iphone/i)) {
        textArea.contentEditable = true;
        textArea.readOnly = false; // Must be false for selection to work
        const range = document.createRange();
        range.selectNodeContents(textArea);
        const selection = window.getSelection();
        selection.removeAllRanges();
        selection.addRange(range);
        textArea.setSelectionRange(0, 999999);
    } else {
        textArea.select();
    }

    try {
        const successful = document.execCommand('copy');
        if (successful) {
            showToast("Đã sao chép thành công!");
        } else {
            alert("Không thể sao chép. Vui lòng thử lại.");
        }
    } catch (err) {
        console.error('Fallback copy failed: ', err);
        alert("Lỗi khi sao chép văn bản.");
    }

    document.body.removeChild(textArea);
}

async function copyImageToClipboard() {
    if (!currentImageDataUrl) {
        alert("Vui lòng lập quẻ trước!");
        return;
    }

    try {
        // Convert data URL to blob
        const response = await fetch(currentImageDataUrl);
        const blob = await response.blob();

        // Use Clipboard API to copy image
        if (navigator.clipboard && navigator.clipboard.write) {
            const clipboardItem = new ClipboardItem({
                'image/png': blob
            });
            await navigator.clipboard.write([clipboardItem]);
            showToast("Đã sao chép ảnh thành công!");
        } else {
            // Fallback: open image in new tab for manual copy
            const newTab = window.open();
            newTab.document.write(`<img src="${currentImageDataUrl}" style="max-width:100%">`);
            newTab.document.title = "Nhấn Ctrl+A, Ctrl+C để sao chép";
            showToast("Mở tab mới - nhấn Ctrl+A, Ctrl+C để sao chép");
        }
    } catch (err) {
        console.error('Copy image failed:', err);
        // Fallback: open image in new tab
        const newTab = window.open();
        newTab.document.write(`<img src="${currentImageDataUrl}" style="max-width:100%">`);
        newTab.document.title = "Nhấn Ctrl+A, Ctrl+C để sao chép";
        showToast("Mở tab mới - nhấn Ctrl+A, Ctrl+C để sao chép");
    }
}

function showToast(message) {
    let toast = document.getElementById('toast-notification');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'toast-notification';
        toast.style.position = 'fixed';
        toast.style.bottom = '20px';
        toast.style.left = '50%';
        toast.style.transform = 'translateX(-50%)';
        toast.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
        toast.style.color = 'white';
        toast.style.padding = '10px 20px';
        toast.style.borderRadius = '5px';
        toast.style.zIndex = '1000';
        toast.style.opacity = '0';
        toast.style.transition = 'opacity 0.3s';
        document.body.appendChild(toast);
    }

    toast.textContent = message;
    toast.style.opacity = '1';

    setTimeout(() => {
        toast.style.opacity = '0';
    }, 3000);
}

function downloadImage() {
    if (!currentImageDataUrl) {
        alert('Chưa có ảnh để tải!');
        return;
    }

    const timestamp = new Date().toISOString().slice(0, 10);
    const filename = `luchao_${timestamp}.png`;

    // Detect if mobile device
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

    // Convert base64 to blob
    fetch(currentImageDataUrl)
        .then(res => res.blob())
        .then(blob => {
            if (isMobile && navigator.share && navigator.canShare) {
                // Mobile: Try Web Share API first
                const file = new File([blob], filename, { type: 'image/png' });
                const shareData = { files: [file] };

                if (navigator.canShare(shareData)) {
                    navigator.share(shareData)
                        .then(() => showToast('Đã chia sẻ thành công!'))
                        .catch((err) => {
                            console.log('Share cancelled or failed, trying fallback');
                            fallbackDownload(blob, filename);
                        });
                    return;
                }
            }

            // Desktop and fallback: Direct download
            fallbackDownload(blob, filename);
            showToast('Đã tải ảnh thành công!');
        })
        .catch(err => {
            console.error('Download error:', err);
            // Ultimate fallback - direct link download
            const link = document.createElement('a');
            link.download = filename;
            link.href = currentImageDataUrl;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        });
}

function fallbackDownload(blob, filename) {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.download = filename;
    link.href = url;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

function calculateShenSha(dCan, dChi, mChi) {
    const list = [];

    const add = (name, val) => {
        let vStr = val || '';
        if (Array.isArray(val)) {
            vStr = val.join(', ');
        }
        if (!vStr) vStr = '-';
        list.push(`<strong>${name}:</strong> ${vStr}`);
    };

    const quy = {
        'Giáp': ['Sửu', 'Mùi'], 'Mậu': ['Sửu', 'Mùi'],
        'Ất': ['Tý', 'Thân'], 'Kỷ': ['Tý', 'Thân'],
        'Bính': ['Hợi', 'Dậu'], 'Đinh': ['Hợi', 'Dậu'],
        'Nhâm': ['Mão', 'Tỵ'], 'Quý': ['Mão', 'Tỵ'],
        'Canh': ['Sửu', 'Mùi'], 'Tân': ['Ngọ', 'Dần']
    };
    add('Quý Nhân', quy[dCan]);

    const loc = { 'Giáp': 'Dần', 'Ất': 'Mão', 'Bính': 'Tỵ', 'Mậu': 'Tỵ', 'Đinh': 'Ngọ', 'Kỷ': 'Ngọ', 'Canh': 'Thân', 'Tân': 'Dậu', 'Nhâm': 'Hợi', 'Quý': 'Tý' };
    add('Lộc Thần', loc[dCan]);

    const kinh = { 'Giáp': 'Mão', 'Ất': 'Dần', 'Bính': 'Ngọ', 'Mậu': 'Ngọ', 'Đinh': 'Tỵ', 'Kỷ': 'Tỵ', 'Canh': 'Dậu', 'Tân': 'Thân', 'Nhâm': 'Tý', 'Quý': 'Hợi' };
    add('Dương Nhận', kinh[dCan]);

    const van = { 'Giáp': 'Tỵ', 'Ất': 'Ngọ', 'Bính': 'Thân', 'Mậu': 'Thân', 'Đinh': 'Dậu', 'Kỷ': 'Dậu', 'Canh': 'Hợi', 'Tân': 'Tý', 'Nhâm': 'Dần', 'Quý': 'Mão' };
    add('Văn Xương', van[dCan]);

    const triadMap = {
        'Thân': 'Thủy', 'Tý': 'Thủy', 'Thìn': 'Thủy',
        'Dần': 'Hỏa', 'Ngọ': 'Hỏa', 'Tuất': 'Hỏa',
        'Tỵ': 'Kim', 'Dậu': 'Kim', 'Sửu': 'Kim',
        'Hợi': 'Mộc', 'Mão': 'Mộc', 'Mùi': 'Mộc'
    };
    const group = triadMap[dChi];

    if (group) {
        const dm = { 'Thủy': 'Dần', 'Hỏa': 'Thân', 'Kim': 'Hợi', 'Mộc': 'Tỵ' };
        add('Dịch Mã', dm[group]);

        const dao = { 'Thủy': 'Dậu', 'Hỏa': 'Mão', 'Kim': 'Ngọ', 'Mộc': 'Tý' };
        add('Đào Hoa', dao[group]);

        const tuong = { 'Thủy': 'Tý', 'Hỏa': 'Ngọ', 'Kim': 'Dậu', 'Mộc': 'Mão' };
        add('Tướng Tinh', tuong[group]);

        const kiep = { 'Thủy': 'Tỵ', 'Hỏa': 'Hợi', 'Kim': 'Dần', 'Mộc': 'Thân' };
        add('Kiếp Sát', kiep[group]);

        const hoa = { 'Thủy': 'Thìn', 'Hỏa': 'Tuất', 'Kim': 'Sửu', 'Mộc': 'Mùi' };
        add('Hoa Cái', hoa[group]);

        const muu = { 'Thủy': 'Tuất', 'Kim': 'Mùi', 'Hỏa': 'Thìn', 'Mộc': 'Sửu' };
        add('Mưu Tinh', muu[group]);

        const tai = { 'Thủy': 'Ngọ', 'Hỏa': 'Tý', 'Kim': 'Mão', 'Mộc': 'Dậu' };
        add('Tai Sát', tai[group]);

        const vong = { 'Thủy': 'Hợi', 'Hỏa': 'Tỵ', 'Kim': 'Thân', 'Mộc': 'Dần' };
        add('Vong Thần', vong[group]);
    } else {
        for (let i = 0; i < 8; i++) add('', '');
    }

    const branches = ['Tý', 'Sửu', 'Dần', 'Mão', 'Thìn', 'Tỵ', 'Ngọ', 'Mùi', 'Thân', 'Dậu', 'Tuất', 'Hợi'];
    const mIdx = branches.indexOf(mChi);
    if (mIdx !== -1) {
        const ty = branches[(mIdx - 1 + 12) % 12];
        add('Thiên Y', ty);
    } else {
        add('Thiên Y', '-');
    }

    const muaMap = {
        'Dần': 'Tuất', 'Mão': 'Tuất', 'Thìn': 'Tuất',
        'Tỵ': 'Sửu', 'Ngọ': 'Sửu', 'Mùi': 'Sửu',
        'Thân': 'Thìn', 'Dậu': 'Thìn', 'Tuất': 'Thìn',
        'Hợi': 'Mùi', 'Tý': 'Mùi', 'Sửu': 'Mùi'
    };
    add('Thiên Hỉ', muaMap[mChi]);

    return list;
}

// ============================================
// COIN TOSS INTERACTIVE FEATURE
// ============================================

let tossResults = [];
let currentTossIndex = 1;

function startCoinToss() {
    // Reset State
    tossResults = [];
    currentTossIndex = 1;

    // Reset UI
    const modal = document.getElementById('coin-toss-modal');
    const resultsList = document.getElementById('toss-results-list');
    const tossBtn = document.getElementById('toss-btn');
    const finishBtn = document.getElementById('finish-toss-btn');
    const statusText = document.getElementById('toss-status');
    const coins = document.querySelectorAll('.coin');

    resultsList.innerHTML = '';
    tossBtn.style.display = 'inline-flex';
    tossBtn.disabled = false;
    tossBtn.innerHTML = 'Gieo Hào 1'; // Reset button text
    finishBtn.style.display = 'none';
    statusText.innerText = 'Sẵn sàng gieo hào 1...';

    // Reset Coins Rotation
    coins.forEach(coin => {
        coin.classList.remove('tossing');
        coin.style.transform = 'rotateX(0deg)';
        const front = coin.querySelector('.front');
        const back = coin.querySelector('.back');
        if (front) front.style.transform = 'rotateX(0deg)';
        if (back) back.style.transform = 'rotateX(180deg)';
    });

    // Show Modal
    modal.classList.add('active');
}

function closeCoinTossModal() {
    document.getElementById('coin-toss-modal').classList.remove('active');
}

function performToss() {
    if (currentTossIndex > 6) return;

    const tossBtn = document.getElementById('toss-btn');
    tossBtn.disabled = true;

    const coins = document.querySelectorAll('.coin');

    // Add animation class
    coins.forEach((coin, index) => {
        coin.classList.remove('tossing');
        // Force reflow
        void coin.offsetWidth;
        coin.classList.add('tossing');
    });

    // Generate Results (The Core Random Logic)
    // 3 Independent Coins: True = Yang (Front/Duong), False = Yin (Back/Am)
    const r1 = Math.random() < 0.5;
    const r2 = Math.random() < 0.5;
    const r3 = Math.random() < 0.5;

    const coinResults = [r1, r2, r3];
    const yangCount = coinResults.filter(r => r).length;

    // Calculate Line Result
    // 0 Yang -> Lão Âm (Line 0)
    // 1 Yang -> Thiếu Dương (Line 1)
    // 2 Yang -> Thiếu Âm (Line 2)
    // 3 Yang -> Lão Dương (Line 3)
    let lineValue, lineText, lineSymbol;
    let isMoving = false;
    let isYangLine = false;

    if (yangCount === 0) {
        lineValue = 0; // Lão Âm
        lineText = "Lão Âm (Âm động)";
        lineSymbol = "X";
        isMoving = true;
        isYangLine = false; // Âm
    } else if (yangCount === 1) {
        lineValue = 1; // Thiếu Dương
        lineText = "Thiếu Dương (Dương tĩnh)";
        lineSymbol = "—";
        isMoving = false;
        isYangLine = true; // Dương
    } else if (yangCount === 2) {
        lineValue = 2; // Thiếu Âm
        lineText = "Thiếu Âm (Âm tĩnh)";
        lineSymbol = "--";
        isMoving = false;
        isYangLine = false; // Âm
    } else {
        lineValue = 3; // Lão Dương
        lineText = "Lão Dương (Dương động)";
        lineSymbol = "O";
        isMoving = true;
        isYangLine = true; // Dương
    }

    tossResults.push({
        value: lineValue,
        isYang: isYangLine,
        isMoving: isMoving,
        yangCount: yangCount,
        coinDetails: coinResults
    });

    // Wait for animation to finish (1.5s match CSS)
    setTimeout(() => {
        // Stop Animation & Set Final State
        coins.forEach((coin, index) => {
            coin.classList.remove('tossing');

            // Animation ends at 2160deg (6 full spins)
            // If Result is Yang (Front): 2160deg
            // If Result is Yin (Back): 2160 + 180 = 2340deg
            const isYang = coinResults[index];
            const finalAngle = 2160 + (isYang ? 0 : 180);
            coin.style.transform = `rotateX(${finalAngle}deg)`;
        });

        // Update Results UI
        addResultToStack(currentTossIndex, lineText, lineSymbol, isMoving);

        // Prepare next step
        currentTossIndex++;

        if (currentTossIndex <= 6) {
            tossBtn.innerHTML = `Gieo Hào ${currentTossIndex}`;
            tossBtn.disabled = false;
            document.getElementById('toss-status').innerText = `Sẵn sàng gieo hào ${currentTossIndex}...`;
        } else {
            tossBtn.style.display = 'none';
            document.getElementById('finish-toss-btn').style.display = 'inline-flex';
            document.getElementById('toss-status').innerText = "Đã gieo xong 6 hào!";
        }

    }, 1500);
}

function addResultToStack(index, text, symbol, isMoving) {
    const container = document.getElementById('toss-results-list');
    const row = document.createElement('div');
    row.className = `result-row ${isMoving ? 'moving' : ''}`;
    row.innerHTML = `
        <div class="result-label">Hào ${index}</div>
        <div class="result-value">
            <span class="result-text">${text}</span>
            <span class="result-symbol">${symbol}</span>
        </div>
    `;
    // Append (Flex column-reverse will show it at top)
    container.appendChild(row);

    // Auto scroll logic might be inverted due to column-reverse or just work naturally
    // With column-reverse, "scrollTop" might refer to the bottom.
    // It's safer to just set scrollTop to 0 or scrollHeight.
    // Actually, usually with column-reverse, the scrollbar stays at the bottom (which is visually top?).
    // Let's force scroll to the "end" of content, which is physically the bottom.
    container.scrollTop = container.scrollHeight;
}

function finishTossSequence() {
    // Populate Main Form
    // tossResults[0] is Hào 1 (Result of first toss) -> #line-1
    tossResults.forEach((res, idx) => {
        const lineNum = idx + 1;
        const select = document.getElementById(`line-${lineNum}`);
        const checkbox = document.getElementById(`moving-${lineNum}`);

        if (!select || !checkbox) return;

        select.value = res.isYang ? 'yang' : 'yin';
        checkbox.checked = res.isMoving;
    });

    closeCoinTossModal();
}

// ============================================
// INITIALIZE ON LOAD
// ============================================
document.addEventListener('DOMContentLoaded', init);

// End of Divination functions
