// ============================================================
// Satellite Compass - Đo Hướng Nhà Chuẩn Xác Từ Ảnh Vệ Tinh
// Sử dụng Leaflet.js + Google Satellite & ESRI World Imagery
// ============================================================

(function() {
  'use strict';

  let map = null;
  let layerGoogle = null;
  let layerEsri = null;
  let currentLayer = 'google';

  let pointA = null; // LatLng 1
  let pointB = null; // LatLng 2
  let markerA = null;
  let markerB = null;
  let lineWall = null;
  let lineFacing = null;
  let markerArrow = null;

  let currentFacingDegree = null;
  let normalOffset = 90; // +90 or -90 (flip)
  let fineTuneDegree = 0; // +/- adjustment

  // Default initial location: Hanoi, Vietnam
  const DEFAULT_LAT = 21.028511;
  const DEFAULT_LNG = 105.854212;
  const DEFAULT_ZOOM = 19;

  /**
   * Geodesic Forward Azimuth (Bearing) between 2 lat/lng points.
   * Formula: θ = atan2( sin Δλ ⋅ cos φ2 , cos φ1 ⋅ sin φ2 − sin φ1 ⋅ cos φ2 ⋅ cos Δλ )
   * Returns bearing in degrees (0° - 359.999°).
   */
  function calculateBearing(lat1, lon1, lat2, lon2) {
    const toRad = Math.PI / 180;
    const toDeg = 180 / Math.PI;
    const φ1 = lat1 * toRad;
    const φ2 = lat2 * toRad;
    const Δλ = (lon2 - lon1) * toRad;

    const y = Math.sin(Δλ) * Math.cos(φ2);
    const x = Math.cos(φ1) * Math.sin(φ2) - Math.sin(φ1) * Math.cos(φ2) * Math.cos(Δλ);
    const θ = Math.atan2(y, x);
    return ((θ * toDeg) % 360 + 360) % 360;
  }

  /**
   * Calculates destination point given distance (meters) and bearing (degrees).
   */
  function destinationPoint(lat, lon, distanceMeters, bearingDeg) {
    const R = 6371e3; // Earth radius in meters
    const toRad = Math.PI / 180;
    const toDeg = 180 / Math.PI;

    const δ = distanceMeters / R;
    const θ = bearingDeg * toRad;
    const φ1 = lat * toRad;
    const λ1 = lon * toRad;

    const sinφ2 = Math.sin(φ1) * Math.cos(δ) + Math.cos(φ1) * Math.sin(δ) * Math.cos(θ);
    const φ2 = Math.asin(sinφ2);
    const y = Math.sin(θ) * Math.sin(δ) * Math.cos(φ1);
    const x = Math.cos(δ) - Math.sin(φ1) * Math.sin(φ2);
    const λ2 = λ1 + Math.atan2(y, x);

    return {
      lat: φ2 * toDeg,
      lng: ((λ2 * toDeg + 540) % 360) - 180
    };
  }

  /**
   * Parse coordinates or Google Maps links from search query
   */
  function parseCoordinatesOrUrl(query) {
    if (!query) return null;
    query = query.trim();

    // 1. Direct coordinates: "21.028511, 105.854212" or "21.028511 105.854212"
    const coordRegex = /^(-?\d+(\.\d+)?)[,\s]+(-?\d+(\.\d+)?)$/;
    const coordMatch = query.match(coordRegex);
    if (coordMatch) {
      const lat = parseFloat(coordMatch[1]);
      const lng = parseFloat(coordMatch[3]);
      if (lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
        return { lat, lng };
      }
    }

    // 2. Google Maps URL formats:
    // ...@21.028511,105.854212,18z...
    const atMatch = query.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
    if (atMatch) {
      return { lat: parseFloat(atMatch[1]), lng: parseFloat(atMatch[2]) };
    }

    // ...?q=21.028511,105.854212...
    const qMatch = query.match(/[?&]q=(-?\d+\.\d+),(-?\d+\.\d+)/);
    if (qMatch) {
      return { lat: parseFloat(qMatch[1]), lng: parseFloat(qMatch[2]) };
    }

    // ...!3d21.028511!4d105.854212...
    const dMatch = query.match(/!3d(-?\d+\.\d+)!4d(-?\d+\.\d+)/);
    if (dMatch) {
      return { lat: parseFloat(dMatch[1]), lng: parseFloat(dMatch[2]) };
    }

    return null;
  }

  /**
   * Geocode address using Nominatim (OpenStreetMap)
   */
  async function geocodeAddress(address) {
    try {
      const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`;
      const res = await fetch(url);
      const data = await res.json();
      if (data && data.length > 0) {
        return {
          lat: parseFloat(data[0].lat),
          lng: parseFloat(data[0].lon),
          displayName: data[0].display_name
        };
      }
    } catch (err) {
      console.warn('Geocoding error:', err);
    }
    return null;
  }

  /**
   * Initialize Leaflet Map
   */
  function initMap() {
    if (map) return;
    const mapContainer = document.getElementById('satMap');
    if (!mapContainer || typeof L === 'undefined') return;

    map = L.map('satMap', {
      center: [DEFAULT_LAT, DEFAULT_LNG],
      zoom: DEFAULT_ZOOM,
      maxZoom: 21,
      zoomControl: false,
      attributionControl: false
    });

    L.control.zoom({ position: 'bottomright' }).addTo(map);

    // Tile Layers
    // 1. Google Satellite Hybrid (Vệ tinh có kèm tên đường & địa danh)
    layerGoogle = L.tileLayer('https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}', {
      maxZoom: 21,
      maxNativeZoom: 20,
      subdomains: ['mt0', 'mt1', 'mt2', 'mt3']
    });

    // 2. ESRI World Imagery (Vệ tinh ESRI siêu nét)
    layerEsri = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
      maxZoom: 21,
      maxNativeZoom: 19
    });

    layerGoogle.addTo(map);
    currentLayer = 'google';

    // Map Click Listener to place points A and B
    map.on('click', handleMapClick);
  }

  /**
   * Handle Click on Map to set Point A and Point B
   */
  function handleMapClick(e) {
    const latlng = e.latlng;

    if (!pointA) {
      setPointA(latlng);
      updateInstruction('👉 <strong>Bước 2:</strong> Hãy click tiếp <strong>Điểm 2</strong> ở đầu kia của mép tường mặt tiền.');
    } else if (!pointB) {
      setPointB(latlng);
      calculateAndDraw();
      updateInstruction('✓ <strong>Đã đo xong!</strong> Bạn có thể kéo thả 2 điểm tròn vàng để chỉnh tinh, hoặc bấm nút <strong>✓ Áp Dụng Số Độ Này</strong> bên dưới.');
    } else {
      // Both points exist, click moves Point A and resets Point B
      setPointA(latlng);
      clearPointB();
      updateInstruction('👉 <strong>Bước 2:</strong> Hãy click tiếp <strong>Điểm 2</strong> ở đầu kia của mép tường mặt tiền.');
    }
  }

  function setPointA(latlng) {
    pointA = latlng;
    if (!markerA) {
      const iconA = L.divIcon({
        className: 'sat-marker-div',
        html: '<div class="sat-pin pin-a">1</div>',
        iconSize: [28, 28],
        iconAnchor: [14, 14]
      });
      markerA = L.marker(latlng, { icon: iconA, draggable: true }).addTo(map);
      markerA.on('drag', function(e) {
        pointA = e.target.getLatLng();
        if (pointB) calculateAndDraw();
      });
    } else {
      markerA.setLatLng(latlng);
    }
  }

  function setPointB(latlng) {
    pointB = latlng;
    if (!markerB) {
      const iconB = L.divIcon({
        className: 'sat-marker-div',
        html: '<div class="sat-pin pin-b">2</div>',
        iconSize: [28, 28],
        iconAnchor: [14, 14]
      });
      markerB = L.marker(latlng, { icon: iconB, draggable: true }).addTo(map);
      markerB.on('drag', function(e) {
        pointB = e.target.getLatLng();
        if (pointA) calculateAndDraw();
      });
    } else {
      markerB.setLatLng(latlng);
    }
  }

  function clearPointB() {
    pointB = null;
    if (markerB) {
      map.removeLayer(markerB);
      markerB = null;
    }
    if (lineWall) {
      map.removeLayer(lineWall);
      lineWall = null;
    }
    if (lineFacing) {
      map.removeLayer(lineFacing);
      lineFacing = null;
    }
    if (markerArrow) {
      map.removeLayer(markerArrow);
      markerArrow = null;
    }
    currentFacingDegree = null;
    updateResultUI();
  }

  function resetAllPoints() {
    pointA = null;
    pointB = null;
    fineTuneDegree = 0;
    if (markerA) { map.removeLayer(markerA); markerA = null; }
    if (markerB) { map.removeLayer(markerB); markerB = null; }
    if (lineWall) { map.removeLayer(lineWall); lineWall = null; }
    if (lineFacing) { map.removeLayer(lineFacing); lineFacing = null; }
    if (markerArrow) { map.removeLayer(markerArrow); markerArrow = null; }
    currentFacingDegree = null;
    updateInstruction('👉 <strong>Bước 1:</strong> Zoom vào nóc nhà, click <strong>Điểm 1</strong> rồi click <strong>Điểm 2</strong> dọc theo mép tường mặt tiền nhà.');
    updateResultUI();
  }

  /**
   * Calculate Wall Bearing and Normal Facing Ray
   */
  function calculateAndDraw() {
    if (!pointA || !pointB || !map) return;

    // 1. Calculate wall azimuth A -> B
    const wallBearing = calculateBearing(pointA.lat, pointA.lng, pointB.lat, pointB.lng);

    // 2. Normal facing angle = wallBearing + normalOffset (+/- 90) + fineTuneDegree
    let facing = ((wallBearing + normalOffset + fineTuneDegree) % 360 + 360) % 360;
    currentFacingDegree = facing;

    // 3. Midpoint of A and B
    const midLat = (pointA.lat + pointB.lat) / 2;
    const midLng = (pointA.lng + pointB.lng) / 2;

    // 4. Ray length in meters (scaled with zoom)
    const rayDist = 20; // 20 meters ray
    const dest = destinationPoint(midLat, midLng, rayDist, facing);

    // 5. Draw / Update Wall Line (Yellow)
    if (!lineWall) {
      lineWall = L.polyline([[pointA.lat, pointA.lng], [pointB.lat, pointB.lng]], {
        color: '#fbbf24',
        weight: 4,
        opacity: 0.95
      }).addTo(map);
    } else {
      lineWall.setLatLngs([[pointA.lat, pointA.lng], [pointB.lat, pointB.lng]]);
    }

    // 6. Draw / Update Facing Ray (Red)
    if (!lineFacing) {
      lineFacing = L.polyline([[midLat, midLng], [dest.lat, dest.lng]], {
        color: '#dc2626',
        weight: 5,
        opacity: 1.0
      }).addTo(map);
    } else {
      lineFacing.setLatLngs([[midLat, midLng], [dest.lat, dest.lng]]);
    }

    // 7. Arrowhead & Label Marker at destination
    const arrowHtml = `
      <div class="sat-facing-arrow" style="transform: rotate(${facing}deg)">
        <div class="sat-arrow-head"></div>
      </div>
      <div class="sat-facing-badge">${facing.toFixed(1)}°</div>
    `;

    if (!markerArrow) {
      const arrowIcon = L.divIcon({
        className: 'sat-arrow-div',
        html: arrowHtml,
        iconSize: [80, 40],
        iconAnchor: [40, 20]
      });
      markerArrow = L.marker([dest.lat, dest.lng], { icon: arrowIcon, interactive: false }).addTo(map);
    } else {
      markerArrow.setLatLng([dest.lat, dest.lng]);
      const arrowIcon = L.divIcon({
        className: 'sat-arrow-div',
        html: arrowHtml,
        iconSize: [80, 40],
        iconAnchor: [40, 20]
      });
      markerArrow.setIcon(arrowIcon);
    }

    updateResultUI();
  }

  /**
   * Update Result UI Display
   */
  function updateResultUI() {
    const degEl = document.getElementById('satResultDegree');
    const nameEl = document.getElementById('satResultName');
    const subEl = document.getElementById('satResultSub');
    const btnApply = document.getElementById('btnSatApplyDegree');

    if (currentFacingDegree !== null && window.FlyingStar) {
      const deg = currentFacingDegree;
      const degStr = deg.toFixed(1);
      
      const mountain = window.FlyingStar.getMountain ? window.FlyingStar.getMountain(deg) : null;
      let mName = '';
      let mSub = '';

      if (mountain) {
        const palaceNames = { 1:'Khảm (Bắc)', 2:'Khôn (Tây Nam)', 3:'Chấn (Đông)', 4:'Tốn (Đông Nam)', 6:'Càn (Tây Bắc)', 7:'Đoài (Tây)', 8:'Cấn (Đông Bắc)', 9:'Ly (Nam)' };
        const pName = palaceNames[mountain.palace] || '';
        mName = `Hướng ${mountain.name} (${pName})`;

        // Check Kiem / Chinh
        const center = mountain.center;
        const diff = Math.abs(deg - center);
        const normDiff = Math.min(diff, 360 - diff);
        if (normDiff <= 1.5) {
          mSub = `✓ Chính Hướng thuần khiết (lệch tâm ${normDiff.toFixed(1)}°)`;
        } else if (normDiff <= 4.5) {
          mSub = `⚡ Kiêm Hướng (lệch tâm ${normDiff.toFixed(1)}° - Dùng Tinh Bàn Thế Quái)`;
        } else {
          mSub = `⚠️ Cận tuyến Không Vong (lệch tâm ${normDiff.toFixed(1)}°)`;
        }
      }

      if (degEl) degEl.textContent = `${degStr}°`;
      if (nameEl) nameEl.textContent = mName;
      if (subEl) subEl.textContent = mSub;
      if (btnApply) btnApply.disabled = false;
    } else {
      if (degEl) degEl.textContent = '0.0°';
      if (nameEl) nameEl.textContent = '-';
      if (subEl) subEl.textContent = 'Nhấp 2 điểm trên nóc nhà để bắt đầu đo';
      if (btnApply) btnApply.disabled = true;
    }
  }

  function updateInstruction(html) {
    const el = document.getElementById('satInstruction');
    if (el) el.innerHTML = html;
  }

  /**
   * Search Location Handler
   */
  async function handleSearch() {
    const input = document.getElementById('satSearchInput');
    if (!input) return;
    const query = (input.value || '').trim();
    if (!query) return;

    const btnSearch = document.getElementById('btnSatSearch');
    if (btnSearch) {
      btnSearch.innerText = 'Đang tìm...';
      btnSearch.disabled = true;
    }

    try {
      // 1. Try coordinate / link parse
      const coords = parseCoordinatesOrUrl(query);
      if (coords && map) {
        map.setView([coords.lat, coords.lng], 19, { animate: true });
        showUserLocationOnMap(coords.lat, coords.lng);
        return;
      }

      // 2. Try Nominatim address geocoding
      const geo = await geocodeAddress(query);
      if (geo && map) {
        map.setView([geo.lat, geo.lng], 19, { animate: true });
        showUserLocationOnMap(geo.lat, geo.lng);
      } else {
        alert('Không tìm thấy địa điểm. Vui lòng nhập tọa độ (VD: 21.0285, 105.8542) hoặc dán link Google Maps.');
      }
    } finally {
      if (btnSearch) {
        btnSearch.innerText = 'Tìm Vị Trí';
        btnSearch.disabled = false;
      }
    }
  }

  let userLocationMarker = null;
  let userLocationCircle = null;

  function showUserLocationOnMap(lat, lng, accuracy) {
    if (!map) return;

    if (userLocationMarker) {
      map.removeLayer(userLocationMarker);
      userLocationMarker = null;
    }
    if (userLocationCircle) {
      map.removeLayer(userLocationCircle);
      userLocationCircle = null;
    }

    // Blue pulsing GPS dot
    const gpsIcon = L.divIcon({
      className: 'sat-gps-dot-container',
      html: '<div class="sat-gps-pulse"></div><div class="sat-gps-dot"></div>',
      iconSize: [32, 32],
      iconAnchor: [16, 16]
    });

    userLocationMarker = L.marker([lat, lng], {
      icon: gpsIcon,
      interactive: false,
      zIndexOffset: 1000
    }).addTo(map);

    // Soft accuracy circle
    if (accuracy && accuracy > 0 && accuracy < 200) {
      userLocationCircle = L.circle([lat, lng], {
        radius: accuracy,
        color: '#2563eb',
        weight: 1.5,
        fillColor: '#3b82f6',
        fillOpacity: 0.12,
        interactive: false
      }).addTo(map);
    }
  }

  /**
   * GPS Current Location
   */
  function handleCurrentLocation() {
    if (!navigator.geolocation) {
      alert('Thiết bị hoặc trình duyệt không hỗ trợ định vị GPS.');
      return;
    }

    const btn = document.getElementById('btnSatCurrentLocation');
    if (btn) {
      btn.innerText = '📍 Đang lấy vị trí...';
      btn.disabled = true;
    }

    navigator.geolocation.getCurrentPosition(
      pos => {
        if (btn) {
          btn.innerText = '📍 Vị Trí Của Tôi';
          btn.disabled = false;
        }
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        const acc = pos.coords.accuracy;
        if (map) {
          map.setView([lat, lng], 19, { animate: true });
          showUserLocationOnMap(lat, lng, acc);
        }
      },
      err => {
        if (btn) {
          btn.innerText = '📍 Vị Trí Của Tôi';
          btn.disabled = false;
        }
        alert('Không thể truy cập vị trí GPS. Vui lòng cho phép quyền truy cập vị trí hoặc nhập tọa độ.');
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }

  /**
   * Switch Map Layers (Google Hybrid vs ESRI)
   */
  function switchLayer(layerType) {
    if (!map) return;
    if (layerType === 'google') {
      if (layerEsri) map.removeLayer(layerEsri);
      layerGoogle.addTo(map);
      currentLayer = 'google';
      document.getElementById('btnLayerGoogleHybrid')?.classList.add('active');
      document.getElementById('btnLayerEsri')?.classList.remove('active');
    } else {
      if (layerGoogle) map.removeLayer(layerGoogle);
      layerEsri.addTo(map);
      currentLayer = 'esri';
      document.getElementById('btnLayerEsri')?.classList.add('active');
      document.getElementById('btnLayerGoogleHybrid')?.classList.remove('active');
    }
  }

  /**
   * Open / Close Modal
   */
  function openModal() {
    const modal = document.getElementById('satelliteModal');
    if (!modal) return;
    modal.classList.remove('hidden');

    setTimeout(() => {
      initMap();
      if (map) {
        map.invalidateSize();
      }
    }, 150);
  }

  function closeModal() {
    const modal = document.getElementById('satelliteModal');
    if (modal) modal.classList.add('hidden');
  }

  /**
   * Apply Degree to Main Form
   */
  function applyDegree() {
    if (currentFacingDegree === null) return;
    const inputDegree = document.getElementById('inputDegree');
    if (inputDegree) {
      inputDegree.value = currentFacingDegree.toFixed(1);
      // Trigger input event to update anything bound
      inputDegree.dispatchEvent(new Event('input', { bubbles: true }));
      inputDegree.dispatchEvent(new Event('change', { bubbles: true }));
    }
    closeModal();

    // Visual feedback
    const btnCalculate = document.getElementById('btnCalculate');
    if (btnCalculate) {
      btnCalculate.focus();
    }
  }

  /**
   * Module Initialization & Event Binding
   */
  function init() {
    const btnOpen = document.getElementById('btnOpenSatellite');
    if (btnOpen) btnOpen.addEventListener('click', openModal);

    const btnClose = document.getElementById('btnCloseSatModal');
    if (btnClose) btnClose.addEventListener('click', closeModal);

    const backdrop = document.querySelector('.sat-modal-backdrop');
    if (backdrop) backdrop.addEventListener('click', closeModal);

    const btnSearch = document.getElementById('btnSatSearch');
    if (btnSearch) btnSearch.addEventListener('click', handleSearch);

    const searchInput = document.getElementById('satSearchInput');
    if (searchInput) {
      searchInput.addEventListener('keydown', function(e) {
        if (e.key === 'Enter') {
          e.preventDefault();
          handleSearch();
        }
      });
    }

    const btnCurrentLoc = document.getElementById('btnSatCurrentLocation');
    if (btnCurrentLoc) btnCurrentLoc.addEventListener('click', handleCurrentLocation);

    const btnGoogle = document.getElementById('btnLayerGoogleHybrid');
    if (btnGoogle) btnGoogle.addEventListener('click', () => switchLayer('google'));

    const btnEsri = document.getElementById('btnLayerEsri');
    if (btnEsri) btnEsri.addEventListener('click', () => switchLayer('esri'));

    // Flip normal (180 deg)
    const btnFlip = document.getElementById('btnSatFlipNormal');
    if (btnFlip) {
      btnFlip.addEventListener('click', function() {
        normalOffset = normalOffset === 90 ? -90 : 90;
        calculateAndDraw();
      });
    }

    // Fine-tune -0.5
    const btnMinus = document.getElementById('btnSatMinusHalf');
    if (btnMinus) {
      btnMinus.addEventListener('click', function() {
        fineTuneDegree = (fineTuneDegree - 0.5 + 360) % 360;
        calculateAndDraw();
      });
    }

    // Fine-tune +0.5
    const btnPlus = document.getElementById('btnSatPlusHalf');
    if (btnPlus) {
      btnPlus.addEventListener('click', function() {
        fineTuneDegree = (fineTuneDegree + 0.5) % 360;
        calculateAndDraw();
      });
    }

    // Reset points
    const btnReset = document.getElementById('btnSatResetPoints');
    if (btnReset) btnReset.addEventListener('click', resetAllPoints);

    // Apply button
    const btnApply = document.getElementById('btnSatApplyDegree');
    if (btnApply) btnApply.addEventListener('click', applyDegree);
  }

  // Auto initialize on DOM ready
  if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', init);
    } else {
      init();
    }
  }

  window.SatelliteCompass = {
    open: openModal,
    close: closeModal,
    calculateBearing: calculateBearing
  };

})();
