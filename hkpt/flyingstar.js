// ============================================================
// Huyền Không Phi Tinh - Flying Star Feng Shui Engine
// ============================================================

// --- CONSTANTS ---

// 24 Mountains data: name, centerDegree, yinYang (+1=Yang, -1=Yin), sanYuanLong, loShuPalace
const MOUNTAINS = [
  { name: 'Nhâm', center: 345, yinYang: 1,  sanYuan: 'Địa',  palace: 1 },
  { name: 'Tý',   center: 0,   yinYang: -1, sanYuan: 'Thiên', palace: 1 },
  { name: 'Quý',  center: 15,  yinYang: -1, sanYuan: 'Nhân',  palace: 1 },
  { name: 'Sửu',  center: 30,  yinYang: -1, sanYuan: 'Địa',  palace: 8 },
  { name: 'Cấn',  center: 45,  yinYang: 1,  sanYuan: 'Thiên', palace: 8 },
  { name: 'Dần',  center: 60,  yinYang: 1,  sanYuan: 'Nhân',  palace: 8 },
  { name: 'Giáp', center: 75,  yinYang: 1,  sanYuan: 'Địa',  palace: 3 },
  { name: 'Mão',  center: 90,  yinYang: -1, sanYuan: 'Thiên', palace: 3 },
  { name: 'Ất',   center: 105, yinYang: -1, sanYuan: 'Nhân',  palace: 3 },
  { name: 'Thìn', center: 120, yinYang: -1, sanYuan: 'Địa',  palace: 4 },
  { name: 'Tốn',  center: 135, yinYang: 1,  sanYuan: 'Thiên', palace: 4 },
  { name: 'Tỵ',   center: 150, yinYang: 1,  sanYuan: 'Nhân',  palace: 4 },
  { name: 'Bính', center: 165, yinYang: 1,  sanYuan: 'Địa',  palace: 9 },
  { name: 'Ngọ',  center: 180, yinYang: -1, sanYuan: 'Thiên', palace: 9 },
  { name: 'Đinh', center: 195, yinYang: -1, sanYuan: 'Nhân',  palace: 9 },
  { name: 'Mùi',  center: 210, yinYang: -1, sanYuan: 'Địa',  palace: 2 },
  { name: 'Khôn', center: 225, yinYang: 1,  sanYuan: 'Thiên', palace: 2 },
  { name: 'Thân', center: 240, yinYang: 1,  sanYuan: 'Nhân',  palace: 2 },
  { name: 'Canh', center: 255, yinYang: 1,  sanYuan: 'Địa',  palace: 7 },
  { name: 'Dậu',  center: 270, yinYang: -1, sanYuan: 'Thiên', palace: 7 },
  { name: 'Tân',  center: 285, yinYang: -1, sanYuan: 'Nhân',  palace: 7 },
  { name: 'Tuất', center: 300, yinYang: -1, sanYuan: 'Địa',  palace: 6 },
  { name: 'Càn',  center: 315, yinYang: 1,  sanYuan: 'Thiên', palace: 6 },
  { name: 'Hợi',  center: 330, yinYang: 1,  sanYuan: 'Nhân',  palace: 6 },
];

// Palace names
const PALACE_NAMES = {
  1: 'Khảm', 2: 'Khôn', 3: 'Chấn', 4: 'Tốn',
  5: 'Trung', 6: 'Càn', 7: 'Đoài', 8: 'Cấn', 9: 'Ly'
};

// Palace directions
const PALACE_DIRECTIONS = {
  1: 'Bắc', 2: 'Tây Nam', 3: 'Đông', 4: 'Đông Nam',
  5: 'Trung Cung', 6: 'Tây Bắc', 7: 'Tây', 8: 'Đông Bắc', 9: 'Nam'
};

// Flying path - Luong Thien Xich trajectory
const FORWARD_PATH = [5, 6, 7, 8, 9, 1, 2, 3, 4];
const REVERSE_PATH = [5, 4, 3, 2, 1, 9, 8, 7, 6];

// Replacement Star Table (Thế Tinh) - mountain name -> replacement star number
const REPLACEMENT_STAR = {
  'Tý': 1, 'Quý': 1, 'Giáp': 1, 'Thân': 1,
  'Khôn': 2, 'Nhâm': 2, 'Ất': 2, 'Mão': 2, 'Mùi': 2,
  'Tuất': 6, 'Càn': 6, 'Hợi': 6, 'Thìn': 6, 'Tốn': 6, 'Tỵ': 6,
  'Cấn': 7, 'Bính': 7, 'Tân': 7, 'Dậu': 7, 'Sửu': 7,
  'Dần': 9, 'Ngọ': 9, 'Canh': 9, 'Đinh': 9,
};

// Period (Vận) ranges - each period is 20 years
const PERIOD_RANGES = [
  { van: 1, start: 1864, end: 1883 },
  { van: 2, start: 1884, end: 1903 },
  { van: 3, start: 1904, end: 1923 },
  { van: 4, start: 1924, end: 1943 },
  { van: 5, start: 1944, end: 1963 },
  { van: 6, start: 1964, end: 1983 },
  { van: 7, start: 1984, end: 2003 },
  { van: 8, start: 2004, end: 2023 },
  { van: 9, start: 2024, end: 2043 },
  // Extended periods (cycle repeats every 180 years)
  { van: 1, start: 2044, end: 2063 },
  { van: 2, start: 2064, end: 2083 },
  { van: 3, start: 2084, end: 2103 },
];

// --- UTILITY FUNCTIONS ---

function wrapStar(n) {
  // Wrap star number 1-9
  n = ((n - 1) % 9 + 9) % 9 + 1;
  return n;
}

function degreeDiff(a, b) {
  // Angular difference handling 360° wrap
  let diff = Math.abs(a - b);
  if (diff > 180) diff = 360 - diff;
  return diff;
}

// --- CORE FUNCTIONS ---

/**
 * Get Period (Vận) from year
 */
function getVan(year) {
  // Use 180-year cycle from 1864
  const cycleYear = ((year - 1864) % 180 + 180) % 180;
  const van = Math.floor(cycleYear / 20) + 1;
  return van;
}

/**
 * Find the closest mountain for a given degree
 */
function findMountain(degree) {
  degree = ((degree % 360) + 360) % 360;
  let best = null;
  let bestDiff = 999;
  for (const m of MOUNTAINS) {
    const diff = degreeDiff(degree, m.center);
    if (diff < bestDiff) {
      bestDiff = diff;
      best = m;
    }
  }
  return { mountain: best, deviation: bestDiff };
}

/**
 * Find the opposite mountain (Tọa from Hướng or vice versa)
 */
function getOpposite(degree) {
  let opp = degree + 180;
  if (opp >= 360) opp -= 360;
  return findMountain(opp);
}

// 8 Đại Không Vong boundaries (Ranh giới giữa 8 Quẻ lớn)
const DAI_KHONG_VONG_BOUNDARIES = [
  { degree: 22.5,  palaces: 'Khảm (Bắc) / Cấn (Đông Bắc)', name: 'Khảm - Cấn' },
  { degree: 67.5,  palaces: 'Cấn (Đông Bắc) / Chấn (Đông)', name: 'Cấn - Chấn' },
  { degree: 112.5, palaces: 'Chấn (Đông) / Tốn (Đông Nam)', name: 'Chấn - Tốn' },
  { degree: 157.5, palaces: 'Tốn (Đông Nam) / Ly (Nam)', name: 'Tốn - Ly' },
  { degree: 202.5, palaces: 'Ly (Nam) / Khôn (Tây Nam)', name: 'Ly - Khôn' },
  { degree: 247.5, palaces: 'Khôn (Tây Nam) / Đoài (Tây)', name: 'Khôn - Đoài' },
  { degree: 292.5, palaces: 'Đoài (Tây) / Càn (Tây Bắc)', name: 'Đoài - Càn' },
  { degree: 337.5, palaces: 'Càn (Tây Bắc) / Khảm (Bắc)', name: 'Càn - Khảm' },
];

// 16 Tiểu Không Vong boundaries (Ranh giới giữa 2 Sơn kề nhau trong cùng 1 Quẻ)
const TIEU_KHONG_VONG_BOUNDARIES = [
  { degree: 352.5, mountains: 'Nhâm / Tý', palace: 'Khảm (Bắc)' },
  { degree: 7.5,   mountains: 'Tý / Quý', palace: 'Khảm (Bắc)' },
  { degree: 37.5,  mountains: 'Sửu / Cấn', palace: 'Cấn (Đông Bắc)' },
  { degree: 52.5,  mountains: 'Cấn / Dần', palace: 'Cấn (Đông Bắc)' },
  { degree: 82.5,  mountains: 'Giáp / Mão', palace: 'Chấn (Đông)' },
  { degree: 97.5,  mountains: 'Mão / Ất', palace: 'Chấn (Đông)' },
  { degree: 127.5, mountains: 'Thìn / Tốn', palace: 'Tốn (Đông Nam)' },
  { degree: 142.5, mountains: 'Tốn / Tỵ', palace: 'Tốn (Đông Nam)' },
  { degree: 172.5, mountains: 'Bính / Ngọ', palace: 'Ly (Nam)' },
  { degree: 187.5, mountains: 'Ngọ / Đinh', palace: 'Ly (Nam)' },
  { degree: 217.5, mountains: 'Mùi / Khôn', palace: 'Khôn (Tây Nam)' },
  { degree: 232.5, mountains: 'Khôn / Thân', palace: 'Khôn (Tây Nam)' },
  { degree: 262.5, mountains: 'Canh / Dậu', palace: 'Đoài (Tây)' },
  { degree: 277.5, mountains: 'Dậu / Tân', palace: 'Đoài (Tây)' },
  { degree: 307.5, mountains: 'Tuất / Càn', palace: 'Càn (Tây Bắc)' },
  { degree: 322.5, mountains: 'Càn / Hợi', palace: 'Càn (Tây Bắc)' },
];

/**
 * Classify the chart type based on deviation from mountain center and facing degree
 */
function classifyChart(deviation, facingDegree) {
  if (deviation <= 3.0) {
    return { type: 'HA_QUAI', label: 'Chính Hướng (Hạ Quái)', isKhongVong: false };
  }
  if (deviation <= 5.5) {
    return { type: 'THE_QUAI', label: 'Kiêm Hướng (Thế Quái)', isKhongVong: false };
  }

  const deg = typeof facingDegree === 'number' ? ((facingDegree % 360) + 360) % 360 : 0;
  
  // Check Đại Không Vong
  let closestDKV = null;
  let minDiffDKV = 999;
  for (const b of DAI_KHONG_VONG_BOUNDARIES) {
    const diff = degreeDiff(deg, b.degree);
    if (diff < minDiffDKV) {
      minDiffDKV = diff;
      closestDKV = b;
    }
  }

  // Check Tiểu Không Vong
  let closestTKV = null;
  let minDiffTKV = 999;
  for (const b of TIEU_KHONG_VONG_BOUNDARIES) {
    const diff = degreeDiff(deg, b.degree);
    if (diff < minDiffTKV) {
      minDiffTKV = diff;
      closestTKV = b;
    }
  }

  if (minDiffDKV <= minDiffTKV) {
    return {
      type: 'DAI_KHONG_VONG',
      label: 'Đại Không Vong',
      isKhongVong: true,
      boundary: closestDKV,
      boundaryType: 'DAI_KHONG_VONG',
      boundaryDegree: closestDKV ? closestDKV.degree : 0,
      diff: parseFloat(minDiffDKV.toFixed(2)),
      desc: `Trục hướng nhà (${deg.toFixed(1)}°) rơi sát đường phân giới Đại Không Vong giữa 2 quẻ ${closestDKV ? closestDKV.palaces : ''} (${closestDKV ? closestDKV.degree : ''}°). Sai lệch chỉ ${minDiffDKV.toFixed(1)}°.`
    };
  } else {
    return {
      type: 'TIEU_KHONG_VONG',
      label: 'Tiểu Không Vong',
      isKhongVong: true,
      boundary: closestTKV,
      boundaryType: 'TIEU_KHONG_VONG',
      boundaryDegree: closestTKV ? closestTKV.degree : 0,
      diff: parseFloat(minDiffTKV.toFixed(2)),
      desc: `Trục hướng nhà (${deg.toFixed(1)}°) rơi sát đường phân giới Tiểu Không Vong giữa 2 sơn ${closestTKV ? closestTKV.mountains : ''} (${closestTKV ? closestTKV.palace : ''}, ${closestTKV ? closestTKV.degree : ''}°). Sai lệch chỉ ${minDiffTKV.toFixed(1)}°.`
    };
  }
}

/**
 * Phân tích Phản Ngâm & Phục Ngâm theo toàn bộ 8 cung và Toàn Bàn
 */
function analyzePhanPhucNgam(palaces, van) {
  if (!palaces) return null;

  const result = {
    hasPhucNgam: false,
    hasPhanNgam: false,
    isToanBanPhucNgam: false,
    isToanBanPhanNgam: false,
    sonPhucNgam: [],
    huongPhucNgam: [],
    sonPhanNgam: [],
    huongPhanNgam: [],
    items: []
  };

  let countSonPhuc = 0;
  let countHuongPhuc = 0;
  let countSonPhan = 0;
  let countHuongPhan = 0;

  for (let p = 1; p <= 9; p++) {
    if (p === 5) continue; // 8 outer palaces
    const pal = palaces[p];
    if (!pal) continue;

    const son = pal.son;
    const huong = pal.huong;
    const pName = pal.palaceName;
    const pDir = pal.palaceDirection;

    // 1. Phục ngâm: Star == Palace
    const isSonPhuc = (son === p);
    const isHuongPhuc = (huong === p);

    if (isSonPhuc) {
      countSonPhuc++;
      const isVuong = (son === van);
      result.sonPhucNgam.push({ palace: p, name: pName, dir: pDir, star: son, isVuong });
      result.hasPhucNgam = true;
      result.items.push({
        palace: p, name: pName, dir: pDir, starType: 'Sơn Tinh', star: son,
        type: 'PHUC_NGAM', typeLabel: 'Phục Ngâm', isVuong,
        scope: 'Gia đạo / Sức khỏe / Nhân đinh'
      });
    }

    if (isHuongPhuc) {
      countHuongPhuc++;
      const isVuong = (huong === van);
      result.huongPhucNgam.push({ palace: p, name: pName, dir: pDir, star: huong, isVuong });
      result.hasPhucNgam = true;
      result.items.push({
        palace: p, name: pName, dir: pDir, starType: 'Hướng Tinh', star: huong,
        type: 'PHUC_NGAM', typeLabel: 'Phục Ngâm', isVuong,
        scope: 'Tài lộc / Kinh doanh / Tiền của'
      });
    }

    // 2. Phản ngâm: Star + Palace == 10
    const isSonPhan = (son + p === 10);
    const isHuongPhan = (huong + p === 10);

    if (isSonPhan) {
      countSonPhan++;
      const isVuong = (son === van);
      result.sonPhanNgam.push({ palace: p, name: pName, dir: pDir, star: son, isVuong });
      result.hasPhanNgam = true;
      result.items.push({
        palace: p, name: pName, dir: pDir, starType: 'Sơn Tinh', star: son,
        type: 'PHAN_NGAM', typeLabel: 'Phản Ngâm', isVuong,
        scope: 'Gia đạo / Sức khỏe / Nhân đinh'
      });
    }

    if (isHuongPhan) {
      countHuongPhan++;
      const isVuong = (huong === van);
      result.huongPhanNgam.push({ palace: p, name: pName, dir: pDir, star: huong, isVuong });
      result.hasPhanNgam = true;
      result.items.push({
        palace: p, name: pName, dir: pDir, starType: 'Hướng Tinh', star: huong,
        type: 'PHAN_NGAM', typeLabel: 'Phản Ngâm', isVuong,
        scope: 'Tài lộc / Kinh doanh / Tiền của'
      });
    }
  }

  if (countSonPhuc === 8 || countHuongPhuc === 8) result.isToanBanPhucNgam = true;
  if (countSonPhan === 8 || countHuongPhan === 8) result.isToanBanPhanNgam = true;

  return result;
}

/**
 * Phân tích Lệnh Tinh Nhập Tù (Vận hiện tại & Bảng dự báo 9 Vận)
 */
function analyzeNhapTu(palaces, currentVan) {
  if (!palaces || !palaces[5]) return null;

  const centerPal = palaces[5];
  const sonCenter = centerPal.son;
  const huongCenter = centerPal.huong;
  const vanTrach = currentVan || 9;

  // Trạng thái ở Vận hiện tại
  const isHuongNhapTuCurrent = (huongCenter === vanTrach); // Tài Tù
  const isSonNhapTuCurrent = (sonCenter === vanTrach);     // Đinh Tù

  // Bảng dự báo cho 9 vận
  const forecast = [];
  for (let v = 1; v <= 9; v++) {
    const range = PERIOD_RANGES.find(r => r.van === v) || { start: (v - 1) * 20 + 1864, end: v * 20 + 1843 };
    const isTaiTu = (huongCenter === v);
    const isDinhTu = (sonCenter === v);
    let statusText = 'Cát Lành (Khí thông suốt)';
    let statusType = 'good';

    if (isTaiTu && isDinhTu) {
      statusText = 'Song Tinh Nhập Tù (Đại Hung Bế Khí)';
      statusType = 'danger';
    } else if (isTaiTu) {
      statusText = 'Tài Tù (Hướng Tinh Bị Giam)';
      statusType = 'danger';
    } else if (isDinhTu) {
      statusText = 'Đinh Tù (Sơn Tinh Bị Giam)';
      statusType = 'danger';
    }

    forecast.push({
      van: v,
      years: `${range.start} - ${range.end}`,
      isCurrent: (v === vanTrach),
      isTaiTu,
      isDinhTu,
      status: statusText,
      statusType
    });
  }

  let currentTitle = 'Không Bị Nhập Tù';
  let currentSeverity = 'good';
  if (isHuongNhapTuCurrent && isSonNhapTuCurrent) {
    currentTitle = 'Song Tinh Nhập Tù (Đại Kỵ Toàn Diện)';
    currentSeverity = 'danger';
  } else if (isHuongNhapTuCurrent) {
    currentTitle = 'Tài Tù (Tài Lộc Nhập Tù - Tiền Bạc Bế Tắc)';
    currentSeverity = 'danger';
  } else if (isSonNhapTuCurrent) {
    currentTitle = 'Đinh Tù (Nhân Đinh Nhập Tù - Sức Khỏe Gia Đạo Bế Tắc)';
    currentSeverity = 'danger';
  }

  return {
    sonCenter,
    huongCenter,
    vanTrach,
    isHuongNhapTuCurrent,
    isSonNhapTuCurrent,
    isNhapTuCurrent: isHuongNhapTuCurrent || isSonNhapTuCurrent,
    currentTitle,
    currentSeverity,
    forecast
  };
}

/**
 * 1. Phép Hợp Thập (Thiên Tâm Thập Đạo)
 */
function analyzeHopThap(palaces) {
  if (!palaces) return null;

  let isSonVan = true;
  let isHuongVan = true;
  let isSonHuong = true;

  for (let p = 1; p <= 9; p++) {
    const pal = palaces[p];
    if (!pal) continue;

    // Loại 1: Sơn Tinh + Vận Tinh = 10 (8 cung xung quanh trung cung p != 5)
    if (p !== 5) {
      if (pal.son + pal.van !== 10) {
        isSonVan = false;
      }
    }

    // Loại 2: Hướng Tinh + Vận Tinh = 10 (8 cung xung quanh trung cung p != 5)
    if (p !== 5) {
      if (pal.huong + pal.van !== 10) {
        isHuongVan = false;
      }
    }

    // Loại 3: Sơn Tinh + Hướng Tinh = 10 (tính cả 9 cung kể cả trung cung)
    if (pal.son + pal.huong !== 10) {
      isSonHuong = false;
    }
  }

  const result = {
    hasHopThap: (isSonHuong || isSonVan || isHuongVan),
    isSonHuongHopThap: isSonHuong,
    isSonVanHopThap: isSonVan,
    isHuongVanHopThap: isHuongVan,
    type: null,
    label: null,
    scope: null,
    desc: null
  };

  if (isSonHuong) {
    result.type = 'SON_HUONG_HOP_THAP';
    result.label = 'Toàn Bàn Sơn Hướng Hợp Thập';
    result.scope = 'Cực Cát Toàn Diện (Vượng Cả Đinh Lẫn Tài)';
    result.desc = 'Thế trận Thiên Địa Thông Khí tối cao. Tại cả 9 cung (bao gồm Trung Cung), tổng số sao Sơn tinh và Hướng tinh đều hợp thành 10 (Mẫu số Lạc Thư). Chuyển bại thành thắng, vượng phát phúc trạch bền vững.';
  } else if (isSonVan) {
    result.type = 'SON_VAN_HOP_THAP';
    result.label = 'Toàn Bàn Sơn Vận Hợp Thập';
    result.scope = 'Đại Cát Về Sức Khỏe, Nhân Đinh, Gia Đạo';
    result.desc = 'Tại 8 cung bát quái xung quanh, tổng số sao Sơn tinh và Vận tinh đều hợp thành 10. Giúp gia đạo êm ấm, sức khỏe dồi dào, nhân đinh hưng vượng, hóa giải mọi hung sát bế khí.';
  } else if (isHuongVan) {
    result.type = 'HUONG_VAN_HOP_THAP';
    result.label = 'Toàn Bàn Hướng Vận Hợp Thập';
    result.scope = 'Đại Cát Về Tài Lộc, Kinh Doanh, Công Danh';
    result.desc = 'Tại 8 cung bát quái xung quanh, tổng số sao Hướng tinh và Vận tinh đều hợp thành 10. Kích hoạt dòng chảy tài lộc cực mạnh, buôn bán thuận buồm xuôi gió, công danh thăng tiến nhanh chóng.';
  }

  return result;
}

/**
 * 2. Tam Ban Quái (Liên Châu & Xảo Quái)
 */
function analyzeTamBanQuai(palaces) {
  if (!palaces) return null;

  // Helper so sánh 2 tập hợp 3 số
  function matchTriad(a, b, c, targetSets) {
    const sorted = [a, b, c].sort((x, y) => x - y);
    return targetSets.some(set => {
      const targetSorted = [...set].sort((x, y) => x - y);
      return sorted[0] === targetSorted[0] && sorted[1] === targetSorted[1] && sorted[2] === targetSorted[2];
    });
  }

  // 9 bộ số Liên Châu (3 số tự nhiên liên tiếp xoay vòng)
  const LIEN_CHAU_SETS = [
    [1, 2, 3], [2, 3, 4], [3, 4, 5], [4, 5, 6], [5, 6, 7],
    [6, 7, 8], [7, 8, 9], [1, 8, 9], [1, 2, 9]
  ];

  // 3 bộ số Tam Hợp Xảo Quái
  const XAO_QUAI_SETS = [
    [1, 4, 7], [2, 5, 8], [3, 6, 9]
  ];

  let isLienChau = true;
  let isXaoQuai = true;

  for (let p = 1; p <= 9; p++) {
    const pal = palaces[p];
    if (!pal) continue;

    const s = pal.son;
    const h = pal.huong;
    const v = pal.van;

    if (!matchTriad(s, h, v, LIEN_CHAU_SETS)) {
      isLienChau = false;
    }

    if (!matchTriad(s, h, v, XAO_QUAI_SETS)) {
      isXaoQuai = false;
    }
  }

  const result = {
    hasTamBanQuai: (isLienChau || isXaoQuai),
    isLienChau,
    isXaoQuai,
    type: null,
    label: null,
    desc: null
  };

  if (isLienChau) {
    result.type = 'LIEN_CHAU_TAM_BAN_QUAI';
    result.label = 'Liên Châu Tam Ban Quái';
    result.desc = 'Đắc cách Liên Châu Tam Ban Quái vô cùng quý hiếm! Tại toàn bộ 9 cung, tổ hợp 3 sao Sơn - Hướng - Vận đều là 3 số tự nhiên liên tiếp. Khí mạch 9 cung thông suốt liên hoàn, gia đình đời đời hưng vượng.';
  } else if (isXaoQuai) {
    result.type = 'TAM_BAN_XAO_QUAI';
    result.label = 'Tam Ban Xảo Quái (Tam Hợp Quái)';
    result.desc = 'Đắc cách Tam Ban Xảo Quái (1-4-7, 2-5-8, 3-6-9)! Tạo thành hệ thống ống dẫn khí linh thiêng kết nối toàn bộ ngôi nhà. Dù có phạm cách xấu Thượng Sơn Hạ Thủy thì toàn bàn vẫn thông khí và hóa vượng cực nhanh.';
  }

  return result;
}

/**
 * 3. Thất Tinh Đả Kiếp (Mượn khí thiên cơ tương lai)
 */
function analyzeThatTinhDaKiep(palaces, facingPalace, vanTrach) {
  if (!palaces || !facingPalace || !vanTrach) return null;

  const facingPal = palaces[facingPalace];
  if (!facingPal) return null;

  // Bước 1: Điều kiện tiên quyết - Song Tinh Đáo Hướng
  const isSongTinhDaoHuong = (facingPal.son === vanTrach && facingPal.huong === vanTrach);

  const TRIAD_SETS = [
    [1, 4, 7], [2, 5, 8], [3, 6, 9]
  ];

  function matchTriad(a, b, c) {
    const sorted = [a, b, c].sort((x, y) => x - y);
    return TRIAD_SETS.some(set => {
      const target = [...set].sort((x, y) => x - y);
      return sorted[0] === target[0] && sorted[1] === target[1] && sorted[2] === target[2];
    });
  }

  let isLyCung = false;
  let isKhamCung = false;
  let linkedPalaces = [];
  let linkedStars = [];

  if (isSongTinhDaoHuong) {
    // Nhóm A: Ly Cung Đả Kiếp (Ly: 9 - Chấn: 3 - Càn: 6)
    if ([9, 3, 6].includes(facingPalace)) {
      if (palaces[9] && palaces[3] && palaces[6]) {
        const h9 = palaces[9].huong;
        const h3 = palaces[3].huong;
        const h6 = palaces[6].huong;
        if (matchTriad(h9, h3, h6)) {
          isLyCung = true;
          linkedPalaces = [
            { palace: 9, name: 'Ly', dir: 'Nam', huongStar: h9 },
            { palace: 3, name: 'Chấn', dir: 'Đông', huongStar: h3 },
            { palace: 6, name: 'Càn', dir: 'Tây Bắc', huongStar: h6 }
          ];
          linkedStars = [h9, h3, h6];
        }
      }
    }

    // Nhóm B: Khảm Cung Giả Kiếp (Khảm: 1 - Đoài: 7 - Tốn: 4)
    if (!isLyCung && [1, 7, 4].includes(facingPalace)) {
      if (palaces[1] && palaces[7] && palaces[4]) {
        const h1 = palaces[1].huong;
        const h7 = palaces[7].huong;
        const h4 = palaces[4].huong;
        if (matchTriad(h1, h7, h4)) {
          isKhamCung = true;
          linkedPalaces = [
            { palace: 1, name: 'Khảm', dir: 'Bắc', huongStar: h1 },
            { palace: 7, name: 'Đoài', dir: 'Tây', huongStar: h7 },
            { palace: 4, name: 'Tốn', dir: 'Đông Nam', huongStar: h4 }
          ];
          linkedStars = [h1, h7, h4];
        }
      }
    }
  }

  const result = {
    isSongTinhDaoHuong,
    hasThatTinhDaKiep: (isLyCung || isKhamCung),
    isLyCungDaKiep: isLyCung,
    isKhamCungGiaKiep: isKhamCung,
    type: null,
    label: null,
    linkedPalaces,
    linkedStars,
    desc: null,
    loanDauAdvice: null
  };

  if (isLyCung) {
    result.type = 'LY_CUNG_DA_KIEP';
    result.label = 'Ly Cung Đả Kiếp (Đả Kiếp Thật - Cực Cát)';
    result.desc = 'Đắc thế trận Ly Cung Đả Kiếp (Tam giác khí Ly 9 - Chấn 3 - Càn 6)! Đây là bí pháp tối thượng mượn khí của tương lai, tài lộc phát triển vượt bậc qua 3 nguyên liên hoàn.';
    result.loanDauAdvice = 'KÍCH HOẠT LOAN ĐẦU: Ba cung Ly (Nam), Chấn (Đông) và Càn (Tây Bắc) bắt buộc phải mở cửa sổ lớn, cửa đi hoặc giếng trời thông thoáng để tạo luồng khí lưu chuyển liền mạch. Tuyệt đối không để 1 trong 3 cung bị bít kín hoặc đặt nhà vệ sinh/kho rác.';
  } else if (isKhamCung) {
    result.type = 'KHAM_CUNG_GIA_KIEP';
    result.label = 'Khảm Cung Giả Kiếp (Đả Kiếp Giả - Hỗ Trợ Cát)';
    result.desc = 'Đắc thế trận Khảm Cung Giả Kiếp (Tam giác khí Khảm 1 - Đoài 7 - Tốn 4)! Hỗ trợ nạp thông khí vận tốt, tài lộc ổn định vững vàng.';
    result.loanDauAdvice = 'KÍCH HOẠT LOAN ĐẦU: Ba cung Khảm (Bắc), Đoài (Tây) và Tốn (Đông Nam) cần thiết kế thoáng đãng, kết nối khí trường thông suốt để kích hoạt công năng mượn khí.';
  }

  return result;
}

/**
 * Build Vận Bàn (Period Chart) - always flies FORWARD
 */
function buildVanBan(vanNumber) {
  const chart = {};
  for (let i = 0; i < 9; i++) {
    const palace = FORWARD_PATH[i];
    chart[palace] = wrapStar(vanNumber + i);
  }
  return chart;
}

/**
 * Build a star chart (Sơn Bàn or Hướng Bàn)
 * @param {number} startStar - The star number entering center
 * @param {boolean} isForward - true = forward (thuận), false = reverse (nghịch)
 */
function buildStarBan(startStar, isForward) {
  const path = isForward ? FORWARD_PATH : REVERSE_PATH;
  const chart = {};
  for (let i = 0; i < 9; i++) {
    const palace = path[i];
    chart[palace] = wrapStar(startStar + i);
  }
  return chart;
}

/**
 * Find the mountain in a given palace that matches a specific San Yuan Long
 */
function findMountainInPalace(palace, sanYuan) {
  return MOUNTAINS.find(m => m.palace === palace && m.sanYuan === sanYuan);
}

/**
 * Determine flying direction for a star
 * Returns true for forward (thuận), false for reverse (nghịch)
 * 
 * @param {number} star - The star number (Sao Sơn or Sao Hướng)
 * @param {string} sanYuan - The San Yuan Long of the house
 * @param {object} originalMountain - The original Tọa/Hướng mountain (used when star=5)
 */
function getDirection(star, sanYuan, originalMountain) {
  if (star === 5) {
    // Special case: star 5 has no palace, use the yin/yang of the original mountain
    return originalMountain.yinYang === 1; // Yang = forward
  }
  // Find the palace that corresponds to this star in the Lo Shu
  const targetPalace = star; // In Lo Shu, palace number = star number
  const refMountain = findMountainInPalace(targetPalace, sanYuan);
  if (!refMountain) return true; // fallback
  return refMountain.yinYang === 1; // Yang = forward
}

/**
 * Get replacement star for Thế Quái
 * @param {number} star - Original star (Sao Sơn or Sao Hướng)
 * @param {string} sanYuan - San Yuan Long of the house
 * @returns {{ replacementStar: number, refMountain: object, isForward: boolean }}
 */
function getReplacementStar(star, sanYuan) {
  const targetPalace = star === 5 ? 5 : star;
  if (star === 5) {
    // Star 5: no palace, need special handling
    // For Thế Quái with star 5, this shouldn't normally occur
    // but handle gracefully
    return { replacementStar: 5, refMountain: null, isForward: true };
  }
  const refMountain = findMountainInPalace(targetPalace, sanYuan);
  if (!refMountain) return { replacementStar: star, refMountain: null, isForward: true };
  
  const replacementStar = REPLACEMENT_STAR[refMountain.name] || star;
  const isForward = refMountain.yinYang === 1;
  
  return { replacementStar, refMountain, isForward };
}

/**
 * Determine which mountain the facing degree is leaning towards (for Kiêm display)
 */
function getKiemInfo(facingDegree, facingMountain) {
  // Find which adjacent mountain the degree leans towards
  const idx = MOUNTAINS.findIndex(m => m.name === facingMountain.name);
  const prevIdx = (idx - 1 + 24) % 24;
  const nextIdx = (idx + 1) % 24;
  
  const prevDiff = degreeDiff(facingDegree, MOUNTAINS[prevIdx].center);
  const nextDiff = degreeDiff(facingDegree, MOUNTAINS[nextIdx].center);
  
  let kiemMountain;
  if (prevDiff < nextDiff) {
    kiemMountain = MOUNTAINS[prevIdx];
  } else {
    kiemMountain = MOUNTAINS[nextIdx];
  }
  
  // Find the opposite of the kiêm mountain for Tọa side
  const kiemOpp = getOpposite(kiemMountain.center);
  
  return {
    kiemHuong: kiemMountain,
    kiemToa: kiemOpp.mountain,
    label: `Kiêm ${kiemOpp.mountain.name} ${kiemMountain.name}`
  };
}

/**
 * Resolve hour parameter into { hourIndex (1..12 Canh Gio), solarHour (0..23), solarMinute (0..59) }
 */
function resolveHourAndSolarTime(hourParam, minuteParam, canhParam) {
  let solarHour = 12;
  let solarMinute = (typeof minuteParam === 'number' && !isNaN(minuteParam)) ? minuteParam : 0;
  let hourIndex = 1;

  if (typeof canhParam === 'number' && canhParam >= 1 && canhParam <= 12) {
    hourIndex = canhParam;
  }

  if (typeof hourParam === 'number' && !isNaN(hourParam)) {
    solarHour = hourParam;
    if (typeof canhParam !== 'number' || isNaN(canhParam)) {
      if (solarHour >= 23 || solarHour < 1) hourIndex = 1;
      else hourIndex = Math.floor((solarHour + 1) / 2) + 1;
    }
  }

  return { hourIndex, solarHour, solarMinute };
}

// Backward-compatibility alias
const resolveHourInfo = resolveHourAndSolarTime;

const SOLAR_TERM_NAMES_VI = {
  '冬至': 'Đông Chí', '小寒': 'Tiểu Hàn', '大寒': 'Đại Hàn', '立春': 'Lập Xuân',
  '雨水': 'Vũ Thủy', '惊蛰': 'Kinh Trập', '春分': 'Xuân Phân', '清明': 'Thanh Minh',
  '谷雨': 'Cốc Vũ', '立夏': 'Lập Hạ', '小满': 'Tiểu Mãn', '芒种': 'Mang Chủng',
  '夏至': 'Hạ Chí', '小暑': 'Tiểu Thử', '大暑': 'Đại Thử', '立秋': 'Lập Thu',
  '处暑': 'Xử Thử', '白露': 'Bạch Lộ', '秋分': 'Thu Phân', '寒露': 'Hàn Lộ',
  '霜降': 'Sương Giáng', '立冬': 'Lập Đông', '小雪': 'Tiểu Tuyết', '大雪': 'Đại Tuyết'
};

const CANH_GIO_NAMES_VI = [
  '',
  'Tý (23:00 - 00:59)',
  'Sửu (01:00 - 02:59)',
  'Dần (03:00 - 04:59)',
  'Mão (05:00 - 06:59)',
  'Thìn (07:00 - 08:59)',
  'Tỵ (09:00 - 10:59)',
  'Ngọ (11:00 - 12:59)',
  'Mùi (13:00 - 14:59)',
  'Thân (15:00 - 16:59)',
  'Dậu (17:00 - 18:59)',
  'Tuất (19:00 - 20:59)',
  'Hợi (21:00 - 22:59)'
];

/**
 * Create a Lunar instance adjusted for the local timezone relative to Beijing Civil Time (CST, UTC+8).
 * By default, if tzOffsetHours is not passed, it uses Vietnam Standard Time (ICT, UTC+7 -> diff = +1h).
 * If the user's browser is in another timezone or a tzOffsetHours is given, it computes (8 - tzOffsetHours).
 * Using second = 59 ensures any astronomical transition occurring within the minute is recognized.
 */
function getLunarForVnTime(year, month, day, solarHour = 12, solarMinute = 0, second = 59, tzOffsetHours = null) {
  let hourShift = 1; // Mặc định giờ Việt Nam (UTC+7 -> Bắc Kinh UTC+8 bù +1h)
  if (tzOffsetHours !== null && !isNaN(tzOffsetHours)) {
    hourShift = 8 - tzOffsetHours;
  } else if (typeof window !== 'undefined' && window.currentTzOffsetHours !== undefined) {
    hourShift = 8 - window.currentTzOffsetHours;
  }
  const d = new Date(year, month - 1, day, solarHour + hourShift, solarMinute, second);
  return Lunar.fromDate(d);
}
const getLunarForTime = getLunarForVnTime;

/**
 * Get full solar term details and Vietnamese naming
 */
function getSolarTermDetails(year, month, day, solarHour = 12, solarMinute = 0) {
  const info = getSolarTermInfoExact(year, month, day, solarHour, solarMinute);
  let termNameVi = '';
  let rawName = '';
  let monthNum = 1;
  let monthChi = 'Dần';
  if (typeof Lunar !== 'undefined') {
    const lunar = getLunarForVnTime(year, month, day, solarHour, solarMinute);
    const prevJq = lunar.getPrevJieQi(false);
    if (prevJq) {
      rawName = prevJq.getName();
      termNameVi = SOLAR_TERM_NAMES_VI[rawName] || rawName;
    }
    const bazi = lunar.getEightChar();
    const zhi = bazi.getMonthZhi();
    const zhiMap = {
      '寅': { num: 1, chi: 'Dần' },
      '卯': { num: 2, chi: 'Mão' },
      '辰': { num: 3, chi: 'Thìn' },
      '巳': { num: 4, chi: 'Tỵ' },
      '午': { num: 5, chi: 'Ngọ' },
      '未': { num: 6, chi: 'Mùi' },
      '申': { num: 7, chi: 'Thân' },
      '酉': { num: 8, chi: 'Dậu' },
      '戌': { num: 9, chi: 'Tuất' },
      '亥': { num: 10, chi: 'Hợi' },
      '子': { num: 11, chi: 'Tý' },
      '丑': { num: 12, chi: 'Sửu' }
    };
    if (zhiMap[zhi]) {
      monthNum = zhiMap[zhi].num;
      monthChi = zhiMap[zhi].chi;
    }
  } else {
    const termToMonth = {
      'Lập Xuân': { num: 1, chi: 'Dần' }, 'Vũ Thủy': { num: 1, chi: 'Dần' },
      'Kinh Trập': { num: 2, chi: 'Mão' }, 'Xuân Phân': { num: 2, chi: 'Mão' },
      'Thanh Minh': { num: 3, chi: 'Thìn' }, 'Cốc Vũ': { num: 3, chi: 'Thìn' },
      'Lập Hạ': { num: 4, chi: 'Tỵ' }, 'Tiểu Mãn': { num: 4, chi: 'Tỵ' },
      'Mang Chủng': { num: 5, chi: 'Ngọ' }, 'Hạ Chí': { num: 5, chi: 'Ngọ' },
      'Tiểu Thử': { num: 6, chi: 'Mùi' }, 'Đại Thử': { num: 6, chi: 'Mùi' },
      'Lập Thu': { num: 7, chi: 'Thân' }, 'Xử Thử': { num: 7, chi: 'Thân' },
      'Bạch Lộ': { num: 8, chi: 'Dậu' }, 'Thu Phân': { num: 8, chi: 'Dậu' },
      'Hàn Lộ': { num: 9, chi: 'Tuất' }, 'Sương Giáng': { num: 9, chi: 'Tuất' },
      'Lập Đông': { num: 10, chi: 'Hợi' }, 'Tiểu Tuyết': { num: 10, chi: 'Hợi' },
      'Đại Tuyết': { num: 11, chi: 'Tý' }, 'Đông Chí': { num: 11, chi: 'Tý' },
      'Tiểu Hàn': { num: 12, chi: 'Sửu' }, 'Đại Hàn': { num: 12, chi: 'Sửu' }
    };
    if (termToMonth[termNameVi]) {
      monthNum = termToMonth[termNameVi].num;
      monthChi = termToMonth[termNameVi].chi;
    }
  }
  const monthLabel = `Tháng ${monthNum} (${monthChi})`;
  return {
    period: info.period,
    isYang: info.isYang,
    termName: termNameVi,
    rawName: rawName,
    donType: info.isYang ? 'Dương Độn' : 'Âm Độn',
    monthNum,
    monthChi,
    monthLabel
  };
}

/**
 * Calculate Solar Term Info exact to the hour/minute
 */
function getSolarTermInfoExact(year, month, day, solarHour = 12, solarMinute = 0) {
  let isYang = true;
  let period = 1;

  if (typeof Lunar !== 'undefined') {
    const lunar = getLunarForVnTime(year, month, day, solarHour, solarMinute);
    // getPrevJieQi(false) returns the exact solar term currently in effect at this exact minute
    const prevJq = lunar.getPrevJieQi(false);
    const name = prevJq ? prevJq.getName() : '';
    if (['冬至', '小寒', '大寒', '立春'].includes(name)) period = 1;
    else if (['雨水', '惊蛰', '春分', '清明'].includes(name)) period = 2;
    else if (['谷雨', '立夏', '小满', '芒种'].includes(name)) period = 3;
    else if (['夏至', '小暑', '大暑', '立秋'].includes(name)) { period = 4; isYang = false; }
    else if (['处暑', '白露', '秋分', '寒露'].includes(name)) { period = 5; isYang = false; }
    else if (['霜降', '立冬', '小雪', '大雪'].includes(name)) { period = 6; isYang = false; }
  } else {
    const dd = month * 100 + day;
    if (dd >= 1222 || dd < 219) { period = 1; isYang = true; }
    else if (dd >= 219 && dd < 420) { period = 2; isYang = true; }
    else if (dd >= 420 && dd < 621) { period = 3; isYang = true; }
    else if (dd >= 621 && dd < 823) { period = 4; isYang = false; }
    else if (dd >= 823 && dd < 1023) { period = 5; isYang = false; }
    else if (dd >= 1023 && dd < 1222) { period = 6; isYang = false; }
  }
  return { period, isYang };
}

function getDailyStar(year, month, day, solarHour = 12, solarMinute = 0) {
  const info = getSolarTermInfoExact(year, month, day, solarHour, solarMinute);
  
  let baseStar = 1;
  const periodMap = {1:1, 2:7, 3:4, 4:9, 5:3, 6:6};
  baseStar = periodMap[info.period] || 1;
  
  const giapTy = new Date(2024, 2, 1);
  const d = new Date(year, month - 1, day);
  let dayOffset = Math.floor((d.getTime() - giapTy.getTime()) / (1000 * 60 * 60 * 24)) % 60;
  if (dayOffset < 0) dayOffset += 60;
  
  let nhatTinh = 0;
  if (info.isYang) {
    nhatTinh = baseStar + (dayOffset % 9);
    nhatTinh = ((nhatTinh - 1) % 9) + 1;
  } else {
    nhatTinh = baseStar - (dayOffset % 9);
    nhatTinh = ((nhatTinh - 1) % 9 + 9) % 9 + 1;
  }
  return { centerStar: nhatTinh, isForward: info.isYang };
}

function getHourlyStar(year, month, day, hourParam, minuteParam = 0, canhParam) {
  const { hourIndex, solarHour, solarMinute } = resolveHourAndSolarTime(hourParam, minuteParam, canhParam);
  const info = getSolarTermInfoExact(year, month, day, solarHour, solarMinute);
  
  const giapTy = new Date(2024, 2, 1);
  const d = new Date(year, month - 1, day);
  let dayOffset = Math.floor((d.getTime() - giapTy.getTime()) / (1000 * 60 * 60 * 24)) % 60;
  if (dayOffset < 0) dayOffset += 60;
  
  const dayBranch = dayOffset % 12; 
  let baseStar = 1;
  if ([0, 3, 6, 9].includes(dayBranch)) baseStar = info.isYang ? 1 : 9;
  else if ([2, 5, 8, 11].includes(dayBranch)) baseStar = info.isYang ? 7 : 3;
  else baseStar = info.isYang ? 4 : 6;
  
  let thoiTinh = 0;
  if (info.isYang) {
    thoiTinh = baseStar + (hourIndex - 1);
    thoiTinh = ((thoiTinh - 1) % 9) + 1;
  } else {
    thoiTinh = baseStar - (hourIndex - 1);
    thoiTinh = ((thoiTinh - 1) % 9 + 9) % 9 + 1;
  }
  return { centerStar: thoiTinh, isForward: info.isYang, hourIndex };
}

function getMenhQuai(year, gender) {
  // 1: Nam, 0: Nữ
  let sum = 0;
  let temp = year;
  while (temp > 0) {
    sum += temp % 10;
    temp = Math.floor(temp / 10);
  }
  
  let remainder = sum % 9;
  if (remainder === 0) remainder = 9;
  
  let base = remainder + 4;
  if (base > 9) base -= 9;
  
  let resultNum = 0;
  let quai = '';
  let element = '';
  
  if (base === 1) {
    resultNum = gender === 1 ? 8 : 1;
    quai = gender === 1 ? 'Cấn' : 'Khảm';
    element = gender === 1 ? 'Thổ' : 'Thủy';
  } else if (base === 2) {
    resultNum = gender === 1 ? 4 : 2;
    quai = gender === 1 ? 'Tốn' : 'Khôn';
    element = gender === 1 ? 'Mộc' : 'Thổ';
  } else if (base === 3) {
    resultNum = 3;
    quai = 'Chấn';
    element = 'Mộc';
  } else if (base === 4) {
    resultNum = gender === 1 ? 2 : 4;
    quai = gender === 1 ? 'Khôn' : 'Tốn';
    element = gender === 1 ? 'Thổ' : 'Mộc';
  } else if (base === 5) {
    resultNum = gender === 1 ? 8 : 2;
    quai = gender === 1 ? 'Cấn' : 'Khôn';
    element = 'Thổ';
  } else if (base === 6) {
    resultNum = gender === 1 ? 9 : 6;
    quai = gender === 1 ? 'Ly' : 'Càn';
    element = gender === 1 ? 'Hỏa' : 'Kim';
  } else if (base === 7) {
    resultNum = gender === 1 ? 8 : 7;
    quai = gender === 1 ? 'Cấn' : 'Đoài';
    element = gender === 1 ? 'Thổ' : 'Kim';
  } else if (base === 8) {
    resultNum = gender === 1 ? 7 : 8;
    quai = gender === 1 ? 'Đoài' : 'Cấn';
    element = gender === 1 ? 'Kim' : 'Thổ';
  } else if (base === 9) {
    resultNum = gender === 1 ? 6 : 9;
    quai = gender === 1 ? 'Càn' : 'Ly';
    element = gender === 1 ? 'Kim' : 'Hỏa';
  }
  
  return { number: resultNum, quai: quai, element: element };
}

/**
 * Calculate effective solar year based on LiChun transition down to exact hour/minute
 */
function getEffectiveYear(year, month, day, solarHour = 12, solarMinute = 0) {
  if (typeof Lunar !== 'undefined') {
    const bazi = getLunarForVnTime(year, month, day, solarHour, solarMinute).getEightChar();
    const baziYearZhi = bazi.getYearZhi();
    const ZHI_ORDER = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];
    const currentYearZhiIndex = ((year - 4) % 12 + 12) % 12;
    const baziZhiIndex = ZHI_ORDER.indexOf(baziYearZhi);
    
    // In Jan/Feb (months 1 and 2), if bazi year branch is previous year's branch, it's before LiChun
    if (month <= 2) {
      const prevYearZhiIndex = (currentYearZhiIndex - 1 + 12) % 12;
      if (baziZhiIndex === prevYearZhiIndex) return year - 1;
    }
    // In late December, if already after LiChun (rare leap edge)
    if (month === 12) {
      const nextYearZhiIndex = (currentYearZhiIndex + 1) % 12;
      if (baziZhiIndex === nextYearZhiIndex) return year + 1;
    }
    return year;
  }
  // Fallback
  if (month === 1 || (month === 2 && day < 4)) {
    return year - 1;
  }
  return year;
}

function getAnnualStar(year, month, day, solarHour = 12, solarMinute = 0) {
  const effectiveYear = getEffectiveYear(year, month, day, solarHour, solarMinute);
  
  let remainder = (effectiveYear - 1982) % 9;
  if (remainder < 0) remainder += 9;
  let star = 9 - remainder;
  if (star === 0) star = 9;
  
  return { star, effectiveYear };
}

function getMonthlyStar(effectiveYear, year, month, day, solarHour = 12, solarMinute = 0) {
  let chineseMonth = month === 1 ? 12 : month - 1;

  if (typeof Lunar !== 'undefined') {
    const bazi = getLunarForVnTime(year, month, day, solarHour, solarMinute).getEightChar();
    const zhi = bazi.getMonthZhi();
    const zhiToMonth = {'寅':1, '卯':2, '辰':3, '巳':4, '午':5, '未':6, '申':7, '酉':8, '戌':9, '亥':10, '子':11, '丑':12};
    if (zhiToMonth[zhi]) chineseMonth = zhiToMonth[zhi];
  }

  let chiIndex = (effectiveYear - 3) % 12;
  if (chiIndex <= 0) chiIndex += 12;

  let baseStar;
  if ([1, 4, 7, 10].includes(chiIndex)) {
    baseStar = 8;
  } else if ([2, 5, 8, 11].includes(chiIndex)) {
    baseStar = 5;
  } else {
    baseStar = 2;
  }

  let star = baseStar - (chineseMonth - 1);
  star = ((star - 1) % 9 + 9) % 9 + 1;
  return star;
}

function buildOverlayChart(centerStar) {
  return buildStarBan(centerStar, true);
}

function calculateChart(year, facingDegree, currentYear, currentMonth, currentDay, currentHour, currentMinute = 0, currentCanh) {
  // Parse degree
  facingDegree = ((facingDegree % 360) + 360) % 360;
  
  // Step 1: Get Period
  const van = getVan(year);
  
  // Step 2: Find Facing and Sitting mountains
  const facingResult = findMountain(facingDegree);
  const facingMountain = facingResult.mountain;
  const deviation = facingResult.deviation;
  
  const sittingDegree = (facingDegree + 180) % 360;
  const sittingResult = findMountain(sittingDegree);
  const sittingMountain = sittingResult.mountain;
  
  // Step 3: Classify chart type
  const chartClass = classifyChart(deviation, facingDegree);
  const chartType = chartClass.type;
  
  // Get San Yuan Long of the house (from the sitting mountain)
  // Tọa and Hướng mountains always share the same san yuan long (they are opposite)
  const sanYuan = sittingMountain.sanYuan;
  
  // Step 4: Build Vận Bàn
  const vanBan = buildVanBan(van);
  
  // Step 5: Get Mountain Star (Sao Sơn) and Facing Star (Sao Hướng)
  const saoSon = vanBan[sittingMountain.palace];
  const saoHuong = vanBan[facingMountain.palace];
  
  let sonBan, huongBan;
  let sonCenter, huongCenter;
  let kiemInfo = null;
  
  if (chartType === 'DAI_KHONG_VONG' || chartType === 'TIEU_KHONG_VONG' || chartType === 'KHONG_VONG') {
    // Không Vong - still build chart as Hạ Quái for display but attach full warning and advisory
    sonCenter = saoSon;
    const sonForward = getDirection(saoSon, sanYuan, sittingMountain);
    sonBan = buildStarBan(saoSon, sonForward);
    
    huongCenter = saoHuong;
    const huongForward = getDirection(saoHuong, sanYuan, facingMountain);
    huongBan = buildStarBan(saoHuong, huongForward);
  } else if (chartType === 'HA_QUAI') {
    // Hạ Quái (Chính Hướng)
    sonCenter = saoSon;
    const sonForward = getDirection(saoSon, sanYuan, sittingMountain);
    sonBan = buildStarBan(saoSon, sonForward);
    
    huongCenter = saoHuong;
    const huongForward = getDirection(saoHuong, sanYuan, facingMountain);
    huongBan = buildStarBan(saoHuong, huongForward);
  } else {
    // Thế Quái (Kiêm Hướng)
    kiemInfo = getKiemInfo(facingDegree, facingMountain);
    
    // Theo thuật toán đúng của Thế Quái:
    // - Sơn Bàn: dùng sanYuan của chính Tọa sơn (sittingMountain.sanYuan)
    //   để tìm Sơn Gốc trong cung gốc của saoSon, rồi tra Bảng Thế Tinh.
    // - Hướng Bàn: dùng sanYuan của chính Hướng sơn (facingMountain.sanYuan)
    //   để tìm Sơn Gốc trong cung gốc của saoHuong, rồi tra Bảng Thế Tinh.
    const toaSanYuan = sittingMountain.sanYuan;   // Nguyên Long của Tọa sơn
    const huongSanYuan = facingMountain.sanYuan;  // Nguyên Long của Hướng sơn
    
    // Mountain star replacement - dùng sanYuan của Tọa sơn
    const sonReplacement = getReplacementStar(saoSon, toaSanYuan);
    sonCenter = sonReplacement.replacementStar;
    sonBan = buildStarBan(sonCenter, sonReplacement.isForward);
    
    // Facing star replacement - dùng sanYuan của Hướng sơn
    const huongReplacement = getReplacementStar(saoHuong, huongSanYuan);
    huongCenter = huongReplacement.replacementStar;
    huongBan = buildStarBan(huongCenter, huongReplacement.isForward);
  }
  
  // Step 6: Build Annual and Monthly overlay charts
  let annualBan = null, monthlyBan = null;
  let nhatBan = null, thoiBan = null;
  let annualCenter = null, monthlyCenter = null;
  
  const { hourIndex, solarHour, solarMinute } = resolveHourAndSolarTime(currentHour, currentMinute, currentCanh);

  if (currentYear) {
    const annualResult = getAnnualStar(currentYear, currentMonth, currentDay || 15, solarHour, solarMinute);
    annualCenter = annualResult.star;
    annualBan = buildOverlayChart(annualCenter);
    
    if (currentMonth) {
      monthlyCenter = getMonthlyStar(annualResult.effectiveYear, currentYear, currentMonth, currentDay || 15, solarHour, solarMinute);
      monthlyBan = buildOverlayChart(monthlyCenter);
    }
  }

  if (currentYear && currentMonth && currentDay && (currentHour !== undefined && currentHour !== null && currentHour !== '')) {
    const dailyResult = getDailyStar(currentYear, currentMonth, currentDay, solarHour, solarMinute);
    nhatBan = buildStarBan(dailyResult.centerStar, dailyResult.isForward);
    
    const hourlyResult = getHourlyStar(currentYear, currentMonth, currentDay, solarHour, solarMinute, hourIndex);
    thoiBan = buildStarBan(hourlyResult.centerStar, hourlyResult.isForward);
  }
  
  // Step 7: Compose result - 9 palaces
  const palaces = {};
  for (let p = 1; p <= 9; p++) {
    palaces[p] = {
      son: sonBan[p],       // Mountain star
      huong: huongBan[p],   // Facing star
      van: vanBan[p],       // Period star
      nien: annualBan ? annualBan[p] : null,    
      nguyet: monthlyBan ? monthlyBan[p] : null,
      nhat: nhatBan ? nhatBan[p] : null,
      thoi: thoiBan ? thoiBan[p] : null,
      palaceName: PALACE_NAMES[p],
      palaceDirection: PALACE_DIRECTIONS[p],
    };
  }
  
  // Determine degree range for the facing mountain
  const halfMountain = 7.5;
  let degreeMin = facingMountain.center - halfMountain;
  let degreeMax = facingMountain.center + halfMountain;
  if (degreeMin < 0) degreeMin += 360;
  if (degreeMax >= 360) degreeMax -= 360;

  // Analysis extensions
  const phanPhucNgam = analyzePhanPhucNgam(palaces, van);
  const nhapTu = analyzeNhapTu(palaces, van);
  const hopThap = analyzeHopThap(palaces);
  const tamBanQuai = analyzeTamBanQuai(palaces);
  const thatTinhDaKiep = analyzeThatTinhDaKiep(palaces, facingMountain.palace, van);

  const specialFormations = {
    hopThap,
    tamBanQuai,
    thatTinhDaKiep,
    hasSpecial: (hopThap && hopThap.hasHopThap) || (tamBanQuai && tamBanQuai.hasTamBanQuai) || (thatTinhDaKiep && thatTinhDaKiep.hasThatTinhDaKiep)
  };
  
  return {
    van,
    facingMountain,
    sittingMountain,
    facingDegree,
    sittingDegree,
    deviation,
    chartType,
    chartLabel: chartClass.label || 'Chính Hướng (Hạ Quái)',
    isKhongVong: chartClass.isKhongVong || false,
    khongVongInfo: chartClass.isKhongVong ? chartClass : null,
    kiemInfo,
    sanYuan,
    palaces,
    sonCenter,
    huongCenter,
    annualCenter,
    monthlyCenter,
    phanPhucNgam,
    nhapTu,
    hopThap,
    tamBanQuai,
    thatTinhDaKiep,
    specialFormations,
    degreeRange: { min: degreeMin, max: degreeMax },
  };
}

// Export for use in main.js
window.FlyingStar = {
  calculateChart,
  getVan,
  findMountain,
  getMenhQuai,
  getAnnualStar,
  getMonthlyStar,
  getDailyStar,
  getHourlyStar,
  getSolarTermInfoExact,
  getSolarTermDetails,
  getLunarForVnTime,
  getLunarForTime,
  resolveHourAndSolarTime,
  resolveHourInfo,
  classifyChart,
  analyzePhanPhucNgam,
  analyzeNhapTu,
  analyzeHopThap,
  analyzeTamBanQuai,
  analyzeThatTinhDaKiep,
  DAI_KHONG_VONG_BOUNDARIES,
  TIEU_KHONG_VONG_BOUNDARIES,
  MOUNTAINS,
  PALACE_NAMES,
  PALACE_DIRECTIONS,
};
