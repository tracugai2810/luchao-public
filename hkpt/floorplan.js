(function() {
  'use strict';

  // State variables
  let isInitialized = false;
  let currentRotation = 0; // degrees
  let normalizedCenterX = 0.5; // ratio [0, 1] relative to image
  let normalizedCenterY = 0.5;
  let centerX = 0; // px relative to image
  let centerY = 0;
  let isDragging = false;
  let isMovingCenter = false;
  let isPanning = false;
  let panStartX = 0;
  let panStartY = 0;
  let scrollStartX = 0;
  let scrollStartY = 0;
  let startAngle = 0;
  let isAdjustingCenter = false;
  let overlaySize = 240; // px
  let overlayOpacity = 0.7;
  let imageZoom = 100; // percent (50 - 300)
  let baseFitWidth = 0;
  let baseFitHeight = 0;
  let showGuideLines = true;
  let isMinimalMode = false;
  let isFullscreen = false;
  let showCenterPalace = true; // Trung Cung 1/9 DT
  let houseBounds = { widthRatio: 0.8, heightRatio: 0.8 }; // Ratio of house max width & length relative to image

  // Centering modes: 'free' | 'box' | 'polygon' | 'auto'
  let centerMode = 'free';
  let boxPoints = []; // [{x, y}] normalized ratios (max 2 points)
  let polygonPoints = []; // [{x, y}] normalized ratios

  // Touch tracking for pinch-to-zoom & two-finger rotate
  let touchStartDist = 0;
  let touchStartSize = 0;
  let touchStartAngle = 0;
  let touchStartRotation = 0;

  // DOM Elements
  let btnUploadPlan, floorplanFileInput, floorplanSection, floorplanContainer, floorplanWrapper;
  let floorplanImage, floorplanHelperCanvas, floorplanOverlay, floorplanCompass;
  let centerMarker, sizeSlider, imageZoomSlider, opacitySlider, rotationDisplay;
  let btnAdjustCenter, btnResetFloorplan, btnExportFloorplan, btnToggleFullscreen, btnFitView;
  let transparentBgCheckbox, guideLinesCheckbox, minimalModeCheckbox, centerPalaceCheckbox;
  let centerToolsPanel, centerToolDesc;
  let centerBoxActions, centerPolyActions, centerFreeActions;
  let btnModeFree, btnModeBox, btnModePolygon, btnModeAuto;
  let btnBoxDone, btnBoxClear, btnPolyDone, btnPolyUndo, btnPolyClear, btnFreeDone;

  function init() {
    if (isInitialized) return;

    // Get DOM elements
    btnUploadPlan = document.getElementById('btnUploadPlan');
    floorplanFileInput = document.getElementById('floorplanFileInput');
    floorplanSection = document.getElementById('floorplanSection');
    floorplanContainer = document.getElementById('floorplanContainer');
    floorplanWrapper = document.getElementById('floorplanWrapper');
    floorplanImage = document.getElementById('floorplanImage');
    floorplanHelperCanvas = document.getElementById('floorplanHelperCanvas');
    floorplanOverlay = document.getElementById('floorplanOverlay');
    floorplanCompass = document.getElementById('floorplanCompass');
    centerMarker = document.getElementById('centerMarker');
    sizeSlider = document.getElementById('sizeSlider');
    imageZoomSlider = document.getElementById('imageZoomSlider');
    opacitySlider = document.getElementById('opacitySlider');
    transparentBgCheckbox = document.getElementById('transparentBgCheckbox');
    guideLinesCheckbox = document.getElementById('guideLinesCheckbox');
    minimalModeCheckbox = document.getElementById('minimalModeCheckbox');
    centerPalaceCheckbox = document.getElementById('centerPalaceCheckbox');
    rotationDisplay = document.getElementById('rotationDisplay');
    btnAdjustCenter = document.getElementById('btnAdjustCenter');
    btnResetFloorplan = document.getElementById('btnResetFloorplan');
    btnExportFloorplan = document.getElementById('btnExportFloorplan');
    btnToggleFullscreen = document.getElementById('btnToggleFullscreen');
    btnFitView = document.getElementById('btnFitView');

    // Center Tools elements
    centerToolsPanel = document.getElementById('centerToolsPanel');
    centerToolDesc = document.getElementById('centerToolDesc');
    centerBoxActions = document.getElementById('centerBoxActions');
    centerPolyActions = document.getElementById('centerPolyActions');
    centerFreeActions = document.getElementById('centerFreeActions');
    btnModeFree = document.getElementById('btnModeFree');
    btnModeBox = document.getElementById('btnModeBox');
    btnModePolygon = document.getElementById('btnModePolygon');
    btnModeAuto = document.getElementById('btnModeAuto');
    
    btnBoxDone = document.getElementById('btnBoxDone');
    btnBoxClear = document.getElementById('btnBoxClear');
    btnPolyDone = document.getElementById('btnPolyDone');
    btnPolyUndo = document.getElementById('btnPolyUndo');
    btnPolyClear = document.getElementById('btnPolyClear');
    btnFreeDone = document.getElementById('btnFreeDone');

    if (!btnUploadPlan || !floorplanFileInput || !floorplanImage || !floorplanContainer) {
      console.warn('FloorPlan: Missing required DOM elements');
      return;
    }

    // 1. Upload button / label
    if (btnUploadPlan) {
      btnUploadPlan.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          if (floorplanFileInput) floorplanFileInput.click();
        }
      });
    }

    // 2. File input change
    if (floorplanFileInput) {
      floorplanFileInput.addEventListener('change', handleFileUpload);
    }

    // 3. Star Chart Size slider
    if (sizeSlider) {
      sizeSlider.addEventListener('input', function(e) {
        overlaySize = parseInt(e.target.value, 10);
        updateOverlayPosition();
      });
    }

    // 4. Floorplan Image Zoom slider
    if (imageZoomSlider) {
      imageZoomSlider.addEventListener('input', function(e) {
        imageZoom = parseInt(e.target.value, 10);
        updateImageZoom();
      });
    }

    // 5. Opacity slider
    if (opacitySlider) {
      overlayOpacity = parseInt(opacitySlider.value, 10) / 100;
      opacitySlider.addEventListener('input', function(e) {
        overlayOpacity = parseInt(e.target.value, 10) / 100;
        if (floorplanOverlay) {
          floorplanOverlay.style.opacity = overlayOpacity;
        }
        renderHelperCanvas();
      });
    }

    // 6. Transparent BG checkbox
    if (transparentBgCheckbox) {
      transparentBgCheckbox.addEventListener('change', function() {
        updateTransparentState();
      });
    }

    // 6. Minimal Mode (Tối Giản 8 Hướng) checkbox
    if (minimalModeCheckbox) {
      minimalModeCheckbox.addEventListener('change', function() {
        isMinimalMode = this.checked;
        renderCompass();
      });
    }

    // 7. Guide lines & Sitting/Facing axis checkbox
    if (guideLinesCheckbox) {
      guideLinesCheckbox.addEventListener('change', function() {
        showGuideLines = this.checked;
        renderCompass();
      });
    }

    // 7.5. Center Palace (Trung Cung 1/9) checkbox
    if (centerPalaceCheckbox) {
      centerPalaceCheckbox.addEventListener('change', function() {
        showCenterPalace = this.checked;
        renderHelperCanvas();
      });
    }

    // 8. Adjust center button toggle
    if (btnAdjustCenter) {
      btnAdjustCenter.addEventListener('click', toggleAdjustCenter);
    }

    // 9. Reset button
    if (btnResetFloorplan) {
      btnResetFloorplan.addEventListener('click', function() {
        currentRotation = 0;
        boxPoints = [];
        polygonPoints = [];
        fitImageToContainer();
        renderCompass();
      });
    }

    // Fit View (Vừa Khung) button
    if (btnFitView) {
      btnFitView.addEventListener('click', function() {
        fitImageToContainer();
      });
    }

    // 10. Export button
    if (btnExportFloorplan) {
      btnExportFloorplan.addEventListener('click', exportFloorplan);
    }

    // 11. Fullscreen / Wide mode toggle
    if (btnToggleFullscreen) {
      btnToggleFullscreen.addEventListener('click', toggleFullscreen);
    }

    // 12. Center Tool Modes
    if (btnModeFree) btnModeFree.addEventListener('click', () => switchCenterMode('free'));
    if (btnModeBox) btnModeBox.addEventListener('click', () => switchCenterMode('box'));
    if (btnModePolygon) btnModePolygon.addEventListener('click', () => switchCenterMode('polygon'));
    if (btnModeAuto) btnModeAuto.addEventListener('click', () => {
      detectCenter(floorplanImage);
      setupOverlay();
      switchCenterMode('auto');
    });

    // 13. Center Confirmation and Action Buttons
    if (btnBoxDone) btnBoxDone.addEventListener('click', confirmAndLockCenter);
    if (btnBoxClear) btnBoxClear.addEventListener('click', clearBoxPoints);

    if (btnPolyDone) btnPolyDone.addEventListener('click', finishPolygonAndLock);
    if (btnPolyUndo) btnPolyUndo.addEventListener('click', undoPolygonPoint);
    if (btnPolyClear) btnPolyClear.addEventListener('click', clearPolygon);

    if (btnFreeDone) btnFreeDone.addEventListener('click', confirmAndLockCenter);

    // 14. Mouse Wheel Zoom on star chart (or on image if Ctrl is held)
    floorplanContainer.addEventListener('wheel', handleWheelZoom, { passive: false });

    // 15. Core interaction handlers (Rotate, Move Center, Pinch Zoom, Pan)
    setupInteractionHandlers();

    // 16. Window resize listener to keep overlay and canvas aligned
    window.addEventListener('resize', debounce(() => {
      if (imageZoom === 100) {
        fitImageToContainer();
      } else {
        computeBaseFitSize();
        calculateCenterPx();
        updateOverlayPosition();
        renderHelperCanvas();
      }
    }, 150));

    isInitialized = true;
  }

  function toggleFullscreen() {
    isFullscreen = !isFullscreen;
    if (floorplanSection) {
      floorplanSection.classList.toggle('fullscreen-mode', isFullscreen);
    }
    if (btnToggleFullscreen) {
      const iconExp = btnToggleFullscreen.querySelector('.icon-expand');
      const iconComp = btnToggleFullscreen.querySelector('.icon-compress');
      const btnText = btnToggleFullscreen.querySelector('.btn-text');
      if (iconExp && iconComp) {
        iconExp.classList.toggle('hidden', isFullscreen);
        iconComp.classList.toggle('hidden', !isFullscreen);
      }
      if (btnText) {
        btnText.textContent = isFullscreen ? 'Thu nhỏ' : 'Toàn màn hình';
      }
    }
    setTimeout(() => {
      if (imageZoom === 100) {
        fitImageToContainer();
      } else {
        computeBaseFitSize();
        calculateCenterPx();
        updateOverlayPosition();
        renderHelperCanvas();
      }
    }, 120);
  }

  function toggleAdjustCenter() {
    isAdjustingCenter = !isAdjustingCenter;
    if (isAdjustingCenter) {
      btnAdjustCenter.textContent = '✓ Xong';
      btnAdjustCenter.classList.add('active');
      floorplanContainer.classList.add('adjusting-center');
      if (centerMarker) centerMarker.style.display = 'block';
      if (centerToolsPanel) centerToolsPanel.classList.remove('hidden');
      switchCenterMode(centerMode);
    } else {
      btnAdjustCenter.textContent = '📍 Chỉnh Tâm';
      btnAdjustCenter.classList.remove('active');
      floorplanContainer.classList.remove('adjusting-center');
      if (centerMarker) centerMarker.style.display = 'none';
      if (centerToolsPanel) centerToolsPanel.classList.add('hidden');
      renderHelperCanvas();
    }
  }

  function confirmAndLockCenter() {
    // If in box mode with 2 points, ensure center is calculated
    if (centerMode === 'box' && boxPoints.length === 2) {
      normalizedCenterX = (boxPoints[0].x + boxPoints[1].x) / 2;
      normalizedCenterY = (boxPoints[0].y + boxPoints[1].y) / 2;
    }
    calculateCenterPx();
    updateOverlayPosition();

    // Permanently exit center adjusting mode to lock the center
    if (isAdjustingCenter) {
      toggleAdjustCenter();
    }
  }

  function clearBoxPoints() {
    boxPoints = [];
    renderHelperCanvas();
    if (centerToolDesc) {
      centerToolDesc.innerHTML = '📐 <strong>Lập cực 2 góc chéo:</strong> Hãy click <strong>Góc thứ 1</strong> (ví dụ: góc trên-trái tường bao nhà).';
    }
  }

  function switchCenterMode(mode) {
    centerMode = mode;
    const modeBtns = [btnModeFree, btnModeBox, btnModePolygon, btnModeAuto];
    modeBtns.forEach(btn => {
      if (btn) btn.classList.toggle('active', btn.dataset.mode === mode);
    });

    if (centerBoxActions) centerBoxActions.classList.toggle('hidden', mode !== 'box');
    if (centerPolyActions) centerPolyActions.classList.toggle('hidden', mode !== 'polygon');
    if (centerFreeActions) centerFreeActions.classList.toggle('hidden', mode !== 'free' && mode !== 'auto');

    if (centerToolDesc) {
      if (mode === 'free') {
        centerToolDesc.innerHTML = '💡 <strong>Kéo / Chấm Tâm:</strong> Click hoặc kéo thả trực tiếp điểm tâm đỏ đến vị trí trung tâm mong muốn. Sau đó nhấn <strong>✓ Xác Nhận & Khóa Tâm</strong>.';
      } else if (mode === 'box') {
        boxPoints = [];
        centerToolDesc.innerHTML = '📐 <strong>Lập cực 2 góc chéo (Nhà vuông / chữ nhật):</strong> Hãy click <strong>Góc thứ 1</strong> (ví dụ: góc trên-trái tường bao nhà).';
      } else if (mode === 'polygon') {
        polygonPoints = [];
        centerToolDesc.innerHTML = '⬡ <strong>Đa giác (Nhà chữ L / khuyết góc / đất xéo):</strong> Click lần lượt từng góc tường bao của ngôi nhà (tối thiểu 3 góc).';
      } else if (mode === 'auto') {
        centerToolDesc.innerHTML = '⚡ <strong>Tự động quét:</strong> Đã tự động phân tích và xác định tâm khối kiến trúc chính của bản vẽ. Nhấn <strong>✓ Xác Nhận & Khóa Tâm</strong> để hoàn tất.';
      }
    }
    renderHelperCanvas();
  }

  function handleFileUpload(e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(event) {
      const img = new Image();
      img.onload = function() {
        if (floorplanSection) floorplanSection.classList.remove('hidden');
        document.body.classList.add('has-floorplan');
        const appContainer = document.querySelector('.app-container');
        if (appContainer) appContainer.classList.add('has-floorplan');

        floorplanImage.src = img.src;
        boxPoints = [];
        polygonPoints = [];
        
        setTimeout(() => {
          fitImageToContainer();
          detectCenter(floorplanImage);
          setupOverlay();
          renderHelperCanvas();
          floorplanSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }, 100);
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  }

  // Smart Architectural Structural Bounds Detection
  function detectCenter(imgElement) {
    const naturalW = imgElement.naturalWidth;
    const naturalH = imgElement.naturalHeight;
    if (!naturalW || !naturalH) return;

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    canvas.width = naturalW;
    canvas.height = naturalH;
    
    ctx.drawImage(imgElement, 0, 0, naturalW, naturalH);
    let imageData;
    try {
      imageData = ctx.getImageData(0, 0, naturalW, naturalH);
    } catch(err) {
      console.warn('Cannot read image data, fallback to geometric center', err);
    }
    
    if (imageData) {
      const data = imageData.data;
      
      // Trim outer 4% margins to remove border lines
      const marginX = Math.floor(naturalW * 0.04);
      const marginY = Math.floor(naturalH * 0.04);
      
      // 1D Line Density Histograms
      const rowDensity = new Float32Array(naturalH);
      const colDensity = new Float32Array(naturalW);
      
      const step = 2; // performance sampling
      for (let y = marginY; y < naturalH - marginY; y += step) {
        for (let x = marginX; x < naturalW - marginX; x += step) {
          const i = (y * naturalW + x) * 4;
          const a = data[i + 3];
          if (a < 128) continue;
          
          const gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
          if (gray < 160) {
            // Dark pixel detected
            const weight = (160 - gray) / 160;
            rowDensity[y] += weight;
            colDensity[x] += weight;
          }
        }
      }
      
      // Find peak densities
      let maxRowD = 0, maxColD = 0;
      for (let y = 0; y < naturalH; y++) if (rowDensity[y] > maxRowD) maxRowD = rowDensity[y];
      for (let x = 0; x < naturalW; x++) if (colDensity[x] > maxColD) maxColD = colDensity[x];
      
      const rowThreshold = maxRowD * 0.08;
      const colThreshold = maxColD * 0.08;
      
      let minX = marginX, maxX = naturalW - marginX;
      let minY = marginY, maxY = naturalH - marginY;
      
      // Scan inward to find continuous structural boundaries
      for (let x = marginX; x < naturalW - marginX; x++) {
        if (colDensity[x] > colThreshold) { minX = x; break; }
      }
      for (let x = naturalW - marginX; x >= marginX; x--) {
        if (colDensity[x] > colThreshold) { maxX = x; break; }
      }
      for (let y = marginY; y < naturalH - marginY; y++) {
        if (rowDensity[y] > rowThreshold) { minY = y; break; }
      }
      for (let y = naturalH - marginY; y >= marginY; y--) {
        if (rowDensity[y] > rowThreshold) { maxY = y; break; }
      }
      
      // Check bottom 25% for a valley to remove title text block
      const bottomQuarter = Math.floor(naturalH * 0.75);
      if (maxY > bottomQuarter) {
        let valleyY = -1;
        let minValleyVal = Infinity;
        for (let y = bottomQuarter; y < maxY - 15; y++) {
          if (rowDensity[y] < minValleyVal) {
            minValleyVal = rowDensity[y];
            valleyY = y;
          }
        }
        if (minValleyVal < maxRowD * 0.05 && valleyY > 0) {
          maxY = valleyY;
        }
      }
      
      if (maxX > minX + 50 && maxY > minY + 50) {
        normalizedCenterX = ((minX + maxX) / 2) / naturalW;
        normalizedCenterY = ((minY + maxY) / 2) / naturalH;
      } else {
        normalizedCenterX = 0.5;
        normalizedCenterY = 0.5;
      }
    } else {
      normalizedCenterX = 0.5;
      normalizedCenterY = 0.5;
    }
    
    calculateCenterPx();
    if (centerMarker) {
      centerMarker.style.display = isAdjustingCenter ? 'block' : 'none';
    }
    currentRotation = 0;
  }

  function computeBaseFitSize() {
    if (!floorplanImage || !floorplanContainer) return;
    const naturalW = floorplanImage.naturalWidth || 600;
    const naturalH = floorplanImage.naturalHeight || 400;
    const containerW = floorplanContainer.clientWidth || 600;
    const containerH = floorplanContainer.clientHeight || 500;

    const availW = Math.max(160, containerW - 32);
    const availH = Math.max(160, containerH - 32);

    const scale = Math.min(availW / naturalW, availH / naturalH);
    baseFitWidth = Math.max(80, Math.round(naturalW * scale));
    baseFitHeight = Math.max(80, Math.round(naturalH * scale));
  }

  function fitImageToContainer() {
    if (!floorplanImage || !floorplanImage.naturalWidth) return;
    computeBaseFitSize();
    imageZoom = 100;
    if (imageZoomSlider) imageZoomSlider.value = 100;

    floorplanImage.style.width = baseFitWidth + 'px';
    floorplanImage.style.height = baseFitHeight + 'px';

    // Auto-scale star chart overlay to cover ~72% of the minimum dimension
    const minDim = Math.min(baseFitWidth, baseFitHeight);
    overlaySize = Math.max(80, Math.min(650, Math.round(minDim * 0.72)));
    if (sizeSlider) sizeSlider.value = overlaySize;

    calculateCenterPx();
    updateOverlayPosition();
    renderHelperCanvas();
  }

  function calculateCenterPx() {
    if (!floorplanImage) return;
    const curW = floorplanImage.offsetWidth || baseFitWidth || floorplanImage.width || 400;
    const curH = floorplanImage.offsetHeight || baseFitHeight || floorplanImage.height || 300;
    centerX = normalizedCenterX * curW;
    centerY = normalizedCenterY * curH;
  }

  function updateImageZoom(anchorClientX, anchorClientY) {
    if (!floorplanImage) return;
    if (!baseFitWidth || !baseFitHeight) {
      computeBaseFitSize();
    }
    
    const containerW = floorplanContainer.clientWidth;
    const containerH = floorplanContainer.clientHeight;
    const oldImgW = floorplanImage.offsetWidth || baseFitWidth || 1;
    const oldImgH = floorplanImage.offsetHeight || baseFitHeight || 1;
    
    // Determine the anchor point in image-ratio space
    let ratioX, ratioY;
    if (typeof anchorClientX === 'number' && typeof anchorClientY === 'number') {
      const containerRect = floorplanContainer.getBoundingClientRect();
      const localX = anchorClientX - containerRect.left + floorplanContainer.scrollLeft;
      const localY = anchorClientY - containerRect.top + floorplanContainer.scrollTop;
      ratioX = localX / oldImgW;
      ratioY = localY / oldImgH;
    } else {
      const viewCenterX = floorplanContainer.scrollLeft + containerW / 2;
      const viewCenterY = floorplanContainer.scrollTop + containerH / 2;
      ratioX = viewCenterX / oldImgW;
      ratioY = viewCenterY / oldImgH;
    }
    
    ratioX = Math.max(0, Math.min(1, ratioX));
    ratioY = Math.max(0, Math.min(1, ratioY));
    
    // Apply zoom relative to baseFit dimensions
    const zoomRatio = imageZoom / 100;
    const newImgW = Math.round(baseFitWidth * zoomRatio);
    const newImgH = Math.round(baseFitHeight * zoomRatio);
    
    floorplanImage.style.width = newImgW + 'px';
    floorplanImage.style.height = newImgH + 'px';
    
    // Recalculate pixel center
    calculateCenterPx();
    
    // Scroll to preserve anchor
    if (typeof anchorClientX === 'number' && typeof anchorClientY === 'number') {
      const containerRect = floorplanContainer.getBoundingClientRect();
      const screenOffsetX = anchorClientX - containerRect.left;
      const screenOffsetY = anchorClientY - containerRect.top;
      floorplanContainer.scrollLeft = ratioX * newImgW - screenOffsetX;
      floorplanContainer.scrollTop = ratioY * newImgH - screenOffsetY;
    } else {
      floorplanContainer.scrollLeft = ratioX * newImgW - containerW / 2;
      floorplanContainer.scrollTop = ratioY * newImgH - containerH / 2;
    }
    
    updateOverlayPosition();
    renderHelperCanvas();
  }

  function setupOverlay() {
    if (!floorplanImage || !floorplanOverlay) return;
    calculateCenterPx();
    updateOverlayPosition();
    renderHelperCanvas();
  }

  function scrollToCenter() {
    if (!floorplanContainer || !floorplanImage) return;
    const containerW = floorplanContainer.clientWidth;
    const containerH = floorplanContainer.clientHeight;
    const targetScrollX = centerX - containerW / 2;
    const targetScrollY = centerY - containerH / 2;
    floorplanContainer.scrollLeft = Math.max(0, targetScrollX);
    floorplanContainer.scrollTop = Math.max(0, targetScrollY);
  }

  function updateOverlayPosition() {
    if (!floorplanOverlay) return;

    floorplanOverlay.style.left = centerX + 'px';
    floorplanOverlay.style.top = centerY + 'px';
    floorplanOverlay.style.width = overlaySize + 'px';
    floorplanOverlay.style.height = overlaySize + 'px';
    floorplanOverlay.style.transform = `translate(-50%, -50%) rotate(${currentRotation}deg)`;
    floorplanOverlay.style.opacity = overlayOpacity;

    if (centerMarker) {
      centerMarker.style.left = centerX + 'px';
      centerMarker.style.top = centerY + 'px';
    }

    if (rotationDisplay) {
      let displayAng = Math.round(currentRotation) % 360;
      if (displayAng < 0) displayAng += 360;
      rotationDisplay.textContent = displayAng + '°';
    }

    if (sizeSlider && parseInt(sizeSlider.value, 10) !== Math.round(overlaySize)) {
      sizeSlider.value = Math.round(overlaySize);
    }

    renderCompass();
  }

  function renderCompass() {
    if (!floorplanCompass || !window.Compass) return;
    
    const result = window._currentChartResult;
    let facingDegree = 0;
    let facingPalace = 180;
    let palaces = null;
    let thanhMon = null;
    
    if (result) {
      facingDegree = result.facingDegree || 0;
      if (result.facingMountain && result.facingMountain.palace) {
        facingPalace = result.facingMountain.palace;
      }
      palaces = result.palaces || null;
      if (window.ThanhMonRules && window.ThanhMonRules.analyze) {
        thanhMon = window.ThanhMonRules.analyze(result);
      }
    }
    
    window.Compass.render(floorplanCompass, facingDegree, facingPalace, {
      showGuideLines: showGuideLines,
      showSectorStars: true,
      palaces: palaces,
      minimalMode: isMinimalMode,
      thanhMon: thanhMon,
      overlayRotation: currentRotation
    });
  }

  // Draw Trung Cung (1/9 Area) Centered Box (Thin Dashed Border Only)
  function drawCenterPalace(ctx, curW, curH, opacityFactor = 1.0) {
    if (!showCenterPalace || !houseBounds) return;

    const houseW = (houseBounds.widthRatio || 0.8) * curW;
    const houseH = (houseBounds.heightRatio || 0.8) * curH;

    // Trung Cung = 1/3 Width x 1/3 Height (Area = 1/9 of House Area)
    const tcW = houseW / 3;
    const tcH = houseH / 3;

    const startX = centerX - tcW / 2;
    const startY = centerY - tcH / 2;

    const alpha = overlayOpacity * opacityFactor;

    ctx.save();
    // Thin dashed border only (no fill, no text label)
    ctx.strokeStyle = `rgba(220, 38, 38, ${0.9 * alpha})`;
    ctx.lineWidth = 1.2;
    ctx.setLineDash([5, 4]);
    ctx.strokeRect(startX, startY, tcW, tcH);
    ctx.setLineDash([]);
    ctx.restore();
  }

  // Render Visual Guide Lines (Trung Cung Box, Diagonals, Bounding Box, Polygon, Crosshairs)
  function renderHelperCanvas() {
    if (!floorplanHelperCanvas || !floorplanImage) return;
    const curW = floorplanImage.offsetWidth || 1;
    const curH = floorplanImage.offsetHeight || 1;

    floorplanHelperCanvas.width = curW;
    floorplanHelperCanvas.height = curH;
    floorplanHelperCanvas.style.width = curW + 'px';
    floorplanHelperCanvas.style.height = curH + 'px';

    const ctx = floorplanHelperCanvas.getContext('2d');
    ctx.clearRect(0, 0, curW, curH);

    // 1. Draw Trung Cung (1/9 Area) Box
    if (showCenterPalace) {
      drawCenterPalace(ctx, curW, curH, 1.0);
    }

    if (!isAdjustingCenter) return;

    // 3. Box Mode: Draw 2 points, bounding box, and diagonal cross
    if (centerMode === 'box' && boxPoints.length > 0) {
      const p1 = { x: boxPoints[0].x * curW, y: boxPoints[0].y * curH };
      
      // Point 1 marker
      drawPin(ctx, p1.x, p1.y, '1', '#2563eb');

      if (boxPoints.length === 2) {
        const p2 = { x: boxPoints[1].x * curW, y: boxPoints[1].y * curH };
        drawPin(ctx, p2.x, p2.y, '2', '#2563eb');

        const xMin = Math.min(p1.x, p2.x);
        const xMax = Math.max(p1.x, p2.x);
        const yMin = Math.min(p1.y, p2.y);
        const yMax = Math.max(p1.y, p2.y);

        // Bounding Rectangle
        ctx.strokeStyle = '#2563eb';
        ctx.lineWidth = 2;
        ctx.setLineDash([6, 4]);
        ctx.strokeRect(xMin, yMin, xMax - xMin, yMax - yMin);
        ctx.fillStyle = 'rgba(37, 99, 235, 0.06)';
        ctx.fillRect(xMin, yMin, xMax - xMin, yMax - yMin);

        // Diagonals
        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = 2;
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.moveTo(xMin, yMin);
        ctx.lineTo(xMax, yMax);
        ctx.moveTo(xMax, yMin);
        ctx.lineTo(xMin, yMax);
        ctx.stroke();
        ctx.setLineDash([]);
      }
    }

    // 4. Polygon Mode: Draw polygon outline and centroid lines
    if (centerMode === 'polygon' && polygonPoints.length > 0) {
      ctx.strokeStyle = '#8b5cf6';
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 3]);
      ctx.beginPath();
      
      polygonPoints.forEach((pt, idx) => {
        const px = pt.x * curW;
        const py = pt.y * curH;
        if (idx === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      });

      if (polygonPoints.length >= 3) {
        ctx.closePath();
        ctx.fillStyle = 'rgba(139, 92, 246, 0.08)';
        ctx.fill();
      }
      ctx.stroke();
      ctx.setLineDash([]);

      // Draw pins
      polygonPoints.forEach((pt, idx) => {
        drawPin(ctx, pt.x * curW, pt.y * curH, (idx + 1).toString(), '#8b5cf6');
      });
    }

    // 5. Free Mode: Draw full crosshairs through center
    if (centerMode === 'free' || centerMode === 'auto') {
      ctx.strokeStyle = 'rgba(239, 68, 68, 0.4)';
      ctx.lineWidth = 1;
      ctx.setLineDash([5, 4]);
      ctx.beginPath();
      ctx.moveTo(0, centerY);
      ctx.lineTo(curW, centerY);
      ctx.moveTo(centerX, 0);
      ctx.lineTo(centerX, curH);
      ctx.stroke();
      ctx.setLineDash([]);
    }
  }

  function drawPin(ctx, x, y, label, color) {
    ctx.save();
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x, y, 9, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 10px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(label, x, y);
    ctx.restore();
  }

  function setOverlaySize(newSize) {
    overlaySize = Math.max(60, Math.min(800, newSize));
    updateOverlayPosition();
  }

  function handleWheelZoom(e) {
    e.preventDefault();
    if (e.ctrlKey) {
      imageZoom = Math.max(50, Math.min(300, imageZoom + (e.deltaY < 0 ? 10 : -10)));
      if (imageZoomSlider) imageZoomSlider.value = imageZoom;
      updateImageZoom(e.clientX, e.clientY);
    } else {
      const zoomDelta = e.deltaY < 0 ? 15 : -15;
      setOverlaySize(overlaySize + zoomDelta);
    }
  }

  function getAngleFromCenter(clientX, clientY) {
    const imgRect = floorplanImage.getBoundingClientRect();
    const x = clientX - imgRect.left - centerX;
    const y = clientY - imgRect.top - centerY;
    return Math.atan2(y, x) * 180 / Math.PI;
  }

  // Exact 0px-offset Coordinate Calculation
  function updateCenterFromEvent(e) {
    if (!floorplanImage) return;
    const imgRect = floorplanImage.getBoundingClientRect();
    if (!imgRect.width || !imgRect.height) return;

    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    
    const clickX = clientX - imgRect.left;
    const clickY = clientY - imgRect.top;
    
    const ratioX = Math.max(0, Math.min(1, clickX / imgRect.width));
    const ratioY = Math.max(0, Math.min(1, clickY / imgRect.height));

    if (centerMode === 'box') {
      if (boxPoints.length >= 2) boxPoints = [];
      boxPoints.push({ x: ratioX, y: ratioY });

      if (boxPoints.length === 1) {
        if (centerToolDesc) {
          centerToolDesc.innerHTML = '📐 <strong>Đã chọn Góc 1.</strong> Hãy click tiếp <strong>Góc đối diện (Góc 2)</strong> của tường bao nhà.';
        }
      } else if (boxPoints.length === 2) {
        normalizedCenterX = (boxPoints[0].x + boxPoints[1].x) / 2;
        normalizedCenterY = (boxPoints[0].y + boxPoints[1].y) / 2;
        const wRatio = Math.abs(boxPoints[1].x - boxPoints[0].x);
        const hRatio = Math.abs(boxPoints[1].y - boxPoints[0].y);
        if (wRatio > 0.02 && hRatio > 0.02) {
          houseBounds = { widthRatio: wRatio, heightRatio: hRatio };
        }
        calculateCenterPx();
        updateOverlayPosition();
        if (centerToolDesc) {
          centerToolDesc.innerHTML = '✓ <strong>Đã tính giao điểm 2 đường chéo & Ô Trung Cung (1/9)!</strong> Nhấn nút <strong>✓ Xác Nhận & Khóa Tâm</strong> bên dưới để hoàn tất.';
        }
      }
      renderHelperCanvas();
      return;
    }

    if (centerMode === 'polygon') {
      polygonPoints.push({ x: ratioX, y: ratioY });
      if (polygonPoints.length >= 3) {
        computePolygonCentroid();
        let minX = 1, maxX = 0, minY = 1, maxY = 0;
        polygonPoints.forEach(p => {
          minX = Math.min(minX, p.x);
          maxX = Math.max(maxX, p.x);
          minY = Math.min(minY, p.y);
          maxY = Math.max(maxY, p.y);
        });
        const wRatio = maxX - minX;
        const hRatio = maxY - minY;
        if (wRatio > 0.02 && hRatio > 0.02) {
          houseBounds = { widthRatio: wRatio, heightRatio: hRatio };
        }
      }
      if (centerToolDesc) {
        centerToolDesc.innerHTML = `⬡ <strong>Đã chọn ${polygonPoints.length} góc.</strong> Tiếp tục click các góc khác hoặc nhấn <strong>✓ Xác Nhận & Khóa Tâm</strong> bên dưới.`;
      }
      renderHelperCanvas();
      return;
    }

    // Free mode
    normalizedCenterX = ratioX;
    normalizedCenterY = ratioY;
    calculateCenterPx();
    updateOverlayPosition();
    renderHelperCanvas();
  }

  // Polygon Centroid Formula: Cx = (1/6A) * sum((xi + xi+1)*(xi*yi+1 - xi+1*yi))
  function computePolygonCentroid() {
    const pts = polygonPoints;
    const n = pts.length;
    if (n < 3) return;

    let area = 0;
    let cx = 0;
    let cy = 0;

    for (let i = 0; i < n; i++) {
      const j = (i + 1) % n;
      const factor = pts[i].x * pts[j].y - pts[j].x * pts[i].y;
      area += factor;
      cx += (pts[i].x + pts[j].x) * factor;
      cy += (pts[i].y + pts[j].y) * factor;
    }
    area = area / 2;

    if (Math.abs(area) > 0.0001) {
      normalizedCenterX = Math.max(0, Math.min(1, cx / (6 * area)));
      normalizedCenterY = Math.max(0, Math.min(1, cy / (6 * area)));
      calculateCenterPx();
      updateOverlayPosition();
    }
  }

  function finishPolygonAndLock() {
    if (polygonPoints.length >= 3) {
      computePolygonCentroid();
    }
    confirmAndLockCenter();
  }

  function undoPolygonPoint() {
    if (polygonPoints.length > 0) {
      polygonPoints.pop();
      if (polygonPoints.length >= 3) computePolygonCentroid();
      renderHelperCanvas();
      if (centerToolDesc) {
        centerToolDesc.innerHTML = `⬡ <strong>Đã xóa 1 điểm:</strong> Còn ${polygonPoints.length} điểm.`;
      }
    }
  }

  function clearPolygon() {
    polygonPoints = [];
    renderHelperCanvas();
    if (centerToolDesc) {
      centerToolDesc.innerHTML = '⬡ <strong>Làm lại:</strong> Hãy click lần lượt các góc tường bao quanh nhà.';
    }
  }

  function setupInteractionHandlers() {
    const onStart = function(e) {
      // 2-finger touch: Pinch zoom & twist rotation of the star chart
      if (e.touches && e.touches.length === 2) {
        e.preventDefault();
        const t1 = e.touches[0];
        const t2 = e.touches[1];
        touchStartDist = Math.hypot(t2.clientX - t1.clientX, t2.clientY - t1.clientY);
        touchStartSize = overlaySize;
        touchStartAngle = Math.atan2(t2.clientY - t1.clientY, t2.clientX - t1.clientX) * 180 / Math.PI;
        touchStartRotation = currentRotation;
        isDragging = false;
        isMovingCenter = false;
        isPanning = false;
        return;
      }

      // 1-pointer interaction:
      if (isAdjustingCenter) {
        // Mode 1: Moving center / picking corners
        e.preventDefault();
        isMovingCenter = true;
        updateCenterFromEvent(e);
      } else {
        const target = e.target;
        if (floorplanOverlay.contains(target) || target === floorplanOverlay) {
          // Mode 2: Rotating star chart
          e.preventDefault();
          isDragging = true;
          const clientX = e.touches ? e.touches[0].clientX : e.clientX;
          const clientY = e.touches ? e.touches[0].clientY : e.clientY;
          startAngle = getAngleFromCenter(clientX, clientY) - currentRotation;
        } else if (imageZoom > 100) {
          // Mode 3: Panning zoomed floor plan image
          isPanning = true;
          const clientX = e.touches ? e.touches[0].clientX : e.clientX;
          const clientY = e.touches ? e.touches[0].clientY : e.clientY;
          panStartX = clientX;
          panStartY = clientY;
          scrollStartX = floorplanContainer.scrollLeft;
          scrollStartY = floorplanContainer.scrollTop;
        }
      }
    };

    const onMove = function(e) {
      // 2-finger pinch zoom & rotation
      if (e.touches && e.touches.length === 2 && touchStartDist > 0) {
        e.preventDefault();
        const t1 = e.touches[0];
        const t2 = e.touches[1];
        
        const currentDist = Math.hypot(t2.clientX - t1.clientX, t2.clientY - t1.clientY);
        const scale = currentDist / touchStartDist;
        setOverlaySize(touchStartSize * scale);

        const currentAngle = Math.atan2(t2.clientY - t1.clientY, t2.clientX - t1.clientX) * 180 / Math.PI;
        currentRotation = touchStartRotation + (currentAngle - touchStartAngle);
        updateOverlayPosition();
        return;
      }

      // Moving center mode (free drag)
      if (isMovingCenter && isAdjustingCenter && centerMode === 'free') {
        e.preventDefault();
        updateCenterFromEvent(e);
        return;
      }

      // Rotating overlay mode
      if (isDragging) {
        e.preventDefault();
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;
        currentRotation = getAngleFromCenter(clientX, clientY) - startAngle;
        updateOverlayPosition();
        return;
      }

      // Panning container mode
      if (isPanning) {
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;
        floorplanContainer.scrollLeft = scrollStartX - (clientX - panStartX);
        floorplanContainer.scrollTop = scrollStartY - (clientY - panStartY);
      }
    };

    const onEnd = function() {
      const wasDragging = isDragging;
      isDragging = false;
      isMovingCenter = false;
      isPanning = false;
      touchStartDist = 0;
      if (wasDragging) {
        renderCompass();
      }
    };

    floorplanContainer.addEventListener('mousedown', onStart);
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onEnd);

    floorplanContainer.addEventListener('touchstart', onStart, { passive: false });
    document.addEventListener('touchmove', onMove, { passive: false });
    document.addEventListener('touchend', onEnd);
    document.addEventListener('touchcancel', onEnd);
  }

  function debounce(fn, ms) {
    let timer;
    return function(...args) {
      clearTimeout(timer);
      timer = setTimeout(() => fn.apply(this, args), ms);
    };
  }

  /**
   * Render signature watermark badge "Nguyễn Khôi" on exported floorplan image.
   * Auto-scales according to natural image resolution and uses a frosted pill badge
   * to guarantee legibility on any blueprint background without obscuring house center.
   */
  function renderExportSignature(ctx, width, height) {
    if (!ctx || !width || !height) return;

    ctx.save();
    try {
      const baseDim = Math.min(width, height);
      // Scale proportionally: 1.0 for ~950px, clamped between 0.85 and 3.5
      const scale = Math.max(0.85, Math.min(baseDim / 950, 3.5));

      const fontSize = Math.round(15 * scale);
      const iconSize = Math.round(14 * scale);
      const padX = Math.round(14 * scale);
      const padY = Math.round(8 * scale);
      const gap = Math.round(8 * scale);
      const margin = Math.round(20 * scale);

      ctx.font = `700 ${fontSize}px "Inter", "Noto Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
      const text = 'Nguyễn Khôi';
      const textMetrics = ctx.measureText(text);
      const textW = textMetrics.width;

      const badgeW = padX * 2 + iconSize + gap + textW;
      const badgeH = padY * 2 + Math.max(fontSize, iconSize);
      const badgeX = width - margin - badgeW;
      const badgeY = height - margin - badgeH;
      const radius = badgeH / 2;

      // 1. Draw badge pill shadow
      ctx.shadowColor = 'rgba(0, 0, 0, 0.4)';
      ctx.shadowBlur = Math.round(10 * scale);
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = Math.round(3 * scale);

      // 2. Draw frosted dark pill background
      ctx.fillStyle = 'rgba(15, 23, 42, 0.82)';
      ctx.beginPath();
      if (typeof ctx.roundRect === 'function') {
        ctx.roundRect(badgeX, badgeY, badgeW, badgeH, radius);
      } else {
        ctx.arc(badgeX + radius, badgeY + radius, radius, Math.PI / 2, Math.PI * 1.5);
        ctx.lineTo(badgeX + badgeW - radius, badgeY);
        ctx.arc(badgeX + badgeW - radius, badgeY + radius, radius, -Math.PI / 2, Math.PI / 2);
        ctx.closePath();
      }
      ctx.fill();

      // 3. Subtle translucent border
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
      ctx.lineWidth = Math.max(1, Math.round(1.2 * scale));
      ctx.stroke();

      // Clear shadow for crisp icon and text
      ctx.shadowColor = 'transparent';
      ctx.shadowBlur = 0;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 0;

      // 4. Draw vector pen icon
      const iconX = badgeX + padX;
      const iconY = badgeY + (badgeH - iconSize) / 2;
      ctx.save();
      ctx.translate(iconX, iconY);
      const iconScale = iconSize / 24;
      ctx.scale(iconScale, iconScale);
      ctx.strokeStyle = '#2dd4bf'; // teal accent
      ctx.fillStyle = 'transparent';
      ctx.lineWidth = 2.2;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      if (typeof Path2D !== 'undefined') {
        const path = new Path2D('M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z');
        ctx.stroke(path);
      } else {
        ctx.beginPath();
        ctx.moveTo(6.5, 21);
        ctx.lineTo(3, 21);
        ctx.lineTo(3, 17.5);
        ctx.lineTo(16.7, 3.7);
        ctx.lineTo(20.3, 7.3);
        ctx.closePath();
        ctx.stroke();
      }
      ctx.restore();

      // 5. Draw signature text "Nguyễn Khôi"
      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      ctx.fillText(text, badgeX + padX + iconSize + gap, badgeY + badgeH / 2);

    } catch (err) {
      console.warn('FloorPlan: Error drawing signature:', err);
    } finally {
      ctx.restore();
    }
  }

  function exportFloorplan() {
    if (!floorplanImage || !floorplanImage.src) {
      console.warn('FloorPlan: No image loaded to export');
      return;
    }

    if (isAdjustingCenter) {
      toggleAdjustCenter();
    }

    if (btnExportFloorplan) {
      btnExportFloorplan.innerText = 'Đang tạo...';
      btnExportFloorplan.disabled = true;
    }

    try {
      const naturalW = floorplanImage.naturalWidth || floorplanImage.width || 800;
      const naturalH = floorplanImage.naturalHeight || floorplanImage.height || 600;

      // 1. Create full-resolution offscreen canvas matching original drawing
      const exportCanvas = document.createElement('canvas');
      exportCanvas.width = naturalW;
      exportCanvas.height = naturalH;
      const ctx = exportCanvas.getContext('2d');

      // 2. Draw full original floor plan image at 100% resolution
      ctx.drawImage(floorplanImage, 0, 0, naturalW, naturalH);

      // 3. Calculate exact export center & compass size on full image resolution
      const exportCenterX = normalizedCenterX * naturalW;
      const exportCenterY = normalizedCenterY * naturalH;

      const screenImgW = floorplanImage.offsetWidth || 1;
      const scaleFactor = naturalW / screenImgW;
      const exportCompassSize = Math.max(60, Math.round(overlaySize * scaleFactor));

      // 3.5. Draw Trung Cung (1/9) Box on Export Canvas if enabled
      if (showCenterPalace && houseBounds) {
        const houseW = (houseBounds.widthRatio || 0.8) * naturalW;
        const houseH = (houseBounds.heightRatio || 0.8) * naturalH;
        const tcW = houseW / 3;
        const tcH = houseH / 3;
        const startX = exportCenterX - tcW / 2;
        const startY = exportCenterY - tcH / 2;

        ctx.save();
        ctx.strokeStyle = `rgba(220, 38, 38, ${0.9 * overlayOpacity})`;
        ctx.lineWidth = Math.max(1, Math.round(1.2 * scaleFactor));
        ctx.setLineDash([Math.round(5 * scaleFactor), Math.round(4 * scaleFactor)]);
        ctx.strokeRect(startX, startY, tcW, tcH);
        ctx.setLineDash([]);
        ctx.restore();
      }

      // 4. Render Compass on high-resolution temporary canvas
      const compCanvas = document.createElement('canvas');
      compCanvas.width = exportCompassSize;
      compCanvas.height = exportCompassSize;

      const result = window._currentChartResult;
      let facingDegree = 0;
      let facingPalace = 180;
      let palaces = null;
      let thanhMon = null;
      if (result) {
        facingDegree = result.facingDegree || 0;
        if (result.facingMountain && result.facingMountain.palace) {
          facingPalace = result.facingMountain.palace;
        }
        palaces = result.palaces || null;
        if (window.ThanhMonRules && window.ThanhMonRules.analyze) {
          thanhMon = window.ThanhMonRules.analyze(result);
        }
      }

      if (window.Compass && window.Compass.render) {
        window.Compass.render(compCanvas, facingDegree, facingPalace, {
          showGuideLines: showGuideLines,
          showSectorStars: true,
          palaces: palaces,
          minimalMode: isMinimalMode,
          thanhMon: thanhMon,
          overlayRotation: currentRotation
        });
      }

      // 5. Composite compass with exact position, rotation, and opacity
      ctx.save();
      ctx.globalAlpha = overlayOpacity;
      ctx.translate(exportCenterX, exportCenterY);
      ctx.rotate(currentRotation * Math.PI / 180);
      ctx.drawImage(compCanvas, -exportCompassSize / 2, -exportCompassSize / 2, exportCompassSize, exportCompassSize);
      ctx.restore();

      // 5.5. Draw Signature Badge "Nguyễn Khôi" on exported image
      renderExportSignature(ctx, naturalW, naturalH);

      // 6. Save or Share Image immediately (instant synchronous canvas export)
      if (window.saveOrShareImage) {
        window.saveOrShareImage(exportCanvas, 'tinhban_banve.png', 'Bản Vẽ Tinh Bàn Phong Thủy');
      } else {
        const link = document.createElement('a');
        link.download = 'tinhban_banve.png';
        link.href = exportCanvas.toDataURL('image/png', 1.0);
        link.click();
      }
    } catch (err) {
      console.error('FloorPlan: Error exporting floorplan:', err);
    } finally {
      if (btnExportFloorplan) {
        btnExportFloorplan.innerText = '💾 Tải Ảnh';
        btnExportFloorplan.disabled = false;
      }
    }
  }

  // Auto initialize on DOM ready
  if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', init);
    } else {
      init();
    }
  }

  // Export module
  window.FloorPlan = {
    init: init,
    update: setupOverlay
  };

})();
