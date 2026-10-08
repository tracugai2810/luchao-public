(function() {
  'use strict';

  const MOUNTAINS_24 = [
    { name: 'Nhâm', center: 345 },
    { name: 'Tý',   center: 0   },
    { name: 'Quý',  center: 15  },
    { name: 'Sửu',  center: 30  },
    { name: 'Cấn',  center: 45  },
    { name: 'Dần',  center: 60  },
    { name: 'Giáp', center: 75  },
    { name: 'Mão',  center: 90  },
    { name: 'Ất',   center: 105 },
    { name: 'Thìn', center: 120 },
    { name: 'Tốn',  center: 135 },
    { name: 'Tỵ',   center: 150 },
    { name: 'Bính', center: 165 },
    { name: 'Ngọ',  center: 180 },
    { name: 'Đinh', center: 195 },
    { name: 'Mùi',  center: 210 },
    { name: 'Khôn', center: 225 },
    { name: 'Thân', center: 240 },
    { name: 'Canh', center: 255 },
    { name: 'Dậu',  center: 270 },
    { name: 'Tân',  center: 285 },
    { name: 'Tuất', center: 300 },
    { name: 'Càn',  center: 315 },
    { name: 'Hợi',  center: 330 },
  ];

  const DIRECTIONS_8 = [
    { name: 'BẮC',  center: 0   },
    { name: 'ĐB',   center: 45  },
    { name: 'ĐÔNG', center: 90  },
    { name: 'ĐN',   center: 135 },
    { name: 'NAM',  center: 180 },
    { name: 'TN',   center: 225 },
    { name: 'TÂY',  center: 270 },
    { name: 'TB',   center: 315 },
  ];

  const PALACE_CENTER_DEG = {
    1: 0, 2: 225, 3: 90, 4: 135, 6: 315, 7: 270, 8: 45, 9: 180
  };

  const PALACE_TO_DIR_DEG = {
    1: 0,    // Bắc (Khảm)
    2: 225,  // Tây Nam (Khôn)
    3: 90,   // Đông (Chấn)
    4: 135,  // Đông Nam (Tốn)
    5: null, // Trung Cung (Tâm)
    6: 315,  // Tây Bắc (Càn)
    7: 270,  // Tây (Đoài)
    8: 45,   // Đông Bắc (Cấn)
    9: 180   // Nam (Ly)
  };

  /**
   * Converts a compass degree to a canvas API angle (in radians).
   * 0° (North) is at BOTTOM, 90° (East) at LEFT, 180° (South) at TOP, 270° (West) at RIGHT.
   */
  function compassToCanvasAngle(compassDeg) {
    return (compassDeg + 90) * Math.PI / 180;
  }

  /**
   * Returns the absolute {x,y} coordinates on a circle given center, radius, and compass degree.
   */
  function getXY(cx, cy, radius, compassDeg) {
    const angle = compassToCanvasAngle(compassDeg);
    return {
      x: cx + radius * Math.cos(angle),
      y: cy + radius * Math.sin(angle)
    };
  }

  /**
   * Draws the outline of a circle.
   */
  function drawCircle(ctx, cx, cy, radius, strokeColor, lineWidth, dashArray) {
    ctx.save();
    if (dashArray) ctx.setLineDash(dashArray);
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, 2 * Math.PI);
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = lineWidth;
    ctx.stroke();
    ctx.restore();
  }

  /**
   * Safe rounded rect helper that supports all browsers.
   */
  function drawRoundRect(ctx, x, y, w, h, r) {
    if (typeof ctx.roundRect === 'function') {
      ctx.roundRect(x, y, w, h, r);
    } else {
      ctx.moveTo(x + r, y);
      ctx.lineTo(x + w - r, y);
      ctx.quadraticCurveTo(x + w, y, x + w, y + r);
      ctx.lineTo(x + w, y + h - r);
      ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
      ctx.lineTo(x + r, y + h);
      ctx.quadraticCurveTo(x, y + h, x, y + h - r);
      ctx.lineTo(x, y + r);
      ctx.quadraticCurveTo(x, y, x + r, y);
    }
  }

  /**
   * Draws a radial line between two radii at a specified compass degree.
   */
  function drawRadialLine(ctx, cx, cy, r1, r2, compassDeg, color, lineWidth, dashArray) {
    const p1 = getXY(cx, cy, r1, compassDeg);
    const p2 = getXY(cx, cy, r2, compassDeg);
    ctx.save();
    if (dashArray) ctx.setLineDash(dashArray);
    ctx.beginPath();
    ctx.moveTo(p1.x, p1.y);
    ctx.lineTo(p2.x, p2.y);
    ctx.strokeStyle = color;
    ctx.lineWidth = lineWidth;
    ctx.stroke();
    ctx.restore();
  }

  /**
   * Draws tangential text (readable from outside the circle) at the specified position.
   */
  function drawText(ctx, cx, cy, radius, compassDeg, text, font, color, withHalo) {
    const pos = getXY(cx, cy, radius, compassDeg);
    const textRotation = (compassDeg + 180) * Math.PI / 180;
    
    ctx.save();
    ctx.translate(pos.x, pos.y);
    ctx.rotate(textRotation);
    ctx.font = font;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    if (withHalo) {
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 4.5;
      ctx.lineJoin = 'round';
      ctx.strokeText(text, 0, 0);
    }
    ctx.fillStyle = color;
    ctx.fillText(text, 0, 0);
    ctx.restore();
  }

  /**
   * Draws an arrowhead pointing radially outward along the given compass degree.
   */
  function drawArrowhead(ctx, cx, cy, radius, compassDeg, size, color) {
    const pos = getXY(cx, cy, radius, compassDeg);
    const angle = compassToCanvasAngle(compassDeg);
    
    ctx.save();
    ctx.translate(pos.x, pos.y);
    ctx.rotate(angle);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(-size, -size * 0.45);
    ctx.lineTo(-size * 0.65, 0);
    ctx.lineTo(-size, size * 0.45);
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.fill();
    ctx.restore();
  }

  /**
   * Draws a flat tail crossbar (đuôi ngang) at the TỌA end perpendicular to the radial ray.
   */
  function drawTailBar(ctx, cx, cy, radius, compassDeg, length, color, lineWidth) {
    const pos = getXY(cx, cy, radius, compassDeg);
    const angle = compassToCanvasAngle(compassDeg);
    const perpAngle = angle + Math.PI / 2;
    const half = length / 2;
    const x1 = pos.x + half * Math.cos(perpAngle);
    const y1 = pos.y + half * Math.sin(perpAngle);
    const x2 = pos.x - half * Math.cos(perpAngle);
    const y2 = pos.y - half * Math.sin(perpAngle);

    ctx.save();
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.strokeStyle = color;
    ctx.lineWidth = lineWidth || 4;
    ctx.lineCap = 'round';
    ctx.stroke();
    ctx.restore();
  }

  /**
   * Draws a star trio badge: [Sao Sơn (Xanh Dương)] [Sao Vận (Lớn)] [Sao Hướng (Đỏ)]
   * positioned directly in the given direction sector.
   * UX/UI Optimized: Always renders in standard horizontal orientation (chiều chuẩn)
   * with a frosted white pill backdrop to guarantee crystal-clear contrast and legibility
   * over any complex blueprint, photo, or compass radial lines.
   */
  function drawSectorStarTrio(ctx, x, y, rotation, s, son, van, huong, isCenter, hasThanhMon) {
    ctx.save();
    ctx.translate(x, y);
    if (rotation !== 0) {
      ctx.rotate(rotation);
    }

    const offsetSide = isCenter ? 24 * s : 22 * s;
    const sonW = 19 * s;
    const sonH = 21 * s;
    const huongR = 10.5 * s;

    // 1. Sao Sơn (Left) - Blue Rounded Badge (đồng bộ màu Xanh với TỌA)
    ctx.save();
    ctx.shadowColor = 'rgba(0, 0, 0, 0.25)';
    ctx.shadowBlur = 3 * s;
    ctx.shadowOffsetY = 1 * s;
    ctx.fillStyle = '#1d4ed8';
    ctx.strokeStyle = '#1e40af';
    ctx.lineWidth = 1 * s;
    ctx.beginPath();
    drawRoundRect(ctx, -offsetSide - sonW / 2, -sonH / 2, sonW, sonH, 3.5 * s);
    ctx.fill();
    ctx.stroke();
    ctx.restore();

    ctx.fillStyle = '#ffffff';
    ctx.font = `900 ${Math.round(14 * s)}px "Inter", "Noto Sans", sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(son !== undefined ? son.toString() : '-', -offsetSide, 0.8 * s);

    // 2. Sao Vận (Center) - Large Bold Number with crisp white halo outline (100% transparent around it)
    ctx.font = `900 ${Math.round(isCenter ? 20 * s : 17.5 * s)}px "Inter", "Noto Sans", sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 3.5 * s;
    ctx.lineJoin = 'round';
    ctx.strokeText(van !== undefined ? van.toString() : '-', 0, 0.8 * s);
    ctx.fillStyle = isCenter ? '#1d4ed8' : '#0f172a';
    ctx.fillText(van !== undefined ? van.toString() : '-', 0, 0.8 * s);

    // 3. Sao Hướng (Right) - Red Circular Badge (đồng bộ màu Đỏ với HƯỚNG)
    ctx.save();
    ctx.shadowColor = 'rgba(0, 0, 0, 0.25)';
    ctx.shadowBlur = 3 * s;
    ctx.shadowOffsetY = 1 * s;
    ctx.fillStyle = '#dc2626';
    ctx.strokeStyle = '#b91c1c';
    ctx.lineWidth = 1 * s;
    ctx.beginPath();
    ctx.arc(offsetSide, 0, huongR, 0, 2 * Math.PI);
    ctx.fill();
    ctx.stroke();
    ctx.restore();

    ctx.fillStyle = '#ffffff';
    ctx.font = `900 ${Math.round(14 * s)}px "Inter", "Noto Sans", sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(huong !== undefined ? huong.toString() : '-', offsetSide, 0.8 * s);

    // 4. Thành Môn Small Door Icon (nhỏ nhắn, nằm ngay trên số Vận, không che số, không che nền)
    if (hasThanhMon) {
      ctx.save();
      ctx.font = `${Math.round(13 * s)}px "Segoe UI Emoji", "Apple Color Emoji", "Noto Color Emoji", sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.shadowColor = 'rgba(255, 255, 255, 0.95)';
      ctx.shadowBlur = 4 * s;
      ctx.fillText('🚪', 0, -16 * s);
      ctx.restore();
    }

    ctx.restore();
  }

  /**
   * Renders the La Bàn (compass) to the given canvas.
   * Supports rendering sector stars directly in the 8 directions + Center.
   * Supports minimalMode for clean, blueprint-friendly 8-palace architectural overlay.
   */
  function render(canvas, facingDegree, facingPalace, options) {
    options = options || {};
    const showGuideLines = options.showGuideLines !== false;
    const showSectorStars = !!options.showSectorStars;
    const palaces = options.palaces || null;
    const isMinimal = !!options.minimalMode;
    const thanhMon = options.thanhMon || null;
    const overlayRotation = options.overlayRotation || 0;

    // 1. Set canvas resolution to 1000x1000
    canvas.width = 1000;
    canvas.height = 1000;
    const ctx = canvas.getContext('2d');
    const cx = canvas.width / 2;
    const cy = canvas.height / 2;
    const s = 1000 / 600; // Scale factor

    // 2. Clear canvas with transparency
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 3. Calculate rotation so that the facing palace is at the TOP (180° on canvas compass map)
    const palaceDeg = (PALACE_CENTER_DEG && PALACE_CENTER_DEG[facingPalace] !== undefined) ? PALACE_CENTER_DEG[facingPalace] : 180;
    const rotDeg = -(palaceDeg - 180);

    // 4. Counter-rotation so star badges remain 100% horizontal & upright (chiều chuẩn) to the user's eyes
    const totalBaseRotDeg = rotDeg + overlayRotation;
    const starRot = -totalBaseRotDeg * Math.PI / 180;

    // 5. Apply main rotation
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(rotDeg * Math.PI / 180);
    ctx.translate(-cx, -cy);

    // Radii in scaled units
    const R_OUTER = 290 * s;

    // ============================================================
    // MODE 0: CHẾ ĐỘ CHỈ MŨI TÊN TỌA - HƯỚNG (MAIN CHART CLEAN VIEW)
    // ============================================================
    if (options.arrowsOnly) {
      const sittingDegree = (facingDegree + 180) % 360;
      const R_ARROW_OUT = 294 * s;
      const R_GRID_BASE = 250 * s;

      // Subtle boundary guide ring
      drawCircle(ctx, cx, cy, R_ARROW_OUT + 2 * s, 'rgba(15, 23, 42, 0.12)', 1.2 * s, [6 * s, 6 * s]);

      // HƯỚNG (Facing) - Bold Red Ray & Arrowhead
      drawRadialLine(ctx, cx, cy, R_GRID_BASE, R_ARROW_OUT + 4 * s, facingDegree, '#dc2626', 4.0 * s);
      drawArrowhead(ctx, cx, cy, R_ARROW_OUT + 5 * s, facingDegree, 22 * s, '#dc2626');

      // HƯỚNG Badge
      const huongPos = getXY(cx, cy, R_ARROW_OUT - 24 * s, facingDegree);
      ctx.save();
      ctx.translate(huongPos.x, huongPos.y);
      ctx.fillStyle = '#dc2626';
      ctx.beginPath();
      drawRoundRect(ctx, -24 * s, -10 * s, 48 * s, 20 * s, 4 * s);
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.font = `900 ${Math.round(10 * s)}px "Inter", "Noto Sans", sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('HƯỚNG', 0, 0);
      ctx.restore();

      // TỌA (Sitting) - Bold Blue Ray & Tailbar
      drawRadialLine(ctx, cx, cy, R_GRID_BASE, R_ARROW_OUT + 4 * s, sittingDegree, '#1d4ed8', 4.0 * s);
      drawTailBar(ctx, cx, cy, R_ARROW_OUT + 4 * s, sittingDegree, 30 * s, '#1d4ed8', 5.0 * s);

      // TỌA Badge
      const toaPos = getXY(cx, cy, R_ARROW_OUT - 24 * s, sittingDegree);
      ctx.save();
      ctx.translate(toaPos.x, toaPos.y);
      ctx.fillStyle = '#1d4ed8';
      ctx.beginPath();
      drawRoundRect(ctx, -20 * s, -10 * s, 40 * s, 20 * s, 4 * s);
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.font = `900 ${Math.round(10 * s)}px "Inter", "Noto Sans", sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('TỌA', 0, 0);
      ctx.restore();

      ctx.restore();
      return;
    }

    // ============================================================
    // MODE 1: CHẾ ĐỘ TỐI GIẢN (MINIMALIST 8-PALACE OVERLAY)
    // ============================================================
    if (isMinimal) {
      const R_DIR_TEXT = 225 * s;
      const R_STAR_SECTOR = 120 * s;

      // Outer boundary dashed circle
      drawCircle(ctx, cx, cy, R_OUTER, 'rgba(15, 23, 42, 0.4)', 1.5 * s, [8 * s, 6 * s]);

      // 1. Draw 16 mountain subdivision rays (chia 3 sơn trong 1 hướng) with dashed lines
      for (let k = 0; k < 24; k++) {
        // Skip the 8 main boundary angles which are drawn as solid lines (k = 1, 4, 7, 10, 13, 16, 19, 22)
        if (k % 3 === 1) continue;
        const mountainBoundDeg = k * 15 + 7.5;
        drawRadialLine(ctx, cx, cy, 0, R_OUTER, mountainBoundDeg, 'rgba(15, 23, 42, 0.45)', 1.2 * s, [6 * s, 6 * s]);
      }

      // 2. Draw 8 main Palaces partition rays (chia 8 hướng 45°) in clean solid dark lines
      for (let i = 0; i < 8; i++) {
        const boundDeg = i * 45 + 22.5;
        drawRadialLine(ctx, cx, cy, 0, R_OUTER, boundDeg, '#0f172a', 2.0 * s);
      }

      // 8 Direction text - Compact short abbreviations (B, ĐB, Đ, ĐN, N, TN, T, TB) with white halo
      const DIR_NAMES_MINIMAL = [
        { name: 'B', center: 0 },
        { name: 'ĐB', center: 45 },
        { name: 'Đ', center: 90 },
        { name: 'ĐN', center: 135 },
        { name: 'N', center: 180 },
        { name: 'TN', center: 225 },
        { name: 'T', center: 270 },
        { name: 'TB', center: 315 },
      ];

      for (let i = 0; i < 8; i++) {
        const dir = DIR_NAMES_MINIMAL[i];
        const font = `900 ${Math.round(18 * s)}px "Inter", "Noto Sans", sans-serif`;
        drawText(ctx, cx, cy, R_DIR_TEXT, dir.center, dir.name, font, '#0f172a', true);
      }

      // Distinct HƯỚNG & TỌA rays & badges
      if (showGuideLines) {
        const sittingDegree = (facingDegree + 180) % 360;

        // HƯỚNG (Facing)
        drawRadialLine(ctx, cx, cy, 0, R_OUTER + 14 * s, facingDegree, '#dc2626', 3.5 * s);
        drawArrowhead(ctx, cx, cy, R_OUTER + 16 * s, facingDegree, 16 * s, '#dc2626');

        const huongPos = getXY(cx, cy, R_OUTER - 26 * s, facingDegree);
        ctx.save();
        ctx.translate(huongPos.x, huongPos.y);
        ctx.fillStyle = '#dc2626';
        ctx.beginPath();
        drawRoundRect(ctx, -24 * s, -9 * s, 48 * s, 18 * s, 4 * s);
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.font = `900 ${Math.round(9.5 * s)}px "Inter", "Noto Sans", sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('HƯỚNG', 0, 0);
        ctx.restore();

        // TỌA (Sitting) - Flat tail bar (đuôi ngang)
        drawRadialLine(ctx, cx, cy, 0, R_OUTER + 14 * s, sittingDegree, '#1d4ed8', 3.5 * s);
        drawTailBar(ctx, cx, cy, R_OUTER + 14 * s, sittingDegree, 24 * s, '#1d4ed8', 4 * s);

        const toaPos = getXY(cx, cy, R_OUTER - 26 * s, sittingDegree);
        ctx.save();
        ctx.translate(toaPos.x, toaPos.y);
        ctx.fillStyle = '#1d4ed8';
        ctx.beginPath();
        drawRoundRect(ctx, -20 * s, -9 * s, 40 * s, 18 * s, 4 * s);
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.font = `900 ${Math.round(9.5 * s)}px "Inter", "Noto Sans", sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('TỌA', 0, 0);
        ctx.restore();
      }

      // Render Sector Flying Stars directly in each direction sector & center (Always Upright)
      if (showSectorStars && palaces) {
        for (let p = 1; p <= 9; p++) {
          if (p === 5) continue;
          const dirDeg = PALACE_TO_DIR_DEG[p];
          const pData = palaces[p];
          const hasTM = !!(thanhMon && thanhMon.dacThanhMonPalaces && thanhMon.dacThanhMonPalaces.includes(p));
          if (pData && dirDeg !== null) {
            const starPos = getXY(cx, cy, R_STAR_SECTOR, dirDeg);
            drawSectorStarTrio(ctx, starPos.x, starPos.y, starRot, s, pData.son, pData.van, pData.huong, false, hasTM);
          }
        }

        // Draw Center Palace (Palace 5 - Trung Cung)
        const centerData = palaces[5];
        if (centerData) {
          drawSectorStarTrio(ctx, cx, cy, starRot, s, centerData.son, centerData.van, centerData.huong, true, false);
        }
      }

      // Center red dot (only if center stars are not rendered)
      if (!(showSectorStars && palaces && palaces[5])) {
        ctx.beginPath();
        ctx.arc(cx, cy, 4.5 * s, 0, 2 * Math.PI);
        ctx.fillStyle = '#dc2626';
        ctx.fill();
      }

      ctx.restore();
      return;
    }

    // ============================================================
    // MODE 2: CHẾ ĐỘ LA BÀN ĐẦY ĐỦ (FULL 24-MOUNTAIN COMPASS)
    // ============================================================
    const R_TICK_OUT = 288 * s;
    const R_TICK_IN_MINOR = 280 * s;
    const R_TICK_IN_MAJOR = 274 * s;
    const R_DEG_TEXT = 262 * s;
    const R_RING_1 = 250 * s;
    const R_MTN_TEXT = 228 * s;
    const R_RING_2 = 206 * s;
    const R_DIR_TEXT = 184 * s;
    const R_RING_3 = 162 * s;
    const R_STAR_SECTOR = 112 * s;

    // 5. Bold concentric guide circles
    drawCircle(ctx, cx, cy, R_TICK_OUT, '#dc2626', 1.8 * s);
    drawCircle(ctx, cx, cy, R_RING_1, 'rgba(220, 38, 38, 0.65)', 1.2 * s, [5 * s, 4 * s]);
    drawCircle(ctx, cx, cy, R_RING_2, 'rgba(220, 38, 38, 0.65)', 1.2 * s, [5 * s, 4 * s]);
    drawCircle(ctx, cx, cy, R_RING_3, 'rgba(220, 38, 38, 0.8)', 1.5 * s);

    // 6. Connecting radial lines extending ALL THE WAY TO THE VERY CENTER (tận tâm 0,0)
    if (showGuideLines) {
      // 24 Mountains rays: connecting from center (0) out to R_TICK_OUT
      for (let i = 0; i < 24; i++) {
        const boundDeg = i * 15 - 7.5;
        drawRadialLine(ctx, cx, cy, 0, R_TICK_OUT, boundDeg, 'rgba(220, 38, 38, 0.55)', 1.1 * s, [4 * s, 3 * s]);
      }

      // 8 Palaces boundary rays: connecting from center (0) out to R_OUTER in solid bold red
      for (let i = 0; i < 8; i++) {
        const boundDeg = i * 45 + 22.5;
        drawRadialLine(ctx, cx, cy, 0, R_OUTER, boundDeg, '#dc2626', 2.0 * s);
        drawArrowhead(ctx, cx, cy, R_OUTER - 2 * s, boundDeg, 12 * s, '#dc2626');
      }

      // 8 Direction center rays: from center (0) out to R_RING_1
      for (let i = 0; i < 8; i++) {
        const dirDeg = DIRECTIONS_8[i].center;
        drawRadialLine(ctx, cx, cy, 0, R_RING_1, dirDeg, '#b91c1c', 1.6 * s, [6 * s, 4 * s]);
      }
    }

    // 7. Degree ticks (every 5°, numbers every 10°) - BOLD & HIGH CONTRAST
    for (let d = 0; d < 360; d++) {
      if (d % 5 === 0) {
        const isMajor = d % 10 === 0;
        const tickInR = isMajor ? R_TICK_IN_MAJOR : R_TICK_IN_MINOR;
        const isCardinal = (d === 0 || d === 90 || d === 180 || d === 270);
        const tickColor = isCardinal ? '#dc2626' : (isMajor ? '#000000' : '#dc2626');
        const tickWidth = isMajor ? 2.0 * s : 1.2 * s;
        drawRadialLine(ctx, cx, cy, R_TICK_OUT, tickInR, d, tickColor, tickWidth);

        if (isMajor) {
          const textColor = isCardinal ? '#dc2626' : '#000000';
          const font = isCardinal 
            ? `900 ${Math.round(11 * s)}px "Inter", "Noto Sans", sans-serif`
            : `bold ${Math.round(9.5 * s)}px "Inter", "Noto Sans", sans-serif`;
          drawText(ctx, cx, cy, R_DEG_TEXT, d, d.toString(), font, textColor);
        }
      }
    }

    // 8. 24 Mountains text - BOLD SOLID BLACK
    for (let i = 0; i < 24; i++) {
      const mtn = MOUNTAINS_24[i];
      const font = `bold ${Math.round(12 * s)}px "Noto Sans", "Inter", sans-serif`;
      drawText(ctx, cx, cy, R_MTN_TEXT, mtn.center, mtn.name, font, '#000000');
    }

    // 9. 8 Directions text - BOLD VIVID RED
    for (let i = 0; i < 8; i++) {
      const dir = DIRECTIONS_8[i];
      const font = `900 ${Math.round(16 * s)}px "Inter", "Noto Sans", sans-serif`;
      drawText(ctx, cx, cy, R_DIR_TEXT, dir.center, dir.name, font, '#dc2626');
    }

    // 10. Distinct HƯỚNG & TỌA rays & badges (connecting from center to outer ring)
    if (showGuideLines) {
      const sittingDegree = (facingDegree + 180) % 360;

      // HƯỚNG (Facing) - Heavy Red ray into center
      drawRadialLine(ctx, cx, cy, 0, R_OUTER + 12 * s, facingDegree, '#dc2626', 3.8 * s);
      drawArrowhead(ctx, cx, cy, R_OUTER + 14 * s, facingDegree, 18 * s, '#dc2626');

      // HƯỚNG badge
      const huongPos = getXY(cx, cy, R_OUTER - 26 * s, facingDegree);
      ctx.save();
      ctx.translate(huongPos.x, huongPos.y);
      ctx.fillStyle = '#dc2626';
      ctx.beginPath();
      drawRoundRect(ctx, -24 * s, -9 * s, 48 * s, 18 * s, 4 * s);
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.font = `900 ${Math.round(9.5 * s)}px "Inter", "Noto Sans", sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('HƯỚNG', 0, 0);
      ctx.restore();

      // TỌA (Sitting) - Heavy Blue ray with flat tail crossbar (đuôi ngang)
      drawRadialLine(ctx, cx, cy, 0, R_OUTER + 12 * s, sittingDegree, '#1d4ed8', 3.8 * s);
      drawTailBar(ctx, cx, cy, R_OUTER + 12 * s, sittingDegree, 26 * s, '#1d4ed8', 4.5 * s);

      // TỌA badge
      const toaPos = getXY(cx, cy, R_OUTER - 26 * s, sittingDegree);
      ctx.save();
      ctx.translate(toaPos.x, toaPos.y);
      ctx.fillStyle = '#1d4ed8';
      ctx.beginPath();
      drawRoundRect(ctx, -20 * s, -9 * s, 40 * s, 18 * s, 4 * s);
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.font = `900 ${Math.round(9.5 * s)}px "Inter", "Noto Sans", sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('TỌA', 0, 0);
      ctx.restore();
    }

    // 11. Render Sector Flying Stars directly in each direction sector & center (Always Upright)
    if (showSectorStars && palaces) {
      // Draw 8 outer palace sectors
      for (let p = 1; p <= 9; p++) {
        if (p === 5) continue; // handle center separately
        const dirDeg = PALACE_TO_DIR_DEG[p];
        const pData = palaces[p];
        const hasTM = !!(thanhMon && thanhMon.dacThanhMonPalaces && thanhMon.dacThanhMonPalaces.includes(p));
        if (pData && dirDeg !== null) {
          const starPos = getXY(cx, cy, R_STAR_SECTOR, dirDeg);
          drawSectorStarTrio(ctx, starPos.x, starPos.y, starRot, s, pData.son, pData.van, pData.huong, false, hasTM);
        }
      }

      // Draw Center Palace (Palace 5 - Trung Cung)
      const centerData = palaces[5];
      if (centerData) {
        drawSectorStarTrio(ctx, cx, cy, starRot, s, centerData.son, centerData.van, centerData.huong, true, false);
      }
    }

    // 12. Restore context
    ctx.restore();
  }

  // Expose module functionality
  window.Compass = {
    render: render,
    PALACE_CENTER_DEG: PALACE_CENTER_DEG,
    PALACE_TO_DIR_DEG: PALACE_TO_DIR_DEG
  };

})();
