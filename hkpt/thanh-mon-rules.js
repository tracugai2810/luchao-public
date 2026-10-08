/**
 * ============================================================
 * Thành Môn Quyết (Castle Gate Theory) - Huyền Không Phi Tinh
 * Thuật toán chuẩn hóa 4 bước theo Thẩm Thị Huyền Không Học
 * Tích hợp Hệ Thống Đánh Giá Cấp Độ Ứng Dụng (Cứu Giải vs Trợ Vượng)
 * ============================================================
 */

(function (window) {
  'use strict';

  // 24 Sơn dữ liệu
  const MOUNTAINS = [
    { name: 'Nhâm', center: 345, yinYang: 1,  sanYuan: 'Địa',   palace: 1 },
    { name: 'Tý',   center: 0,   yinYang: -1, sanYuan: 'Thiên', palace: 1 },
    { name: 'Quý',  center: 15,  yinYang: -1, sanYuan: 'Nhân',  palace: 1 },
    { name: 'Sửu',  center: 30,  yinYang: -1, sanYuan: 'Địa',   palace: 8 },
    { name: 'Cấn',  center: 45,  yinYang: 1,  sanYuan: 'Thiên', palace: 8 },
    { name: 'Dần',  center: 60,  yinYang: 1,  sanYuan: 'Nhân',  palace: 8 },
    { name: 'Giáp', center: 75,  yinYang: 1,  sanYuan: 'Địa',   palace: 3 },
    { name: 'Mão',  center: 90,  yinYang: -1, sanYuan: 'Thiên', palace: 3 },
    { name: 'Ất',   center: 105, yinYang: -1, sanYuan: 'Nhân',  palace: 3 },
    { name: 'Thìn', center: 120, yinYang: -1, sanYuan: 'Địa',   palace: 4 },
    { name: 'Tốn',  center: 135, yinYang: 1,  sanYuan: 'Thiên', palace: 4 },
    { name: 'Tỵ',   center: 150, yinYang: 1,  sanYuan: 'Nhân',  palace: 4 },
    { name: 'Bính', center: 165, yinYang: 1,  sanYuan: 'Địa',   palace: 9 },
    { name: 'Ngọ',  center: 180, yinYang: -1, sanYuan: 'Thiên', palace: 9 },
    { name: 'Đinh', center: 195, yinYang: -1, sanYuan: 'Nhân',  palace: 9 },
    { name: 'Mùi',  center: 210, yinYang: -1, sanYuan: 'Địa',   palace: 2 },
    { name: 'Khôn', center: 225, yinYang: 1,  sanYuan: 'Thiên', palace: 2 },
    { name: 'Thân', center: 240, yinYang: 1,  sanYuan: 'Nhân',  palace: 2 },
    { name: 'Canh', center: 255, yinYang: 1,  sanYuan: 'Địa',   palace: 7 },
    { name: 'Dậu',  center: 270, yinYang: -1, sanYuan: 'Thiên', palace: 7 },
    { name: 'Tân',  center: 285, yinYang: -1, sanYuan: 'Nhân',  palace: 7 },
    { name: 'Tuất', center: 300, yinYang: -1, sanYuan: 'Địa',   palace: 6 },
    { name: 'Càn',  center: 315, yinYang: 1,  sanYuan: 'Thiên', palace: 6 },
    { name: 'Hợi',  center: 330, yinYang: 1,  sanYuan: 'Nhân',  palace: 6 },
  ];

  const PALACE_NAMES = {
    1: 'Khảm', 2: 'Khôn', 3: 'Chấn', 4: 'Tốn',
    5: 'Trung', 6: 'Càn', 7: 'Đoài', 8: 'Cấn', 9: 'Ly'
  };

  const PALACE_DIRECTIONS = {
    1: 'Bắc', 2: 'Tây Nam', 3: 'Đông', 4: 'Đông Nam',
    5: 'Trung Cung', 6: 'Tây Bắc', 7: 'Tây', 8: 'Đông Bắc', 9: 'Nam'
  };

  // Vòng 8 cung theo chiều kim đồng hồ
  const RING_8 = [1, 8, 3, 4, 9, 2, 7, 6];

  // Các cặp số Tiên thiên Hà Đồ (Thành Môn Chính - Chính Mã)
  const HA_DO_PAIRS = [
    [1, 6], [6, 1],
    [2, 7], [7, 2],
    [3, 8], [8, 3],
    [4, 9], [9, 4]
  ];

  // Quỹ đạo bay Lạc Thư
  const FORWARD_PATH = [5, 6, 7, 8, 9, 1, 2, 3, 4];
  const REVERSE_PATH = [5, 4, 3, 2, 1, 9, 8, 7, 6];

  function wrapStar(n) {
    return ((n - 1) % 9 + 9) % 9 + 1;
  }

  function isHaDoPair(p1, p2) {
    return HA_DO_PAIRS.some(pair => pair[0] === p1 && pair[1] === p2);
  }

  /**
   * Tính toán Thành Môn cho một cung liền kề cụ thể
   */
  function evaluateSide(facingPalace, adjPalace, sanYuan, vanTrach, chartResult, sidePosition, isFacingMainVuong, facingHuongStar) {
    // 1. Phân loại Chính Mã vs Tá Mã
    const isChinhMa = isHaDoPair(facingPalace, adjPalace);
    const typeLabel = isChinhMa ? 'Thành Môn Chính (Chính Mã)' : 'Thành Môn Phụ (Tá Mã)';
    const typeShort = isChinhMa ? 'Chính Mã' : 'Tá Mã';

    // 2. Tìm Sơn đồng nguyên trong cung liền kề
    const candidateMountain = MOUNTAINS.find(m => m.palace === adjPalace && m.sanYuan === sanYuan);
    if (!candidateMountain) {
      return null;
    }

    // 3. Tra Vận tinh tại cung liền kề
    const saoVan = chartResult.palaces[adjPalace] ? chartResult.palaces[adjPalace].van : 5;

    // 4. Xác định chiều bay (Thuận / Nghịch)
    let direction = 1;
    let gocDetail = '';

    if (saoVan !== 5) {
      const gocPalace = saoVan;
      const sonGoc = MOUNTAINS.find(m => m.palace === gocPalace && m.sanYuan === sanYuan);
      if (sonGoc) {
        direction = sonGoc.yinYang === 1 ? 1 : -1;
        gocDetail = `Sao ${saoVan} gốc Cung ${PALACE_NAMES[gocPalace]} -> Sơn ${sonGoc.name} (${sonGoc.sanYuan} Nguyên, mang tính ${sonGoc.yinYang === 1 ? 'Dương +' : 'Âm -'}) -> Bay ${direction === 1 ? 'Thuận' : 'Nghịch'}`;
      }
    } else {
      // Sao 5 nhập trung: Lấy Sơn đối diện 180 độ
      const oppCenter = (candidateMountain.center + 180) % 360;
      const sonDoiDien = MOUNTAINS.find(m => Math.abs(m.center - oppCenter) < 1 || Math.abs(m.center - oppCenter) === 360);
      if (sonDoiDien) {
        direction = sonDoiDien.yinYang === 1 ? 1 : -1;
        gocDetail = `Sao 5 nhập trung -> Lấy Sơn đối diện ${sonDoiDien.name} (${sonDoiDien.sanYuan} Nguyên Cung ${PALACE_NAMES[sonDoiDien.palace]}, mang tính ${sonDoiDien.yinYang === 1 ? 'Dương +' : 'Âm -'}) -> Bay ${direction === 1 ? 'Thuận' : 'Nghịch'}`;
      }
    }

    // 5. Phi tinh tìm sao bay đến cung liền kề
    const path = direction === 1 ? FORWARD_PATH : REVERSE_PATH;
    const step = path.indexOf(adjPalace);
    const saoKetQua = wrapStar(saoVan + step);

    // 6. Kiểm tra điều kiện đắc Thành Môn vượng khí
    // Điều kiện: Sao kết quả == Vận Trạch VÀ Bay Nghịch
    const isDacThanhMon = (saoKetQua === vanTrach && direction === -1);

    // 7. Xác định Cấp Độ Khuyến Cáo (Trợ Vượng vs Cứu Giải)
    let priorityType = 'KHONG_DUNG';
    let priorityBadge = '⛔ Không Đắc Khí';
    let priorityClass = 'badge-khong-dung';
    let advice = '';

    if (isDacThanhMon) {
      if (isFacingMainVuong) {
        priorityType = 'TRO_VUONG';
        priorityBadge = '🌸 Cẩm Thượng Thiêm Hoa (Trợ Vượng)';
        priorityClass = 'badge-tro-vuong';
        advice = `🌸 Cẩm Thượng Thiêm Hoa (Gấm Thêm Hoa): Hướng chính của nhà đã có Hướng tinh Sao ${facingHuongStar} là Vượng/Sinh khí (cửa chính đã rất đắc tài). Vị trí Thành Môn tại Cung ${PALACE_NAMES[adjPalace]} - Sơn ${candidateMountain.name} đóng vai trò đòn bẩy trợ lực tăng cường. Nếu có điều kiện mở thêm cửa phụ, cổng ngõ hoặc đặt phong thủy luân / thác nước động tại đây, gia trạch sẽ đạt thế 'Song Khí Tề Đáo', tài lộc đại phát vượt bậc. Nếu không mở cửa phụ thì cửa chính vẫn rất phát đạt, không hề phạm hung.`;
      } else {
        priorityType = 'CUU_CANH';
        priorityBadge = '🚨 Dụng Thần Cứu Giải (Tối Quan Trọng)';
        priorityClass = 'badge-cuu-canh';
        advice = `🚨 Dụng Thần Cứu Giải (Cứu Cánh Tài Lộc): Vì hướng chính của ngôi nhà chỉ có Hướng tinh Sao ${facingHuongStar} (bị suy thoái / hưu tù), cửa chính không thể nạp vượng khí. Thành Môn tại Cung ${PALACE_NAMES[adjPalace]} - Sơn ${candidateMountain.name} chính là 'Cửa cứu cánh duy nhất'. Khuyến cáo gia chủ NÊN ƯU TIÊN mở cửa phụ, trổ cổng, mở ban công hoặc đặt bể cá, phong thủy luân lớn tại đây để đoạt lấy vượng khí đương thời (Sao ${vanTrach} bay nghịch), hóa giải suy bại và kích hoạt tài lộc cho toàn gia trạch!`;
      }
    } else {
      advice = `Không đắc Thành Môn (Sao bay đến là Sao ${saoKetQua} ${direction === 1 ? 'bay Thuận' : 'bay Nghịch'}): Tuyệt đối không mở cửa phụ, cổng hoặc đặt hồ nước lớn tại đây kẻo nạp thoái khí, suy bại tài vận.`;
    }

    return {
      sidePosition: sidePosition, // 'left' hoặc 'right'
      sideLabel: sidePosition === 'left' ? 'Bên Trái Hướng Nhà' : 'Bên Phải Hướng Nhà',
      palace: adjPalace,
      palaceName: PALACE_NAMES[adjPalace],
      palaceDirection: PALACE_DIRECTIONS[adjPalace],
      isChinhMa: isChinhMa,
      typeLabel: typeLabel,
      typeShort: typeShort,
      candidateMountain: candidateMountain,
      mountainName: candidateMountain.name,
      sanYuan: sanYuan,
      saoVan: saoVan,
      direction: direction,
      directionText: direction === 1 ? 'Bay Thuận (+)' : 'Bay Nghịch (-)',
      gocDetail: gocDetail,
      saoKetQua: saoKetQua,
      isDacThanhMon: isDacThanhMon,
      priorityType: priorityType,
      priorityBadge: priorityBadge,
      priorityClass: priorityClass,
      badgeText: isDacThanhMon ? `🚪 TM: ${candidateMountain.name}` : '',
      statusText: isDacThanhMon ? 'Đắc Thành Môn Vượng Khí (Dùng Được)' : 'Thành Môn Suy Tử Khí (Không Dùng)',
      statusClass: isDacThanhMon ? 'status-dac' : 'status-khong-dac',
      advice: advice
    };
  }

  /**
   * Phân tích toàn bộ 2 vị trí Thành Môn của ngôi nhà
   */
  function analyzeThanhMon(chartResult) {
    if (!chartResult || !chartResult.facingMountain) return null;

    const vanTrach = chartResult.van || 9;
    const facingPalace = chartResult.facingMountain.palace;
    const sanYuan = chartResult.facingMountain.sanYuan;

    if (!facingPalace || facingPalace === 5) return null;

    // Kiểm tra Hướng tinh tại Cung Hướng chính
    const facingData = chartResult.palaces[facingPalace];
    const facingHuongStar = facingData ? facingData.huong : 0;
    const vuongStar = vanTrach;
    const sinhStar = wrapStar(vanTrach + 1);
    const isFacingMainVuong = (facingHuongStar === vuongStar || facingHuongStar === sinhStar);

    const idx = RING_8.indexOf(facingPalace);
    if (idx === -1) return null;

    const leftPalace = RING_8[(idx - 1 + 8) % 8];
    const rightPalace = RING_8[(idx + 1) % 8];

    const leftResult = evaluateSide(facingPalace, leftPalace, sanYuan, vanTrach, chartResult, 'left', isFacingMainVuong, facingHuongStar);
    const rightResult = evaluateSide(facingPalace, rightPalace, sanYuan, vanTrach, chartResult, 'right', isFacingMainVuong, facingHuongStar);

    const dacThanhMonPalaces = [];
    const dacThanhMonDetails = {};

    if (leftResult && leftResult.isDacThanhMon) {
      dacThanhMonPalaces.push(leftResult.palace);
      dacThanhMonDetails[leftResult.palace] = leftResult;
    }

    if (rightResult && rightResult.isDacThanhMon) {
      dacThanhMonPalaces.push(rightResult.palace);
      dacThanhMonDetails[rightResult.palace] = rightResult;
    }

    return {
      vanTrach: vanTrach,
      facingMountain: chartResult.facingMountain,
      facingPalace: facingPalace,
      facingPalaceName: PALACE_NAMES[facingPalace],
      facingHuongStar: facingHuongStar,
      isFacingMainVuong: isFacingMainVuong,
      sanYuan: sanYuan,
      hasAnyDacThanhMon: dacThanhMonPalaces.length > 0,
      dacThanhMonPalaces: dacThanhMonPalaces,
      dacThanhMonDetails: dacThanhMonDetails,
      left: leftResult,
      right: rightResult
    };
  }

  /**
   * Render HTML thẻ hiển thị Thành Môn Quyết
   */
  function renderThanhMonHTML(tmAnalysis) {
    if (!tmAnalysis) return '';

    const { vanTrach, facingMountain, facingPalaceName, facingHuongStar, isFacingMainVuong, hasAnyDacThanhMon, left, right } = tmAnalysis;

    function renderSideCard(side) {
      if (!side) return '';
      return `
        <div class="tm-card ${side.isDacThanhMon ? 'tm-card-dac' : 'tm-card-khong'}">
          <div class="tm-card-header">
            <div class="tm-card-title-group">
              <span class="tm-side-tag">${side.sideLabel}</span>
              <h4 class="tm-palace-name">Cung ${side.palaceName} (${side.palaceDirection}) - Sơn ${side.mountainName}</h4>
            </div>
            <span class="tm-type-badge ${side.isChinhMa ? 'tm-badge-chinh' : 'tm-badge-ta'}">
              ${side.typeShort}
            </span>
          </div>

          <div class="tm-status-banner ${side.statusClass}">
            <span class="tm-status-icon">${side.isDacThanhMon ? '🚪✨' : '🚫'}</span>
            <strong>${side.statusText}</strong>
          </div>

          ${side.isDacThanhMon ? `
            <div class="tm-priority-pill ${side.priorityClass}">
              <span>${side.priorityBadge}</span>
            </div>
          ` : ''}

          <div class="tm-calc-steps">
            <div class="tm-calc-row">
              <span class="calc-lbl">Nguyên Long:</span>
              <strong class="calc-val">${side.sanYuan} Nguyên Long</strong>
            </div>
            <div class="tm-calc-row">
              <span class="calc-lbl">Vận Tinh Đáo Cung:</span>
              <strong class="calc-val">Sao ${side.saoVan}</strong>
            </div>
            <div class="tm-calc-row">
              <span class="calc-lbl">Khảo Sát Chiều Bay:</span>
              <strong class="calc-val">${side.directionText}</strong>
            </div>
            <div class="tm-calc-row">
              <span class="calc-lbl">Sao Bay Đến:</span>
              <strong class="calc-val ${side.saoKetQua === vanTrach ? 'text-vuong' : ''}">Sao ${side.saoKetQua} ${side.saoKetQua === vanTrach ? `(Vượng Tinh Vận ${vanTrach})` : ''}</strong>
            </div>
          </div>

          <div class="tm-calc-explain">
            <small>🔍 ${side.gocDetail}</small>
          </div>

          <div class="tm-advice-box ${side.isDacThanhMon ? (side.priorityType === 'CUU_CANH' ? 'advice-cuu-canh' : 'advice-tro-vuong') : 'advice-khong'}">
            <strong>${side.isDacThanhMon ? (side.priorityType === 'CUU_CANH' ? '🚨 Đề Xuất Cứu Giải:' : '💡 Đề Xuất Trợ Vượng:') : '⚠️ Cảnh Báo:'}</strong>
            <p>${side.advice}</p>
          </div>
        </div>
      `;
    }

    return `
      <div class="thanh-mon-section">
        <div class="thanh-mon-header">
          <div class="tm-title-group">
            <span class="tm-tag">Bí Pháp Huyền Không</span>
            <h3 class="tm-main-title">🚪 Luận Giải Thành Môn Quyết (Castle Gate)</h3>
            <p class="tm-subtitle">Khảo sát 2 cung bên cạnh hướng chính (Hướng <strong>${facingMountain.name}</strong> - Vận ${vanTrach}) để tìm khí khẩu phụ mở cửa, cổng, đón vượng khí.</p>
          </div>
          ${hasAnyDacThanhMon ? `
            <div class="tm-summary-badge tm-summary-success">
              <span>🚪 CÓ VỊ TRÍ ĐẮC THÀNH MÔN VƯỢNG KHÍ</span>
            </div>
          ` : `
            <div class="tm-summary-badge tm-summary-none">
              <span>Cả 2 bên không đắc Thành Môn</span>
            </div>
          `}
        </div>

        <!-- Facing Status Context Banner -->
        <div class="tm-facing-banner ${isFacingMainVuong ? 'facing-banner-vuong' : 'facing-banner-suy'}">
          <span class="facing-banner-icon">${isFacingMainVuong ? '🌟' : '⚠️'}</span>
          <div class="facing-banner-content">
            <strong>${isFacingMainVuong ? 'Chính Hướng Đã Đắc Vượng Khí (Cửa Chính Rất Tốt):' : 'Chính Hướng Bị Hưu Tù / Suy Thoái Khí (Cần Dụng Thần Cứu Giải):'}</strong>
            <span>${isFacingMainVuong 
              ? `Cung Hướng (${facingPalaceName}) có Hướng tinh Sao ${facingHuongStar} là Vượng/Sinh khí. Cửa chính đã nạp trọn tài khí. Mở thêm Thành Môn là giải pháp 'Gấm Thêm Hoa' nhân đôi tài lộc; nếu không mở cửa phụ thì cửa chính vẫn đại phát.` 
              : `Cung Hướng (${facingPalaceName}) có Hướng tinh Sao ${facingHuongStar} là Suy/Thoái khí, cửa chính không đón được vượng tài. Cần ĐẶC BIỆT ƯU TIÊN mở cửa phụ / cổng / bể cá tại vị trí Thành Môn đắc khí để cứu giải tài vận.`}</span>
          </div>
        </div>

        <div class="tm-cards-grid">
          ${renderSideCard(left)}
          ${renderSideCard(right)}
        </div>
      </div>
    `;
  }

  // Export module
  window.ThanhMonRules = {
    analyze: analyzeThanhMon,
    renderHTML: renderThanhMonHTML,
    MOUNTAINS: MOUNTAINS,
    PALACE_NAMES: PALACE_NAMES,
    PALACE_DIRECTIONS: PALACE_DIRECTIONS
  };

})(window);
