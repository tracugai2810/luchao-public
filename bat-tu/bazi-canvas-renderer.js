/* ==========================================================================
   HOA SƠN BÁT TỰ — NATIVE CANVAS 2D HD RENDERER
   Renders directly with Canvas 2D + enableInkText ("Mực in") at 1920px lossless PNG,
   preserving 100% of the classic #FEF6E8 cream chart palette, blue grid lines,
   Five-Element typography colors, Tinh Sát highlights, Đại Vận & Lưu Niên tables.
   ========================================================================== */
(function (global) {
  'use strict';

  function drawCenteredPair(ctx, leftText, leftFont, leftColor, rightText, rightFont, rightColor, centerX, y) {
    var l = leftText || '';
    var r = rightText || '';
    var gap = (l && r) ? ' ' : '';

    ctx.font = leftFont;
    var wL = ctx.measureText(l + gap).width;
    ctx.font = rightFont;
    var wR = ctx.measureText(r).width;
    var startX = centerX - (wL + wR) / 2;

    ctx.textAlign = 'left';
    if (l) {
      ctx.font = leftFont;
      ctx.fillStyle = leftColor || '#0F172A';
      ctx.fillText(l + gap, startX, y);
    }
    if (r) {
      ctx.font = rightFont;
      ctx.fillStyle = rightColor || '#334155';
      ctx.fillText(r, startX + wL, y);
    }
  }

  function drawSpansLeft(ctx, spans, startX, y) {
    var curX = startX;
    ctx.textAlign = 'left';
    for (var i = 0; i < spans.length; i++) {
      var s = spans[i];
      ctx.font = s.font || '18px Roboto, sans-serif';
      ctx.fillStyle = s.color || '#0F172A';
      ctx.fillText(s.text, curX, y);
      curX += ctx.measureText(s.text).width;
    }
    return curX;
  }

  function wrapLinesForCell(ctx, rawText, font, maxW) {
    var normalized = String(rawText || '-')
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<[^>]*>/g, '')
      .trim();
    if (!normalized) normalized = '-';

    ctx.font = font;
    var explicitLines = normalized.split('\n');
    var out = [];
    for (var e = 0; e < explicitLines.length; e++) {
      var seg = explicitLines[e].trim();
      if (!seg) continue;
      if (ctx.measureText(seg).width <= maxW) {
        out.push(seg);
        continue;
      }
      var words = seg.split(/\s+/);
      var line = '';
      for (var w = 0; w < words.length; w++) {
        var test = line ? (line + ' ' + words[w]) : words[w];
        if (ctx.measureText(test).width <= maxW || !line) {
          line = test;
        } else {
          out.push(line);
          line = words[w];
        }
      }
      if (line) out.push(line);
    }
    return out.length ? out : ['-'];
  }

  function drawStackedLabel(ctx, lines, cx, topY, boxH, font, color) {
    ctx.font = font || '700 15px Roboto, sans-serif';
    ctx.fillStyle = color || '#0F172A';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    var step = 19;
    var startY = topY + boxH / 2 - ((lines.length - 1) * step) / 2;
    for (var i = 0; i < lines.length; i++) {
      ctx.fillText(lines[i], cx, startY + i * step);
    }
    ctx.textBaseline = 'alphabetic';
  }

  function readTinhSatFromDOM() {
    if (typeof document === 'undefined') return null;
    var list = [];
    for (var i = 0; i < 20; i++) {
      var cell = document.getElementById('res-ts-cell-' + i);
      if (!cell) return null;
      var nEl = cell.querySelector('.ts-name');
      var vEl = cell.querySelector('.ts-val');
      list.push({
        name: nEl ? nEl.innerHTML : '',
        val: vEl ? vEl.innerHTML : '-',
        isActive: cell.classList.contains('is-active')
      });
    }
    return list;
  }

  async function renderBaziToCanvas(res, selectedDaiVanIndex, tzOptText) {
    if (!res || !res.fourPillars) {
      throw new Error('Missing Bazi calculation result');
    }

    if (global.PortalImageDownload && global.PortalImageDownload.waitForFonts) {
      await global.PortalImageDownload.waitForFonts([
        '400 16px Roboto',
        '600 16px Roboto',
        '700 18px Roboto',
        '700 46px Roboto',
        '400 18px "Be Vietnam Pro"',
        '700 18px "Be Vietnam Pro"'
      ], 1800);
    } else if (typeof document !== 'undefined' && document.fonts && document.fonts.ready) {
      await document.fonts.ready.catch(function () {});
    }

    var W = 1280;
    var SCALE = 1.5; // 1920px crisp lossless PNG (< 2000px for social/Zalo full-res)
    var padX = 24;
    var tableW = W - padX * 2; // 1232px
    var labelW = 92;
    var dataW = tableW - labelW; // 1140px
    var col4W = dataW / 4; // 285px
    var col10W = dataW / 10; // 114px

    // Layout Y calculation
    var yHeaderTop = 28;
    var yT1 = 136; // 5 rows of Tứ Trụ
    var t1Heights = [54, 66, 166, 56, 56];
    var t1TotalH = 54 + 66 + 166 + 56 + 56; // 398

    var yT2 = yT1 + t1TotalH + 14;
    var tsRowH = 90;
    var t2TotalH = tsRowH * 2; // 180

    var yT3 = yT2 + t2TotalH + 14;
    var dvHeadH = 72;
    var dvCcH = 92;
    var dvMetaH = 68;
    var t3TotalH = dvHeadH + dvCcH + dvMetaH; // 232

    var yT4 = yT3 + t3TotalH + 14;
    var lnCcH = 84;
    var lnMetaH = 66;
    var lnTvH = 104;
    var t4TotalH = lnCcH + lnMetaH + lnTvH; // 254

    var yT5 = yT4 + t4TotalH + 14;
    var tcRowH = 46;
    var t5TotalH = tcRowH * 2; // 92

    var footerY = yT5 + t5TotalH + 34;
    var H = Math.ceil(footerY + 26);

    var canvas = document.createElement('canvas');
    var ctx = canvas.getContext('2d');
    canvas.width = Math.round(W * SCALE);
    canvas.height = Math.round(H * SCALE);
    ctx.scale(SCALE, SCALE);

    if (global.PortalImageDownload && global.PortalImageDownload.enableInkText) {
      global.PortalImageDownload.enableInkText(ctx, 0.20);
    }

    // 1. Nền giấy kem #FEF6E8 chuẩn Hoa Sơn Bát Tự
    ctx.fillStyle = '#FEF6E8';
    ctx.fillRect(0, 0, W, H);

    var inp = res.rawInput || {};
    var p = res.fourPillars;
    var tzText = tzOptText || 'VN (+7)';

    // 2. Thông tin đương số (Header 2 cột x 3 hàng)
    var nameUpper = (inp.name || 'ĐƯƠNG SỐ').toUpperCase();
    var isNu = inp.gender && (inp.gender.toLowerCase().indexOf('nữ') !== -1 || inp.gender.toLowerCase().indexOf('nu') !== -1);
    var genderDisplay = inp.gender || (isNu ? 'Nữ' : 'Nam');
    var solarLabel = (inp.timeZone !== undefined && inp.timeZone !== 7) ? ('Dương lịch (' + tzText + '): ') : 'Dương lịch: ';
    var birthTimeDisplay = inp.birthTimeStr || '';
    if (inp.solarAdjustment && inp.solarAdjustment.adjustedTimeStr) {
      birthTimeDisplay += ' (MT: ' + inp.solarAdjustment.adjustedTimeStr + ')';
    } else if (inp.timeZone !== undefined && inp.timeZone !== 7) {
      birthTimeDisplay += ' (' + tzText + ')';
    }

    var cYear = inp.calcYear || new Date().getFullYear();
    var Eng = global.BaziEngine || {};
    var CAN = Eng.CAN || ['Giáp', 'Ất', 'Bính', 'Đinh', 'Mậu', 'Kỷ', 'Canh', 'Tân', 'Nhâm', 'Quý'];
    var CHI = Eng.CHI || ['Tý', 'Sửu', 'Dần', 'Mão', 'Thìn', 'Tỵ', 'Ngọ', 'Mùi', 'Thân', 'Dậu', 'Tuất', 'Hợi'];
    var jiaziC = ((cYear - 1924) % 60 + 60) % 60;
    var cCan = CAN[jiaziC % 10];
    var cChi = CHI[jiaziC % 12];
    var calcLabel = 'Năm xem hạn: ';
    var calcValue = cYear + ' - ' + cCan + ' ' + cChi;
    if (inp.calcDay && inp.calcMonth) {
      calcLabel = 'Thời gian xem hạn: ';
      calcValue = String(inp.calcDay).padStart(2, '0') + '/' + String(inp.calcMonth).padStart(2, '0') + '/' + cYear + ' - ' + cCan + ' ' + cChi;
    }

    var birthBaziYear = (p.year && parseInt(p.year.solarDateText, 10)) ? parseInt(p.year.solarDateText, 10) : (inp.year || cYear);
    var calcAge = (res.calcAge !== undefined)
      ? res.calcAge
      : ((res.daiVan && res.daiVan.targetAge !== undefined) ? res.daiVan.targetAge : Math.max(0, cYear - birthBaziYear));

    var leftX = 28;
    var rightX = 468;
    var fHeadBold = '700 18.5px Roboto, sans-serif';
    var fHeadReg = '400 18.5px Roboto, sans-serif';

    drawSpansLeft(ctx, [
      { text: 'Họ tên: ', font: fHeadBold, color: '#0F172A' },
      { text: nameUpper, font: fHeadBold, color: '#0F172A' }
    ], leftX, yHeaderTop + 18);

    drawSpansLeft(ctx, [
      { text: 'Giới tính: ', font: fHeadBold, color: '#0F172A' },
      { text: genderDisplay, font: fHeadReg, color: '#0F172A' }
    ], rightX, yHeaderTop + 18);

    drawSpansLeft(ctx, [
      { text: solarLabel, font: fHeadBold, color: '#0F172A' },
      { text: birthTimeDisplay + ' - ' + (inp.birthDateStr || ''), font: fHeadReg, color: '#0F172A' }
    ], leftX, yHeaderTop + 52);

    drawSpansLeft(ctx, [
      { text: 'Âm Dương hợp lịch: ', font: fHeadBold, color: '#0F172A' },
      { text: (inp.birthTimeStr || '') + ' - ' + (inp.lunarDateStr || ''), font: fHeadReg, color: '#0F172A' }
    ], rightX, yHeaderTop + 52);

    drawSpansLeft(ctx, [
      { text: calcLabel, font: fHeadBold, color: '#0F172A' },
      { text: calcValue, font: fHeadBold, color: '#B45309' }
    ], leftX, yHeaderTop + 86);

    drawSpansLeft(ctx, [
      { text: 'Tuổi xem hạn: ', font: fHeadBold, color: '#0F172A' },
      { text: calcAge + ' tuổi', font: fHeadBold, color: '#B45309' }
    ], rightX, yHeaderTop + 86);

    // Helper vẽ lưới bảng chuẩn xanh #3B82F6 / #93C5FD
    function drawGridBorders(topY, totalH, rowHeights, colXPositions, skipRowGridAt) {
      ctx.strokeStyle = '#93C5FD';
      ctx.lineWidth = 1;
      var accY = topY;
      for (var r = 0; r < rowHeights.length - 1; r++) {
        accY += rowHeights[r];
        ctx.beginPath();
        ctx.moveTo(padX, accY);
        ctx.lineTo(padX + tableW, accY);
        ctx.stroke();
      }
      for (var c = 0; c < colXPositions.length; c++) {
        var cxPos = colXPositions[c];
        var startColY = (skipRowGridAt && c > 0) ? (topY + skipRowGridAt) : topY;
        ctx.beginPath();
        ctx.moveTo(cxPos, startColY);
        ctx.lineTo(cxPos, topY + totalH);
        ctx.stroke();
      }
      ctx.strokeStyle = '#3B82F6';
      ctx.lineWidth = 1.6;
      ctx.strokeRect(padX, topY, tableW, totalH);
    }

    // 3. BẢNG 1: TỨ TRỤ
    var t1Cols = [padX + labelW, padX + labelW + col4W, padX + labelW + col4W * 2, padX + labelW + col4W * 3];
    drawGridBorders(yT1, t1TotalH, t1Heights, t1Cols, 0);

    var t1Labels = [
      ['DƯƠNG', 'LỊCH'],
      ['THIÊN', 'CAN'],
      ['BÁT', 'TỰ'],
      ['ĐỊA', 'CHI'],
      ['VƯỢNG', 'SUY']
    ];
    var rowY = yT1;
    for (var ri = 0; ri < 5; ri++) {
      drawStackedLabel(ctx, t1Labels[ri], padX + labelW / 2, rowY, t1Heights[ri], '700 15px Roboto, sans-serif', '#1E293B');
      rowY += t1Heights[ri];
    }

    var pillars = [p.year, p.month, p.day, p.hour];
    var vs = res.vuongSuy || (res.analysis && res.analysis.vuongSuy);
    var vsList = vs && vs.pillarVuongSuy
      ? [vs.pillarVuongSuy.year, vs.pillarVuongSuy.month, vs.pillarVuongSuy.day, vs.pillarVuongSuy.hour]
      : ['-', '-', '-', '-'];

    ctx.textBaseline = 'middle';
    ctx.textAlign = 'center';
    for (var pi = 0; pi < 4; pi++) {
      var pil = pillars[pi] || {};
      var cellCx = padX + labelW + col4W * pi + col4W / 2;

      // Hàng 1: Dương Lịch
      ctx.font = '700 20px Roboto, sans-serif';
      ctx.fillStyle = '#0F172A';
      ctx.fillText(pil.solarDateText || '', cellCx, yT1 + t1Heights[0] / 2);

      // Hàng 2: Chủ Tinh / Nhật Chủ
      var yR2 = yT1 + t1Heights[0];
      if (pi === 2) {
        drawStackedLabel(ctx, ['NHẬT', 'CHỦ'], cellCx, yR2, t1Heights[1], '700 18.5px Roboto, sans-serif', '#0F172A');
      } else {
        ctx.font = '700 19.5px Roboto, sans-serif';
        ctx.fillStyle = '#0F172A';
        ctx.fillText(pil.thapThanCan || '', cellCx, yR2 + t1Heights[1] / 2);
      }

      // Hàng 3: Can Chi Lớn (Bát Tự)
      var yR3 = yR2 + t1Heights[1];
      ctx.font = '700 44px Roboto, sans-serif';
      ctx.fillStyle = pil.canColor || '#0F172A';
      ctx.fillText((pil.canName || '').toUpperCase(), cellCx, yR3 + t1Heights[2] * 0.30);
      ctx.fillStyle = pil.chiColor || '#0F172A';
      ctx.fillText((pil.chiName || '').toUpperCase(), cellCx, yR3 + t1Heights[2] * 0.72);

      // Hàng 4: Địa Chi Thập Thần
      var yR4 = yR3 + t1Heights[2];
      ctx.font = '700 19.5px Roboto, sans-serif';
      ctx.fillStyle = '#0F172A';
      ctx.fillText(pil.thapThanChi || '', cellCx, yR4 + t1Heights[3] / 2);

      // Hàng 5: Vượng Suy
      var yR5 = yR4 + t1Heights[3];
      ctx.font = '700 19px Roboto, sans-serif';
      ctx.fillStyle = '#0F172A';
      ctx.fillText(vsList[pi] || '-', cellCx, yR5 + t1Heights[4] / 2);
    }
    ctx.textBaseline = 'alphabetic';

    // 4. BẢNG 2: 20 TINH SÁT (2 hàng x 10 cột)
    var tsList = (Array.isArray(res.full20TinhSat) && res.full20TinhSat.length === 20)
      ? res.full20TinhSat
      : (readTinhSatFromDOM() || []);

    for (var ti = 0; ti < tsList.length && ti < 20; ti++) {
      var tsItem = tsList[ti];
      var tRow = Math.floor(ti / 10);
      var tCol = ti % 10;
      var cellX = padX + labelW + tCol * col10W;
      var cellY = yT2 + tRow * tsRowH;
      if (tsItem.isActive) {
        ctx.fillStyle = '#FEF08A';
        ctx.fillRect(cellX, cellY, col10W, tsRowH);
      }
    }

    var cols10 = [padX + labelW];
    for (var c10 = 1; c10 < 10; c10++) cols10.push(padX + labelW + c10 * col10W);
    drawGridBorders(yT2, t2TotalH, [tsRowH, tsRowH], cols10, 0);
    drawStackedLabel(ctx, ['TINH', 'SÁT'], padX + labelW / 2, yT2, t2TotalH, '700 15px Roboto, sans-serif', '#1E293B');

    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    for (var ti2 = 0; ti2 < tsList.length && ti2 < 20; ti2++) {
      var item = tsList[ti2];
      var rIdx = Math.floor(ti2 / 10);
      var cIdx = ti2 % 10;
      var cCx = padX + labelW + cIdx * col10W + col10W / 2;
      var cTopY = yT2 + rIdx * tsRowH;
      var txtColor = item.isActive ? '#78350F' : '#0F172A';

      var nameLines = wrapLinesForCell(ctx, item.name, '600 14.5px Roboto, sans-serif', col10W - 10);
      var valLines = wrapLinesForCell(ctx, item.val || '-', '400 14px Roboto, sans-serif', col10W - 10);
      var totalLines = nameLines.length + valLines.length;
      var lineStep = totalLines >= 4 ? 17 : 19;
      var blockStartY = cTopY + tsRowH / 2 - ((totalLines - 1) * lineStep) / 2;

      ctx.font = '600 14.5px Roboto, sans-serif';
      ctx.fillStyle = txtColor;
      for (var nl = 0; nl < nameLines.length; nl++) {
        ctx.fillText(nameLines[nl], cCx, blockStartY + nl * lineStep);
      }
      ctx.font = '400 14px Roboto, sans-serif';
      for (var vl = 0; vl < valLines.length; vl++) {
        ctx.fillText(valLines[vl], cCx, blockStartY + (nameLines.length + vl) * lineStep);
      }
    }
    ctx.textBaseline = 'alphabetic';

    // 5. BẢNG 3: ĐẠI VẬN (10 cột)
    var dvInfo = res.daiVan || {};
    var dvList = Array.isArray(dvInfo.list) ? dvInfo.list : [];

    // Nền nhẹ cho dòng tiêu đề Khởi Đại Vận
    ctx.fillStyle = '#F8FAFC';
    ctx.fillRect(padX + labelW, yT3, dataW, dvHeadH);

    // Tô nền cột Đại Vận đang xem / mục tiêu
    for (var dvi = 0; dvi < dvList.length && dvi < 10; dvi++) {
      var dv = dvList[dvi];
      var dx = padX + labelW + dvi * col10W;
      if (dv.isTarget) {
        ctx.fillStyle = '#FDE68A';
        ctx.fillRect(dx, yT3 + dvHeadH, col10W, dvCcH + dvMetaH);
      } else if (dv.index === selectedDaiVanIndex) {
        ctx.fillStyle = '#FEF3C7';
        ctx.fillRect(dx, yT3 + dvHeadH, col10W, dvCcH + dvMetaH);
      }
    }

    drawGridBorders(yT3, t3TotalH, [dvHeadH, dvCcH, dvMetaH], cols10, dvHeadH);
    drawStackedLabel(ctx, ['ĐẠI', 'VẬN'], padX + labelW / 2, yT3, t3TotalH, '700 15px Roboto, sans-serif', '#1E293B');

    // Text Header Khởi Đại Vận
    var dvTextX = padX + labelW + 16;
    var dvLine1Spans = [
      { text: 'Khởi đại vận: ', font: '700 16px Roboto, sans-serif', color: '#0F172A' },
      { text: 'Nhập vận ', font: '400 16px Roboto, sans-serif', color: '#0F172A' }
    ];
    if (dvInfo.startSolarDateStr) {
      dvLine1Spans.push({ text: 'ngày ', font: '400 16px Roboto, sans-serif', color: '#0F172A' });
      dvLine1Spans.push({ text: dvInfo.startSolarDateStr + ' ', font: '700 16px Roboto, sans-serif', color: '#1D4ED8' });
    }
    var daysPart = dvInfo.startDays ? (' ' + dvInfo.startDays + ' ngày') : '';
    dvLine1Spans.push({
      text: '(lúc ' + (dvInfo.startYears || 0) + ' tuổi ' + (dvInfo.startMonths || 0) + ' tháng' + daysPart + ', chu kỳ 10 năm)',
      font: '400 15.5px Roboto, sans-serif',
      color: '#475569'
    });
    drawSpansLeft(ctx, dvLine1Spans, dvTextX, yT3 + 29);

    ctx.textAlign = 'left';
    ctx.font = '400 15.5px Roboto, sans-serif';
    ctx.fillStyle = '#334155';
    ctx.fillText(dvInfo.tietKhiRangeText || dvInfo.jieQiInfoText || '', dvTextX, yT3 + 55);

    for (var dvi2 = 0; dvi2 < dvList.length && dvi2 < 10; dvi2++) {
      var dv2 = dvList[dvi2];
      var dCx = padX + labelW + dvi2 * col10W + col10W / 2;
      drawCenteredPair(ctx, dv2.canName, '700 18.5px Roboto, sans-serif', dv2.canColor, dv2.thapThanCan, '400 15.5px Roboto, sans-serif', '#334155', dCx, yT3 + dvHeadH + 34);
      drawCenteredPair(ctx, dv2.chiName, '700 18.5px Roboto, sans-serif', dv2.chiColor, dv2.thapThanChi, '400 15.5px Roboto, sans-serif', '#334155', dCx, yT3 + dvHeadH + 68);

      ctx.textAlign = 'center';
      ctx.font = '400 15px Roboto, sans-serif';
      ctx.fillStyle = '#334155';
      ctx.fillText(dv2.ageRangeText || '', dCx, yT3 + dvHeadH + dvCcH + 26);
      ctx.font = '700 17px Roboto, sans-serif';
      ctx.fillStyle = '#0F172A';
      ctx.fillText(String(dv2.solarYearStart || ''), dCx, yT3 + dvHeadH + dvCcH + 52);
    }

    // 6. BẢNG 4: LƯU NIÊN — TIỂU VẬN (10 cột)
    var lnList = (typeof res.getLuuNienForDaiVan === 'function')
      ? res.getLuuNienForDaiVan(selectedDaiVanIndex)
      : [];

    for (var lni = 0; lni < lnList.length && lni < 10; lni++) {
      var lnItem = lnList[lni];
      var lx = padX + labelW + lni * col10W;
      if (lnItem.isTarget) {
        ctx.fillStyle = '#FDE68A';
        ctx.fillRect(lx, yT4, col10W, t4TotalH);
      } else if (lnItem.isTransitionYear) {
        ctx.fillStyle = '#EFF6FF';
        ctx.fillRect(lx, yT4, col10W, t4TotalH);
      }
    }

    drawGridBorders(yT4, t4TotalH, [lnCcH, lnMetaH, lnTvH], cols10, 0);

    var bdayTag = '';
    if (res.birthdayShortStr) {
      bdayTag = '(' + res.birthdayShortStr + ')';
    } else if (inp.birthDateStr) {
      var bParts = inp.birthDateStr.split('/');
      if (bParts.length >= 2) bdayTag = '(' + bParts[0] + '/' + bParts[1] + ')';
    }
    var lnSideLines = ['LƯU', 'NIÊN', '—', 'TIỂU', 'VẬN'];
    if (bdayTag) lnSideLines.push(bdayTag);
    drawStackedLabel(ctx, lnSideLines, padX + labelW / 2, yT4, t4TotalH, '700 14.5px Roboto, sans-serif', '#1E293B');

    for (var lni2 = 0; lni2 < lnList.length && lni2 < 10; lni2++) {
      var ln = lnList[lni2];
      var lCx = padX + labelW + lni2 * col10W + col10W / 2;

      drawCenteredPair(ctx, ln.canName, '700 18px Roboto, sans-serif', ln.canColor, ln.thapThanCan, '400 15px Roboto, sans-serif', '#334155', lCx, yT4 + 30);
      drawCenteredPair(ctx, ln.chiName, '700 18px Roboto, sans-serif', ln.chiColor, ln.thapThanChi, '400 15px Roboto, sans-serif', '#334155', lCx, yT4 + 62);

      var yMeta = yT4 + lnCcH;
      ctx.textAlign = 'center';
      ctx.font = '700 17.5px Roboto, sans-serif';
      ctx.fillStyle = '#0F172A';
      ctx.fillText(String(ln.year || ''), lCx, yMeta + 25);
      ctx.font = '400 15px Roboto, sans-serif';
      ctx.fillStyle = '#334155';
      ctx.fillText(String(ln.age || '') + 't', lCx, yMeta + 50);

      var yTv = yMeta + lnMetaH;
      drawCenteredPair(ctx, ln.tvCanName1, '700 16.5px Roboto, sans-serif', ln.tvCanColor1, ln.tvThapThan1, '400 14.5px Roboto, sans-serif', '#334155', lCx, yTv + 28);
      ctx.textAlign = 'center';
      ctx.font = '400 15px Roboto, sans-serif';
      ctx.fillStyle = '#64748B';
      ctx.fillText('↓', lCx, yTv + 54);
      drawCenteredPair(ctx, ln.tvCanName2, '700 16.5px Roboto, sans-serif', ln.tvCanColor2, ln.tvThapThan2, '400 14.5px Roboto, sans-serif', '#334155', lCx, yTv + 82);
    }

    // 7. BẢNG 5: 10 THIÊN CAN VƯỢNG SUY
    drawGridBorders(yT5, t5TotalH, [tcRowH, tcRowH], cols10, 0);
    drawStackedLabel(ctx, ['10', 'CAN'], padX + labelW / 2, yT5, t5TotalH, '700 15px Roboto, sans-serif', '#1E293B');

    var stems = (vs && Array.isArray(vs.tenStemsVuongSuy) && vs.tenStemsVuongSuy.length === 10)
      ? vs.tenStemsVuongSuy
      : CAN.map(function (cName) { return { canName: cName, status: '-', color: '#0F172A' }; });

    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    for (var si = 0; si < 10; si++) {
      var st = stems[si];
      var sCx = padX + labelW + si * col10W + col10W / 2;
      ctx.font = '700 18.5px Roboto, sans-serif';
      ctx.fillStyle = st.color || '#0F172A';
      ctx.fillText(st.canName || '', sCx, yT5 + tcRowH / 2);

      ctx.font = '400 17px Roboto, sans-serif';
      ctx.fillStyle = '#0F172A';
      ctx.fillText(st.status || '-', sCx, yT5 + tcRowH + tcRowH / 2);
    }
    ctx.textBaseline = 'alphabetic';

    // 8. Chân trang bản quyền & Chú giải Ngũ Hành
    drawSpansLeft(ctx, [
      { text: 'Lá số được lập tại website: ', font: '400 16px Roboto, sans-serif', color: '#334155' },
      { text: 'https://luchao.io.vn/bat-tu', font: '700 16px Roboto, sans-serif', color: '#1D4ED8' }
    ], padX + 4, footerY);

    var legendItems = [
      { label: 'Kim', color: '#52525B' },
      { label: 'Mộc', color: '#008000' },
      { label: 'Thủy', color: '#08078D' },
      { label: 'Hỏa', color: '#E60000' },
      { label: 'Thổ', color: '#8C4817' }
    ];
    ctx.font = '700 16px Roboto, sans-serif';
    var legX = W - padX - 4;
    for (var li = legendItems.length - 1; li >= 0; li--) {
      var lg = legendItems[li];
      var tw = ctx.measureText(lg.label).width;
      ctx.textAlign = 'right';
      ctx.fillStyle = '#0F172A';
      ctx.fillText(lg.label, legX, footerY);
      ctx.fillStyle = lg.color;
      ctx.fillRect(legX - tw - 18, footerY - 12, 13, 13);
      legX -= (tw + 36);
    }

    return canvas;
  }

  global.BaziCanvasRenderer = {
    renderBaziToCanvas: renderBaziToCanvas
  };
})(typeof window !== 'undefined' ? window : this);
