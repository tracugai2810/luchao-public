// ============================================================
// Huyền Không Phi Tinh - Main UI Controller
// ============================================================

(function() {
  'use strict';

  // Grid layout: visual row/col to Lo Shu palace mapping
  // Traditional Feng Shui chart: South on top, North at bottom
  // Grid positions (row, col) → Palace number
  // Original array not used directly anymore due to dynamic rotation
  // const GRID_MAP = [
  //   [4, 9, 2],
  //   [3, 5, 7],
  //   [8, 1, 6],
  // ];

  // DOM Elements
  let inputDegree;
  let inputYear;
  let inputVan;
  let inputCurrentDateTime;
  let badgeCanhGio;
  let badgeTietKhi;
  let inputOwnerYear;
  let inputOwnerGender;
  let btnCalculate;
  let btnCopyText;
  let warningBox;
  let ownerInfo;
  let chartInfo;
  let infoMain;
  let chartContainer;
  let chartGrid;
  let infoPanel;
  let legendSection;
  let actionContainer;
  let btnDownload;
  let exportArea;
  let imageResultContainer;
  let finalImage;
  
  let currentResult = null; // Store result for copy functionality

  function formatDateTimeLocal(d) {
    const pad = n => String(n).padStart(2, '0');
    const y = d.getFullYear();
    const m = pad(d.getMonth() + 1);
    const day = pad(d.getDate());
    const h = pad(d.getHours());
    const min = pad(d.getMinutes());
    return `${y}-${m}-${day}T${h}:${min}`;
  }

  function parseCurrentDateTime() {
    inputCurrentDateTime = inputCurrentDateTime || document.getElementById('inputCurrentDateTime');
    const now = new Date();
    if (!inputCurrentDateTime || !inputCurrentDateTime.value) {
      return {
        year: now.getFullYear(),
        month: now.getMonth() + 1,
        day: now.getDate(),
        hour: now.getHours(),
        minute: now.getMinutes(),
        rawDate: now
      };
    }
    const val = inputCurrentDateTime.value.trim();
    const parts = val.split('T');
    let year = now.getFullYear(), month = now.getMonth() + 1, day = now.getDate();
    let hour = now.getHours(), minute = now.getMinutes();
    if (parts[0]) {
      const dParts = parts[0].split('-');
      if (dParts.length === 3) {
        year = parseInt(dParts[0], 10) || year;
        month = parseInt(dParts[1], 10) || month;
        day = parseInt(dParts[2], 10) || day;
      }
    }
    if (parts[1]) {
      const tParts = parts[1].split(':');
      if (tParts.length >= 2) {
        hour = parseInt(tParts[0], 10);
        minute = parseInt(tParts[1], 10);
        if (isNaN(hour)) hour = 8;
        if (isNaN(minute)) minute = 0;
      }
    }
    return {
      year,
      month,
      day,
      hour,
      minute,
      rawDate: new Date(year, month - 1, day, hour, minute, 0)
    };
  }

  function updateDateTimeBadges() {
    const { year, month, day, hour, minute } = parseCurrentDateTime();
    badgeCanhGio = badgeCanhGio || document.getElementById('badgeCanhGio');
    badgeTietKhi = badgeTietKhi || document.getElementById('badgeTietKhi');

    // 1. Canh Gio calculation
    let hourIdx = 1;
    if (hour >= 23 || hour < 1) hourIdx = 1;
    else hourIdx = Math.floor((hour + 1) / 2) + 1;

    const canhNames = [
      '',
      'Giờ Tý (23:00 - 00:59)',
      'Giờ Sửu (01:00 - 02:59)',
      'Giờ Dần (03:00 - 04:59)',
      'Giờ Mão (05:00 - 06:59)',
      'Giờ Thìn (07:00 - 08:59)',
      'Giờ Tỵ (09:00 - 10:59)',
      'Giờ Ngọ (11:00 - 12:59)',
      'Giờ Mùi (13:00 - 14:59)',
      'Giờ Thân (15:00 - 16:59)',
      'Giờ Dậu (17:00 - 18:59)',
      'Giờ Tuất (19:00 - 20:59)',
      'Giờ Hợi (21:00 - 22:59)'
    ];

    if (badgeCanhGio) {
      badgeCanhGio.textContent = `🕒 ${canhNames[hourIdx] || 'Giờ Tý'}`;
    }

    // 2. Solar Term calculation exact to the minute
    if (badgeTietKhi && window.FlyingStar && window.FlyingStar.getSolarTermDetails) {
      try {
        const details = window.FlyingStar.getSolarTermDetails(year, month, day, hour, minute);
        const termName = details.termName || details.rawName || 'Tiết Khí';
        const monthPart = details.monthLabel ? ` - ${details.monthLabel}` : '';
        badgeTietKhi.textContent = `🌿 Tiết ${termName}${monthPart}`;
      } catch (e) {
        console.warn('Tiet khi badge calculation error:', e);
      }
    }
  }

  // Set current real-time survey date & hour
  function setCurrentTime() {
    inputCurrentDateTime = inputCurrentDateTime || document.getElementById('inputCurrentDateTime');
    if (inputCurrentDateTime) {
      const now = new Date();
      inputCurrentDateTime.value = formatDateTimeLocal(now);
      updateDateTimeBadges();
    }
  }

  // Initialize
  function init() {
    // Detect local timezone offset in hours (e.g. +7 for VN, -5 for New York)
    if (typeof window !== 'undefined' && window.currentTzOffsetHours === undefined) {
      window.currentTzOffsetHours = -new Date().getTimezoneOffset() / 60;
    }

    // Resolve all DOM elements
    inputDegree = document.getElementById('inputDegree');
    inputYear = document.getElementById('inputYear');
    inputVan = document.getElementById('inputVan');
    inputCurrentDateTime = document.getElementById('inputCurrentDateTime');
    badgeCanhGio = document.getElementById('badgeCanhGio');
    badgeTietKhi = document.getElementById('badgeTietKhi');
    inputOwnerYear = document.getElementById('inputOwnerYear');
    inputOwnerGender = document.getElementById('inputOwnerGender');
    btnCalculate = document.getElementById('btnCalculate');
    btnCopyText = document.getElementById('btnCopyText');
    warningBox = document.getElementById('warningKhongVong');
    ownerInfo = document.getElementById('ownerInfo');
    chartInfo = document.getElementById('chartInfo');
    infoMain = document.getElementById('infoMain');
    chartContainer = document.getElementById('chartContainer');
    chartGrid = document.getElementById('chartGrid');
    infoPanel = document.getElementById('infoPanel');
    legendSection = document.getElementById('legendSection');
    actionContainer = document.getElementById('actionContainer');
    btnDownload = document.getElementById('btnDownload');
    exportArea = document.getElementById('exportArea');
    imageResultContainer = document.getElementById('imageResultContainer');
    finalImage = document.getElementById('finalImage');

    // Set real-time survey date/time automatically
    setCurrentTime();

    // Listen to changes on inputCurrentDateTime to immediately update badges
    if (inputCurrentDateTime) {
      inputCurrentDateTime.addEventListener('input', updateDateTimeBadges);
      inputCurrentDateTime.addEventListener('change', updateDateTimeBadges);
    }

  function autoDetectTimezone(selectEl) {
    if (!selectEl) return;
    try {
      const offsetMin = -new Date().getTimezoneOffset();
      const sign = offsetMin >= 0 ? '+' : '-';
      const absMin = Math.abs(offsetMin);
      const hours = String(Math.floor(absMin / 60)).padStart(2, '0');
      const mins = String(absMin % 60).padStart(2, '0');
      const tzString = `${sign}${hours}:${mins}`;

      let found = false;
      for (let i = 0; i < selectEl.options.length; i++) {
        if (selectEl.options[i].value === tzString) {
          selectEl.selectedIndex = i;
          found = true;
          break;
        }
      }

      if (!found) {
        const opt = document.createElement('option');
        opt.value = tzString;
        opt.textContent = `Vị trí hiện tại (${tzString})`;
        selectEl.insertBefore(opt, selectEl.firstChild);
        selectEl.selectedIndex = 0;
      }
    } catch (e) {
      console.warn('Auto-detect timezone error:', e);
    }
  }

  // Listen to changes on inputTimezone to immediately update timezone offset and badges
    const inputTz = document.getElementById('inputTimezone');
    if (inputTz) {
      autoDetectTimezone(inputTz);
      const updateTz = () => {
        const val = inputTz.value;
        const sign = val.startsWith('-') ? -1 : 1;
        const h = parseInt(val.slice(1, 3), 10);
        const m = parseInt(val.slice(4, 6), 10) || 0;
        window.currentTzOffsetHours = sign * (h + m / 60);
        updateDateTimeBadges();
      };
      inputTz.addEventListener('change', updateTz);
      updateTz();
    }
    
    // Auto-calculate Van on any input/change/keyup/paste/blur
    if (inputYear) {
      ['input', 'change', 'keyup', 'paste', 'blur'].forEach(evt => {
        inputYear.addEventListener(evt, updateVan);
      });
    }
    
    // Handle decimal comma → dot
    if (inputDegree) {
      ['input', 'change', 'keyup', 'paste'].forEach(evt => {
        inputDegree.addEventListener(evt, function() {
          this.value = this.value.replace(',', '.');
        });
      });
    }
    
    // Calculate button
    if (btnCalculate) {
      btnCalculate.addEventListener('click', function(e) {
        if (e) e.preventDefault();
        calculate(true);
      });
    }
    
    // Also calc on Enter key
    document.querySelectorAll('.input-field').forEach(el => {
      el.addEventListener('keydown', function(e) {
        if (e.key === 'Enter') {
          if (e) e.preventDefault();
          calculate(true);
        }
      });
    });
    
    // Download button event
    if (btnDownload) {
      btnDownload.addEventListener('click', handleDownloadButtonClick);
    }
    
    if (btnCopyText) {
      btnCopyText.addEventListener('click', copyChartToText);
    }
    
    // Initial Van calculation
    updateVan();
    
    // Do not calculate automatically on load; calculate only when user clicks 'Lập Tinh Bàn'
    
    // Initialize FloorPlan module
    if (window.FloorPlan && window.FloorPlan.init) {
      window.FloorPlan.init();
    }
  }

  function updateVan() {
    inputYear = inputYear || document.getElementById('inputYear');
    inputVan = inputVan || document.getElementById('inputVan');
    if (!inputYear || !inputVan) return;
    const rawVal = (inputYear.value || '').trim();
    const year = parseInt(rawVal, 10);
    if (!isNaN(year) && year >= 1864) {
      const van = FlyingStar.getVan(year);
      if (van !== undefined && van !== null) {
        inputVan.value = van;
      }
    }
  }

  function calculate(shouldScroll) {
    try {
      // Button press visual feedback
      if (btnCalculate) {
        btnCalculate.style.transform = 'scale(0.96)';
        setTimeout(() => { btnCalculate.style.transform = ''; }, 120);
      }

      // Parse and sanitize inputs
      let degreeStr = (inputDegree.value || '').replace(',', '.').trim();
      let degree = parseFloat(degreeStr);
      if (isNaN(degree)) degree = 180;
      degree = ((degree % 360) + 360) % 360;

      let year = parseInt((inputYear.value || '').trim(), 10);
      if (isNaN(year) || year < 1864) {
        year = 2024;
      }
      
      // Update and synchronize Van input
      const currentVan = FlyingStar.getVan(year);
      if (inputVan && currentVan) {
        inputVan.value = currentVan;
      }

      const dt = parseCurrentDateTime();
      const currentYear = dt.year;
      const currentMonth = dt.month;
      const currentDay = dt.day;
      const exactHour = dt.hour;
      const exactMinute = dt.minute;

      let currentCanh = 1;
      if (exactHour >= 23 || exactHour < 1) currentCanh = 1;
      else currentCanh = Math.floor((exactHour + 1) / 2) + 1;

      const ownerYear = parseInt(inputOwnerYear ? inputOwnerYear.value : '', 10);
      const ownerGender = parseInt(inputOwnerGender ? inputOwnerGender.value : '1', 10);
      
      // Calculate
      const result = FlyingStar.calculateChart(year, degree, currentYear, currentMonth, currentDay, exactHour, exactMinute, currentCanh);
      currentResult = result; // Save to global
      window._currentChartResult = result; // Expose for FloorPlan module
      
      let menhQuai = null;
      if (!isNaN(ownerYear) && ownerYear >= 1900) {
        menhQuai = FlyingStar.getMenhQuai(ownerYear, ownerGender);
        menhQuai.year = ownerYear;
        menhQuai.genderName = ownerGender === 1 ? 'Nam' : 'Nữ';
      }
      
      // Display
      renderResult(result, currentYear, currentMonth, currentDay, currentCanh, menhQuai, exactHour, exactMinute);

      if (shouldScroll && exportArea) {
        setTimeout(() => {
          exportArea.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 30);
      }
    } catch (err) {
      console.error('Calculate execution error:', err);
    }
  }

  function renderResult(result, currentYear, currentMonth, currentDay, currentHour, menhQuai, exactHour, exactMinute) {
    if (!result) return;
    if (imageResultContainer) imageResultContainer.classList.add('hidden');
    
    // Display exportArea directly on screen
    if (exportArea) {
      exportArea.classList.remove('hidden');
      exportArea.classList.remove('export-mode');
      exportArea.style.position = '';
      exportArea.style.left = '';
      exportArea.style.top = '';
    }
    
    if (actionContainer) actionContainer.classList.remove('hidden');
    
    // Warning Box for Không Vong
    if (warningBox) {
      if (result.chartType === 'DAI_KHONG_VONG' || result.chartType === 'TIEU_KHONG_VONG' || result.chartType === 'KHONG_VONG' || result.isKhongVong) {
        const kvInfo = result.khongVongInfo;
        const kvLabel = kvInfo ? kvInfo.label : 'Không Vong';
        const kvDesc = kvInfo ? kvInfo.desc : 'Độ số phạm tuyến Không Vong.';
        warningBox.innerHTML = `
          <div class="warning-title">🚨 CẢNH BÁO ĐẠI HÙNG SÁT: ${kvLabel.toUpperCase()}</div>
          <div class="warning-desc">${kvDesc}</div>
          <div class="warning-advice">💡 <strong>Lời khuyên hóa giải thực tế:</strong> Tuyến Không Vong là ranh giới giao thoa khí trường hỗn loạn. Gia chủ nên <strong>xoay lệch khuôn cửa chính / hướng cửa đi 2° đến 3°</strong> (về phía Chính Sơn thuần khí) để triệt để thoát khỏi đường ranh giới Không Vong trước khi bài trí nội thất.</div>
        `;
        warningBox.classList.remove('hidden');
      } else {
        warningBox.classList.add('hidden');
      }
    }
    
    // Owner info
    if (ownerInfo) {
      if (menhQuai) {
        ownerInfo.innerHTML = `Gia chủ: ${menhQuai.genderName} ${menhQuai.year} - Mệnh quái: ${menhQuai.number} - ${menhQuai.element}`;
        ownerInfo.classList.remove('hidden');
      } else {
        ownerInfo.classList.add('hidden');
        ownerInfo.innerHTML = '';
      }
    }
    
    // Chart info
    const infoMain = document.getElementById('infoMain');
    if (infoMain) {
      let infoHTML = '';
      const toaName = result.sittingMountain.name;
      const huongName = result.facingMountain.name;
      
      infoHTML += `<div class="info-main-title"><span>Tọa <strong>${toaName}</strong> - Hướng <strong>${huongName}</strong></span>`;
      
      if (result.chartType === 'THE_QUAI' && result.kiemInfo) {
        infoHTML += ` <span>- <strong>${result.kiemInfo.label}</strong></span>`;
      }
      
      // Badge
      let badgeClass, badgeText;
      if (result.chartType === 'HA_QUAI') {
        badgeClass = 'badge-ha-quai';
        badgeText = 'Hạ Quái';
      } else if (result.chartType === 'THE_QUAI') {
        badgeClass = 'badge-the-quai';
        badgeText = 'Thế Quái';
      } else if (result.chartType === 'DAI_KHONG_VONG') {
        badgeClass = 'badge-khong-vong badge-dai-kv';
        badgeText = 'Đại Không Vong';
      } else if (result.chartType === 'TIEU_KHONG_VONG') {
        badgeClass = 'badge-khong-vong badge-tieu-kv';
        badgeText = 'Tiểu Không Vong';
      } else {
        badgeClass = 'badge-khong-vong';
        badgeText = 'Không Vong';
      }
      
      infoHTML += ` <span class="chart-type-badge ${badgeClass}">${badgeText}</span></div>`;

      // Special Formation Badges
      let specialBadges = '';
      if (result.hopThap && result.hopThap.hasHopThap) {
        specialBadges += `<span class="chart-type-badge badge-hop-thap" title="${result.hopThap.label}">✨ ${result.hopThap.label}</span>`;
      }
      if (result.tamBanQuai && result.tamBanQuai.hasTamBanQuai) {
        specialBadges += `<span class="chart-type-badge badge-tam-ban" title="${result.tamBanQuai.label}">💫 ${result.tamBanQuai.label}</span>`;
      }
      if (result.thatTinhDaKiep && result.thatTinhDaKiep.hasThatTinhDaKiep) {
        specialBadges += `<span class="chart-type-badge badge-da-kiep" title="${result.thatTinhDaKiep.label}">⚡ ${result.thatTinhDaKiep.label}</span>`;
      }
      if (specialBadges) {
        infoHTML += `<div class="info-special-badges">${specialBadges}</div>`;
      }
      
      infoMain.innerHTML = infoHTML;
    }
    
    // Render Grid
    if (chartContainer) chartContainer.classList.remove('hidden');
    if (chartGrid) {
      chartGrid.innerHTML = '';
      
      const directionShort = {
        1: 'B', 2: 'TN', 3: 'Đ', 4: 'ĐN', 5: '', 6: 'TB', 7: 'T', 8: 'ĐB', 9: 'N'
      };
      
      // Standard ring starting from South (Top-Center) clockwise
      const ring = [9, 2, 7, 6, 1, 8, 3, 4];
      const visualIndices = [1, 2, 5, 8, 7, 6, 3, 0];
      const facingPalace = result.facingMountain.palace;
      
      let rotatedRing = ring;
      if (facingPalace && facingPalace !== 5) {
        const idx = ring.indexOf(facingPalace);
        if (idx !== -1) {
          rotatedRing = ring.slice(idx).concat(ring.slice(0, idx));
        }
      }
      
      const displayGrid = new Array(9);
      displayGrid[4] = 5; // Center
      for (let i = 0; i < 8; i++) {
        displayGrid[visualIndices[i]] = rotatedRing[i];
      }

      // Analyze Thanh Mon (Castle Gate)
      const tmAnalysis = (window.ThanhMonRules && window.ThanhMonRules.analyze) ? window.ThanhMonRules.analyze(result) : null;
      
      for (let i = 0; i < 9; i++) {
        const palace = displayGrid[i];
        const data = result.palaces[palace];
        if (!data) continue;
          
        const cell = document.createElement('div');
        cell.className = 'chart-cell';
        if (i === 4) cell.classList.add('center-cell');
          
        // Direction label inside cell (bottom-left area)
        const dirHTML = directionShort[palace] ? `<div class="dir-label-cell">${directionShort[palace]}</div>` : '';
        
        // Top row: Niên - Nguyệt - Nhật - Thời
        const topDiv = document.createElement('div');
        topDiv.className = 'cell-top-horizontal';
        
        let starsHTML = '';
        if (data.nien) starsHTML += `<span class="star-nien circle">${data.nien}</span>`;
        if (data.nguyet) starsHTML += `<span class="star-nguyet circle">${data.nguyet}</span>`;
        if (data.nhat) starsHTML += `<span class="star-nhat circle">${data.nhat}</span>`;
        if (data.thoi) starsHTML += `<span class="star-thoi circle">${data.thoi}</span>`;
        
        topDiv.innerHTML = starsHTML;
        
        // Check if this palace has Dac Thanh Mon Vuong Khi
        const tmInfo = (tmAnalysis && tmAnalysis.dacThanhMonDetails) ? tmAnalysis.dacThanhMonDetails[palace] : null;
        let tmIconHTML = '';
        if (tmInfo) {
          const priorityText = tmInfo.priorityType === 'CUU_CANH' ? 'Dụng Thần Cứu Giải' : 'Cẩm Thượng Thiêm Hoa';
          tmIconHTML = `<span class="tm-icon-inline" title="Đắc Thành Môn [${priorityText}]: Cung ${tmInfo.palaceName} - Sơn ${tmInfo.mountainName} (${tmInfo.typeShort})">🚪</span>`;
        }

        // Middle: Vận tinh + icon TM nhỏ đặt ngang cạnh số Vận
        const midDiv = document.createElement('div');
        midDiv.className = 'cell-middle';
        midDiv.innerHTML = `<span class="star-van">${data.van}</span>${tmIconHTML}`;
        
        // Bottom: Sơn (left) & Hướng (right)
        const botDiv = document.createElement('div');
        botDiv.className = 'cell-bottom';
        botDiv.innerHTML = `
          <span class="star-son">${data.son}</span>
          <span class="star-huong">${data.huong}</span>
        `;
        
        cell.innerHTML = dirHTML;
        cell.appendChild(topDiv);
        cell.appendChild(midDiv);
        cell.appendChild(botDiv);

        chartGrid.appendChild(cell);
      }
    }
    
    // Update floorplan overlay if active
    try {
      if (window.FloorPlan && window.FloorPlan.update) {
        window.FloorPlan.update();
      }
    } catch (e) {
      console.error('FloorPlan update error:', e);
    }
    
    // Info values
    const infoVan = document.getElementById('infoVan');
    if (infoVan) infoVan.textContent = result.van;
    
    const infoDegree = document.getElementById('infoDegree');
    if (infoDegree) infoDegree.textContent = `${result.facingDegree}°`;
    
    const infoYear = document.getElementById('infoYear');
    if (infoYear) infoYear.textContent = currentYear || '-';
    
    const infoMonth = document.getElementById('infoMonth');
    if (infoMonth) infoMonth.textContent = currentMonth || '-';
    
    const infoDay = document.getElementById('infoDay');
    if (infoDay) infoDay.textContent = currentDay || '-';
    
    const hourmap = {1:'Tý', 2:'Sửu', 3:'Dần', 4:'Mão', 5:'Thìn', 6:'Tỵ', 7:'Ngọ', 8:'Mùi', 9:'Thân', 10:'Dậu', 11:'Tuất', 12:'Hợi'};
    const infoHour = document.getElementById('infoHour');
    if (infoHour) {
      const pad = n => String(n).padStart(2, '0');
      const timeStr = (exactHour !== undefined && exactMinute !== undefined && !isNaN(exactHour) && !isNaN(exactMinute))
        ? `${pad(exactHour)}:${pad(exactMinute)}`
        : '';
      infoHour.textContent = timeStr ? `${hourmap[currentHour] || '-'} (${timeStr})` : (hourmap[currentHour] || '-');
    }

    // Render Loan Dau (Exterior landscape) recommendation
    try {
      const loanDauSection = document.getElementById('loanDauSection');
      if (loanDauSection && window.LoanDauRules) {
        const loanDauAnalysis = window.LoanDauRules.analyze(result);
        if (loanDauAnalysis) {
          loanDauSection.innerHTML = window.LoanDauRules.renderHTML(loanDauAnalysis);
          loanDauSection.classList.remove('hidden');
          window.LoanDauRules.initTabs();
        }
      }
    } catch (e) {
      console.error('LoanDauRules error:', e);
    }

    // Render Thanh Mon (Castle Gate) recommendation
    try {
      const thanhMonSection = document.getElementById('thanhMonSection');
      if (thanhMonSection && window.ThanhMonRules) {
        const tmAnalysis = window.ThanhMonRules.analyze(result);
        if (tmAnalysis) {
          thanhMonSection.innerHTML = window.ThanhMonRules.renderHTML(tmAnalysis);
          thanhMonSection.classList.remove('hidden');
        } else {
          thanhMonSection.classList.add('hidden');
        }
      }
    } catch (e) {
      console.error('ThanhMonRules error:', e);
    }

    // Render Feng Shui interpretation if module available
    try {
      const interpretationSection = document.getElementById('interpretationSection');
      if (interpretationSection && window.FengShuiRules) {
        const analysis = window.FengShuiRules.analyze(result);
        if (analysis) {
          interpretationSection.innerHTML = window.FengShuiRules.renderHTML(analysis);
          interpretationSection.classList.remove('hidden');
          window.FengShuiRules.initTabs();
        }
      }
    } catch (e) {
      console.error('FengShuiRules error:', e);
    }

    // Automatically update image snapshot for right-click copy & instant share sheet
    updateImageSnapshot();
  }

  let cachedChartFile = null;
  let cachedChartBlob = null;
  let snapshotTimer = null;

  function updateImageSnapshot() {
    clearTimeout(snapshotTimer);
    snapshotTimer = setTimeout(() => {
      const exportAreaEl = document.getElementById('exportArea');
      const imgOverlay = document.getElementById('exportAreaImgOverlay');
      if (!exportAreaEl || typeof html2canvas === 'undefined') return;

      if (imgOverlay) imgOverlay.style.display = 'none';

      html2canvas(exportAreaEl, {
        scale: 2.5,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff'
      }).then(canvas => {
        const dataUrl = canvas.toDataURL('image/png');
        if (imgOverlay) {
          imgOverlay.src = dataUrl;
          imgOverlay.style.display = 'block';
        }
        canvas.toBlob(blob => {
          if (blob) {
            cachedChartBlob = blob;
            const van = (document.getElementById('inputVan') && document.getElementById('inputVan').value) || '8';
            const deg = (document.getElementById('inputDegree') && document.getElementById('inputDegree').value) || '180';
            const filename = `tinhban_van${van}_${deg}deg.png`;
            try {
              cachedChartFile = new File([blob], filename, { type: 'image/png', lastModified: Date.now() });
            } catch(e) {
              console.warn('File constructor fallback:', e);
            }
          }
        }, 'image/png');
      }).catch(err => {
        console.warn('Image snapshot generation error:', err);
      });
    }, 80);
  }

  async function handleDownloadButtonClick(e) {
    if (e) e.preventDefault();

    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) || 
                  (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

    // 1. On iPhone / iPad: IMMEDIATELY trigger native iOS Share Sheet!
    if (isIOS && cachedChartFile && typeof navigator !== 'undefined' && navigator.canShare && navigator.canShare({ files: [cachedChartFile] }) && navigator.share) {
      try {
        await navigator.share({
          files: [cachedChartFile],
          title: 'Tinh Bàn Phong Thủy'
        });
        return;
      } catch (err) {
        if (err.name === 'AbortError') return; // User closed share sheet
        console.warn('iOS Share sheet failed, downloading directly...', err);
      }
    }

    // 2. On PC, Android, Mac: Direct file download
    downloadChart();
  }

  function dataURItoBlob(dataURI) {
    try {
      const parts = dataURI.split(',');
      const byteString = atob(parts[1]);
      const mimeString = parts[0].split(':')[1].split(';')[0];
      const ab = new ArrayBuffer(byteString.length);
      const ia = new Uint8Array(ab);
      for (let i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
      }
      return new Blob([ab], { type: mimeString });
    } catch (e) {
      console.warn('dataURItoBlob error:', e);
      return null;
    }
  }

  /**
   * Universal Image Save / Share:
   * - On iOS: Native Share Sheet (Save to Photos).
   * - On Android, PC, Mac: Direct file download.
   */
  async function saveOrShareImage(canvasOrDataUrl, filename, title) {
    let blob = null;
    let dataUrl = '';

    try {
      if (typeof canvasOrDataUrl === 'string') {
        dataUrl = canvasOrDataUrl;
        blob = dataURItoBlob(dataUrl);
      } else if (canvasOrDataUrl) {
        if (canvasOrDataUrl.toBlob) {
          blob = await new Promise(r => canvasOrDataUrl.toBlob(r, 'image/png'));
        }
        if (canvasOrDataUrl.toDataURL) {
          dataUrl = canvasOrDataUrl.toDataURL('image/png', 1.0);
        }
        if (!blob && dataUrl) {
          blob = dataURItoBlob(dataUrl);
        }
      }
    } catch (e) {
      console.warn('Blob conversion error:', e);
    }

    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) || 
                  (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

    // 1. For iOS (iPhone / iPad): Try Native Share Sheet
    if (isIOS && blob && typeof navigator !== 'undefined' && navigator.canShare && navigator.share) {
      try {
        const file = new File([blob], filename || 'tinhban.png', { type: 'image/png', lastModified: Date.now() });
        if (navigator.canShare({ files: [file] })) {
          await navigator.share({
            files: [file],
            title: title || 'Tinh Bàn Phong Thủy',
          });
          return;
        }
      } catch (err) {
        if (err.name === 'AbortError') return; // User closed share sheet normally
        console.warn('iOS Native share failed, downloading file directly...', err);
      }
    }

    // 2. Direct File Download for Android, PC, Mac
    const downloadUrl = blob ? URL.createObjectURL(blob) : dataUrl;
    const link = document.createElement('a');
    link.download = filename || 'tinhban.png';
    link.href = downloadUrl;
    link.rel = 'noopener';
    document.body.appendChild(link);
    link.click();
    setTimeout(() => {
      if (document.body.contains(link)) document.body.removeChild(link);
      if (blob) URL.revokeObjectURL(downloadUrl);
    }, 500);
  }

  window.saveOrShareImage = saveOrShareImage;

  function downloadChart() {
    if (!exportArea) return;
    const origHTML = btnDownload.innerHTML;
    btnDownload.innerText = 'Đang tạo ảnh...';
    btnDownload.disabled = true;

    // Direct snapshot with high quality
    setTimeout(() => {
      html2canvas(exportArea, {
        scale: 3,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
      }).then(canvas => {
        btnDownload.innerHTML = origHTML;
        btnDownload.disabled = false;
        const filename = `tinhban_${document.getElementById('inputVan').value}_${document.getElementById('inputDegree').value}.png`;
        saveOrShareImage(canvas, filename, 'Tinh Bàn Huyền Không');
      }).catch(err => {
        btnDownload.innerHTML = origHTML;
        btnDownload.disabled = false;
        console.error('Download error:', err);
        alert('Có lỗi khi tạo ảnh tải về, vui lòng thử lại.');
      });
    }, 40);
  }

  function copyChartToText() {
    if (!currentResult) return;
    
    const r = currentResult;
    const p = r.palaces;
    
    let text = `I. THÔNG TIN CHUNG\n`;
    text += `• Vận: ${r.van}\n`;
    text += `• Số độ: ${r.facingDegree}°\n`;
    
    let huongType = '';
    if (r.chartType === 'HA_QUAI') huongType = 'Chính Hướng';
    else if (r.chartType === 'THE_QUAI') {
      huongType = r.kiemInfo ? r.kiemInfo.label : 'Kiêm Hướng';
    } else if (r.chartType === 'KHONG_VONG') huongType = 'Không Vong';
    
    text += `• Tọa/Hướng: Tọa ${r.sittingMountain.name} / Hướng ${r.facingMountain.name} (${huongType})\n\n`;
    
    text += `II. CHI TIẾT CÁC CUNG\n`;
    
    text += `• Cung Ly (Nam): Sơn: ${p[9].son}, Hướng: ${p[9].huong}, Vận: ${p[9].van}, Niên: ${p[9].nien || '-'}, Nguyệt: ${p[9].nguyet || '-'}, Nhật: ${p[9].nhat || '-'}, Thời: ${p[9].thoi || '-'}\n`;
    text += `• Cung Khôn (Tây Nam): Sơn: ${p[2].son}, Hướng: ${p[2].huong}, Vận: ${p[2].van}, Niên: ${p[2].nien || '-'}, Nguyệt: ${p[2].nguyet || '-'}, Nhật: ${p[2].nhat || '-'}, Thời: ${p[2].thoi || '-'}\n`;
    text += `• Cung Đoài (Tây): Sơn: ${p[7].son}, Hướng: ${p[7].huong}, Vận: ${p[7].van}, Niên: ${p[7].nien || '-'}, Nguyệt: ${p[7].nguyet || '-'}, Nhật: ${p[7].nhat || '-'}, Thời: ${p[7].thoi || '-'}\n`;
    text += `• Cung Càn (Tây Bắc): Sơn: ${p[6].son}, Hướng: ${p[6].huong}, Vận: ${p[6].van}, Niên: ${p[6].nien || '-'}, Nguyệt: ${p[6].nguyet || '-'}, Nhật: ${p[6].nhat || '-'}, Thời: ${p[6].thoi || '-'}\n`;
    text += `• Cung Khảm (Bắc): Sơn: ${p[1].son}, Hướng: ${p[1].huong}, Vận: ${p[1].van}, Niên: ${p[1].nien || '-'}, Nguyệt: ${p[1].nguyet || '-'}, Nhật: ${p[1].nhat || '-'}, Thời: ${p[1].thoi || '-'}\n`;
    text += `• Cung Cấn (Đông Bắc): Sơn: ${p[8].son}, Hướng: ${p[8].huong}, Vận: ${p[8].van}, Niên: ${p[8].nien || '-'}, Nguyệt: ${p[8].nguyet || '-'}, Nhật: ${p[8].nhat || '-'}, Thời: ${p[8].thoi || '-'}\n`;
    text += `• Cung Chấn (Đông): Sơn: ${p[3].son}, Hướng: ${p[3].huong}, Vận: ${p[3].van}, Niên: ${p[3].nien || '-'}, Nguyệt: ${p[3].nguyet || '-'}, Nhật: ${p[3].nhat || '-'}, Thời: ${p[3].thoi || '-'}\n`;
    text += `• Cung Tốn (Đông Nam): Sơn: ${p[4].son}, Hướng: ${p[4].huong}, Vận: ${p[4].van}, Niên: ${p[4].nien || '-'}, Nguyệt: ${p[4].nguyet || '-'}, Nhật: ${p[4].nhat || '-'}, Thời: ${p[4].thoi || '-'}\n`;
    text += `• Trung Cung: Sơn: ${p[5].son}, Hướng: ${p[5].huong}, Vận: ${p[5].van}, Niên: ${p[5].nien || '-'}, Nguyệt: ${p[5].nguyet || '-'}, Nhật: ${p[5].nhat || '-'}, Thời: ${p[5].thoi || '-'}`;

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(() => {
        showToast('Đã sao chép thành công!');
      }).catch(err => {
        console.error('Lỗi khi sao chép: ', err);
        fallbackCopyText(text);
      });
    } else {
      fallbackCopyText(text);
    }
  }

  function showToast(message) {
    let toast = document.querySelector('.toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.className = 'toast';
      document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.classList.add('show');
    
    setTimeout(() => {
      toast.classList.remove('show');
    }, 2000);
  }

  function fallbackCopyText(text) {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.select();
    try {
      document.execCommand('copy');
      showToast('Đã sao chép thành công!');
    } catch (err) {
      showToast('Không thể tự động sao chép');
    }
    document.body.removeChild(textArea);
  }

  // Start
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
