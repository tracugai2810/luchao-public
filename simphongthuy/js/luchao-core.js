/* ==========================================================================
   LỤC HÀO CORE ENGINE - Dành cho Website Sim Phong Thủy
   Bao gồm:
   - Tính Can Chi Ngày, Tháng, Năm, Giờ (Nhật Thần, Nguyệt Lệnh)
   - Bảng 64 Quẻ, Mai Hoa, Nạp Giáp, Lục Thân, Lục Thú, Tuần Không, Trường Sinh
   - Lập quẻ Lục Hào từ dãy số điện thoại (9 hoặc 10 số)
   - Quy tắc Hào Động Hóa Suy Bại (Bao gồm Hào Động bị Nhật Hợp ➔ Suy Bại)
   ========================================================================== */

// 10 Thiên Can & 12 Địa Chi
const CAN = ['Giáp', 'Ất', 'Bính', 'Đinh', 'Mậu', 'Kỷ', 'Canh', 'Tân', 'Nhâm', 'Quý'];
const CHI = ['Tý', 'Sửu', 'Dần', 'Mão', 'Thìn', 'Tỵ', 'Ngọ', 'Mùi', 'Thân', 'Dậu', 'Tuất', 'Hợi'];

// Ngũ hành Địa Chi
const NGU_HANH_CHI = {
    'Hợi': 'Thủy', 'Tý': 'Thủy',
    'Dần': 'Mộc', 'Mão': 'Mộc',
    'Tỵ': 'Hỏa', 'Ngọ': 'Hỏa',
    'Thân': 'Kim', 'Dậu': 'Kim',
    'Thìn': 'Thổ', 'Tuất': 'Thổ', 'Sửu': 'Thổ', 'Mùi': 'Thổ'
};

// Ngũ hành Quái
const NGU_HANH_QUAI = {
    'Càn': 'Kim', 'Đoài': 'Kim',
    'Ly': 'Hỏa',
    'Chấn': 'Mộc', 'Tốn': 'Mộc',
    'Khảm': 'Thủy',
    'Cấn': 'Thổ', 'Khôn': 'Thổ'
};

// 8 Quái Đơn với mã Nhị phân
const QUAI_SO = [
    { name: 'Khôn', bin: '000', hanh: 'Thổ' }, // 0
    { name: 'Cấn', bin: '001', hanh: 'Thổ' },  // 1
    { name: 'Khảm', bin: '010', hanh: 'Thủy' }, // 2
    { name: 'Tốn', bin: '011', hanh: 'Mộc' },  // 3
    { name: 'Chấn', bin: '100', hanh: 'Mộc' },  // 4
    { name: 'Ly', bin: '101', hanh: 'Hỏa' },   // 5
    { name: 'Đoài', bin: '110', hanh: 'Kim' },  // 6
    { name: 'Càn', bin: '111', hanh: 'Kim' }   // 7
];

// Bảng Mai Hoa (số 1-8 -> 3 bit)
const MAI_HOA_BITS = {
    1: [1, 1, 1], // Càn
    2: [1, 1, 2], // Đoài
    3: [1, 2, 1], // Ly
    4: [1, 2, 2], // Chấn
    5: [2, 1, 1], // Tốn
    6: [2, 1, 2], // Khảm
    7: [2, 2, 1], // Cấn
    8: [2, 2, 2], // Khôn
    0: [2, 2, 2]  // Khôn
};

// Bảng Nạp Giáp (6 Chi cho mỗi quái từ Hào 1 -> Hào 6)
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

// Ma trận 64 Quẻ TEN_QUE[Ngoại][Nội]
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

const LUC_XUNG_LIST = ['Thiên Lôi Vô Vọng', 'Lôi Thiên Đại Tráng'];
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

const PHAN_NGAM_PAIRS = { 7: 3, 3: 7, 5: 2, 2: 5, 4: 6, 6: 4, 1: 0, 0: 1 };
const PHUC_NGAM_PAIRS = { 7: 4, 4: 7 };

function checkNgam(mainInIdx, mainOutIdx, changedInIdx, changedOutIdx) {
    let noiResult = '';
    let ngoaiResult = '';

    if (mainInIdx !== changedInIdx) {
        if (PHUC_NGAM_PAIRS[mainInIdx] === changedInIdx) noiResult = 'phuc';
        else if (PHAN_NGAM_PAIRS[mainInIdx] === changedInIdx) noiResult = 'phan';
    }
    if (mainOutIdx !== changedOutIdx) {
        if (PHUC_NGAM_PAIRS[mainOutIdx] === changedOutIdx) ngoaiResult = 'phuc';
        else if (PHAN_NGAM_PAIRS[mainOutIdx] === changedOutIdx) ngoaiResult = 'phan';
    }

    const results = [];
    if (noiResult && ngoaiResult && noiResult === ngoaiResult) {
        if (noiResult === 'phan') results.push('Toàn Quẻ Phản Ngâm');
        else results.push('Toàn Quẻ Phục Ngâm');
        return results;
    }

    if (ngoaiResult === 'phan') results.push('Ngoại Quái Phản Ngâm');
    else if (ngoaiResult === 'phuc') results.push('Ngoại Quái Phục Ngâm');

    if (noiResult === 'phan') results.push('Nội Quái Phản Ngâm');
    else if (noiResult === 'phuc') results.push('Nội Quái Phục Ngâm');

    return results;
}

function calculateHoData(mBits) {
    const hoInBin = `${mBits[1]}${mBits[2]}${mBits[3]}`;
    const hoOutBin = `${mBits[2]}${mBits[3]}${mBits[4]}`;

    const hoInIdx = QUAI_SO.findIndex(q => q.bin === hoInBin);
    const hoOutIdx = QUAI_SO.findIndex(q => q.bin === hoOutBin);

    const hexID = (hoOutIdx << 3) | hoInIdx;
    const info = HEX_MAP[hexID] || { p: 0, shi: 1, type: '' };

    const name = TEN_QUE[hoOutIdx][hoInIdx];
    const palaceName = QUAI_SO[info.p].name;
    const attr = getHexAttribute(name, info.type);

    const lines = [
        mBits[1] === '1' ? 1 : 2,
        mBits[2] === '1' ? 1 : 2,
        mBits[3] === '1' ? 1 : 2,
        mBits[2] === '1' ? 1 : 2,
        mBits[3] === '1' ? 1 : 2,
        mBits[4] === '1' ? 1 : 2
    ];

    return { name, palaceName, attr, lines };
}

// HEX_MAP tra Họ quái & Thế hào
const HEX_MAP = {};
(function initHexMap() {
    const add = (o, i, p, shi, t) => { HEX_MAP[(o << 3) | i] = { p, shi, type: t }; };
    // Càn
    add(7, 7, 7, 6, 'Bát Thuần'); add(7, 3, 7, 1, ''); add(7, 1, 7, 2, ''); add(7, 0, 7, 3, '');
    add(3, 0, 7, 4, ''); add(1, 0, 7, 5, ''); add(5, 0, 7, 4, 'Du Hồn'); add(5, 7, 7, 3, 'Quy Hồn');
    // Khảm
    add(2, 2, 2, 6, 'Bát Thuần'); add(2, 6, 2, 1, ''); add(2, 4, 2, 2, ''); add(2, 5, 2, 3, '');
    add(6, 5, 2, 4, ''); add(4, 5, 2, 5, ''); add(0, 5, 2, 4, 'Du Hồn'); add(0, 2, 2, 3, 'Quy Hồn');
    // Cấn
    add(1, 1, 1, 6, 'Bát Thuần'); add(1, 5, 1, 1, ''); add(1, 7, 1, 2, ''); add(1, 6, 1, 3, '');
    add(5, 6, 1, 4, ''); add(7, 6, 1, 5, ''); add(3, 6, 1, 4, 'Du Hồn'); add(3, 1, 1, 3, 'Quy Hồn');
    // Chấn
    add(4, 4, 4, 6, 'Bát Thuần'); add(4, 0, 4, 1, ''); add(4, 2, 4, 2, ''); add(4, 3, 4, 3, '');
    add(0, 3, 4, 4, ''); add(2, 3, 4, 5, ''); add(6, 3, 4, 4, 'Du Hồn'); add(6, 4, 4, 3, 'Quy Hồn');
    // Tốn
    add(3, 3, 3, 6, 'Bát Thuần'); add(3, 7, 3, 1, ''); add(3, 5, 3, 2, ''); add(3, 4, 3, 3, '');
    add(7, 4, 3, 4, ''); add(5, 4, 3, 5, ''); add(1, 4, 3, 4, 'Du Hồn'); add(1, 3, 3, 3, 'Quy Hồn');
    // Ly
    add(5, 5, 5, 6, 'Bát Thuần'); add(5, 1, 5, 1, ''); add(5, 3, 5, 2, ''); add(5, 2, 5, 3, '');
    add(1, 2, 5, 4, ''); add(3, 2, 5, 5, ''); add(7, 2, 5, 4, 'Du Hồn'); add(7, 5, 5, 3, 'Quy Hồn');
    // Khôn
    add(0, 0, 0, 6, 'Bát Thuần'); add(0, 4, 0, 1, ''); add(0, 6, 0, 2, ''); add(0, 7, 0, 3, '');
    add(4, 7, 0, 4, ''); add(6, 7, 0, 5, ''); add(2, 7, 0, 4, 'Du Hồn'); add(2, 0, 0, 3, 'Quy Hồn');
    // Đoài
    add(6, 6, 6, 6, 'Bát Thuần'); add(6, 2, 6, 1, ''); add(6, 0, 6, 2, ''); add(6, 1, 6, 3, '');
    add(2, 1, 6, 4, ''); add(0, 1, 6, 5, ''); add(4, 1, 6, 4, 'Du Hồn'); add(4, 6, 6, 3, 'Quy Hồn');
})();

// Trường Sinh 12 Cung
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

// ============================================
// TÍNH CAN CHI & LỊCH ÂM DƯƠNG
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
// LOGIC LỤC HÀO & LẬP QUẺ
// ============================================

function getBit(val, changed) {
    if (!changed) return (val === 1 || val === 3) ? '1' : '0';
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

// Lập quẻ từ Số Điện thoại (ví dụ: "0987654321" hoặc "098765432")
function calculateSimHexagram(simStr, cal) {
    const nums = simStr.replace(/[^0-9]/g, '').split('').map(Number);
    if (nums.length < 9) return null;

    const mid = Math.floor(nums.length / 2);
    const topSum = nums.slice(0, mid).reduce((a, b) => a + b, 0);
    const botSum = nums.slice(mid).reduce((a, b) => a + b, 0);

    const topMod = topSum % 8 || 8;
    const botMod = botSum % 8 || 8;
    const move = (topSum + botSum) % 6 || 6;

    const rawLines = [...MAI_HOA_BITS[botMod], ...MAI_HOA_BITS[topMod]];
    const idx = move - 1;

    const lines = rawLines.map((val, i) => {
        if (i === idx) {
            return (val === 1) ? 3 : 0; // Động
        }
        return (val === 1) ? 1 : 2; // Tĩnh
    });

    return calculateHexagramData(lines, cal, `Sim ${simStr}`);
}

function calculateHexagramData(lines, cal, methodText) {
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
    const mainAttr = getHexAttribute(mainName, info.type);

    const cBits = lines.map(v => getBit(v, true));
    const cInIdx = QUAI_SO.findIndex(q => q.bin === cBits.slice(0, 3).join(''));
    const cOutIdx = QUAI_SO.findIndex(q => q.bin === cBits.slice(3, 6).join(''));

    const hexIDChanged = (cOutIdx << 3) | cInIdx;
    const infoChanged = HEX_MAP[hexIDChanged] || { p: 0, shi: 1, type: '' };
    const changedName = TEN_QUE[cOutIdx][cInIdx];
    const changedPalaceName = QUAI_SO[infoChanged.p].name;
    const changedAttr = getHexAttribute(changedName, infoChanged.type);

    const ngamResult = checkNgam(mInIdx, mOutIdx, cInIdx, cOutIdx);
    const hoData = calculateHoData(mBits);

    const lucThuList = LUC_THU[cal.ngay.can];

    const presentRelations = new Set();
    for (let i = 0; i < 6; i++) {
        const mTriName = (i + 1 <= 3) ? QUAI_SO[mInIdx].name : QUAI_SO[mOutIdx].name;
        const mBranch = NAP_GIAP[mTriName][i];
        const mEl = NGU_HANH_CHI[mBranch];
        presentRelations.add(getRelation(mEl, palaceEl));
    }

    const linesData = [];
    const movingLines = [];

    for (let i = 0; i < 6; i++) {
        const lineVal = lines[i];
        const isMoving = (lineVal === 0 || lineVal === 3);

        const mTriName = (i + 1 <= 3) ? QUAI_SO[mInIdx].name : QUAI_SO[mOutIdx].name;
        const mBranch = NAP_GIAP[mTriName][i];
        const mEl = NGU_HANH_CHI[mBranch];
        const mRel = getRelation(mEl, palaceEl);

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
                phucThan = { rel: pureRel.split(' ')[0], branch: pureBranch, hanh: pureEl };
            }
        }

        const isTK = cal.tuanKhong.includes(mBranch);

        const cTriName = (i + 1 <= 3) ? QUAI_SO[cInIdx].name : QUAI_SO[cOutIdx].name;
        const cBranch = NAP_GIAP[cTriName][i];
        const cEl = NGU_HANH_CHI[cBranch];
        const cRel = getRelation(cEl, palaceEl);

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
            changed: { relation: cRel, branch: cBranch, hanh: cEl },
            isCTK
        });

        if (isMoving) movingLines.push(i + 1);
    }

    return {
        mainName,
        changedName,
        palaceName,
        palaceEl,
        mainAttr,
        changedPalaceName,
        changedAttr,
        info,
        lines,
        linesData,
        movingLines,
        hoData,
        ngamResult,
        methodText,
        dateInfo: {
            fullCanChi: `Giờ ${cal.gio.can} ${cal.gio.chi}, Ngày ${cal.ngay.can} ${cal.ngay.chi}, Tháng ${cal.thang.can} ${cal.thang.chi}, Năm ${cal.nam.can} ${cal.nam.chi}`,
            tuanKhong: cal.tuanKhong.join(', '),
            // Định dạng hiển thị dạng: Dần - Mộc (Theo Yêu cầu Ảnh 1)
            nhatThan: `${cal.ngay.chi} - ${cal.ngay.hanh}`,
            nguyetLenh: `${cal.thang.chi} - ${cal.thang.hanh}`
        }
    };
}
