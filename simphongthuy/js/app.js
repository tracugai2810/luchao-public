/* ==========================================================================
   MAIN UI CONTROLLER - Website Sim Phong Thủy Lục Hào Pro
   - Mở hoàn toàn 100%: Tra cứu & Đánh giá SIM không cần đăng nhập hay Xu
   - Tối ưu Mobile-First, mượt mà trên mọi thiết bị
   ========================================================================== */

let currentResults = [];
let currentSimEvalItem = null;

document.addEventListener('DOMContentLoaded', () => {
    initFormDefaults();
    setupDigitBoxes();
    setupFormEvents();
    setupModalEvents();
    setupCurrentSimEval();
});

function isMobileDevice() {
    return window.innerWidth <= 768 || /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

function initFormDefaults() {
    const now = new Date();
    const offset = now.getTimezoneOffset() * 60000;
    const localISOTime = (new Date(now.getTime() - offset)).toISOString().slice(0, 16);

    const dateInput = document.getElementById('birthDate');
    if (dateInput) {
        dateInput.value = localISOTime;
    }
}

function setupDigitBoxes() {
    const boxes = Array.from(document.querySelectorAll('.digit-box:not(.fixed-zero)'));

    boxes.forEach((box, idx) => {
        box.addEventListener('input', (e) => {
            const val = e.target.value;
            e.target.value = val.replace(/[^0-9]/g, '');

            if (e.target.value.length >= 1) {
                e.target.value = e.target.value.slice(-1);
                if (idx < boxes.length - 1) {
                    boxes[idx + 1].focus();
                }
            }
        });

        box.addEventListener('keydown', (e) => {
            if (e.key === 'Backspace' && !e.target.value) {
                if (idx > 0) {
                    boxes[idx - 1].focus();
                }
            }
        });

        box.addEventListener('focus', (e) => {
            e.target.select();
        });
    });

    const prefixSelect = document.getElementById('prefixSelect');
    if (prefixSelect) {
        prefixSelect.addEventListener('change', (e) => {
            const prefix = e.target.value;
            if (!prefix) return;

            const digit2 = document.getElementById('digit-2');
            const digit3 = document.getElementById('digit-3');

            if (prefix.length >= 2 && digit2) digit2.value = prefix[1] || '';
            if (prefix.length >= 3 && digit3) digit3.value = prefix[2] || '';
        });
    }
}

function getFormInputs() {
    const birthDateVal = document.getElementById('birthDate')?.value || '';
    const genderRadio = document.querySelector('input[name="genderRadio"]:checked');
    const genderSelect = document.getElementById('gender');
    const gender = genderRadio ? genderRadio.value : (genderSelect ? genderSelect.value : 'male');
    const purpose = document.getElementById('purpose')?.value || document.getElementById('purposeSelect')?.value || 'cautai';
    const limitVal = parseInt(document.getElementById('limitSelect')?.value) || 5;

    return { birthDateVal, gender, purpose, limitVal };
}

function setupFormEvents() {
    const btnSubmitSearch = document.getElementById('btnSubmitSearch');
    const form = document.getElementById('simForm');

    const handleSearch = (e) => {
        if (e) e.preventDefault();

        const { birthDateVal } = getFormInputs();
        if (!birthDateVal) {
            showToast("Vui lòng chọn ngày & giờ sinh!");
            return;
        }

        executeSearchSims();
    };

    if (btnSubmitSearch) btnSubmitSearch.addEventListener('click', handleSearch);
    if (form) form.addEventListener('submit', handleSearch);
}

function setupCurrentSimEval() {
    const btn = document.getElementById('btnEvalCurrentSim');
    if (!btn) return;

    btn.addEventListener('click', () => {
        const { birthDateVal } = getFormInputs();
        if (!birthDateVal) {
            showToast("Vui lòng chọn ngày & giờ sinh trước!");
            return;
        }

        const inputEl = document.getElementById('currentSimInput') || document.getElementById('evalCurrentSim');
        const inputSim = inputEl ? inputEl.value.trim() : '';
        const rawSim = inputSim.replace(/[^0-9]/g, '');

        if (!rawSim || rawSim.length !== 10) {
            showToast("Vui lòng nhập SĐT đang dùng hợp lệ chuẩn 10 chữ số!");
            return;
        }

        executeEvalCurrentSim();
    });
}

function getPurposeText(purposeKey) {
    const map = {
        'cautai': 'Cầu Tài Lộc (Thê Tài)',
        'cauquan': 'Cầu Công Danh, Quan Lộc (Quan Quỷ)',
        'suckhoe': 'Cầu Sức Khỏe, Bình An (Hào Thế)',
        'concai': 'Cầu Con Cái, Gia Đạo (Tử Tôn)',
        'honnhan': 'Cầu Hôn Nhân, Tình Duyên'
    };
    return map[purposeKey] || 'Cầu Tài Lộc (Thê Tài)';
}

function executeEvalCurrentSim() {
    const inputEl = document.getElementById('currentSimInput') || document.getElementById('evalCurrentSim');
    const inputSim = inputEl ? inputEl.value.trim() : '';
    const rawSim = inputSim.replace(/[^0-9]/g, '');
    const { birthDateVal, gender, purpose } = getFormInputs();

    const cal = calculateCanChi(birthDateVal);
    const hexData = calculateSimHexagram(rawSim, cal);

    if (!hexData) {
        showToast("Không thể lập quẻ từ dãy số này!");
        return;
    }

    const evaluation = evaluateSimFengShui(rawSim, hexData, cal, purpose, gender);

    const currentSimArea = document.getElementById('currentSimResultArea') || document.getElementById('currentSimResultBox');
    const formattedSim = formatSimNumber(rawSim);
    currentSimEvalItem = { sim: rawSim, hexData, evaluation, purpose, purposeText: getPurposeText(purpose), birthDateVal };

    if (currentSimArea) {
        currentSimArea.style.display = 'block';
        currentSimArea.innerHTML = `
            <div class="sim-card sim-card-evaluated">
                <div class="sim-info">
                    <div class="sim-eval-label">
                        KẾT QUẢ ĐÁNH GIÁ SIM ĐANG DÙNG:
                    </div>
                    <div class="sim-number-display" style="font-size: 1.8rem;">
                        <span class="highlight">${formattedSim}</span>
                    </div>

                    <div class="sim-badge-group">
                        <span class="badge badge-score">${evaluation.score}/100 - ${evaluation.grade}</span>
                        <span class="badge badge-hex">Quẻ Chủ: ${hexData.mainName} → ${hexData.changedName}</span>
                    </div>
                </div>

                <div class="sim-actions">
                    <button class="btn-action btn-view-hex" onclick="handleCurrentSimDetail()">
                        Xem Chi Tiết
                    </button>
                </div>
            </div>
        `;

        currentSimArea.scrollIntoView({ behavior: 'smooth' });
    }
}

function executeSearchSims() {
    const { birthDateVal, gender, purpose, limitVal } = getFormInputs();

    let pattern = '0';
    for (let i = 2; i <= 10; i++) {
        const el = document.getElementById(`digit-${i}`);
        const val = el ? el.value.trim() : '';
        pattern += val ? val : '*';
    }

    const resultsContainer = document.getElementById('resultsContainer');
    if (resultsContainer) {
        resultsContainer.innerHTML = `
            <div class="sim-loading-state">
                <p style="font-size: 1.05rem; font-weight: 600;">Đang lập quẻ Lục Hào & Tính toán Top ${limitVal} SIM Cát Tường...</p>
            </div>
        `;
    }

    setTimeout(() => {
        currentResults = generateMatchingSims(pattern, birthDateVal, gender, purpose, limitVal);
        if (Array.isArray(currentResults)) {
            currentResults.forEach(r => {
                r.purpose = purpose;
                r.purposeText = getPurposeText(purpose);
            });
        }
        renderResults(currentResults);
    }, 20);
}

function renderResults(results) {
    const resultsContainer = document.getElementById('resultsContainer');
    const resultsHeader = document.getElementById('resultsHeader');

    if (!results || results.length === 0) {
        if (resultsHeader) resultsHeader.style.display = 'none';
        resultsContainer.innerHTML = `
            <div class="sim-empty-state">
                <p class="sim-empty-title">Không tìm thấy dãy số phù hợp đạt điều kiện Lục Hào Cát Tường.</p>
                <p class="sim-empty-hint">Gợi ý: Hãy thử bỏ bớt các chữ số cố định (để ô trống) để hệ thống có nhiều lựa chọn phối số hơn.</p>
            </div>
        `;
        return;
    }

    if (resultsHeader) {
        resultsHeader.style.display = 'flex';
        document.getElementById('resultCount').textContent = `${results.length} số Đại Cát`;
    }

    let html = '<div class="sim-list">';

    results.forEach((item, index) => {
        const formattedSim = formatSimNumber(item.sim);
        const { score, grade } = item.evaluation;
        const hex = item.hexData;

        html += `
            <div class="sim-card">
                <div class="sim-info">
                    <div class="sim-number-display">
                        ${index + 1}. <span class="highlight">${formattedSim}</span>
                    </div>

                    <div class="sim-badge-group">
                        <span class="badge badge-score">${score}/100 - ${grade}</span>
                        <span class="badge badge-hex">Quẻ Chủ: ${hex.mainName} → ${hex.changedName}</span>
                    </div>
                </div>

                <div class="sim-actions">
                    <button class="btn-action btn-view-hex" onclick="handleDetailClick(${index})">
                        🔍 Xem Chi Tiết
                    </button>
                    <button class="btn-action btn-copy-info" onclick="copySimNumberOnly('${formattedSim}')">
                        📋 Sao Chép
                    </button>
                </div>
            </div>
        `;
    });

    html += '</div>';
    resultsContainer.innerHTML = html;
}

function formatSimNumber(sim) {
    if (sim.length === 10) {
        return `${sim.slice(0, 4)}.${sim.slice(4, 7)}.${sim.slice(7)}`;
    }
    return sim;
}

function copySimNumberOnly(simStr) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(simStr).then(() => {
            showToast(`Đã sao chép: ${simStr}`);
        }).catch(() => fallbackCopy(simStr));
    } else {
        fallbackCopy(simStr);
    }
}

function fallbackCopy(text) {
    const ta = document.createElement('textarea');
    ta.value = text;
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    document.body.removeChild(ta);
    showToast(`Đã sao chép: ${text}`);
}

function showToast(message) {
    const toast = document.getElementById('toast');
    if (!toast) {
        alert(message);
        return;
    }
    toast.textContent = message;
    toast.classList.add('show');
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3200);
}

function renderHexVisual(lines, isChanged) {
    const bits = lines.map(v => getBit(v, isChanged));
    let html = '';

    for (let i = 5; i >= 0; i--) {
        const isMoving = (lines[i] === 0 || lines[i] === 3);
        const moveClass = isMoving ? 'moving' : '';
        html += `<div class="gua-line ${bits[i] === '1' ? 'yang' : 'yin'} ${moveClass}"></div>`;
    }

    return `<div class="gua-container">${html}</div>`;
}

function handleDetailClick(index) {
    const item = currentResults[index];
    if (!item) return;
    openHexModalDesktopObject(item);
}

function handleCurrentSimDetail() {
    if (!currentSimEvalItem) return;
    openHexModalDesktopObject(currentSimEvalItem);
}

function formatDateTimeVN(dateStr) {
    if (!dateStr) return '';
    try {
        const d = new Date(dateStr);
        if (isNaN(d.getTime())) return dateStr;
        const dd = String(d.getDate()).padStart(2, '0');
        const mm = String(d.getMonth() + 1).padStart(2, '0');
        const yyyy = d.getFullYear();
        const hh = String(d.getHours()).padStart(2, '0');
        const mi = String(d.getMinutes()).padStart(2, '0');
        return `${dd}/${mm}/${yyyy} - ${hh}:${mi}`;
    } catch (e) {
        return dateStr;
    }
}

function buildHexCardHTML(item) {
    const { hexData, sim, evaluation } = item;

    let rowsHtml = '';
    for (let i = 5; i >= 0; i--) {
        const line = hexData.linesData[i];
        const rowClass = line.isMoving ? 'row-moving' : 'row-static';

        let sym = (line.val === 1) ? '—' : (line.val === 2) ? '--' : (line.val === 3) ? 'O' : 'X';

        let sy = '';
        if (line.isShi) sy = `<span class="marker-the">Thế</span>`;
        if (line.isYing) sy = `<span class="marker-ung">Ứng</span>`;

        let phucHtml = '-';
        if (line.phucThan) {
            phucHtml = `<span class="phuc-than">${line.phucThan.rel} - ${line.phucThan.branch}</span>`;
        }

        const isTK = line.isTK ? 'K' : '-';
        const isCTK = line.isCTK ? 'K' : '-';

        rowsHtml += `
            <tr class="${rowClass}">
                <td>${sym}</td>
                <td>${sy}</td>
                <td>${line.relation}</td>
                <td>${line.chi}-${line.hanh}</td>
                <td>${phucHtml}</td>
                <td>${isTK}</td>
                <td class="sep-col">${line.changed.relation}</td>
                <td>${line.changed.branch}-${line.changed.hanh}</td>
                <td>${line.lucThu}</td>
                <td>${isCTK}</td>
                <td>${line.tsNgay}</td>
                <td>${line.tsThang}</td>
            </tr>
        `;
    }

    const { purpose, purposeText: pText, birthDateVal } = getFormInputs();
    const purposeDisplay = item.purposeText || getPurposeText(item.purpose || purpose) || pText;
    const rawBirthDate = item.birthDateVal || birthDateVal;
    const formattedBirthDate = formatDateTimeVN(rawBirthDate);

    return `
        <div id="hexCardCapture" class="hex-card-view">
            <!-- Header Thông Tin -->
            <div class="info-header">
                <div class="info-content">
                    <div class="info-line"><strong>SIM Chọn:</strong> <span class="highlight" style="font-size:18px;">${formatSimNumber(sim)}</span></div>
                    ${formattedBirthDate ? `
                    <div class="info-line"><strong>Ngày giờ:</strong> <span class="highlight">${formattedBirthDate}</span></div>
                    ` : ''}
                    <div class="info-line"><strong>Mục đích cầu:</strong> <span class="highlight">${purposeDisplay}</span></div>
                    <div class="info-line"><strong>Tuần Không:</strong> <span class="highlight">${hexData.dateInfo.tuanKhong}</span></div>
                    <div class="info-line">
                        <strong>Nhật Thần:</strong> <span class="highlight">${hexData.dateInfo.nhatThan}</span> &nbsp;&nbsp;&nbsp;&nbsp; 
                        <strong>Nguyệt Lệnh:</strong> <span class="highlight">${hexData.dateInfo.nguyetLenh}</span>
                        ${hexData.dateInfo.tietKhi ? ` &nbsp;&nbsp;&nbsp;&nbsp; <strong>Tiết khí:</strong> <span class="highlight">${hexData.dateInfo.tietKhi}</span>` : ''}
                    </div>
                </div>
            </div>

            <!-- 3 Cột vẽ hình Hào Quẻ Chủ - Quẻ Hỗ - Quẻ Biến -->
            <div class="hex-visual-section">
                <div class="hex-box">
                    <div class="hex-title">${hexData.mainName}</div>
                    ${renderHexVisual(hexData.lines, false)}
                    <div class="hex-family">Họ ${hexData.palaceName}${hexData.mainAttr ? ' - ' + hexData.mainAttr : ''}</div>
                </div>

                ${hexData.hoData ? `
                <div class="hex-box">
                    <div class="hex-title">${hexData.hoData.name}</div>
                    ${renderHexVisual(hexData.hoData.lines, false)}
                    <div class="hex-family">Họ ${hexData.hoData.palaceName}${hexData.hoData.attr ? ' - ' + hexData.hoData.attr : ''}</div>
                    ${hexData.ngamResult && hexData.ngamResult.length > 0 ? `<div style="font-size:14px; font-weight:bold; margin-top:4px;">${hexData.ngamResult.join(', ')}</div>` : ''}
                </div>` : ''}

                <div class="hex-box">
                    <div class="hex-title">${hexData.changedName}</div>
                    ${renderHexVisual(hexData.lines, true)}
                    <div class="hex-family">Họ ${hexData.changedPalaceName}${hexData.changedAttr ? ' - ' + hexData.changedAttr : ''}</div>
                </div>
            </div>

            <!-- Bảng Lục Hào 12 Cột -->
            <table>
                <thead>
                    <tr>
                        <th>Hào</th>
                        <th>T/Ư</th>
                        <th>Lục Thân</th>
                        <th>Can Chi</th>
                        <th>P.Thần</th>
                        <th>TK</th>
                        <th class="sep-col">Lục Thân</th>
                        <th>Can Chi</th>
                        <th>Lục Thú</th>
                        <th>TK</th>
                        <th>TS Ngày</th>
                        <th>TS Tháng</th>
                    </tr>
                </thead>
                <tbody>
                    ${rowsHtml}
                </tbody>
            </table>

            <!-- Watermark Chú Thích Bản Quyền -->
            <div class="hex-watermark-note">
                Quẻ SĐT được lập tại: <strong>luchao.io.vn/simphongthuy</strong>
            </div>
        </div>
    `;
}

let currentSimModalObjectUrl = null;

function drawSimCanvasRoundRect(ctx, x, y, w, h, r) {
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

function drawSimSpans(ctx, spans, startX, y) {
    let curX = startX;
    for (const span of spans) {
        ctx.font = span.font || '18px Inter, sans-serif';
        ctx.fillStyle = span.color || '#000000';
        ctx.fillText(span.text, curX, y);
        curX += ctx.measureText(span.text).width;
    }
    return curX;
}

async function renderSimHexagramToCanvas(item) {
    if (window.PortalImageDownload && window.PortalImageDownload.waitForFonts) {
        await window.PortalImageDownload.waitForFonts([
            '400 16px Inter',
            '400 18px Inter',
            '700 16px Inter',
            '700 18px Inter',
            '700 20px Inter'
        ], 1800);
    } else if (document.fonts && document.fonts.ready) {
        await document.fonts.ready.catch(() => {});
    }

    const { hexData, sim } = item;
    const { purpose, purposeText: pText, birthDateVal } = getFormInputs();
    const purposeDisplay = item.purposeText || getPurposeText(item.purpose || purpose) || pText || '';
    const rawBirthDate = item.birthDateVal || birthDateVal;
    const formattedBirthDate = formatDateTimeVN(rawBirthDate);

    const W = 1160;
    const SCALE = 1.5; // 1740px lossless PNG (< 2000px for crisp Zalo/Facebook delivery)
    const padX = 24;
    const contentW = W - padX * 2; // 1112px

    let hy = 46;
    hy += 32; // SIM Chon
    if (formattedBirthDate) hy += 30;
    hy += 30; // Muc dich cau
    hy += 30; // Tuan Khong
    hy += 24; // Nhat Than / Nguyet Lenh / Tiet khi + gap
    const yDiv1 = hy;

    const yHexTitle = yDiv1 + 36;
    const yBarsStart = yHexTitle + 20;
    const yFam = yBarsStart + 6 * 24 + 14;
    const hasHoNgam = !!(hexData.hoData && hexData.ngamResult && hexData.ngamResult.length > 0);
    const yDiv2 = yFam + (hasHoNgam ? 42 : 24);

    const tableTop = yDiv2 + 14;
    const tableHeadH = 38;
    const rowH = 38;
    const rowStartY = tableTop + tableHeadH;
    const tableBottom = rowStartY + 6 * rowH;

    const footerTop = tableBottom + 20;
    const H = Math.ceil(footerTop + 52);

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = Math.round(W * SCALE);
    canvas.height = Math.round(H * SCALE);
    ctx.scale(SCALE, SCALE);

    if (window.PortalImageDownload && window.PortalImageDownload.enableInkText) {
        window.PortalImageDownload.enableInkText(ctx, 0.22);
    }

    // 1. Giữ nguyên nền giấy vàng kem #fefee5
    ctx.fillStyle = '#fefee5';
    ctx.fillRect(0, 0, W, H);

    ctx.save();
    ctx.strokeStyle = '#d4ccb4';
    ctx.lineWidth = 2;
    drawSimCanvasRoundRect(ctx, 10, 10, W - 20, H - 20, 18);
    ctx.stroke();
    ctx.restore();

    // 2. Header Thông Tin SIM
    ctx.textAlign = 'left';
    let curY = 46;
    drawSimSpans(ctx, [
        { text: 'SIM Chọn: ', font: 'bold 18px Inter, sans-serif', color: '#000000' },
        { text: formatSimNumber(sim), font: 'bold 21px Inter, sans-serif', color: '#e60000' }
    ], padX, curY);
    curY += 32;

    if (formattedBirthDate) {
        drawSimSpans(ctx, [
            { text: 'Ngày giờ: ', font: 'bold 18px Inter, sans-serif', color: '#000000' },
            { text: formattedBirthDate, font: 'bold 18px Inter, sans-serif', color: '#e60000' }
        ], padX, curY);
        curY += 30;
    }

    drawSimSpans(ctx, [
        { text: 'Mục đích cầu: ', font: 'bold 18px Inter, sans-serif', color: '#000000' },
        { text: purposeDisplay, font: 'bold 18px Inter, sans-serif', color: '#e60000' }
    ], padX, curY);
    curY += 30;

    drawSimSpans(ctx, [
        { text: 'Tuần Không: ', font: 'bold 18px Inter, sans-serif', color: '#000000' },
        { text: hexData.dateInfo.tuanKhong || '', font: 'bold 18px Inter, sans-serif', color: '#e60000' }
    ], padX, curY);
    curY += 30;

    const infoLineSpans = [
        { text: 'Nhật Thần: ', font: 'bold 18px Inter, sans-serif', color: '#000000' },
        { text: (hexData.dateInfo.nhatThan || '') + '    ', font: 'bold 18px Inter, sans-serif', color: '#e60000' },
        { text: 'Nguyệt Lệnh: ', font: 'bold 18px Inter, sans-serif', color: '#000000' },
        { text: hexData.dateInfo.nguyetLenh || '', font: 'bold 18px Inter, sans-serif', color: '#e60000' }
    ];
    if (hexData.dateInfo.tietKhi) {
        infoLineSpans.push({ text: '    Tiết khí: ', font: 'bold 18px Inter, sans-serif', color: '#000000' });
        infoLineSpans.push({ text: hexData.dateInfo.tietKhi, font: 'bold 18px Inter, sans-serif', color: '#e60000' });
    }
    drawSimSpans(ctx, infoLineSpans, padX, curY);

    ctx.strokeStyle = '#888888';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(padX, yDiv1);
    ctx.lineTo(W - padX, yDiv1);
    ctx.stroke();

    // 3. Khu vực 3 hình Quẻ Chủ - Quẻ Hỗ - Quẻ Biến
    const drawSingleSimHex = (centerX, titleText, linesArr, useChanged, familyText) => {
        ctx.textAlign = 'center';
        ctx.font = 'bold 20px Inter, sans-serif';
        ctx.fillStyle = '#c41e3a';
        ctx.fillText((titleText || '').toUpperCase(), centerX, yHexTitle);

        const bits = linesArr.map(v => getBit(v, useChanged));
        for (let i = 5; i >= 0; i--) {
            const lineIdx = 5 - i;
            const lineY = yBarsStart + lineIdx * 24;
            const isMoving = linesArr[i] === 0 || linesArr[i] === 3;
            const barColor = isMoving ? '#e60000' : '#1a1a1a';
            const isYang = bits[i] === '1';
            ctx.fillStyle = barColor;
            if (isYang) {
                ctx.fillRect(centerX - 55, lineY, 110, 16);
            } else {
                ctx.fillRect(centerX - 55, lineY, 46, 16);
                ctx.fillRect(centerX - 55 + 46 + 18, lineY, 46, 16);
            }
        }

        ctx.font = 'bold 17px Inter, sans-serif';
        ctx.fillStyle = '#333333';
        ctx.fillText(familyText.toUpperCase(), centerX, yFam);
    };

    if (hexData.hoData) {
        const cXMain = 220, cXHo = 580, cXChanged = 940;
        drawSingleSimHex(
            cXMain,
            hexData.mainName,
            hexData.lines,
            false,
            `HỌ ${hexData.palaceName}${hexData.mainAttr ? ' - ' + hexData.mainAttr : ''}`
        );
        drawSingleSimHex(
            cXHo,
            hexData.hoData.name,
            hexData.hoData.lines,
            false,
            `HỌ ${hexData.hoData.palaceName}${hexData.hoData.attr ? ' - ' + hexData.hoData.attr : ''}`
        );
        drawSingleSimHex(
            cXChanged,
            hexData.changedName,
            hexData.lines,
            true,
            `HỌ ${hexData.changedPalaceName}${hexData.changedAttr ? ' - ' + hexData.changedAttr : ''}`
        );
        if (hexData.ngamResult && hexData.ngamResult.length > 0) {
            ctx.textAlign = 'center';
            ctx.font = 'bold 15px Inter, sans-serif';
            ctx.fillStyle = '#000000';
            ctx.fillText(hexData.ngamResult.join(', ').toUpperCase(), cXHo, yFam + 24);
        }
    } else {
        const cXMain = 320, cXChanged = 840;
        drawSingleSimHex(
            cXMain,
            hexData.mainName,
            hexData.lines,
            false,
            `HỌ ${hexData.palaceName}${hexData.mainAttr ? ' - ' + hexData.mainAttr : ''}`
        );
        drawSingleSimHex(
            cXChanged,
            hexData.changedName,
            hexData.lines,
            true,
            `HỌ ${hexData.changedPalaceName}${hexData.changedAttr ? ' - ' + hexData.changedAttr : ''}`
        );
        if (hexData.ngamResult && hexData.ngamResult.length > 0) {
            ctx.textAlign = 'center';
            ctx.font = 'bold 17px Inter, sans-serif';
            ctx.fillStyle = '#000000';
            const startNgamY = yBarsStart + 68 - ((hexData.ngamResult.length - 1) * 24) / 2;
            hexData.ngamResult.forEach((txt, idx) => {
                ctx.fillText(txt.toUpperCase(), W / 2, startNgamY + idx * 24);
            });
        }
    }

    ctx.strokeStyle = '#888888';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(padX, yDiv2);
    ctx.lineTo(W - padX, yDiv2);
    ctx.stroke();

    // 4. Bảng Lục Hào 12 Cột
    const colWidths = [56, 67, 117, 117, 117, 50, 106, 112, 128, 45, 98, 99];
    const colLefts = [];
    let curColX = padX;
    for (const w of colWidths) {
        colLefts.push(curColX);
        curColX += w;
    }
    const sepColX = colLefts[6];

    ctx.fillStyle = '#e2e2cc';
    ctx.fillRect(padX, tableTop, contentW, tableHeadH);

    ctx.strokeStyle = '#bbbbbb';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(padX, tableTop);
    ctx.lineTo(W - padX, tableTop);
    ctx.moveTo(padX, tableTop + tableHeadH);
    ctx.lineTo(W - padX, tableTop + tableHeadH);
    ctx.stroke();

    ctx.strokeStyle = 'rgba(0, 0, 0, 0.25)';
    ctx.beginPath();
    ctx.moveTo(sepColX, tableTop);
    ctx.lineTo(sepColX, tableTop + tableHeadH);
    ctx.stroke();

    const headers = ['HÀO', 'T/Ư', 'LỤC THÂN', 'CAN CHI', 'P.THẦN', 'TK', 'LỤC THÂN', 'CAN CHI', 'LỤC THÚ', 'TK', 'TS NGÀY', 'TS THÁNG'];
    ctx.font = 'bold 16px Inter, sans-serif';
    ctx.fillStyle = '#1a1a1a';
    ctx.textAlign = 'center';
    headers.forEach((h, idx) => {
        ctx.fillText(h, colLefts[idx] + colWidths[idx] / 2, tableTop + 25);
    });

    for (let r = 0; r < 6; r++) {
        const i = 5 - r;
        const line = hexData.linesData[i];
        const rY = rowStartY + r * rowH;
        const centerY = rY + 25;

        ctx.strokeStyle = '#d0c8b8';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(padX, rY + rowH);
        ctx.lineTo(W - padX, rY + rowH);
        ctx.stroke();

        ctx.strokeStyle = 'rgba(0, 0, 0, 0.25)';
        ctx.beginPath();
        ctx.moveTo(sepColX, rY);
        ctx.lineTo(sepColX, rY + rowH);
        ctx.stroke();

        const isMoving = line.isMoving;
        const textColor = isMoving ? '#e60000' : '#000000';
        const rowFont = isMoving ? 'bold 17.5px Inter, sans-serif' : '17.5px Inter, sans-serif';

        const sym = (line.val === 1) ? '—' : (line.val === 2) ? '--' : (line.val === 3) ? 'O' : 'X';
        const tu = line.isShi ? 'Thế' : line.isYing ? 'Ứng' : '';
        const phucThan = line.phucThan ? `${line.phucThan.rel} - ${line.phucThan.branch}` : '-';
        const tk = line.isTK ? 'K' : '-';
        const ctk = line.isCTK ? 'K' : '-';

        const vals = [
            sym,
            tu,
            line.relation,
            `${line.chi}-${line.hanh}`,
            phucThan,
            tk,
            line.changed.relation,
            `${line.changed.branch}-${line.changed.hanh}`,
            line.lucThu,
            ctk,
            line.tsNgay,
            line.tsThang
        ];

        vals.forEach((v, idx) => {
            const cX = colLefts[idx] + colWidths[idx] / 2;
            ctx.textAlign = 'center';
            if (idx === 1 && v) {
                ctx.font = 'bold 17.5px Inter, sans-serif';
                ctx.fillStyle = isMoving ? '#e60000' : '#1a1a1a';
            } else if (idx === 4 && !isMoving) {
                ctx.font = '17.5px Inter, sans-serif';
                ctx.fillStyle = '#1a1a1a';
            } else {
                ctx.font = rowFont;
                ctx.fillStyle = textColor;
            }
            ctx.fillText(v, cX, centerY);
        });
    }

    // 5. Chân trang bản quyền luchao.io.vn/simphongthuy
    ctx.save();
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.25)';
    ctx.lineWidth = 1;
    ctx.setLineDash([6, 4]);
    ctx.beginPath();
    ctx.moveTo(padX, footerTop);
    ctx.lineTo(W - padX, footerTop);
    ctx.stroke();
    ctx.restore();

    const fPart1 = 'Quẻ SĐT được lập tại: ';
    const fPart2 = 'luchao.io.vn/simphongthuy';
    ctx.font = 'italic 17px Inter, sans-serif';
    const w1 = ctx.measureText(fPart1).width;
    ctx.font = 'bold 17px Inter, sans-serif';
    const w2 = ctx.measureText(fPart2).width;
    const fStartX = (W - (w1 + w2)) / 2;
    ctx.textAlign = 'left';
    drawSimSpans(ctx, [
        { text: fPart1, font: 'italic 17px Inter, sans-serif', color: '#475569' },
        { text: fPart2, font: 'bold 17px Inter, sans-serif', color: '#b91c1c' }
    ], fStartX, footerTop + 28);

    return canvas;
}

async function openHexModalDesktopObject(item) {
    if (!item) return;

    const modalBody = document.getElementById('modalBody');
    const isMobile = isMobileDevice();
    const formattedSim = formatSimNumber(item.sim);
    const filename = `la-que-sim-${formattedSim.replace(/[^0-9]/g, '')}-${Date.now()}.png`;

    modalBody.innerHTML = `
        <div style="text-align:center; padding:24px; color:#64748b;">
            <div style="font-size:1.5rem; margin-bottom:8px;">⏳</div>
            Đang tạo ảnh lá quẻ sắc nét HD...
        </div>
    `;
    openModal('hexModal');

    try {
        const canvas = await renderSimHexagramToCanvas(item);
        const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
        const dataUrl = blob ? '' : canvas.toDataURL('image/png');
        const resolvedBlob = blob || (window.PortalImageDownload ? window.PortalImageDownload.dataURItoBlob(dataUrl) : null);
        const cachedFile = (resolvedBlob && window.PortalImageDownload)
            ? window.PortalImageDownload.prepareFile(resolvedBlob, filename)
            : null;

        if (currentSimModalObjectUrl) {
            URL.revokeObjectURL(currentSimModalObjectUrl);
            currentSimModalObjectUrl = null;
        }
        const displaySrc = resolvedBlob ? (currentSimModalObjectUrl = URL.createObjectURL(resolvedBlob)) : dataUrl;

        const hintHtml = !isMobile ? `
            <div class="desktop-img-hint">
                💡 <strong>Mẹo:</strong> Bạn có thể bấm nút Tải Ảnh phía trên hoặc nhấp chuột phải vào ảnh để <em>Sao chép hình ảnh</em>.
            </div>
        ` : '';

        modalBody.innerHTML = `
            <div class="hex-card-scroll-wrapper">
                <img src="${displaySrc}" class="hex-native-img" alt="Lá quẻ SIM ${item.sim}" />
            </div>
            <button type="button" id="btnDownloadSimHex" class="btn-mobile-share-ios btn-sim-modal-download">
                📥 Tải Ảnh / Chia Sẻ Quẻ SIM
            </button>
            ${hintHtml}
        `;

        const downloadBtn = document.getElementById('btnDownloadSimHex');
        if (downloadBtn) {
            downloadBtn.addEventListener('click', () => {
                if (window.PortalImageDownload) {
                    window.PortalImageDownload.saveOrShare({
                        file: cachedFile,
                        blob: resolvedBlob,
                        dataUrl: dataUrl,
                        filename: filename,
                        title: `Lá Quẻ SIM Phong Thủy - ${formattedSim}`,
                        text: `Lá quẻ Dịch Học SIM Phong Thủy SĐT: ${formattedSim}`,
                        onSuccess: showToast,
                        onError: showToast
                    });
                } else {
                    fallbackDownloadBlob(resolvedBlob, filename, dataUrl);
                }
            });
        }
    } catch (err) {
        console.error('Native Canvas Sim export error:', err);
        modalBody.innerHTML = buildHexCardHTML(item);
    }
}

function dataURItoBlob(dataURI) {
    if (window.PortalImageDownload) return window.PortalImageDownload.dataURItoBlob(dataURI);
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

function fallbackDownloadBlob(blob, filename, dataUrl) {
    if (window.PortalImageDownload) {
        const ok = window.PortalImageDownload.directDownload(blob, filename, dataUrl);
        if (ok) showToast('Đã tải ảnh HD về máy thành công!');
        else showToast('Không thể tải ảnh. Vui lòng thử lại!');
        return;
    }
    const downloadUrl = blob ? URL.createObjectURL(blob) : (dataUrl || '');
    if (!downloadUrl) {
        showToast("Không thể tải ảnh. Vui lòng thử lại!");
        return;
    }
    const link = document.createElement('a');
    link.download = filename;
    link.href = downloadUrl;
    link.rel = 'noopener';
    document.body.appendChild(link);
    link.click();
    setTimeout(() => {
        if (document.body.contains(link)) document.body.removeChild(link);
        if (blob) URL.revokeObjectURL(downloadUrl);
    }, 500);
    showToast('Đã tải ảnh về máy thành công!');
}

let lastCloseTime = 0;

function openModal(modalId, force = false) {
    if (!force && Date.now() - lastCloseTime < 250) return;
    const modal = document.getElementById(modalId);
    if (modal) modal.classList.add('active');
}

function closeModal(modalId) {
    lastCloseTime = Date.now();
    if (typeof modalId === 'string') {
        const modal = document.getElementById(modalId);
        if (modal) modal.classList.remove('active');
    } else if (modalId && modalId.target) {
        const modal = modalId.target.closest('.modal-overlay');
        if (modal) modal.classList.remove('active');
    } else {
        document.querySelectorAll('.modal-overlay.active').forEach(m => m.classList.remove('active'));
    }
}

window.openModal = openModal;
window.closeModal = closeModal;

function setupModalEvents() {
    document.querySelectorAll('.modal-close').forEach(btn => {
        const handleClose = (e) => {
            if (e) {
                e.preventDefault();
                e.stopPropagation();
            }
            lastCloseTime = Date.now();
            const modal = btn.closest('.modal-overlay');
            if (modal) {
                modal.classList.remove('active');
            }
            return false;
        };

        btn.onclick = handleClose;
    });

    const modals = document.querySelectorAll('.modal-overlay');
    modals.forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                lastCloseTime = Date.now();
                modal.classList.remove('active');
            }
        });
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            lastCloseTime = Date.now();
            document.querySelectorAll('.modal-overlay.active').forEach(modal => {
                modal.classList.remove('active');
            });
        }
    });
}
