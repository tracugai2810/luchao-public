/* ==========================================================================
   HUYỀN KHÔNG PHI TINH — NATIVE CANVAS 2D HD RENDERER
   Renders directly with Canvas 2D + enableInkText ("Mực in") at 1710px lossless PNG,
   preserving 100% of the crisp white tinh bàn palette, 4 annual/monthly/daily/hourly
   star circles, Vận/Sơn/Hướng colors, Thành Môn door icon, info panel & signature.
   ========================================================================== */
(function (global) {
  'use strict';

  function roundRectPath(ctx, x, y, w, h, r) {
    if (typeof ctx.roundRect === 'function') {
      ctx.beginPath();
      ctx.roundRect(x, y, w, h, r);
      return;
    }
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + r, y, r);
    ctx.closePath();
  }

  function wrapParagraph(ctx, text, font, maxW) {
    var clean = String(text || '').replace(/<[^>]*>/g, '').trim();
    if (!clean) return [];
    ctx.font = font;
    var words = clean.split(/\s+/);
    var lines = [];
    var cur = '';
    for (var i = 0; i < words.length; i++) {
      var test = cur ? (cur + ' ' + words[i]) : words[i];
      if (ctx.measureText(test).width <= maxW || !cur) {
        cur = test;
      } else {
        lines.push(cur);
        cur = words[i];
      }
    }
    if (cur) lines.push(cur);
    return lines;
  }

  function drawDoorIcon(ctx, x, y) {
    // Crisp vector miniature Thành Môn door icon (18x22)
    ctx.save();
    ctx.fillStyle = '#92400e';
    roundRectPath(ctx, x, y, 18, 22, 2.5);
    ctx.fill();

    ctx.fillStyle = '#d97706';
    roundRectPath(ctx, x + 2.5, y + 2.5, 13, 17, 1.5);
    ctx.fill();

    ctx.strokeStyle = '#78350f';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x + 9, y + 2.5);
    ctx.lineTo(x + 9, y + 19.5);
    ctx.stroke();

    ctx.fillStyle = '#fef3c7';
    ctx.beginPath();
    ctx.arc(x + 12.2, y + 11.2, 1.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  async function renderHKPTToCanvas(payload) {
    if (!payload || !payload.result) {
      throw new Error('Missing HKPT calculation result');
    }

    if (global.PortalImageDownload && global.PortalImageDownload.waitForFonts) {
      await global.PortalImageDownload.waitForFonts([
        '400 16px Inter',
        '600 16px Inter',
        '700 18px Inter',
        '800 32px Inter',
        '800 40px Inter',
        '700 32px "Dancing Script"'
      ], 2000);
    } else if (typeof document !== 'undefined' && document.fonts && document.fonts.ready) {
      await document.fonts.ready.catch(function () {});
    }

    var result = payload.result;
    var menhQuai = payload.menhQuai || null;
    var tmAnalysis = payload.tmAnalysis || null;

    var W = 760;
    var SCALE = 2.25; // 1710px PNG lossless (< 2000px for crisp Zalo delivery)
    var padX = 26;
    var innerW = W - padX * 2; // 708px

    var mCanvas = document.createElement('canvas');
    var mCtx = mCanvas.getContext('2d');

    var isKV = (result.chartType === 'DAI_KHONG_VONG' || result.chartType === 'TIEU_KHONG_VONG' || result.chartType === 'KHONG_VONG' || result.isKhongVong);
    var kvDescLines = [];
    var kvAdvLines = [];
    var kvBoxH = 0;
    if (isKV) {
      var kvInfo = result.khongVongInfo || {};
      kvDescLines = wrapParagraph(mCtx, kvInfo.desc || 'Độ số phạm tuyến Không Vong.', '400 14.5px Inter, sans-serif', innerW - 36);
      kvAdvLines = wrapParagraph(mCtx, 'Lời khuyên hóa giải: Tuyến Không Vong là ranh giới giao thoa khí trường hỗn loạn. Gia chủ nên xoay lệch khuôn cửa chính 2° đến 3° về phía Chính Sơn thuần khí.', '600 14.5px Inter, sans-serif', innerW - 36);
      kvBoxH = 44 + kvDescLines.length * 20 + kvAdvLines.length * 20 + 18;
    }

    var specialBadges = [];
    if (result.hopThap && result.hopThap.hasHopThap) {
      specialBadges.push({ text: '✨ ' + result.hopThap.label, bg: '#b45309' });
    }
    if (result.tamBanQuai && result.tamBanQuai.hasTamBanQuai) {
      specialBadges.push({ text: '💫 ' + result.tamBanQuai.label, bg: '#0f766e' });
    }
    if (result.thatTinhDaKiep && result.thatTinhDaKiep.hasThatTinhDaKiep) {
      specialBadges.push({ text: '⚡ ' + result.thatTinhDaKiep.label, bg: '#7c3aed' });
    }

    var y = 24;
    var yKV = y;
    if (isKV) y += kvBoxH + 14;

    var yOwner = y;
    if (menhQuai) y += 46 + 12;

    var yHeader = y;
    y += 38;
    if (specialBadges.length > 0) y += 38;
    y += 10;

    var gridSize = 564; // 3 * 188px
    var cellSize = 188;
    var gx = (W - gridSize) / 2; // 98px
    var gy = y;
    y += gridSize + 24;

    var yInfoPanel = y;
    var infoPanelH = 192;
    y += infoPanelH + 22;

    var yFooter = y;
    var H = Math.ceil(yFooter + 52);

    var canvas = document.createElement('canvas');
    var ctx = canvas.getContext('2d');
    canvas.width = Math.round(W * SCALE);
    canvas.height = Math.round(H * SCALE);
    ctx.scale(SCALE, SCALE);

    if (global.PortalImageDownload && global.PortalImageDownload.enableInkText) {
      global.PortalImageDownload.enableInkText(ctx, 0.20);
    }

    // 1. Nền trắng tinh + viền khung vàng nhẹ đặc trưng của HKPT
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, W, H);

    ctx.save();
    ctx.strokeStyle = 'rgba(217, 119, 6, 0.45)';
    ctx.lineWidth = 2.5;
    roundRectPath(ctx, 6, 6, W - 12, H - 12, 16);
    ctx.stroke();
    ctx.restore();

    // 2. Không Vong Warning Box (nếu phạm)
    if (isKV) {
      ctx.fillStyle = '#fef2f2';
      ctx.strokeStyle = '#fca5a5';
      ctx.lineWidth = 1.5;
      roundRectPath(ctx, padX, yKV, innerW, kvBoxH, 12);
      ctx.fill();
      ctx.stroke();

      var kvLabel = (result.khongVongInfo && result.khongVongInfo.label) ? result.khongVongInfo.label : 'Không Vong';
      ctx.textAlign = 'left';
      ctx.font = '800 16px Inter, sans-serif';
      ctx.fillStyle = '#b91c1c';
      ctx.fillText('🚨 CẢNH BÁO ĐẠI HÙNG SÁT: ' + kvLabel.toUpperCase(), padX + 18, yKV + 28);

      var kvy = yKV + 52;
      ctx.font = '400 14.5px Inter, sans-serif';
      ctx.fillStyle = '#7f1d1d';
      for (var dli = 0; dli < kvDescLines.length; dli++) {
        ctx.fillText(kvDescLines[dli], padX + 18, kvy);
        kvy += 20;
      }
      kvy += 4;
      ctx.font = '600 14.5px Inter, sans-serif';
      for (var ali = 0; ali < kvAdvLines.length; ali++) {
        ctx.fillText(kvAdvLines[ali], padX + 18, kvy);
        kvy += 20;
      }
    }

    // 3. Thông tin gia chủ (nếu nhập năm sinh)
    if (menhQuai) {
      ctx.fillStyle = '#f0fdfa';
      ctx.strokeStyle = '#99f6e4';
      ctx.lineWidth = 1.4;
      roundRectPath(ctx, padX, yOwner, innerW, 42, 10);
      ctx.fill();
      ctx.stroke();

      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.font = '700 16.5px Inter, sans-serif';
      ctx.fillStyle = '#0f766e';
      ctx.fillText(
        'Gia chủ: ' + menhQuai.genderName + ' ' + menhQuai.year + ' - Mệnh quái: ' + menhQuai.number + ' - ' + menhQuai.element,
        W / 2,
        yOwner + 21
      );
      ctx.textBaseline = 'alphabetic';
    }

    // 4. Header Tọa - Hướng + Badge Hạ Quái / Thế Quái
    var toaName = result.sittingMountain ? result.sittingMountain.name : '';
    var huongName = result.facingMountain ? result.facingMountain.name : '';
    var titleText = 'Tọa ' + toaName + ' - Hướng ' + huongName;
    if (result.chartType === 'THE_QUAI' && result.kiemInfo && result.kiemInfo.label) {
      titleText += ' - ' + result.kiemInfo.label;
    }

    var badgeText = 'Không Vong';
    var badgeBg = '#fee2e2', badgeBorder = '#fecaca', badgeColor = '#b91c1c';
    if (result.chartType === 'HA_QUAI') {
      badgeText = 'Hạ Quái';
      badgeBg = '#ecfdf5';
      badgeBorder = '#a7f3d0';
      badgeColor = '#047857';
    } else if (result.chartType === 'THE_QUAI') {
      badgeText = 'Thế Quái';
      badgeBg = '#fef3c7';
      badgeBorder = '#fde68a';
      badgeColor = '#b45309';
    } else if (result.chartType === 'DAI_KHONG_VONG') {
      badgeText = 'Đại Không Vong';
    } else if (result.chartType === 'TIEU_KHONG_VONG') {
      badgeText = 'Tiểu Không Vong';
    }

    var titleFont = '800 22.5px Inter, sans-serif';
    var badgeFont = '700 14.5px Inter, sans-serif';
    ctx.font = titleFont;
    var titleW = ctx.measureText(titleText).width;
    ctx.font = badgeFont;
    var badgeW = ctx.measureText(badgeText).width + 24;

    // Co nhẹ nếu tên Kiêm Hướng quá dài
    if (titleW + 14 + badgeW > innerW) {
      titleFont = '800 19.5px Inter, sans-serif';
      ctx.font = titleFont;
      titleW = ctx.measureText(titleText).width;
    }

    var totalHeadW = titleW + 14 + badgeW;
    var headStartX = (W - totalHeadW) / 2;

    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.font = titleFont;
    ctx.fillStyle = '#0f172a';
    ctx.fillText(titleText, headStartX, yHeader + 18);

    var bx = headStartX + titleW + 14;
    ctx.fillStyle = badgeBg;
    ctx.strokeStyle = badgeBorder;
    ctx.lineWidth = 1.2;
    roundRectPath(ctx, bx, yHeader + 4, badgeW, 28, 14);
    ctx.fill();
    ctx.stroke();

    ctx.textAlign = 'center';
    ctx.font = badgeFont;
    ctx.fillStyle = badgeColor;
    ctx.fillText(badgeText, bx + badgeW / 2, yHeader + 18);
    ctx.textBaseline = 'alphabetic';

    // Special Formation Badges (Hợp Thập / Tam Ban Quái / Thất Tinh Đả Kiếp)
    if (specialBadges.length > 0) {
      ctx.font = '700 14.5px Inter, sans-serif';
      var gap = 10;
      var totalBW = 0;
      var measured = specialBadges.map(function (b) {
        var bw = ctx.measureText(b.text).width + 28;
        totalBW += bw;
        return { text: b.text, bg: b.bg, w: bw };
      });
      totalBW += (measured.length - 1) * gap;
      var sbx = (W - totalBW) / 2;
      var sby = yHeader + 42;
      ctx.textBaseline = 'middle';
      for (var bi = 0; bi < measured.length; bi++) {
        var sb = measured[bi];
        ctx.fillStyle = sb.bg;
        roundRectPath(ctx, sbx, sby, sb.w, 28, 14);
        ctx.fill();
        ctx.textAlign = 'center';
        ctx.fillStyle = '#ffffff';
        ctx.fillText(sb.text, sbx + sb.w / 2, sby + 14);
        sbx += sb.w + gap;
      }
      ctx.textBaseline = 'alphabetic';
    }

    // 5. LƯỚI TINH BÀN 9 CUNG (3x3 = 564x564px)
    var directionShort = { 1: 'B', 2: 'TN', 3: 'Đ', 4: 'ĐN', 5: '', 6: 'TB', 7: 'T', 8: 'ĐB', 9: 'N' };
    var ring = [9, 2, 7, 6, 1, 8, 3, 4];
    var visualIndices = [1, 2, 5, 8, 7, 6, 3, 0];
    var facingPalace = result.facingMountain ? result.facingMountain.palace : 9;
    var rotatedRing = ring.slice();
    if (facingPalace && facingPalace !== 5) {
      var rIdx = ring.indexOf(facingPalace);
      if (rIdx !== -1) {
        rotatedRing = ring.slice(rIdx).concat(ring.slice(0, rIdx));
      }
    }
    var displayGrid = new Array(9);
    displayGrid[4] = 5;
    for (var ri = 0; ri < 8; ri++) {
      displayGrid[visualIndices[ri]] = rotatedRing[ri];
    }

    ctx.save();
    roundRectPath(ctx, gx, gy, gridSize, gridSize, 18);
    ctx.clip();

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(gx, gy, gridSize, gridSize);

    // Subtle divider lines
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 1.2;
    for (var k = 1; k <= 2; k++) {
      ctx.beginPath();
      ctx.moveTo(gx + k * cellSize, gy);
      ctx.lineTo(gx + k * cellSize, gy + gridSize);
      ctx.moveTo(gx, gy + k * cellSize);
      ctx.lineTo(gx + gridSize, gy + k * cellSize);
      ctx.stroke();
    }

    for (var gi = 0; gi < 9; gi++) {
      var palace = displayGrid[gi];
      var pData = result.palaces[palace];
      if (!pData) continue;

      var col = gi % 3;
      var row = Math.floor(gi / 3);
      var x0 = gx + col * cellSize;
      var y0 = gy + row * cellSize;

      // Top row: 4 vòng tròn Niên (Lục), Nguyệt (Đỏ), Nhật (Vàng), Thời (Tím)
      var topStars = [
        { val: pData.nien, color: '#16a34a' },
        { val: pData.nguyet, color: '#dc2626' },
        { val: pData.nhat, color: '#d97706' },
        { val: pData.thoi, color: '#9333ea' }
      ];
      var circleOffsets = [32, 73, 115, 156];
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      for (var ts = 0; ts < 4; ts++) {
        if (!topStars[ts].val) continue;
        var scx = x0 + circleOffsets[ts];
        var scy = y0 + 30;
        ctx.strokeStyle = topStars[ts].color;
        ctx.lineWidth = 2.1;
        ctx.beginPath();
        ctx.arc(scx, scy, 15, 0, Math.PI * 2);
        ctx.stroke();

        ctx.font = '800 17px Inter, sans-serif';
        ctx.fillStyle = topStars[ts].color;
        ctx.fillText(String(topStars[ts].val), scx, scy + 0.5);
      }

      // Middle: Vận tinh + icon Cửa Thành Môn nếu đắc
      var hasTM = !!(tmAnalysis && tmAnalysis.dacThanhMonDetails && tmAnalysis.dacThanhMonDetails[palace]);
      var vanCx = hasTM ? (x0 + cellSize / 2 - 12) : (x0 + cellSize / 2);
      ctx.font = '800 40px Inter, sans-serif';
      ctx.fillStyle = '#0284c7';
      ctx.textAlign = 'center';
      ctx.fillText(String(pData.van), vanCx, y0 + 96);

      if (hasTM) {
        drawDoorIcon(ctx, vanCx + 18, y0 + 83);
      }

      // Bottom: Sơn tinh (trái) - Phương vị (giữa) - Hướng tinh (phải)
      ctx.font = '800 32px Inter, sans-serif';
      ctx.fillStyle = '#1d4ed8';
      ctx.textAlign = 'center';
      ctx.fillText(String(pData.son), x0 + 36, y0 + 156);

      var dirTxt = directionShort[palace];
      if (dirTxt) {
        ctx.font = '700 14px Inter, sans-serif';
        var dw = Math.max(26, ctx.measureText(dirTxt).width + 14);
        var dx = x0 + cellSize / 2 - dw / 2;
        var dy = y0 + 144;
        ctx.fillStyle = '#f1f5f9';
        ctx.strokeStyle = '#cbd5e1';
        ctx.lineWidth = 1;
        roundRectPath(ctx, dx, dy, dw, 24, 6);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#334155';
        ctx.fillText(dirTxt, x0 + cellSize / 2, dy + 12.5);
      }

      ctx.font = '800 32px Inter, sans-serif';
      ctx.fillStyle = '#dc2626';
      ctx.fillText(String(pData.huong), x0 + cellSize - 36, y0 + 156);
    }

    ctx.restore();

    // Outer thick rounded border of the 3x3 grid
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 2.4;
    roundRectPath(ctx, gx, gy, gridSize, gridSize, 18);
    ctx.stroke();

    // 6. BẢNG THÔNG TIN DƯỚI TINH BÀN
    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = '#0f766e';
    ctx.lineWidth = 1.6;
    roundRectPath(ctx, padX, yInfoPanel, innerW, infoPanelH, 14);
    ctx.fill();
    ctx.stroke();

    function drawInfoBox(bxPos, byPos, bw, labelText, valText) {
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.font = '700 13.5px Inter, sans-serif';
      ctx.fillStyle = '#0f766e';
      ctx.fillText(labelText, bxPos + bw / 2, byPos + 14);

      ctx.fillStyle = '#f8fafc';
      ctx.strokeStyle = '#cbd5e1';
      ctx.lineWidth = 1.1;
      roundRectPath(ctx, bxPos, byPos + 28, bw, 44, 10);
      ctx.fill();
      ctx.stroke();

      var vStr = String(valText || '-');
      var fSize = 19;
      ctx.font = '800 ' + fSize + 'px Inter, sans-serif';
      while (ctx.measureText(vStr).width > bw - 16 && fSize > 13.5) {
        fSize -= 0.5;
        ctx.font = '800 ' + fSize + 'px Inter, sans-serif';
      }
      ctx.fillStyle = '#0f172a';
      ctx.fillText(vStr, bxPos + bw / 2, byPos + 50);
    }

    var pInPad = 18;
    var gap1 = 16;
    var w2Col = (innerW - pInPad * 2 - gap1) / 2;
    drawInfoBox(padX + pInPad, yInfoPanel + 14, w2Col, 'VẬN', result.van);
    drawInfoBox(padX + pInPad + w2Col + gap1, yInfoPanel + 14, w2Col, 'ĐỘ HƯỚNG', result.facingDegree + '°');

    var gap2 = 12;
    var w4Col = (innerW - pInPad * 2 - gap2 * 3) / 4;
    var hourmap = { 1: 'Tý', 2: 'Sửu', 3: 'Dần', 4: 'Mão', 5: 'Thìn', 6: 'Tỵ', 7: 'Ngọ', 8: 'Mùi', 9: 'Thân', 10: 'Dậu', 11: 'Tuất', 12: 'Hợi' };
    var pad2 = function (n) { return String(n).padStart(2, '0'); };
    var timeStr = (payload.exactHour !== undefined && payload.exactMinute !== undefined && !isNaN(payload.exactHour) && !isNaN(payload.exactMinute))
      ? (pad2(payload.exactHour) + ':' + pad2(payload.exactMinute))
      : '';
    var hourDisplay = timeStr ? ((hourmap[payload.currentHour] || '-') + ' (' + timeStr + ')') : (hourmap[payload.currentHour] || '-');

    var subItems = [
      { label: 'NĂM', val: payload.currentYear || '-' },
      { label: 'THÁNG', val: payload.currentMonth || '-' },
      { label: 'NGÀY', val: payload.currentDay || '-' },
      { label: 'GIỜ', val: hourDisplay }
    ];
    for (var si = 0; si < 4; si++) {
      drawInfoBox(padX + pInPad + si * (w4Col + gap2), yInfoPanel + 104, w4Col, subItems[si].label, subItems[si].val);
    }

    // 7. CHỮ KÝ & WATERMARK CHÂN TRANG
    ctx.textBaseline = 'middle';
    ctx.textAlign = 'left';
    ctx.font = '700 32px "Dancing Script", cursive';
    ctx.fillStyle = '#0f172a';
    ctx.fillText('Nguyễn Khôi', padX + 4, yFooter + 22);

    var wmText = 'Tinh bàn được lập tại: luchao.io.vn/hkpt';
    ctx.font = '700 15.5px Inter, sans-serif';
    var wmW = ctx.measureText(wmText).width + 30;
    var wmX = W - padX - wmW;
    ctx.fillStyle = '#f8fafc';
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 1.2;
    roundRectPath(ctx, wmX, yFooter + 4, wmW, 36, 10);
    ctx.fill();
    ctx.stroke();

    ctx.textAlign = 'center';
    ctx.fillStyle = '#0f172a';
    ctx.fillText(wmText, wmX + wmW / 2, yFooter + 22);
    ctx.textBaseline = 'alphabetic';

    return canvas;
  }

  global.HKPTCanvasRenderer = {
    renderHKPTToCanvas: renderHKPTToCanvas
  };
})(typeof window !== 'undefined' ? window : this);
