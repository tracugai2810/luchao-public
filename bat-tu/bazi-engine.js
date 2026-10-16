/**
 * HOA SƠN BÁT TỰ ENGINE
 * File: bazi-engine.js
 * 
 * Thiết kế cho: luchao.io.vn/bat-tu
 * Tuân thủ nguyên lý Toàn Chân Phái Hoa Sơn Bát Tự Học:
 * 1. Bảng Thập Thần Thiên Can đảo ngược Tài Tinh (Ta khắc cùng giới = Chính Tài, khác giới = Thiên Tài).
 * 2. Bảng Thập Thần Địa Chi (Địa Tinh) độc lập, KHÔNG DÙNG TÀNG CAN.
 * 3. Quan hệ 3 Liên: Can Chi Liên (dọc), Thiên Can Liên (ngang), Địa Chi Liên (ngang).
 * 4. Lịch Mặt Trời Chân Thực (True Solar Time = Kinh độ 63 tỉnh VN + Equation of Time).
 * 5. Tiết Khí & Khởi Đại Vận chuẩn xác từng phút.
 */

(function (global) {
  'use strict';

  // ==========================================
  // I. DỮ LIỆU CƠ BẢN (CAN, CHI, NGŨ HÀNH)
  // ==========================================
  const CAN = ["Giáp", "Ất", "Bính", "Đinh", "Mậu", "Kỷ", "Canh", "Tân", "Nhâm", "Quý"];
  const CHI = ["Tý", "Sửu", "Dần", "Mão", "Thìn", "Tỵ", "Ngọ", "Mùi", "Thân", "Dậu", "Tuất", "Hợi"];

  // 0: Kim, 1: Mộc, 2: Thủy, 3: Hỏa, 4: Thổ
  const NGU_HANH_CAN = [1, 1, 3, 3, 4, 4, 0, 0, 2, 2];
  const NGU_HANH_CHI = [2, 4, 1, 1, 4, 3, 3, 4, 0, 0, 4, 2];

  const ELEMENT_NAMES = ["Kim", "Mộc", "Thủy", "Hỏa", "Thổ"];
  const ELEMENT_COLORS = {
    "Kim": "#52525B",   // Xám thép đậm sắc nét, chuẩn tương phản cao
    "Mộc": "#008000",   // Xanh lục đậm chuẩn nguhanh.net
    "Thủy": "#08078D",  // Xanh lam navy sâu thẳm chuẩn nguhanh.net
    "Hỏa": "#E60000",   // Đỏ cờ đậm rực rỡ chuẩn nguhanh.net
    "Thổ": "#8C4817"    // Nâu đất hoàng thổ đậm chuẩn nguhanh.net
  };

  // 30 Nạp Âm của 60 Hoa Giáp
  const NAP_AM_30 = [
    "Hải Trung Kim", "Lô Trung Hỏa", "Đại Lâm Mộc", "Lộ Bàng Thổ", "Kiếm Phong Kim",
    "Sơn Đầu Hỏa", "Giản Hạ Thủy", "Thành Đầu Thổ", "Bạch Lạp Kim", "Dương Liễu Mộc",
    "Tuyền Trung Thủy", "Ốc Thượng Thổ", "Tích Lịch Hỏa", "Tùng Bách Mộc", "Trường Lưu Thủy",
    "Sa Trung Kim", "Sơn Hạ Hỏa", "Bình Địa Mộc", "Bích Thượng Thổ", "Kim Bạch Kim",
    "Phú Đăng Hỏa", "Thiên Hà Thủy", "Đại Trạch Thổ", "Thoa Xuyến Kim", "Tang Đố Mộc",
    "Đại Khê Thủy", "Sa Trung Thổ", "Thiên Thượng Hỏa", "Thạch Lựu Mộc", "Đại Hải Thủy"
  ];

  // ==========================================
  // II. MA TRẬN THẬP THẦN HOA SƠN BÁT TỰ
  // ==========================================
  
  // 1. Thập Thần Thiên Can - Đảo ngược Tài Tinh
  // Hàng = nhatCan, Cột = targetCan
  const THAP_THAN_THIEN_CAN = [
    // Giáp (0)
    ["Tỷ", "Kiếp", "Thực", "Thương", "Tài", "T.Tài", "Sát", "Quan", "Kiêu", "Ấn"],
    // Ất (1)
    ["Kiếp", "Tỷ", "Thương", "Thực", "T.Tài", "Tài", "Quan", "Sát", "Ấn", "Kiêu"],
    // Bính (2)
    ["Kiêu", "Ấn", "Tỷ", "Kiếp", "Thực", "Thương", "Tài", "T.Tài", "Sát", "Quan"],
    // Đinh (3)
    ["Ấn", "Kiêu", "Kiếp", "Tỷ", "Thương", "Thực", "T.Tài", "Tài", "Quan", "Sát"],
    // Mậu (4)
    ["Sát", "Quan", "Kiêu", "Ấn", "Tỷ", "Kiếp", "Thực", "Thương", "Tài", "T.Tài"],
    // Kỷ (5)
    ["Quan", "Sát", "Ấn", "Kiêu", "Kiếp", "Tỷ", "Thương", "Thực", "T.Tài", "Tài"],
    // Canh (6)
    ["Tài", "T.Tài", "Sát", "Quan", "Kiêu", "Ấn", "Tỷ", "Kiếp", "Thực", "Thương"],
    // Tân (7)
    ["T.Tài", "Tài", "Quan", "Sát", "Ấn", "Kiêu", "Kiếp", "Tỷ", "Thương", "Thực"],
    // Nhâm (8)
    ["Thực", "Thương", "Tài", "T.Tài", "Sát", "Quan", "Kiêu", "Ấn", "Tỷ", "Kiếp"],
    // Quý (9)
    ["Thương", "Thực", "T.Tài", "Tài", "Quan", "Sát", "Ấn", "Kiêu", "Kiếp", "Tỷ"]
  ];

  const THAP_THAN_FULL_NAMES = {
    "Tỷ": "Tỷ Kiên",
    "Kiếp": "Kiếp Tài",
    "Thực": "Thực Thần",
    "Thương": "Thương Quan",
    "Tài": "Chính Tài",
    "T.Tài": "Thiên Tài",
    "Quan": "Chính Quan",
    "Sát": "Thất Sát",
    "Ấn": "Chính Ấn",
    "Kiêu": "Kiêu Thần"
  };

  // 2. Thập Thần Địa Chi (Địa Tinh Bản Nguyên Ma Trận)
  // Hàng = nhatCan, Cột = targetChi (0: Tý .. 11: Hợi)
  const THAP_THAN_DIA_CHI = [
    // Giáp (0)
    ["Ấn", "T.Tài", "Tỷ", "Kiếp", "Tài", "Thực", "Thương", "T.Tài", "Sát", "Quan", "Tài", "Kiêu"],
    // Ất (1)
    ["Kiêu", "Tài", "Kiếp", "Tỷ", "T.Tài", "Thương", "Thực", "Tài", "Quan", "Sát", "T.Tài", "Ấn"],
    // Bính (2)
    ["Sát", "Thực", "Ấn", "Kiêu", "Thương", "Kiếp", "Tỷ", "Thực", "Tài", "T.Tài", "Thương", "Quan"],
    // Đinh (3)
    ["Quan", "Thương", "Kiêu", "Ấn", "Thực", "Tỷ", "Kiếp", "Thương", "T.Tài", "Tài", "Thực", "Sát"],
    // Mậu (4)
    ["Tài", "Kiếp", "Sát", "Quan", "Tỷ", "Kiêu", "Ấn", "Kiếp", "Thương", "Thực", "Tỷ", "T.Tài"],
    // Kỷ (5)
    ["T.Tài", "Tỷ", "Quan", "Sát", "Kiếp", "Ấn", "Kiêu", "Tỷ", "Thực", "Thương", "Kiếp", "Tài"],
    // Canh (6)
    ["Thương", "Kiêu", "Tài", "T.Tài", "Ấn", "Quan", "Sát", "Kiêu", "Tỷ", "Kiếp", "Ấn", "Thực"],
    // Tân (7)
    ["Thực", "Ấn", "T.Tài", "Tài", "Kiêu", "Sát", "Quan", "Ấn", "Kiếp", "Tỷ", "Kiêu", "Thương"],
    // Nhâm (8)
    ["Tỷ", "Quan", "Thương", "Thực", "Sát", "T.Tài", "Tài", "Quan", "Ấn", "Kiêu", "Sát", "Kiếp"],
    // Quý (9)
    ["Kiếp", "Sát", "Thực", "Thương", "Quan", "Tài", "T.Tài", "Sát", "Kiêu", "Ấn", "Quan", "Tỷ"]
  ];

  // ==========================================
  // III. 63 TỈNH THÀNH VIỆT NAM & GIỜ MẶT TRỜI
  // ==========================================
  const VN_PROVINCES = [
    { id: "an-giang", name: "An Giang", longitude: 105.12, capital: "Long Xuyên" },
    { id: "ba-ria-vung-tau", name: "Bà Rịa - Vũng Tàu", longitude: 107.17, capital: "Bà Rịa" },
    { id: "bac-giang", name: "Bắc Giang", longitude: 106.19, capital: "Bắc Giang" },
    { id: "bac-kan", name: "Bắc Kạn", longitude: 105.83, capital: "Bắc Kạn" },
    { id: "bac-lieu", name: "Bạc Liêu", longitude: 105.72, capital: "Bạc Liêu" },
    { id: "bac-ninh", name: "Bắc Ninh", longitude: 106.07, capital: "Bắc Ninh" },
    { id: "ben-tre", name: "Bến Tre", longitude: 106.38, capital: "Bến Tre" },
    { id: "binh-dinh", name: "Bình Định", longitude: 109.22, capital: "Quy Nhơn" },
    { id: "binh-duong", name: "Bình Dương", longitude: 106.65, capital: "Thủ Dầu Một" },
    { id: "binh-phuoc", name: "Bình Phước", longitude: 106.88, capital: "Đồng Xoài" },
    { id: "binh-thuan", name: "Bình Thuận", longitude: 108.10, capital: "Phan Thiết" },
    { id: "ca-mau", name: "Cà Mau", longitude: 105.15, capital: "Cà Mau" },
    { id: "can-tho", name: "Cần Thơ", longitude: 105.78, capital: "Cần Thơ" },
    { id: "cao-bang", name: "Cao Bằng", longitude: 106.26, capital: "Cao Bằng" },
    { id: "da-nang", name: "Đà Nẵng", longitude: 108.20, capital: "Đà Nẵng" },
    { id: "dak-lak", name: "Đắk Lắk", longitude: 108.04, capital: "Buôn Ma Thuột" },
    { id: "dak-nong", name: "Đắk Nông", longitude: 107.69, capital: "Gia Nghĩa" },
    { id: "dien-bien", name: "Điện Biên", longitude: 103.02, capital: "Điện Biên Phủ" },
    { id: "dong-nai", name: "Đồng Nai", longitude: 106.84, capital: "Biên Hòa" },
    { id: "dong-thap", name: "Đồng Tháp", longitude: 105.63, capital: "Cao Lãnh" },
    { id: "gia-lai", name: "Gia Lai", longitude: 108.00, capital: "Pleiku" },
    { id: "ha-giang", name: "Hà Giang", longitude: 104.98, capital: "Hà Giang" },
    { id: "ha-nam", name: "Hà Nam", longitude: 105.92, capital: "Phủ Lý" },
    { id: "ha-noi", name: "Hà Nội", longitude: 105.85, capital: "Hà Nội" },
    { id: "ha-tinh", name: "Hà Tĩnh", longitude: 105.91, capital: "Hà Tĩnh" },
    { id: "hai-duong", name: "Hải Dương", longitude: 106.32, capital: "Hải Dương" },
    { id: "hai-phong", name: "Hải Phòng", longitude: 106.68, capital: "Hải Phòng" },
    { id: "hau-giang", name: "Hậu Giang", longitude: 105.47, capital: "Vị Thanh" },
    { id: "hoa-binh", name: "Hòa Bình", longitude: 105.34, capital: "Hòa Bình" },
    { id: "hung-yen", name: "Hưng Yên", longitude: 106.05, capital: "Hưng Yên" },
    { id: "khanh-hoa", name: "Khánh Hòa", longitude: 109.19, capital: "Nha Trang" },
    { id: "kien-giang", name: "Kiên Giang", longitude: 105.08, capital: "Rạch Giá" },
    { id: "kon-tum", name: "Kon Tum", longitude: 108.01, capital: "Kon Tum" },
    { id: "lai-chau", name: "Lai Châu", longitude: 103.46, capital: "Lai Châu" },
    { id: "lam-dong", name: "Lâm Đồng", longitude: 108.44, capital: "Đà Lạt" },
    { id: "lang-son", name: "Lạng Sơn", longitude: 106.76, capital: "Lạng Sơn" },
    { id: "lao-cai", name: "Lào Cai", longitude: 103.97, capital: "Lào Cai" },
    { id: "long-an", name: "Long An", longitude: 106.41, capital: "Tân An" },
    { id: "nam-dinh", name: "Nam Định", longitude: 106.17, capital: "Nam Định" },
    { id: "nghe-an", name: "Nghệ An", longitude: 105.68, capital: "Vinh" },
    { id: "ninh-binh", name: "Ninh Bình", longitude: 105.97, capital: "Ninh Bình" },
    { id: "ninh-thuan", name: "Ninh Thuận", longitude: 108.99, capital: "Phan Rang" },
    { id: "phu-tho", name: "Phú Thọ", longitude: 105.22, capital: "Việt Trì" },
    { id: "phu-yen", name: "Phú Yên", longitude: 109.30, capital: "Tuy Hòa" },
    { id: "quang-binh", name: "Quảng Bình", longitude: 106.62, capital: "Đồng Hới" },
    { id: "quang-nam", name: "Quảng Nam", longitude: 108.47, capital: "Tam Kỳ" },
    { id: "quang-ngai", name: "Quảng Ngãi", longitude: 108.80, capital: "Quảng Ngãi" },
    { id: "quang-ninh", name: "Quảng Ninh", longitude: 107.07, capital: "Hạ Long" },
    { id: "quang-tri", name: "Quảng Trị", longitude: 107.19, capital: "Đông Hà" },
    { id: "soc-trang", name: "Sóc Trăng", longitude: 105.97, capital: "Sóc Trăng" },
    { id: "son-la", name: "Sơn La", longitude: 103.91, capital: "Sơn La" },
    { id: "tay-ninh", name: "Tây Ninh", longitude: 106.10, capital: "Tây Ninh" },
    { id: "thai-binh", name: "Thái Bình", longitude: 106.34, capital: "Thái Bình" },
    { id: "thai-nguyen", name: "Thái Nguyên", longitude: 105.84, capital: "Thái Nguyên" },
    { id: "thanh-hoa", name: "Thanh Hóa", longitude: 105.78, capital: "Thanh Hóa" },
    { id: "thua-thien-hue", name: "Thừa Thiên Huế", longitude: 107.59, capital: "Huế" },
    { id: "tien-giang", name: "Tiền Giang", longitude: 106.36, capital: "Mỹ Tho" },
    { id: "ho-chi-minh", name: "TP. Hồ Chí Minh", longitude: 106.66, capital: "TP. Hồ Chí Minh" },
    { id: "tra-vinh", name: "Trà Vinh", longitude: 106.34, capital: "Trà Vinh" },
    { id: "tuyen-quang", name: "Tuyên Quang", longitude: 105.22, capital: "Tuyên Quang" },
    { id: "vinh-long", name: "Vĩnh Long", longitude: 105.97, capital: "Vinh Long" },
    { id: "vinh-phuc", name: "Vĩnh Phúc", longitude: 105.60, capital: "Vĩnh Yên" },
    { id: "yen-bai", name: "Yên Bái", longitude: 104.87, capital: "Yên Bái" }
  ];

  function getDayOfYear(year, month, day) {
    const d = new Date(Date.UTC(year, month - 1, day));
    const start = new Date(Date.UTC(year, 0, 1));
    return Math.floor((d.getTime() - start.getTime()) / 86400000) + 1;
  }

  // Equation of Time (EoT) - Công thức NOAA/Spencer
  function getEquationOfTime(year, month, day, hour) {
    if (hour === undefined) hour = 12;
    const n = getDayOfYear(year, month, day);
    const isLeapYear = (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
    const daysInYear = isLeapYear ? 366 : 365;
    const gamma = ((2 * Math.PI) / daysInYear) * (n - 1 + (hour - 12) / 24);

    const eot =
      229.18 *
      (0.000075 +
        0.001868 * Math.cos(gamma) -
        0.032077 * Math.sin(gamma) -
        0.014615 * Math.cos(2 * gamma) -
        0.040849 * Math.sin(2 * gamma));

    return eot; // Đơn vị phút
  }

  function calculateSolarAdjustment(year, month, day, hour, minute, provinceId) {
    if (!provinceId) return null;
    const province = VN_PROVINCES.find(p => 
      p.id === provinceId || 
      p.name.toLowerCase() === String(provinceId).trim().toLowerCase() ||
      p.id === String(provinceId).replace(/_/g, '-')
    );
    if (!province) return null;

    // Kinh tuyến chuẩn VN là 105 độ E
    const longitudeOffsetMinutes = (province.longitude - 105) * 4;
    const eotMinutes = getEquationOfTime(year, month, day, hour);
    const totalOffsetMinutes = Math.round(longitudeOffsetMinutes + eotMinutes);

    // Tính thời gian sau hiệu chỉnh
    const baseUtcMs = Date.UTC(year, month - 1, day, hour, minute);
    const adjustedUtcMs = baseUtcMs + totalOffsetMinutes * 60 * 1000;
    const adjDate = new Date(adjustedUtcMs);

    const adjYear = adjDate.getUTCFullYear();
    const adjMonth = adjDate.getUTCMonth() + 1;
    const adjDay = adjDate.getUTCDate();
    const adjHour = adjDate.getUTCHours();
    const adjMinute = adjDate.getUTCMinutes();

    const adjustedTimeStr = `${String(adjHour).padStart(2, "0")}:${String(adjMinute).padStart(2, "0")}`;

    // Độ lệch ngày (-1, 0, +1)
    let dayShift = 0;
    if (adjYear !== year || adjMonth !== month || adjDay !== day) {
      dayShift = adjDate.getTime() > baseUtcMs ? 1 : -1;
    }

    return {
      province,
      longitudeOffsetMinutes: Math.round(longitudeOffsetMinutes * 10) / 10,
      eotMinutes: Math.round(eotMinutes * 10) / 10,
      totalOffsetMinutes,
      adjustedYear: adjYear,
      adjustedMonth: adjMonth,
      adjustedDay: adjDay,
      adjustedHour: adjHour,
      adjustedMinute: adjMinute,
      adjustedTimeStr,
      dayShift
    };
  }

  // ==========================================
  // IV. QUY ĐỔI ÂM DƯƠNG LỊCH THIÊN VĂN (HỒ NGỌC ĐỨC / SÓC)
  // ==========================================
  const PI = Math.PI;
  function int(d) { return Math.floor(d); }

  function jdFromDate(dd, mm, yy) {
    const a = int((14 - mm) / 12);
    const y = yy + 4800 - a;
    const m = mm + 12 * a - 3;
    let jd = dd + int((153 * m + 2) / 5) + 365 * y + int(y / 4) - int(y / 100) + int(y / 400) - 32045;
    if (jd < 2299161) {
      jd = dd + int((153 * m + 2) / 5) + 365 * y + int(y / 4) - 32083;
    }
    return jd;
  }

  function jdToDate(jd) {
    let a, b, c, d, e, m, day, month, year;
    if (jd > 2299160) {
      a = jd + 32044;
      b = int((4 * a + 3) / 146097);
      c = a - int((b * 146097) / 4);
      d = int((4 * c + 3) / 1461);
      e = c - int((1461 * d) / 4);
      m = int((5 * e + 2) / 153);
      day = e - int((153 * m + 2) / 5) + 1;
      month = m + 3 - 12 * int(m / 10);
      year = b * 100 + d - 4800 + int(m / 10);
    } else {
      b = 0;
      c = jd + 32082;
      d = int((4 * c + 3) / 1461);
      e = c - int((1461 * d) / 4);
      m = int((5 * e + 2) / 153);
      day = e - int((153 * m + 2) / 5) + 1;
      month = m + 3 - 12 * int(m / 10);
      year = d - 4800 + int(m / 10);
    }
    return { day, month, year };
  }

  function newMoon(k) {
    const T = k / 1236.85;
    const T2 = T * T;
    const T3 = T2 * T;
    const dr = PI / 180;
    let Jd1 = 2415020.75933 + 29.53058868 * k + 0.0001178 * T2 - 0.000000155 * T3;
    Jd1 = Jd1 + 0.00033 * Math.sin((166.56 + 132.87 * T - 0.009173 * T2) * dr);
    const M = 359.2242 + 29.10535608 * k - 0.0000333 * T2 - 0.00000347 * T3;
    const Mpr = 306.0253 + 385.81691806 * k + 0.0107306 * T2 + 0.00001236 * T3;
    const F = 21.2964 + 390.67050646 * k - 0.0016528 * T2 - 0.00000239 * T3;
    let C1 = (0.1734 - 0.000393 * T) * Math.sin(M * dr) + 0.0021 * Math.sin(2 * dr * M);
    C1 = C1 - 0.4068 * Math.sin(Mpr * dr) + 0.0161 * Math.sin(2 * dr * Mpr);
    C1 = C1 - 0.0004 * Math.sin(3 * dr * Mpr);
    C1 = C1 + 0.0104 * Math.sin(2 * dr * F) - 0.0051 * Math.sin((M + Mpr) * dr);
    C1 = C1 - 0.0074 * Math.sin((M - Mpr) * dr) + 0.0004 * Math.sin((2 * F + M) * dr);
    C1 = C1 - 0.0004 * Math.sin((2 * F - M) * dr) - 0.0006 * Math.sin((2 * F + Mpr) * dr);
    C1 = C1 + 0.001 * Math.sin((2 * F - Mpr) * dr) + 0.0005 * Math.sin((2 * Mpr + M) * dr);
    return Jd1 + C1;
  }

  function getNewMoonDay(k, timeZone) {
    return int(newMoon(k) + 0.5 + timeZone / 24);
  }

  function sunLongitude(jdn) {
    const t = (jdn - 2451545.0) / 36525;
    const t2 = t * t;
    const dr = PI / 180;
    const m = 357.5291 + 35999.0503 * t - 0.0001559 * t2 - 0.00000048 * t * t2;
    const l0 = 280.46645 + 36000.76983 * t + 0.0003032 * t2;
    const dl =
      (1.9146 - 0.004817 * t - 0.000014 * t2) * Math.sin(dr * m) +
      (0.019993 - 0.000101 * t) * Math.sin(dr * 2 * m) +
      0.00029 * Math.sin(dr * 3 * m);
    let longitude = (l0 + dl) * dr;
    longitude -= PI * 2 * int(longitude / (PI * 2));
    return longitude;
  }

  function getSunLongitude(dayNumber, timeZone) {
    return int((sunLongitude(dayNumber - 0.5 - timeZone / 24) / PI) * 6);
  }

  function getLunarMonth11(year, timeZone) {
    const off = jdFromDate(31, 12, year) - 2415021;
    const k = int(off / 29.530588853);
    let monthStart = getNewMoonDay(k, timeZone);
    const sunLong = getSunLongitude(monthStart, timeZone);
    if (sunLong >= 9) {
      monthStart = getNewMoonDay(k - 1, timeZone);
    }
    return monthStart;
  }

  function getLeapMonthOffset(a11, timeZone) {
    const k = int((a11 - 2415021) / 29.530588853 + 0.5);
    let last = 0;
    let index = 1;
    let arc = getSunLongitude(getNewMoonDay(k + index, timeZone), timeZone);
    do {
      last = arc;
      index += 1;
      arc = getSunLongitude(getNewMoonDay(k + index, timeZone), timeZone);
    } while (arc !== last && index < 14);
    return index - 1;
  }

  function solarToLunar(day, month, year, timeZone) {
    if (timeZone === undefined) timeZone = 7;
    const dayNumber = jdFromDate(day, month, year);
    const k = int((dayNumber - 2415021) / 29.530588853);
    let monthStart = getNewMoonDay(k + 1, timeZone);
    if (monthStart > dayNumber) {
      monthStart = getNewMoonDay(k, timeZone);
    }
    let a11 = getLunarMonth11(year, timeZone);
    let b11 = a11;
    let lunarYear;
    if (a11 >= monthStart) {
      lunarYear = year;
      a11 = getLunarMonth11(year - 1, timeZone);
    } else {
      lunarYear = year + 1;
      b11 = getLunarMonth11(year + 1, timeZone);
    }
    const lunarDay = dayNumber - monthStart + 1;
    const diff = int((monthStart - a11) / 29);
    let lunarLeap = false;
    let lunarMonth = diff + 11;
    if (b11 - a11 > 365) {
      const leapOff = getLeapMonthOffset(a11, timeZone);
      const leapMonth = leapOff - 2;
      if (diff >= leapOff) {
        lunarMonth = diff + 10;
        if (diff === leapOff) {
          lunarLeap = true;
        }
      }
    }
    if (lunarMonth > 12) {
      lunarMonth -= 12;
    }
    if (lunarMonth >= 11 && diff < 4) {
      lunarYear -= 1;
    }
    return { day: lunarDay, month: lunarMonth, year: lunarYear, isLeap: lunarLeap };
  }

  function lunarToSolar(lunarDay, lunarMonth, lunarYear, isLeap, timeZone) {
    if (timeZone === undefined) timeZone = 7;
    let a11, b11;
    if (lunarMonth < 11) {
      a11 = getLunarMonth11(lunarYear - 1, timeZone);
      b11 = getLunarMonth11(lunarYear, timeZone);
    } else {
      a11 = getLunarMonth11(lunarYear, timeZone);
      b11 = getLunarMonth11(lunarYear + 1, timeZone);
    }
    const k = int((a11 - 2415021) / 29.530588853 + 0.5);
    let off = lunarMonth - 11;
    if (off < 0) off += 12;
    if (b11 - a11 > 365) {
      const leapOff = getLeapMonthOffset(a11, timeZone);
      const leapMonth = leapOff - 2;
      if (isLeap) {
        off = leapOff;
      } else if (off >= leapOff) {
        off += 1;
      }
    }
    const monthStart = getNewMoonDay(k + off, timeZone);
    return jdToDate(monthStart + lunarDay - 1);
  }

  // ==========================================
  // V. 3 LIÊN (CAN CHI LIÊN, THIÊN CAN LIÊN, ĐỊA CHI LIÊN)
  // ==========================================

  // 1. Can Chi Liên (Tác dụng dọc trong cùng trụ - Trang 36-37, 176)
  function checkCanChiLien(canIdx, chiIdx) {
    const canName = CAN[canIdx];
    const chiName = CHI[chiIdx];
    const canElem = NGU_HANH_CAN[canIdx];
    const chiElem = NGU_HANH_CHI[chiIdx];

    // Can Chi Đồng Khí
    if (canElem === chiElem) {
      return { type: "dong_khi", label: "Can Chi Đồng Khí", desc: "Can Chi gánh nhau vững chắc" };
    }

    // Chi sinh Can (Đắc căn - Trang 36-37)
    // Giáp Tý, Ất Hợi, Bính Dần, Đinh Mão, Mậu Ngọ, Kỷ Tỵ, Canh Thìn, Canh Tuất, Tân Sửu, Tân Mùi, Nhâm Thân, Quý Dậu
    const chiSinhCanPairs = [
      "Giáp Tý", "Ất Hợi", "Bính Dần", "Đinh Mão", "Mậu Ngọ", "Kỷ Tỵ",
      "Canh Thìn", "Canh Tuất", "Tân Sửu", "Tân Mùi", "Nhâm Thân", "Quý Dậu"
    ];
    if (chiSinhCanPairs.includes(`${canName} ${chiName}`)) {
      return { type: "chi_sinh_can", label: "Chi sinh Can", desc: "Đắc căn hữu khí, địa chi bồi bổ thiên can" };
    }

    // Can sinh Chi (Trang 36-37)
    // Giáp Ngọ, Ất Tỵ, Bính Thìn, Bính Tuất, Đinh Sửu, Đinh Mùi, Mậu Thân, Kỷ Dậu, Canh Tý, Tân Hợi, Nhâm Dần, Quý Mão
    const canSinhChiPairs = [
      "Giáp Ngọ", "Ất Tỵ", "Bính Thìn", "Bính Tuất", "Đinh Sửu", "Đinh Mùi",
      "Mậu Thân", "Kỷ Dậu", "Canh Tý", "Tân Hợi", "Nhâm Dần", "Quý Mão"
    ];
    if (canSinhChiPairs.includes(`${canName} ${chiName}`)) {
      return { type: "can_sinh_chi", label: "Can sinh Chi", desc: "Thiên can tiết khí dưỡng địa chi" };
    }

    // Chi khắc Can (Đả thương căn bản - Trang 37, 187)
    // Giáp Thân, Ất Dậu, Bính Tý, Đinh Hợi, Mậu Dần, Kỷ Mão, Canh Ngọ, Tân Tỵ, Nhâm Thìn, Nhâm Tuất, Quý Sửu, Quý Mùi
    const chiKhacCanPairs = [
      "Giáp Thân", "Ất Dậu", "Bính Tý", "Đinh Hợi", "Mậu Dần", "Kỷ Mão",
      "Canh Ngọ", "Tân Tỵ", "Nhâm Thìn", "Nhâm Tuất", "Quý Sửu", "Quý Mùi"
    ];
    if (chiKhacCanPairs.includes(`${canName} ${chiName}`)) {
      return { type: "chi_khac_can", label: "Chi khắc Can", desc: "Căn cơ đả thương, địa chi khắc chế can" };
    }

    // Can khắc Chi (Trang 37)
    // Giáp Thìn, Giáp Tuất, Ất Sửu, Ất Mùi, Bính Thân, Đinh Dậu, Mậu Tý, Kỷ Hợi, Canh Dần, Tân Mão, Nhâm Ngọ, Quý Tỵ
    const canKhacChiPairs = [
      "Giáp Thìn", "Giáp Tuất", "Ất Sửu", "Ất Mùi", "Bính Thân", "Đinh Dậu",
      "Mậu Tý", "Kỷ Hợi", "Canh Dần", "Tân Mão", "Nhâm Ngọ", "Quý Tỵ"
    ];
    if (canKhacChiPairs.includes(`${canName} ${chiName}`)) {
      return { type: "can_khac_chi", label: "Can khắc Chi", desc: "Can chế ngự chi, lực chuyên chế" };
    }

    return { type: "khac_phai", label: "Khác phái", desc: "Ít tác dụng trực tiếp" };
  }

  // Các cặp tương tác Thiên Can (Hoa Sơn Bát Tự)
  const HOP_PAIRS = [[0, 5], [1, 6], [2, 7], [3, 8], [4, 9]];
  const XUNG_PAIRS = [[0, 6], [1, 7], [2, 8], [3, 9]];
  const SINH_PAIRS = [[0, 3], [1, 2], [2, 5], [3, 4], [4, 7], [5, 6], [6, 9], [7, 8], [8, 1], [9, 0]];
  const KHAC_PAIRS = [[0, 4], [1, 5], [2, 6], [3, 7], [4, 8], [5, 9], [6, 0], [7, 1], [8, 2], [9, 3]];

  // 2. Thiên Can Liên (Tác dụng ngang giữa 3 can khách thể: Niên, Nguyệt, Thời - Trang 33-34)
  function analyzeThienCanLien(canNam, canThang, canGio) {
    const list = [
      { name: "Niên Can", can: canNam },
      { name: "Nguyệt Can", can: canThang },
      { name: "Thời Can", can: canGio }
    ];
    const results = [];

    for (let i = 0; i < list.length; i++) {
      for (let j = i + 1; j < list.length; j++) {
        const c1 = list[i].can;
        const c2 = list[j].can;
        const label = `${list[i].name} (${CAN[c1]}) - ${list[j].name} (${CAN[c2]})`;

        // Check Hợp
        if (HOP_PAIRS.some(p => (p[0] === c1 && p[1] === c2) || (p[0] === c2 && p[1] === c1))) {
          results.push({ type: "hop", text: `${label}: Tương Hợp (Vững chắc, hòa hợp)` });
        }
        // Check Xung
        if (XUNG_PAIRS.some(p => (p[0] === c1 && p[1] === c2) || (p[0] === c2 && p[1] === c1))) {
          results.push({ type: "xung", text: `${label}: Tương Xung (Dao động, xung đột)` });
        }
        // Check Sinh
        if (SINH_PAIRS.some(p => p[0] === c1 && p[1] === c2)) {
          results.push({ type: "sinh", text: `${label}: ${CAN[c1]} sinh ${CAN[c2]}` });
        } else if (SINH_PAIRS.some(p => p[0] === c2 && p[1] === c1)) {
          results.push({ type: "sinh", text: `${label}: ${CAN[c2]} sinh ${CAN[c1]}` });
        }
        // Check Khắc
        if (KHAC_PAIRS.some(p => p[0] === c1 && p[1] === c2)) {
          results.push({ type: "khac", text: `${label}: ${CAN[c1]} khắc ${CAN[c2]}` });
        } else if (KHAC_PAIRS.some(p => p[0] === c2 && p[1] === c1)) {
          results.push({ type: "khac", text: `${label}: ${CAN[c2]} khắc ${CAN[c1]}` });
        }
      }
    }
    return results;
  }

  function isHoaSonSinh(c1, c2) {
    return SINH_PAIRS.some(p => p[0] === c1 && p[1] === c2);
  }

  function isHoaSonKhac(c1, c2) {
    return KHAC_PAIRS.some(p => p[0] === c1 && p[1] === c2);
  }

  // Đánh giá 3 Thiên can khách thể (Tầng 1 - Chu Thần Bân tr. 41-42, 108-116, 134, 138, 142, 150, 154-156)
  function evaluateClientStems(canNam, canThang, canGio) {
    const c = [canNam, canThang, canGio];
    const strengths = [true, true, true]; // true: Vượng (Cường thế), false: Suy (Yếu thế)

    // 1. Trùng điệp cả 3 can (Trang 154)
    if (c[0] === c[1] && c[1] === c[2]) {
      return {
        clientStrength: strengths,
        patternName: 'Trùng điệp tam vị',
        patternDesc: `Ba can ${CAN[c[0]]} trùng điệp thuần nhất, tự thân hiển lộ Cường thế (Vượng).`
      };
    }

    // 2. Có 2 can trùng điệp (A, A, B) (Trang 117, 154-156)
    if (c[0] === c[1] || c[1] === c[2] || c[0] === c[2]) {
      let dup_val, dup_indices, single_idx;
      if (c[0] === c[1]) {
        dup_val = c[0]; dup_indices = [0, 1]; single_idx = 2;
      } else if (c[1] === c[2]) {
        dup_val = c[1]; dup_indices = [1, 2]; single_idx = 0;
      } else {
        dup_val = c[0]; dup_indices = [0, 2]; single_idx = 1;
      }

      const single_val = c[single_idx];

      if (isHoaSonKhac(dup_val, single_val)) {
        // Trùng điệp hợp lực khắc can đơn (Ví dụ tr. 117: Bính Bính khắc Canh)
        strengths[single_idx] = false;
        return {
          clientStrength: strengths,
          patternName: 'Trùng điệp tương khắc',
          patternDesc: `Hai can ${CAN[dup_val]} trùng điệp hợp lực khắc thương ${CAN[single_val]}: ${CAN[dup_val]} Cường thế (Vượng), ${CAN[single_val]} Yếu thế (Suy).`
        };
      } else if (isHoaSonKhac(single_val, dup_val)) {
        // Can đơn khắc 2 can trùng điệp
        for (let idx of dup_indices) strengths[idx] = false;
        return {
          clientStrength: strengths,
          patternName: 'Tương khắc trùng điệp',
          patternDesc: `${CAN[single_val]} khắc thương ${CAN[dup_val]}: ${CAN[single_val]} Cường thế (Vượng), cả hai can ${CAN[dup_val]} Yếu thế (Suy).`
        };
      } else if (isHoaSonSinh(dup_val, single_val)) {
        return {
          clientStrength: strengths,
          patternName: 'Trùng điệp tương sinh',
          patternDesc: `Hai can ${CAN[dup_val]} trùng điệp sinh vượng ${CAN[single_val]}: Tất cả đều Cường thế (Vượng).`
        };
      } else if (isHoaSonSinh(single_val, dup_val)) {
        return {
          clientStrength: strengths,
          patternName: 'Tương sinh trùng điệp',
          patternDesc: `${CAN[single_val]} sinh vượng hai can ${CAN[dup_val]} trùng điệp: Tất cả đều Cường thế (Vượng).`
        };
      } else if ((dup_val % 2 !== single_val % 2) && (Math.floor(dup_val / 2) === Math.floor(single_val / 2))) {
        return {
          clientStrength: strengths,
          patternName: 'Đồng tài phối trùng điệp',
          patternDesc: `${CAN[dup_val]} và ${CAN[single_val]} đồng khí ngũ hành khác âm dương (Đồng tài), cùng hiển lộ Cường thế (Vượng).`
        };
      } else {
        return {
          clientStrength: strengths,
          patternName: 'Trùng điệp độc lập',
          patternDesc: `Hai can ${CAN[dup_val]} trùng điệp và ${CAN[single_val]} không sinh khắc nhau, đều tự thân hiển lộ Cường thế (Vượng).`
        };
      }
    }

    // 3. Ba can phân biệt
    const sinh_edges = [];
    const khac_edges = [];
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        if (i === j) continue;
        if (isHoaSonSinh(c[i], c[j])) sinh_edges.push([i, j]);
        if (isHoaSonKhac(c[i], c[j])) khac_edges.push([i, j]);
      }
    }

    // A. Tam giác Liên hoàn tương sinh (Trang 111, 134)
    if (sinh_edges.length === 2) {
      const e1 = sinh_edges[0];
      const e2 = sinh_edges[1];
      let A, B, C_idx;
      if (e1[1] === e2[0]) {
        A = e1[0]; B = e1[1]; C_idx = e2[1];
      } else if (e2[1] === e1[0]) {
        A = e2[0]; B = e2[1]; C_idx = e1[1];
      } else {
        A = 0; B = 1; C_idx = 2;
      }
      return {
        clientStrength: strengths,
        patternName: 'Tam giác Liên hoàn tương sinh',
        patternDesc: `Tổ hợp liên hoàn tương sinh ${CAN[c[A]]} sinh ${CAN[c[B]]} sinh ${CAN[c[C_idx]]}, năng lượng dồn về cuối: Cả ba can đều Cường thế (Vượng).`
      };
    }

    // B. Tam giác Liên hoàn tương khắc (Trang 111, 138)
    if (khac_edges.length === 2) {
      const e1 = khac_edges[0];
      const e2 = khac_edges[1];
      let A, B, C_idx;
      if (e1[1] === e2[0]) {
        A = e1[0]; B = e1[1]; C_idx = e2[1];
      } else if (e2[1] === e1[0]) {
        A = e2[0]; B = e2[1]; C_idx = e1[1];
      } else {
        A = 0; B = 1; C_idx = 2;
      }
      strengths[B] = false;
      return {
        clientStrength: strengths,
        patternName: 'Tam giác Liên hoàn tương khắc',
        patternDesc: `Tổ hợp liên hoàn tương khắc ${CAN[c[A]]} khắc ${CAN[c[B]]} khắc ${CAN[c[C_idx]]}: ${CAN[c[A]]} và ${CAN[c[C_idx]]} Cường thế (Vượng), ${CAN[c[B]]} ở giữa bị khắc nên Yếu thế (Suy).`
      };
    }

    // C & D. len(sinh_edges) == 1 && len(khac_edges) == 1
    if (sinh_edges.length === 1 && khac_edges.length === 1) {
      const s_from = sinh_edges[0][0];
      const s_to = sinh_edges[0][1];
      const k_from = khac_edges[0][0];
      const k_to = khac_edges[0][1];

      if (s_to === k_from) {
        // Liên sinh khắc chế (A sinh B khắc C - Trang 112, 142)
        strengths[k_to] = false;
        return {
          clientStrength: strengths,
          patternName: 'Tam giác Liên sinh khắc chế',
          patternDesc: `Tổ hợp sinh khắc ${CAN[c[s_from]]} sinh ${CAN[c[s_to]]} tụ lực khắc thương ${CAN[c[k_to]]}: ${CAN[c[s_from]]} và ${CAN[c[s_to]]} Cường thế (Vượng), ${CAN[c[k_to]]} Yếu thế (Suy).`
        };
      } else if (k_to === s_from) {
        // Căn nguyên bị thương (A khắc B sinh C - Trang 112, 150)
        strengths[k_to] = false;
        strengths[s_to] = false;
        return {
          clientStrength: strengths,
          patternName: 'Tam giác Căn nguyên bị thương',
          patternDesc: `Tổ hợp căn nguyên bị thương ${CAN[c[k_from]]} khắc thương nguồn sinh ${CAN[c[k_to]]} khiến ${CAN[c[s_to]]} mất nguồn sinh: ${CAN[c[k_from]]} Cường thế (Vượng), cả ${CAN[c[k_to]]} và ${CAN[c[s_to]]} đều Yếu thế (Suy).`
        };
      }
    }

    // E. Tương khắc đơn cặp (Trang 109, 156)
    if (khac_edges.length === 1) {
      const k_from = khac_edges[0][0];
      const k_to = khac_edges[0][1];
      strengths[k_to] = false;
      const remain_idx = [0, 1, 2].find(x => x !== k_from && x !== k_to);
      return {
        clientStrength: strengths,
        patternName: 'Tương khắc đơn cặp',
        patternDesc: `${CAN[c[k_from]]} khắc thương ${CAN[c[k_to]]} (${CAN[c[k_to]]} Yếu thế, ${CAN[c[k_from]]} Cường thế); ${CAN[c[remain_idx]]} độc lập không bị khắc thương nên Cường thế (Vượng).`
      };
    }

    // F. Tương sinh đơn cặp (Trang 109, 156)
    if (sinh_edges.length === 1) {
      const s_from = sinh_edges[0][0];
      const s_to = sinh_edges[0][1];
      const remain_idx = [0, 1, 2].find(x => x !== s_from && x !== s_to);
      return {
        clientStrength: strengths,
        patternName: 'Tương sinh đơn cặp',
        patternDesc: `${CAN[c[s_from]]} sinh ${CAN[c[s_to]]} cùng Cường thế (Vượng); ${CAN[c[remain_idx]]} độc lập không bị khắc thương nên Cường thế (Vượng).`
      };
    }

    // G. len == 0: Kiểm tra Đồng tài hoặc Lạc đàn (Trang 155, 156)
    let has_dong_tai = false;
    for (let i = 0; i < 3; i++) {
      for (let j = i + 1; j < 3; j++) {
        if ((c[i] % 2 !== c[j] % 2) && (Math.floor(c[i] / 2) === Math.floor(c[j] / 2))) {
          has_dong_tai = true;
          break;
        }
      }
    }
    if (has_dong_tai) {
      return {
        clientStrength: strengths,
        patternName: 'Đồng tài khách thể',
        patternDesc: 'Các can đồng khí ngũ hành khác âm dương (Đồng tài), không bị khắc thương, đều tự thân hiển lộ Cường thế (Vượng).'
      };
    }

    return {
      clientStrength: strengths,
      patternName: 'Lạc đàn độc lập',
      patternDesc: `Ba can ${CAN[c[0]]}, ${CAN[c[1]]}, ${CAN[c[2]]} phân lập không tương tác sinh khắc, đều tự thân hiển lộ Cường thế (Vượng).`
    };
  }

  // 2.B. Định Vị Vượng - Suy Thiên Can & Ẩn Tình Chỉ Hướng (Chu Thần Bân - Chương 4, 6, 8, 9)
  function calculateStemVuongSuy(canNam, canThang, canNgay, canGio, chiThang) {
    const clientIndices = [canNam, canThang, canGio];
    
    // 1. Phân tích tương tác giữa 3 can khách thể (Tầng 1) chuẩn Chu Thần Bân
    const { clientStrength, patternName, patternDesc } = evaluateClientStems(canNam, canThang, canGio);

    const pillarVuongSuy = {
      year: clientStrength[0] ? 'Vượng' : 'Suy',
      month: clientStrength[1] ? 'Vượng' : 'Suy',
      day: '-',
      hour: clientStrength[2] ? 'Vượng' : 'Suy',
      patternName,
      patternDesc
    };

    const res = new Array(10).fill(null);

    // Phase 1: Lộ tính khách thể
    clientIndices.forEach((c, idx) => {
      res[c] = {
        status: clientStrength[idx] ? 'Vượng' : 'Suy',
        source: 'Lộ tính'
      };
    });

    // Phase 2: Bập bênh Âm Dương cho can ẩn có can lộ cùng hành (Tầng 2 - Cơ chế 1)
    for (let c = 0; c < 10; c++) {
      if (res[c] !== null) continue;
      const opp = (c % 2 === 0) ? c + 1 : c - 1;
      if (res[opp] !== null && res[opp].source === 'Lộ tính') {
        const oppIsVuong = (res[opp].status === 'Vượng');
        res[c] = {
          status: oppIsVuong ? 'Suy' : 'Vượng',
          source: 'Bập bênh Âm Dương'
        };
      }
    }

    // Phase 3: Nguyệt lệnh đề thăng (Tầng 3 - Chốt chặn 2)
    // Bản khí của Chi tháng được đề thăng thành Vượng, can đối lập cùng hành chịu áp lực rơi vào Suy (Bập bênh Âm Dương)
    const CHI_BAN_KHI = [
      9, // 0: Tý -> Quý (9)
      5, // 1: Sửu -> Kỷ (5)
      0, // 2: Dần -> Giáp (0)
      1, // 3: Mão -> Ất (1)
      4, // 4: Thìn -> Mậu (4)
      2, // 5: Tỵ -> Bính (2)
      3, // 6: Ngọ -> Đinh (3)
      5, // 7: Mùi -> Kỷ (5)
      6, // 8: Thân -> Canh (6)
      7, // 9: Dậu -> Tân (7)
      4, // 10: Tuất -> Mậu (4)
      8  // 11: Hợi -> Nhâm (8)
    ];

    const stemBanKhi = CHI_BAN_KHI[chiThang];
    if (res[stemBanKhi] === null) {
      res[stemBanKhi] = {
        status: 'Vượng',
        source: 'Nguyệt lệnh đề thăng'
      };
      const oppBanKhi = (stemBanKhi % 2 === 0) ? stemBanKhi + 1 : stemBanKhi - 1;
      if (res[oppBanKhi] === null) {
        res[oppBanKhi] = {
          status: 'Suy',
          source: 'Bập bênh Âm Dương'
        };
      }
    } else {
      // Nếu can bản khí đã có trạng thái rồi (từ lộ tính), nhưng can đối lập chưa có
      const oppBanKhi = (stemBanKhi % 2 === 0) ? stemBanKhi + 1 : stemBanKhi - 1;
      if (res[oppBanKhi] === null) {
        res[oppBanKhi] = {
          status: res[stemBanKhi].status === 'Vượng' ? 'Suy' : 'Vượng',
          source: 'Bập bênh Âm Dương'
        };
      }
    }

    // Phase 4: Ẩn tình từ Điểm Tụ Lực / Sinh Khắc / Trùng điệp / Đồng tài
    const strongStems = [];
    clientIndices.forEach((c, idx) => {
      if (clientStrength[idx] && !strongStems.includes(c)) strongStems.push(c);
    });

    // 4.A: ĐỒNG TÀI ƯU TIÊN (Cơ chế 4 - tr. 156, 166-167)
    // Cùng thấu xuất 2 can cùng ngũ hành khác âm dương -> Phóng bao trùm theo CẢ NGŨ HÀNH
    const dongTaiElements = [];
    for (let i = 0; i < clientIndices.length; i++) {
      for (let j = i + 1; j < clientIndices.length; j++) {
        if (NGU_HANH_CAN[clientIndices[i]] === NGU_HANH_CAN[clientIndices[j]] && clientIndices[i] !== clientIndices[j]) {
          if (clientStrength[i] && clientStrength[j]) {
            dongTaiElements.push(NGU_HANH_CAN[clientIndices[i]]);
          }
        }
      }
    }

    if (dongTaiElements.length > 0) {
      for (const dtElem of dongTaiElements) {
        const sinhMap = { 1: 3, 3: 4, 4: 0, 0: 2, 2: 1 };
        const khacMap = { 1: 4, 4: 2, 2: 3, 3: 0, 0: 1 };
        const elemDuocSinh = sinhMap[dtElem];
        const elemBiKhac = khacMap[dtElem];

        // Sinh vượng CẢ ngũ hành được sinh
        for (let c = 0; c < 10; c++) {
          if (res[c] === null && NGU_HANH_CAN[c] === elemDuocSinh) {
            res[c] = { status: 'Vượng', source: 'Đồng tài sinh vượng' };
          }
        }
        // Khắc yếu CẢ ngũ hành bị khắc
        for (let c = 0; c < 10; c++) {
          if (res[c] === null && NGU_HANH_CAN[c] === elemBiKhac) {
            res[c] = { status: 'Suy', source: 'Đồng tài khắc yếu' };
          }
        }
      }
    }

    // 4.B: ĐIỂM TỤ LỰC & ĐIỂM TẬP TRUNG TỪ TỔ HỢP SINH KHẮC (Cơ chế 2 - Chu Thần Bân tr. 163-164)
    // Nhánh 1: Tương sinh (A sinh B -> B tụ lực Cường thế phóng lực khắc thương can C, sinh vượng can D)
    let tuLucStem = null;
    for (let i = 0; i < clientIndices.length; i++) {
      for (let j = 0; j < clientIndices.length; j++) {
        if (i === j) continue;
        const cA = clientIndices[i];
        const cB = clientIndices[j];
        if (isHoaSonSinh(cA, cB) && clientStrength[j]) {
          tuLucStem = cB;
        }
      }
    }

    if (tuLucStem !== null) {
      // 1. Phóng lực khắc thương can C (C suy, can đối lập của C vươn lên Vượng)
      const pair = KHAC_PAIRS.find(p => p[0] === tuLucStem);
      if (pair) {
        const cTarget = pair[1]; // Chữ cùng giới bị khắc
        if (res[cTarget] === null) {
          res[cTarget] = { status: 'Suy', source: 'Ẩn tình bị khắc' };
          // Bập bênh âm dương giải phóng can đối lập
          const oppTarget = (cTarget % 2 === 0) ? cTarget + 1 : cTarget - 1;
          if (res[oppTarget] === null) {
            res[oppTarget] = { status: 'Vượng', source: 'Bập bênh giải phóng' };
          }
        }
      }
      // 2. Phóng lực sinh vượng can D (D vượng, can đối lập của D rơi vào Suy)
      const sinhP = SINH_PAIRS.find(p => p[0] === tuLucStem);
      if (sinhP) {
        const cSinh = sinhP[1];
        if (res[cSinh] === null) {
          res[cSinh] = { status: 'Vượng', source: 'Ẩn tình được sinh' };
          const oppSinh = (cSinh % 2 === 0) ? cSinh + 1 : cSinh - 1;
          if (res[oppSinh] === null) {
            res[oppSinh] = { status: 'Suy', source: 'Bập bênh đè nén' };
          }
        }
      }
    }

    // Nhánh 2: Tương khắc (A khắc B -> B bị khắc Yếu thế [Suy] - tr. 163 Chu Thần Bân)
    // Điểm tập trung của ẩn tính là định tính mạnh yếu của Thập thần bị sinh khắc:
    // B yếu thế -> Không thể khắc C (C thoát khắc vươn lên CƯỜNG THẾ [Vượng], can đối lập C rơi vào Suy)
    //           -> Không thể sinh D (D mất nguồn sinh rơi vào YẾU THẾ [Suy], can đối lập D vươn lên Vượng)
    for (let i = 0; i < clientIndices.length; i++) {
      for (let j = 0; j < clientIndices.length; j++) {
        if (i === j) continue;
        const cA = clientIndices[i];
        const cB = clientIndices[j];
        if (isHoaSonKhac(cA, cB) && !clientStrength[j]) {
          // cB là can bị khắc suy yếu
          // 1. cB không khắc được can C (theo KHAC_PAIRS) -> C thoát khắc vươn lên Vượng
          const khacPair = KHAC_PAIRS.find(p => p[0] === cB);
          if (khacPair) {
            const cNotKhac = khacPair[1];
            if (res[cNotKhac] === null) {
              res[cNotKhac] = { status: 'Vượng', source: 'Ẩn tình thoát khắc vượng' };
              // Bập bênh âm dương cùng hành: Can đối lập rơi vào Suy
              const oppNotKhac = (cNotKhac % 2 === 0) ? cNotKhac + 1 : cNotKhac - 1;
              if (res[oppNotKhac] === null) {
                res[oppNotKhac] = { status: 'Suy', source: 'Bập bênh đè nén' };
              }
            }
          }

          // 2. cB không sinh được can D (theo SINH_PAIRS) -> D mất nguồn sinh rơi vào Suy
          const sinhPair = SINH_PAIRS.find(p => p[0] === cB);
          if (sinhPair) {
            const cNotSinh = sinhPair[1];
            if (res[cNotSinh] === null) {
              res[cNotSinh] = { status: 'Suy', source: 'Ẩn tình mất nguồn sinh' };
              // Bập bênh âm dương cùng hành: Can đối lập vươn lên CƯỜNG THẾ (Vượng)
              const oppNotSinh = (cNotSinh % 2 === 0) ? cNotSinh + 1 : cNotSinh - 1;
              if (res[oppNotSinh] === null) {
                res[oppNotSinh] = { status: 'Vượng', source: 'Bập bênh giải phóng' };
              }
            }
          }
        }
      }
    }

    // 4.C: TRÙNG ĐIỆP (Cơ chế 3 - tr. 155, 165)
    const counts = {};
    clientIndices.forEach(c => { counts[c] = (counts[c] || 0) + 1; });
    const trungDiepStems = Object.keys(counts).filter(c => counts[c] >= 2).map(Number);

    for (const td of trungDiepStems) {
      // Sinh vượng
      const sinhP = SINH_PAIRS.find(p => p[0] === td);
      if (sinhP && res[sinhP[1]] === null) {
        res[sinhP[1]] = { status: 'Vượng', source: 'Trùng điệp sinh vượng' };
        const opp = (sinhP[1] % 2 === 0) ? sinhP[1] + 1 : sinhP[1] - 1;
        if (res[opp] === null) res[opp] = { status: 'Suy', source: 'Bập bênh đè nén' };
      }
      // Hợp vượng
      const hopP = HOP_PAIRS.find(p => p[0] === td || p[1] === td);
      if (hopP) {
        const other = hopP[0] === td ? hopP[1] : hopP[0];
        if (res[other] === null) {
          res[other] = { status: 'Vượng', source: 'Trùng điệp hợp vượng' };
          const opp = (other % 2 === 0) ? other + 1 : other - 1;
          if (res[opp] === null) res[opp] = { status: 'Suy', source: 'Bập bênh đè nén' };
        }
      }
      // Khắc yếu
      const khacP = KHAC_PAIRS.find(p => p[0] === td);
      if (khacP && res[khacP[1]] === null) {
        res[khacP[1]] = { status: 'Suy', source: 'Trùng điệp khắc yếu' };
        const opp = (khacP[1] % 2 === 0) ? khacP[1] + 1 : khacP[1] - 1;
        if (res[opp] === null) res[opp] = { status: 'Vượng', source: 'Bập bênh giải phóng' };
      }
      // Xung yếu
      const xungP = XUNG_PAIRS.find(p => p[0] === td || p[1] === td);
      if (xungP) {
        const other = xungP[0] === td ? xungP[1] : xungP[0];
        if (res[other] === null) {
          res[other] = { status: 'Suy', source: 'Trùng điệp xung yếu' };
          const opp = (other % 2 === 0) ? other + 1 : other - 1;
          if (res[opp] === null) res[opp] = { status: 'Vượng', source: 'Bập bênh giải phóng' };
        }
      }
    }

    // Phase 5: Nguyên Thần thay thế cho các can còn lại (Tầng 4)
    for (let c = 0; c < 10; c++) {
      if (res[c] !== null) continue;
      let ntFound = false;
      for (const sc of strongStems) {
        if (isHoaSonSinh(sc, c)) {
          res[c] = { status: 'Vượng', source: 'Nguyên Thần thay thế' };
          const opp = (c % 2 === 0) ? c + 1 : c - 1;
          if (res[opp] === null) {
            res[opp] = { status: 'Suy', source: 'Bập bênh đè nén' };
          }
          ntFound = true;
          break;
        }
      }
      if (!ntFound) {
        res[c] = { status: 'Suy', source: 'Khuyết suy' };
      }
    }

    const tenStemsVuongSuy = res.map((item, idx) => {
      const elemName = ELEMENT_NAMES[NGU_HANH_CAN[idx]];
      return {
        canIdx: idx,
        canName: CAN[idx],
        elem: elemName,
        color: ELEMENT_COLORS[elemName] || "#0F172A",
        status: item.status,
        source: item.source
      };
    });

    return { pillarVuongSuy, tenStemsVuongSuy };
  }

  // 3. Địa Chi Liên (Tác dụng ngang giữa 4 chi: Niên, Nguyệt, Nhật, Thời - Trang 35, 37, 176, 186)
  function analyzeDiaChiLien(chiNam, chiThang, chiNgay, chiGio) {
    const list = [
      { name: "Niên Chi", chi: chiNam },
      { name: "Nguyệt Chi", chi: chiThang },
      { name: "Nhật Chi", chi: chiNgay },
      { name: "Thời Chi", chi: chiGio }
    ];
    const results = [];
    const allChi = [chiNam, chiThang, chiNgay, chiGio];

    // Tam Hội Cục (Dần Mão Thìn: Mộc, Tỵ Ngọ Mùi: Hỏa, Thân Dậu Tuất: Kim, Hợi Tý Sửu: Thủy)
    const TAM_HOI = [
      { name: "Tam hội Mộc cục", chi: [2, 3, 4] },
      { name: "Tam hội Hỏa cục", chi: [5, 6, 7] },
      { name: "Tam hội Kim cục", chi: [8, 9, 10] },
      { name: "Tam hội Thủy cục", chi: [11, 0, 1] }
    ];
    TAM_HOI.forEach(th => {
      if (th.chi.every(c => allChi.includes(c))) {
        results.push({ type: "tam_hoi", text: `${th.name} (Hội tụ thế lực cực thịnh)` });
      }
    });

    // Tam Hợp Cục (Thân Tý Thìn: Thủy, Dần Ngọ Tuất: Hỏa, Tỵ Dậu Sửu: Kim, Hợi Mão Mùi: Mộc)
    const TAM_HOP = [
      { name: "Tam hợp Thủy cục (Tý)", chi: [8, 0, 4] },
      { name: "Tam hợp Hỏa cục (Ngọ)", chi: [2, 6, 10] },
      { name: "Tam hợp Kim cục (Dậu)", chi: [5, 9, 1] },
      { name: "Tam hợp Mộc cục (Mão)", chi: [11, 3, 7] }
    ];
    TAM_HOP.forEach(th => {
      if (th.chi.every(c => allChi.includes(c))) {
        results.push({ type: "tam_hop", text: `${th.name} (Liên kết đồng minh vững chắc)` });
      }
    });

    // Lục Hợp (Tý Sửu, Dần Hợi, Mão Tuất, Thìn Dậu, Tỵ Thân, Ngọ Mùi)
    const LUC_HOP = [[0, 1], [2, 11], [3, 10], [4, 9], [5, 8], [6, 7]];
    // Lục Xung (Tý Ngọ, Sửu Mùi, Dần Thân, Mão Dậu, Thìn Tuất, Tỵ Hợi)
    const LUC_XUNG = [[0, 6], [1, 7], [2, 8], [3, 9], [4, 10], [5, 11]];

    for (let i = 0; i < list.length; i++) {
      for (let j = i + 1; j < list.length; j++) {
        const c1 = list[i].chi;
        const c2 = list[j].chi;
        const label = `${list[i].name} (${CHI[c1]}) - ${list[j].name} (${CHI[c2]})`;

        // Đồng Tài (Chi giống nhau)
        if (c1 === c2) {
          results.push({ type: "dong_tai", text: `${label}: Đồng Tài (Trợ lực vững chắc)` });
        }
        // Lục Hợp
        if (LUC_HOP.some(p => (p[0] === c1 && p[1] === c2) || (p[0] === c2 && p[1] === c1))) {
          results.push({ type: "luc_hop", text: `${label}: Lục Hợp (Tương hợp bền chặt)` });
        }
        // Lục Xung
        if (LUC_XUNG.some(p => (p[0] === c1 && p[1] === c2) || (p[0] === c2 && p[1] === c1))) {
          results.push({ type: "luc_xung", text: `${label}: Lục Xung (Dao động, xung phá)` });
        }
      }
    }

    return results;
  }

  // ==========================================
  // VI. THẦN SÁT & KHÔNG VONG
  // ==========================================
  function calculateThanSat(canNgay, canNam, chiNgay, chiNam, targetChi) {
    const list = [];

    // 1. Không Vong (tính theo Nhật trụ và Niên trụ)
    // kv1 = (chi - can + 10 + 12) % 12, kv2 = (chi - can + 11 + 12) % 12
    const kvNgay1 = (chiNgay - canNgay + 22) % 12;
    const kvNgay2 = (chiNgay - canNgay + 23) % 12;
    if (targetChi === kvNgay1 || targetChi === kvNgay2) {
      list.push("Không Vong");
    }

    // 2. Lộc Thần & Dương Nhận (theo Nhật Can)
    const LOC_THAN = [2, 3, 5, 6, 5, 6, 8, 9, 11, 0];
    const DUONG_NHAN = [3, 2, 6, 5, 6, 5, 9, 8, 0, 11];
    if (targetChi === LOC_THAN[canNgay]) list.push("Lộc Thần");
    if (targetChi === DUONG_NHAN[canNgay]) list.push("Dương Nhận");

    // 3. Thiên Ất Quý Nhân (theo Nhật Can & Niên Can)
    const THIEN_AT = {
      0: [1, 7], 4: [1, 7], 6: [1, 7], // Giáp Mậu Canh: Sửu Mùi
      1: [0, 8], 5: [0, 8],             // Ất Kỷ: Tý Thân
      2: [11, 9], 3: [11, 9],           // Bính Đinh: Hợi Dậu
      8: [3, 5], 9: [3, 5],             // Nhâm Quý: Mão Tỵ
      7: [2, 6]                         // Tân: Dần Ngọ
    };
    if (THIEN_AT[canNgay]?.includes(targetChi) || THIEN_AT[canNam]?.includes(targetChi)) {
      list.push("Thiên Ất");
    }

    // 4. Văn Xương Quý Nhân (theo Nhật Can & Niên Can)
    const VAN_XUONG = [5, 6, 8, 9, 8, 9, 11, 0, 2, 3];
    if (targetChi === VAN_XUONG[canNgay] || targetChi === VAN_XUONG[canNam]) {
      list.push("Văn Xương");
    }

    // 5. Đào Hoa, Hoa Cái, Dịch Mã, Tướng Tinh (theo Tam Hợp Niên Chi & Nhật Chi)
    // Nhóm tam hợp chi:
    // [8, 0, 4] (Thân Tý Thìn) -> Đào Hoa: Dậu (9), Hoa Cái: Thìn (4), Dịch Mã: Dần (2), Tướng Tinh: Tý (0)
    // [2, 6, 10] (Dần Ngọ Tuất) -> Đào Hoa: Mão (3), Hoa Cái: Tuất (10), Dịch Mã: Thân (8), Tướng Tinh: Ngọ (6)
    // [5, 9, 1] (Tỵ Dậu Sửu) -> Đào Hoa: Ngọ (6), Hoa Cái: Sửu (1), Dịch Mã: Hợi (11), Tướng Tinh: Dậu (9)
    // [11, 3, 7] (Hợi Mão Mùi) -> Đào Hoa: Tý (0), Hoa Cái: Mùi (7), Dịch Mã: Tỵ (5), Tướng Tinh: Mão (3)
    const checkTamHopGroup = (baseChi) => {
      if ([8, 0, 4].includes(baseChi)) return { daoHoa: 9, hoaCai: 4, dichMa: 2, tuongTinh: 0 };
      if ([2, 6, 10].includes(baseChi)) return { daoHoa: 3, hoaCai: 10, dichMa: 8, tuongTinh: 6 };
      if ([5, 9, 1].includes(baseChi)) return { daoHoa: 6, hoaCai: 1, dichMa: 11, tuongTinh: 9 };
      return { daoHoa: 0, hoaCai: 7, dichMa: 5, tuongTinh: 3 };
    };

    [chiNam, chiNgay].forEach(bc => {
      const g = checkTamHopGroup(bc);
      if (targetChi === g.daoHoa && !list.includes("Đào Hoa")) list.push("Đào Hoa");
      if (targetChi === g.hoaCai && !list.includes("Hoa Cái")) list.push("Hoa Cái");
      if (targetChi === g.dichMa && !list.includes("Dịch Mã")) list.push("Dịch Mã");
      if (targetChi === g.tuongTinh && !list.includes("Tướng Tinh")) list.push("Tướng Tinh");
    });

    return list;
  }

  // ==========================================
  // VI.B. VÒNG TRƯỜNG SINH, THAI NGUYÊN, MỆNH CUNG, KHÔNG VONG
  // ==========================================
  const TRUONG_SINH_NAMES = [
    "Trường sinh", "Mộc dục", "Quan đới", "Lâm quan", 
    "Đế vượng", "Suy", "Bệnh", "Tử", "Mộ", "Tuyệt", "Thai", "Dưỡng"
  ];

  function getTruongSinh(canIdx, chiIdx) {
    const START_CHI = [11, 6, 2, 9, 2, 9, 5, 0, 8, 3];
    const isDuong = (canIdx % 2 === 0);
    const start = START_CHI[canIdx];
    const step = isDuong ? (chiIdx - start + 12) % 12 : (start - chiIdx + 12) % 12;
    return TRUONG_SINH_NAMES[step];
  }

  function calculateThaiNguyen(canThang, chiThang) {
    const canThai = (canThang + 1) % 10;
    const chiThai = (chiThang + 3) % 12;
    const jiazi = (6 * canThai - 5 * chiThai + 60) % 60;
    const napAmIndex = Math.floor(jiazi / 2);
    return {
      can: canThai,
      chi: chiThai,
      name: `${CAN[canThai]} ${CHI[chiThai]}`,
      napAm: NAP_AM_30[napAmIndex] || ""
    };
  }

  function calculateMenhCung(canNam, chiThang, chiGio) {
    const mNum = (chiThang - 2 + 12) % 12 + 1; // Dần = 1 ... Sửu = 12
    const hNum = (chiGio - 2 + 12) % 12 + 1;
    const sum = mNum + hNum;
    const cNum = sum <= 14 ? (14 - sum) : (26 - sum);
    const chiMenh = (cNum - 1 + 2) % 12;

    const canDanMap = [2, 4, 6, 8, 0, 2, 4, 6, 8, 0];
    const canDan = canDanMap[canNam];
    const offsetDan = (chiMenh - 2 + 12) % 12;
    const canMenh = (canDan + offsetDan) % 10;

    return {
      can: canMenh,
      chi: chiMenh,
      name: `${CAN[canMenh]} ${CHI[chiMenh]}`
    };
  }

  function calculateKhongVong(can, chi) {
    const kv1 = (chi - can + 22) % 12;
    const kv2 = (chi - can + 23) % 12;
    return `${CHI[kv1]} - ${CHI[kv2]}`;
  }

  // ==========================================
  // VII. THUẬT TOÁN TÍNH TỨ TRỤ & TIẾT KHÍ CHUẨN TỪNG PHÚT
  // ==========================================

  /**
   * Tính Trụ Năm & Trụ Tháng theo Tiết Khí chính xác
   * Sử dụng thư viện Lunar-javascript (nếu có trên window.Solar) hoặc thuật toán thiên văn dự phòng.
   */
  function calculateSolarPillars(solarYear, solarMonth, solarDay, solarHour, solarMinute, timeZone) {
    if (timeZone === undefined) timeZone = 7;
    let yearCan, yearChi, monthCan, monthChi;
    let prevJieQiObj = null;
    let nextJieQiObj = null;

    const SolarLib = (typeof Solar !== "undefined" ? Solar : (typeof window !== "undefined" && window.Solar ? window.Solar : (typeof global !== "undefined" && global.Solar ? global.Solar : null)));

    if (SolarLib) {
      // Chuyển đổi thời điểm sinh sang UTC rồi sang giờ Bắc Kinh (UTC+8) của lunar-javascript
      const birthUtcMs = Date.UTC(solarYear, solarMonth - 1, solarDay, solarHour, solarMinute) - (timeZone * 3600000);
      const bjDate = new Date(birthUtcMs + (8 * 3600000));
      const solar = SolarLib.fromYmdHms(
        bjDate.getUTCFullYear(),
        bjDate.getUTCMonth() + 1,
        bjDate.getUTCDate(),
        bjDate.getUTCHours(),
        bjDate.getUTCMinutes(),
        0
      );
      const lunar = solar.getLunar();

      // Ký tự chữ Hán trong lunar-javascript
      const CAN_CN = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
      const CHI_CN = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];

      // Can Chi Năm chuẩn theo Tiết Khí (Lập Xuân)
      const yearInGanZhiExact = lunar.getYearInGanZhiExact();
      const monthInGanZhiExact = lunar.getMonthInGanZhiExact();

      const parseGanZhi = (gzStr) => {
        let cIdx = -1, chIdx = -1;
        if (!gzStr) return { cIdx, chIdx };
        // Ưu tiên tra chữ Hán
        if (CAN_CN.includes(gzStr[0])) {
          cIdx = CAN_CN.indexOf(gzStr[0]);
          chIdx = CHI_CN.indexOf(gzStr[1]);
          return { cIdx, chIdx };
        }
        // Tra chuỗi tiếng Việt
        for (let i = 0; i < CAN.length; i++) {
          if (gzStr.startsWith(CAN[i])) {
            cIdx = i;
            const rem = gzStr.slice(CAN[i].length).trim();
            chIdx = CHI.indexOf(rem);
            break;
          }
        }
        return { cIdx, chIdx };
      };

      const yP = parseGanZhi(yearInGanZhiExact);
      yearCan = yP.cIdx;
      yearChi = yP.chIdx;

      const mP = parseGanZhi(monthInGanZhiExact);
      monthCan = mP.cIdx;
      monthChi = mP.chIdx;

      // Ánh xạ tên 24 Tiết Khí sang Tiếng Việt
      const JIEQI_NAME_MAP = {
        "立春": "Lập Xuân", "雨水": "Vũ Thủy", "惊蛰": "Kinh Trập", "春分": "Xuân Phân",
        "清明": "Thanh Minh", "谷雨": "Cốc Vũ", "立夏": "Lập Hạ", "小满": "Tiểu Mãn",
        "芒种": "Mang Chủng", "夏至": "Hạ Chí", "小暑": "Tiểu Thử", "大暑": "Đại Thử",
        "立秋": "Lập Thu", "处暑": "Xử Thử", "白露": "Bạch Lộ", "秋分": "Thu Phân",
        "寒露": "Hàn Lộ", "霜降": "Sương Giáng", "立冬": "Lập Đông", "小雪": "Tiểu Tuyết",
        "大雪": "Đại Tuyết", "冬至": "Đông Chí", "小寒": "Tiểu Hàn", "大寒": "Đại Hàn"
      };

      // Trong Bát Tự, ranh giới tháng tính theo TIẾT (Jie), dùng getPrevJie() và getNextJie()
      const prevJq = typeof lunar.getPrevJie === "function" ? lunar.getPrevJie() : lunar.getPrevJieQi(true);
      const nextJq = typeof lunar.getNextJie === "function" ? lunar.getNextJie() : lunar.getNextJieQi(true);

      if (prevJq) {
        const ps = prevJq.getSolar();
        const rawName = prevJq.getName();
        const jqUtcMs = Date.UTC(ps.getYear(), ps.getMonth() - 1, ps.getDay(), ps.getHour(), ps.getMinute()) - (8 * 3600000);
        const userDate = new Date(jqUtcMs + (timeZone * 3600000));
        prevJieQiObj = {
          name: JIEQI_NAME_MAP[rawName] || rawName,
          utcMs: jqUtcMs,
          userDateStr: `${String(userDate.getUTCDate()).padStart(2, "0")}/${String(userDate.getUTCMonth() + 1).padStart(2, "0")}/${userDate.getUTCFullYear()} ${String(userDate.getUTCHours()).padStart(2, "0")}:${String(userDate.getUTCMinutes()).padStart(2, "0")}`
        };
      }

      if (nextJq) {
        const ns = nextJq.getSolar();
        const rawName = nextJq.getName();
        const jqUtcMs = Date.UTC(ns.getYear(), ns.getMonth() - 1, ns.getDay(), ns.getHour(), ns.getMinute()) - (8 * 3600000);
        const userDate = new Date(jqUtcMs + (timeZone * 3600000));
        nextJieQiObj = {
          name: JIEQI_NAME_MAP[rawName] || rawName,
          utcMs: jqUtcMs,
          userDateStr: `${String(userDate.getUTCDate()).padStart(2, "0")}/${String(userDate.getUTCMonth() + 1).padStart(2, "0")}/${userDate.getUTCFullYear()} ${String(userDate.getUTCHours()).padStart(2, "0")}:${String(userDate.getUTCMinutes()).padStart(2, "0")}`
        };
      }
    } else {
      // Thuật toán dự phòng thiên văn chuẩn (nếu không có CDN Lunar)
      const jdn = jdFromDate(solarDay, solarMonth, solarYear);
      const sunLong = sunLongitude(jdn + (solarHour + solarMinute / 60) / 24);
      const deg = (sunLong * 180) / PI;

      // Lập Xuân = 315 độ
      let yAdj = solarYear;
      if (solarMonth < 2 || (solarMonth === 2 && solarDay < 4)) {
        yAdj = solarYear - 1;
      }
      yearCan = (yAdj + 6) % 10;
      yearChi = (yAdj + 8) % 12;

      // Nguyệt Chi theo 12 tiết khí
      let monthOrder = 1; // 1 = Dần (Lập Xuân)
      if (deg >= 315 && deg < 345) monthOrder = 1; // Dần
      else if (deg >= 345 || deg < 15) monthOrder = 2; // Mão
      else if (deg >= 15 && deg < 45) monthOrder = 3; // Thìn
      else if (deg >= 45 && deg < 75) monthOrder = 4; // Tỵ
      else if (deg >= 75 && deg < 105) monthOrder = 5; // Ngọ
      else if (deg >= 105 && deg < 135) monthOrder = 6; // Mùi
      else if (deg >= 135 && deg < 165) monthOrder = 7; // Thân
      else if (deg >= 165 && deg < 195) monthOrder = 8; // Dậu
      else if (deg >= 195 && deg < 225) monthOrder = 9; // Tuất
      else if (deg >= 225 && deg < 255) monthOrder = 10; // Hợi
      else if (deg >= 255 && deg < 285) monthOrder = 11; // Tý
      else monthOrder = 12; // Sửu

      monthChi = (monthOrder + 1) % 12;
      const canThangDau = ((yearCan % 5) * 2 + 2) % 10;
      monthCan = (canThangDau + (monthOrder - 1)) % 10;
    }

    return { yearCan, yearChi, monthCan, monthChi, prevJieQiObj, nextJieQiObj };
  }

  // ==========================================
  // VIII. CORE ENGINE: TÍNH TOÁN BÁT TỰ TOÀN DIỆN
  // ==========================================

  function calculateBazi(input) {
    const {
      name = "Đương số",
      gender = "nam",         // "nam" | "nu"
      calendarType = "solar",  // "solar" | "lunar"
      isLeapMonth = false,
      calcDay: inCalcDay,
      calcMonth: inCalcMonth,
      calcYear: inCalcYear,
      year: inYear,
      month: inMonth,
      day: inDay,
      hour: inHour,
      minute: inMinute,
      solarYear: inSolarYear,
      solarMonth: inSolarMonth,
      solarDay: inSolarDay,
      solarHour: inSolarHour,
      solarMinute: inSolarMinute,
      timeZone = 7,
      provinceId = null
    } = input;

    const now = new Date();
    const currentYear = now.getFullYear();
    const calcYear = (inCalcYear !== undefined && inCalcYear !== null && !isNaN(parseInt(inCalcYear, 10))) 
      ? parseInt(inCalcYear, 10) 
      : currentYear;
    const calcDay = (inCalcDay !== undefined && inCalcDay !== null && !isNaN(parseInt(inCalcDay, 10)))
      ? parseInt(inCalcDay, 10)
      : null;
    const calcMonth = (inCalcMonth !== undefined && inCalcMonth !== null && !isNaN(parseInt(inCalcMonth, 10)))
      ? parseInt(inCalcMonth, 10)
      : null;

    // 1. Chuyển đổi Âm lịch sang Dương lịch (nếu chọn Âm lịch)
    let solarYear = parseInt(inSolarYear !== undefined ? inSolarYear : inYear, 10);
    let solarMonth = parseInt(inSolarMonth !== undefined ? inSolarMonth : inMonth, 10);
    let solarDay = parseInt(inSolarDay !== undefined ? inSolarDay : inDay, 10);
    let rawHour = parseInt(inSolarHour !== undefined ? inSolarHour : inHour, 10);
    let rawMinute = parseInt(inSolarMinute !== undefined ? inSolarMinute : inMinute, 10);
    let lunarDateInfo = null;

    if (calendarType === "lunar") {
      const sDate = lunarToSolar(solarDay, solarMonth, solarYear, isLeapMonth, timeZone);
      const lDay = solarDay;
      const lMonth = solarMonth;
      const lYear = solarYear;
      solarDay = sDate.day;
      solarMonth = sDate.month;
      solarYear = sDate.year;
      lunarDateInfo = {
        day: lDay,
        month: lMonth,
        year: lYear,
        isLeap: isLeapMonth
      };
    } else {
      lunarDateInfo = solarToLunar(solarDay, solarMonth, solarYear, timeZone);
    }

    // 2. Tính Lịch Mặt Trời (True Solar Time) nếu ở VN (+7)
    let solarAdjustment = null;
    let effYear = solarYear;
    let effMonth = solarMonth;
    let effDay = solarDay;
    let effHour = rawHour;
    let effMinute = rawMinute;

    if (timeZone === 7 && provinceId) {
      solarAdjustment = calculateSolarAdjustment(solarYear, solarMonth, solarDay, rawHour, rawMinute, provinceId);
      if (solarAdjustment) {
        effYear = solarAdjustment.adjustedYear;
        effMonth = solarAdjustment.adjustedMonth;
        effDay = solarAdjustment.adjustedDay;
        effHour = solarAdjustment.adjustedHour;
        effMinute = solarAdjustment.adjustedMinute;
      }
    }

    // 3. Xử lý Giờ Tý đêm (23h00 - 23h59): Chuyển ngày Can Chi sang ngày hôm sau
    let baziDay = effDay;
    let baziMonth = effMonth;
    let baziYear = effYear;
    if (effHour >= 23) {
      // Sang ngày mới theo quy ước Giờ Tý
      const nextDayMs = Date.UTC(effYear, effMonth - 1, effDay) + 86400000;
      const nd = new Date(nextDayMs);
      baziDay = nd.getUTCDate();
      baziMonth = nd.getUTCMonth() + 1;
      baziYear = nd.getUTCFullYear();
    }

    // 4. Trụ Ngày (Nhật Trụ) từ JDN của baziDay/baziMonth/baziYear
    const jdn = jdFromDate(baziDay, baziMonth, baziYear);
    const jiaziIndex = (jdn + 49) % 60;
    const canNgay = jiaziIndex % 10;
    const chiNgay = jiaziIndex % 12;

    // 5. Trụ Giờ (Thời Trụ): Ngũ Thử Độn
    let chiGio;
    if (effHour >= 23 || effHour < 1) chiGio = 0; // Tý
    else if (effHour < 3) chiGio = 1; // Sửu
    else if (effHour < 5) chiGio = 2; // Dần
    else if (effHour < 7) chiGio = 3; // Mão
    else if (effHour < 9) chiGio = 4; // Thìn
    else if (effHour < 11) chiGio = 5; // Tỵ
    else if (effHour < 13) chiGio = 6; // Ngọ
    else if (effHour < 15) chiGio = 7; // Mùi
    else if (effHour < 17) chiGio = 8; // Thân
    else if (effHour < 19) chiGio = 9; // Dậu
    else if (effHour < 21) chiGio = 10; // Tuất
    else chiGio = 11; // Hợi

    const canGioTy = (canNgay % 5) * 2;
    const canGio = (canGioTy + chiGio) % 10;

    // 6. Trụ Năm & Trụ Tháng theo Tiết Khí
    const pillars = calculateSolarPillars(solarYear, solarMonth, solarDay, effHour, effMinute, timeZone);
    const canNam = pillars.yearCan;
    const chiNam = pillars.yearChi;
    const canThang = pillars.monthCan;
    const chiThang = pillars.monthChi;

    // Phân loại Âm Dương Đương Số
    const isDuongNam = (gender === "nam" && canNam % 2 === 0);
    const isAmNam = (gender === "nam" && canNam % 2 !== 0);
    const isDuongNu = (gender === "nu" && canNam % 2 === 0);
    const isAmNu = (gender === "nu" && canNam % 2 !== 0);

    let genderLabel = "";
    if (isDuongNam) genderLabel = "Dương Nam";
    else if (isAmNam) genderLabel = "Âm Nam";
    else if (isDuongNu) genderLabel = "Dương Nữ";
    else genderLabel = "Âm Nữ";

    // Chiều Đại Vận: Dương Nam / Âm Nữ = Thuận (+1), Âm Nam / Dương Nữ = Nghịch (-1)
    const direction = (isDuongNam || isAmNu) ? 1 : -1;

    // 7. Thập Thần 4 Trụ (Can & Chi) theo chuẩn Hoa Sơn Bát Tự
    // Thiên Tinh (Can)
    const ttCanNam = THAP_THAN_THIEN_CAN[canNgay][canNam];
    const ttCanThang = THAP_THAN_THIEN_CAN[canNgay][canThang];
    const ttCanNgay = "NHẬT CHỦ";
    const ttCanGio = THAP_THAN_THIEN_CAN[canNgay][canGio];

    // Địa Tinh (Chi - Trang 73)
    const ttChiNam = THAP_THAN_DIA_CHI[canNgay][chiNam];
    const ttChiThang = THAP_THAN_DIA_CHI[canNgay][chiThang];
    const ttChiNgay = THAP_THAN_DIA_CHI[canNgay][chiNgay];
    const ttChiGio = THAP_THAN_DIA_CHI[canNgay][chiGio];

    // Can Chi Liên (Dọc)
    const cclNam = checkCanChiLien(canNam, chiNam);
    const cclThang = checkCanChiLien(canThang, chiThang);
    const cclNgay = checkCanChiLien(canNgay, chiNgay);
    const cclGio = checkCanChiLien(canGio, chiGio);

    // Thần Sát
    const tsNam = calculateThanSat(canNgay, canNam, chiNgay, chiNam, chiNam);
    const tsThang = calculateThanSat(canNgay, canNam, chiNgay, chiNam, chiThang);
    const tsNgay = calculateThanSat(canNgay, canNam, chiNgay, chiNam, chiNgay);
    const tsGio = calculateThanSat(canNgay, canNam, chiNgay, chiNam, chiGio);

    // Nạp Âm 4 Trụ
    const getNapAm = (can, chi) => {
      const jiazi = (6 * can - 5 * chi + 60) % 60;
      return NAP_AM_30[Math.floor(jiazi / 2)] || "";
    };
    const napAmNam = getNapAm(canNam, chiNam);
    const napAmThang = getNapAm(canThang, chiThang);
    const napAmNgay = getNapAm(canNgay, chiNgay);
    const napAmGio = getNapAm(canGio, chiGio);

    // Vòng 12 Trường Sinh theo Can Ngày
    const tsSinhNam = getTruongSinh(canNgay, chiNam);
    const tsSinhThang = getTruongSinh(canNgay, chiThang);
    const tsSinhNgay = getTruongSinh(canNgay, chiNgay);
    const tsSinhGio = getTruongSinh(canNgay, chiGio);

    // Mệnh Cung, Thai Nguyên, Niên Không, Nhật Không
    const thaiNguyen = calculateThaiNguyen(canThang, chiThang);
    const menhCung = calculateMenhCung(canNam, chiThang, chiGio);
    const nienKhong = calculateKhongVong(canNam, chiNam);
    const nhatKhong = calculateKhongVong(canNgay, chiNgay);

    // 8. Tính Tuổi Khởi Đại Vận & 10 Đại Vận (Chuẩn từng phút)
    let startYears = 1;
    let startMonths = 0;
    let startDays = 0;
    let soTinhDaiVan = 0;
    let soTinhDaiVanStr = "-";
    let tietKhiRangeText = "";
    let jieQiInfoText = "";

    const birthUtcMs = Date.UTC(solarYear, solarMonth - 1, solarDay, effHour, effMinute) - (timeZone * 3600000);

    if (pillars.prevJieQiObj && pillars.nextJieQiObj) {
      const jqTarget = direction === 1 ? pillars.nextJieQiObj : pillars.prevJieQiObj;
      const deltaMs = Math.abs(jqTarget.utcMs - birthUtcMs);
      const deltaMinutes = deltaMs / (60 * 1000);
      soTinhDaiVan = deltaMinutes / 1440;
      soTinhDaiVanStr = soTinhDaiVan.toFixed(2);

      // 4320 phút = 1 năm, 360 phút = 1 tháng, 12 phút = 1 ngày
      startYears = Math.floor(deltaMinutes / 4320);
      let remMinutes = deltaMinutes % 4320;
      startMonths = Math.floor(remMinutes / 360);
      let remDaysMin = remMinutes % 360;
      startDays = Math.floor(remDaysMin / 12);

      jieQiInfoText = `Khởi Đại Vận: ${startYears} tuổi ${startMonths} tháng ${startDays} ngày (${direction === 1 ? 'Thuận hành đến tiết ' + jqTarget.name + ' [' + jqTarget.userDateStr + ']' : 'Nghịch hành lùi về tiết ' + jqTarget.name + ' [' + jqTarget.userDateStr + ']'})`;

      const pName = pillars.prevJieQiObj.name || "";
      const pDate = (pillars.prevJieQiObj.userDateStr || "").replace(/\//g, "-");
      const nDate = (pillars.nextJieQiObj.userDateStr || "").replace(/\//g, "-");
      tietKhiRangeText = `Tiết ${pName}: Bắt đầu ${pDate} → Kết thúc ${nDate}`;
    } else {
      jieQiInfoText = `Khởi Đại Vận: 1 tuổi 8 tháng (Tính theo tiết khí thiên văn)`;
      startYears = 1;
      startMonths = 8;
      soTinhDaiVan = 5;
      soTinhDaiVanStr = "5.00";
      tietKhiRangeText = "";
    }

    // Tính ngày Dương lịch chính xác bắt đầu nhập Đại Vận 1 (Chu Thần Bân tr. 318)
    const startDateObj = new Date(solarYear, solarMonth - 1, solarDay);
    startDateObj.setFullYear(startDateObj.getFullYear() + startYears);
    startDateObj.setMonth(startDateObj.getMonth() + startMonths);
    startDateObj.setDate(startDateObj.getDate() + startDays);
    const startSolarDay = startDateObj.getDate();
    const startSolarMonth = startDateObj.getMonth() + 1;
    const startSolarYear = startDateObj.getFullYear();
    const startSolarDateStr = `${String(startSolarDay).padStart(2, '0')}/${String(startSolarMonth).padStart(2, '0')}/${startSolarYear}`;

    // Chuẩn Chu Thần Bân (Chương 21, tr. 318): "Tuế là một năm tròn", mỗi 10 năm chuyển một vận
    const baseStartAge = startYears;

    // Lập 10 Cột Đại Vận
    const daiVanList = [];

    for (let i = 1; i <= 10; i++) {
      const dvCan = (canThang + i * direction + 100) % 10;
      const dvChi = (chiThang + i * direction + 120) % 12;
      const ageFrom = baseStartAge + (i - 1) * 10;
      const ageTo = ageFrom + 9;
      const solarYearStart = startSolarYear + (i - 1) * 10;

      const ttCan = THAP_THAN_THIEN_CAN[canNgay][dvCan];
      const ttChi = THAP_THAN_DIA_CHI[canNgay][dvChi];

      // Đánh dấu đại vận hiện tại và đại vận của năm xem (target)
      const isCurrent = (currentYear >= solarYearStart && currentYear < solarYearStart + 10);
      const isTarget = (calcYear >= solarYearStart && calcYear < solarYearStart + 10);

      daiVanList.push({
        index: i,
        can: dvCan,
        canName: CAN[dvCan],
        canElem: ELEMENT_NAMES[NGU_HANH_CAN[dvCan]],
        canColor: ELEMENT_COLORS[ELEMENT_NAMES[NGU_HANH_CAN[dvCan]]],
        chi: dvChi,
        chiName: CHI[dvChi],
        chiElem: ELEMENT_NAMES[NGU_HANH_CHI[dvChi]],
        chiColor: ELEMENT_COLORS[ELEMENT_NAMES[NGU_HANH_CHI[dvChi]]],
        thapThanCan: ttCan,
        thapThanChi: ttChi,
        thapThanDisplay: `${ttCan} / ${ttChi}`,
        ageFrom,
        ageTo,
        ageRangeText: `${ageFrom}-${ageTo}t`,
        solarYearStart,
        isCurrent,
        isTarget
      });
    }

    // 9. Hàm lấy 20 Năm Lưu Niên theo Đại Vận được chọn (Kèm Tiểu Vận chuẩn Hoa Sơn Bát Tự - tr. 331-336)
    const getLuuNienForDaiVan = (dvIndex, customCalcYear) => {
      const dv = daiVanList.find(d => d.index === dvIndex) || daiVanList[0];
      const nextDv = daiVanList.find(d => d.index === dvIndex + 1);
      const targetY = (customCalcYear !== undefined && customCalcYear !== null && !isNaN(parseInt(customCalcYear, 10)))
        ? parseInt(customCalcYear, 10)
        : calcYear;

      // Chiều Tiểu Vận: Dương Nam / Âm Nữ đi Thuận (+1), Âm Nam / Dương Nữ đi Nghịch (-1) - tr. 331
      const tvDirection = (isDuongNam || isAmNu) ? 1 : -1;
      // Gốc khởi Tiểu Vận là Trụ Giờ (Thời trụ)
      const hourJiazi = (6 * canGio - 5 * chiGio + 60) % 60;

      const calcYearData = (yr, age, row, isTransitionYear = false) => {
        const jiaziYr = ((yr - 1924) % 60 + 60) % 60;
        const yCan = jiaziYr % 10;
        const yChi = jiaziYr % 12;
        const ttCan = THAP_THAN_THIEN_CAN[canNgay][yCan];
        const ttChi = THAP_THAN_DIA_CHI[canNgay][yChi];
        const isCurrent = (yr === currentYear);
        const isTarget = (yr === targetY);

        // Tính 2 giai đoạn Tiểu Vận trong năm yr (tr. 331-336):
        // Tuổi mụ (tuổi ta) trong năm yr:
        const currentAge = yr - solarYear + 1;

        // Giai đoạn 1: Trước ngày sinh nhật dương lịch (tuổi currentAge - 1)
        const ageBefore = Math.max(1, currentAge - 1);
        const tvJiazi1 = ((hourJiazi + tvDirection * ageBefore) % 60 + 60) % 60;
        const tvCan1 = tvJiazi1 % 10;
        const tvCanName1 = CAN[tvCan1];
        const tvCanColor1 = ELEMENT_COLORS[ELEMENT_NAMES[NGU_HANH_CAN[tvCan1]]];
        const tvThapThan1 = THAP_THAN_THIEN_CAN[canNgay][tvCan1];

        // Giai đoạn 2: Từ ngày sinh nhật dương lịch trở đi (tuổi currentAge)
        const ageAfter = Math.max(1, currentAge);
        const tvJiazi2 = ((hourJiazi + tvDirection * ageAfter) % 60 + 60) % 60;
        const tvCan2 = tvJiazi2 % 10;
        const tvCanName2 = CAN[tvCan2];
        const tvCanColor2 = ELEMENT_COLORS[ELEMENT_NAMES[NGU_HANH_CAN[tvCan2]]];
        const tvThapThan2 = THAP_THAN_THIEN_CAN[canNgay][tvCan2];

        return {
          year: yr,
          age,
          canName: CAN[yCan],
          chiName: CHI[yChi],
          canElem: ELEMENT_NAMES[NGU_HANH_CAN[yCan]],
          chiElem: ELEMENT_NAMES[NGU_HANH_CHI[yChi]],
          canColor: ELEMENT_COLORS[ELEMENT_NAMES[NGU_HANH_CAN[yCan]]],
          chiColor: ELEMENT_COLORS[ELEMENT_NAMES[NGU_HANH_CHI[yChi]]],
          thapThanCan: ttCan,
          thapThanChi: ttChi,
          thapThan: `${ttCan}/${ttChi}`,
          tvCanName1,
          tvCanColor1,
          tvThapThan1,
          tvCanName2,
          tvCanColor2,
          tvThapThan2,
          isCurrent,
          isTarget,
          isTransitionYear,
          row
        };
      };

      const years = [];
      // 10 năm đại vận này
      for (let y = 0; y < 10; y++) {
        const yr = dv.solarYearStart + y;
        const age = dv.ageFrom + y;
        years.push(calcYearData(yr, age, 1, y === 0));
      }

      // 10 năm đại vận kế tiếp (nếu có)
      if (nextDv) {
        for (let y = 0; y < 10; y++) {
          const yr = nextDv.solarYearStart + y;
          const age = nextDv.ageFrom + y;
          years.push(calcYearData(yr, age, 2, y === 0));
        }
      }

      return years;
    };

    // 10. Phân tích 3 Liên (Thiên Can Liên & Địa Chi Liên) & Vượng Suy Thiên Can
    const thienCanLienList = analyzeThienCanLien(canNam, canThang, canGio);
    const diaChiLienList = analyzeDiaChiLien(chiNam, chiThang, chiNgay, chiGio);
    const vuongSuyInfo = calculateStemVuongSuy(canNam, canThang, canNgay, canGio, chiThang);

    // 11. Thống kê Ngũ Hành trên 8 chữ nguyên cục
    const elementCounts = { "Kim": 0, "Mộc": 0, "Thủy": 0, "Hỏa": 0, "Thổ": 0 };
    [canNam, canThang, canNgay, canGio].forEach(c => elementCounts[ELEMENT_NAMES[NGU_HANH_CAN[c]]]++);
    [chiNam, chiThang, chiNgay, chiGio].forEach(c => elementCounts[ELEMENT_NAMES[NGU_HANH_CHI[c]]]++);

    let vuongNhat = "Kim";
    let maxCount = -1;
    const khuyetList = [];

    ELEMENT_NAMES.forEach(elem => {
      if (elementCounts[elem] > maxCount) {
        maxCount = elementCounts[elem];
        vuongNhat = elem;
      }
      if (elementCounts[elem] === 0) {
        khuyetList.push(elem);
      }
    });

    // Trả về toàn bộ dữ liệu lá số
    return {
      rawInput: {
        name,
        gender: genderLabel,
        calcDay,
        calcMonth,
        calcYear,
        calcDateStr: (calcDay && calcMonth) ? `${String(calcDay).padStart(2, '0')}/${String(calcMonth).padStart(2, '0')}/${calcYear}` : `${calcYear}`,
        birthDateStr: `${String(solarDay).padStart(2, '0')}/${String(solarMonth).padStart(2, '0')}/${solarYear}`,
        birthTimeStr: `${String(rawHour).padStart(2, '0')}:${String(rawMinute).padStart(2, '0')}`,
        lunarDateStr: `${String(lunarDateInfo.day).padStart(2, '0')}/${String(lunarDateInfo.month).padStart(2, '0')}/${lunarDateInfo.year}${lunarDateInfo.isLeap ? ' (Nhuận)' : ''}`,
        timeZone,
        provinceName: solarAdjustment ? solarAdjustment.province.name : null,
        solarAdjustment
      },
      fourPillars: {
        year: {
          label: "NĂM",
          solarDateText: `${solarYear}`,
          canIdx: canNam,
          canName: CAN[canNam],
          canElem: ELEMENT_NAMES[NGU_HANH_CAN[canNam]],
          canColor: ELEMENT_COLORS[ELEMENT_NAMES[NGU_HANH_CAN[canNam]]],
          chiIdx: chiNam,
          chiName: CHI[chiNam],
          chiElem: ELEMENT_NAMES[NGU_HANH_CHI[chiNam]],
          chiColor: ELEMENT_COLORS[ELEMENT_NAMES[NGU_HANH_CHI[chiNam]]],
          thapThanCan: ttCanNam,
          thapThanChi: ttChiNam,
          truongSinh: tsSinhNam,
          napAm: napAmNam,
          canChiLien: cclNam,
          thanSat: tsNam
        },
        month: {
          label: "THÁNG",
          solarDateText: `${String(solarMonth).padStart(2, '0')}`,
          canIdx: canThang,
          canName: CAN[canThang],
          canElem: ELEMENT_NAMES[NGU_HANH_CAN[canThang]],
          canColor: ELEMENT_COLORS[ELEMENT_NAMES[NGU_HANH_CAN[canThang]]],
          chiIdx: chiThang,
          chiName: CHI[chiThang],
          chiElem: ELEMENT_NAMES[NGU_HANH_CHI[chiThang]],
          chiColor: ELEMENT_COLORS[ELEMENT_NAMES[NGU_HANH_CHI[chiThang]]],
          thapThanCan: ttCanThang,
          thapThanChi: ttChiThang,
          truongSinh: tsSinhThang,
          napAm: napAmThang,
          canChiLien: cclThang,
          thanSat: tsThang
        },
        day: {
          label: "NGÀY",
          solarDateText: `${String(solarDay).padStart(2, '0')}`,
          canIdx: canNgay,
          canName: CAN[canNgay],
          canElem: ELEMENT_NAMES[NGU_HANH_CAN[canNgay]],
          canColor: ELEMENT_COLORS[ELEMENT_NAMES[NGU_HANH_CAN[canNgay]]],
          chiIdx: chiNgay,
          chiName: CHI[chiNgay],
          chiElem: ELEMENT_NAMES[NGU_HANH_CHI[chiNgay]],
          chiColor: ELEMENT_COLORS[ELEMENT_NAMES[NGU_HANH_CHI[chiNgay]]],
          thapThanCan: ttCanNgay,
          thapThanChi: ttChiNgay,
          truongSinh: tsSinhNgay,
          napAm: napAmNgay,
          canChiLien: cclNgay,
          thanSat: tsNgay
        },
        hour: {
          label: "GIỜ",
          solarDateText: `${String(rawHour).padStart(2, '0')}:${String(rawMinute).padStart(2, '0')}`,
          canIdx: canGio,
          canName: CAN[canGio],
          canElem: ELEMENT_NAMES[NGU_HANH_CAN[canGio]],
          canColor: ELEMENT_COLORS[ELEMENT_NAMES[NGU_HANH_CAN[canGio]]],
          chiIdx: chiGio,
          chiName: CHI[chiGio],
          chiElem: ELEMENT_NAMES[NGU_HANH_CHI[chiGio]],
          chiColor: ELEMENT_COLORS[ELEMENT_NAMES[NGU_HANH_CHI[chiGio]]],
          thapThanCan: ttCanGio,
          thapThanChi: ttChiGio,
          truongSinh: tsSinhGio,
          napAm: napAmGio,
          canChiLien: cclGio,
          thanSat: tsGio
        }
      },
      daiVan: {
        jieQiInfoText,
        startAgeDisplay: baseStartAge,
        soTinhDaiVan: soTinhDaiVanStr,
        startYears,
        startMonths,
        startDays,
        startSolarDateStr,
        tietKhiRangeText,
        prevJieQi: pillars.prevJieQiObj,
        nextJieQi: pillars.nextJieQiObj,
        targetDaiVanIndex: (daiVanList.find(d => d.isTarget) || daiVanList[0]).index,
        list: daiVanList
      },
      extraInfo: {
        thaiNguyen,
        menhCung,
        nienKhong,
        nhatKhong
      },
      getLuuNienForDaiVan,
      solarDay,
      solarMonth,
      solarYear,
      birthdayShortStr: `${String(solarDay).padStart(2, "0")}/${String(solarMonth).padStart(2, "0")}`,
      analysis: {
        thienCanLienList,
        diaChiLienList,
        elementCounts,
        vuongNhat,
        khuyetList,
        vuongSuy: vuongSuyInfo
      },
      vuongSuy: vuongSuyInfo
    };
  }

  // Export engine ra global window
  global.BaziEngine = {
    CAN,
    CHI,
    NGU_HANH_CAN,
    NGU_HANH_CHI,
    ELEMENT_NAMES,
    ELEMENT_COLORS,
    VN_PROVINCES,
    NAP_AM_30,
    THAP_THAN_THIEN_CAN,
    THAP_THAN_DIA_CHI,
    THAP_THAN_FULL_NAMES,
    calculateSolarAdjustment,
    getEquationOfTime,
    lunarToSolar,
    solarToLunar,
    checkCanChiLien,
    analyzeThienCanLien,
    analyzeDiaChiLien,
    calculateStemVuongSuy,
    evaluateClientStems,
    isHoaSonSinh,
    isHoaSonKhac,
    calculateThanSat,
    getTruongSinh,
    calculateThaiNguyen,
    calculateMenhCung,
    calculateKhongVong,
    calculateBazi
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = global.BaziEngine;
  }
})(typeof window !== 'undefined' ? window : global);
