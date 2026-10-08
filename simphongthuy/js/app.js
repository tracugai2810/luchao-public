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
    currentSimEvalItem = { sim: rawSim, hexData, evaluation, purpose, purposeText: getPurposeText(purpose) };

    if (currentSimArea) {
        currentSimArea.style.display = 'block';
        currentSimArea.innerHTML = `
            <div class="sim-card" style="border: 2px solid var(--gold-dark); background: #1a2438; margin-top: 14px;">
                <div class="sim-info">
                    <div style="font-size: 0.95rem; color: var(--gold-primary); font-weight: bold; margin-bottom: 4px;">
                        📲 KẾT QUẢ ĐÁNH GIÁ SIM ĐANG DÙNG:
                    </div>
                    <div class="sim-number-display" style="font-size: 1.8rem;">
                        <span class="highlight">${formattedSim}</span>
                    </div>

                    <div class="sim-badge-group">
                        <span class="badge badge-score">${evaluation.score}/100 - ${evaluation.grade}</span>
                        <span class="badge badge-hex">Quẻ Chủ: ${hexData.mainName} → ${hexData.changedName}</span>
                    </div>

                    <ul class="sim-reasons-list">
                        ${evaluation.reasons.map(r => `<li>${r}</li>`).join('')}
                    </ul>
                </div>

                <div class="sim-actions">
                    <button class="btn-action btn-view-hex" onclick="handleCurrentSimDetail()">
                        🔍 Xem Chi Tiết
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
            <div style="text-align: center; padding: 40px; color: var(--gold-primary);">
                <div class="spinner" style="font-size: 2rem; margin-bottom: 10px;">🔮</div>
                <p style="font-size: 1.1rem; font-weight: 600;">Đang lập quẻ Lục Hào & Tính toán Top ${limitVal} SIM Cát Tường...</p>
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
            <div style="text-align: center; padding: 40px; background: var(--bg-card); border-radius: 16px; border: 1px solid var(--border-gold);">
                <p style="font-size: 1.2rem; color: #f87171; font-weight: 600;">Không tìm thấy dãy số phù hợp đạt điều kiện Lục Hào Cát Tường.</p>
                <p style="color: var(--text-muted); margin-top: 8px;">Gợi ý: Hãy thử bỏ bớt các chữ số cố định (để ô trống) để hệ thống có nhiều lựa chọn phối số hơn.</p>
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
        const { score, grade, reasons } = item.evaluation;
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

                    <ul class="sim-reasons-list">
                        ${reasons.map(r => `<li>${r}</li>`).join('')}
                    </ul>
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

    const { purpose, purposeText: pText } = getFormInputs();
    const purposeDisplay = item.purposeText || getPurposeText(item.purpose || purpose) || pText;

    return `
        <div id="hexCardCapture" class="hex-card-view">
            <!-- Header Thông Tin -->
            <div class="info-header">
                <div class="info-content">
                    <div class="info-line"><strong>SIM Chọn:</strong> <span class="highlight" style="font-size:18px;">${formatSimNumber(sim)}</span></div>
                    <div class="info-line"><strong>Mục đích cầu:</strong> <span class="highlight">${purposeDisplay}</span></div>
                    <div class="info-line"><strong>Tuần Không:</strong> <span class="highlight">${hexData.dateInfo.tuanKhong}</span></div>
                    <div class="info-line">
                        <strong>Nhật Thần:</strong> <span class="highlight">${hexData.dateInfo.nhatThan}</span> &nbsp;&nbsp;&nbsp;&nbsp; 
                        <strong>Nguyệt Lệnh:</strong> <span class="highlight">${hexData.dateInfo.nguyetLenh}</span>
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

            <!-- Đánh giá Phong Thủy Chi Tiết -->
            <div class="eval-box">
                <h4>🎯 Đánh giá Cát Tường: ${evaluation.score}/100 - ${evaluation.grade}</h4>
                <ul>
                    ${evaluation.reasons.map(r => `<li>${r}</li>`).join('')}
                </ul>
            </div>
        </div>
    `;
}

function openHexModalDesktopObject(item) {
    if (!item) return;

    const modal = document.getElementById('hexModal');
    const modalBody = document.getElementById('modalBody');
    const isMobile = isMobileDevice();

    modalBody.innerHTML = `
        <div style="text-align:center; padding:20px; color:#888;">
            <div style="font-size:1.8rem; margin-bottom:8px;">🔮</div>
            Đang tạo ảnh lá quẻ sắc nét...
        </div>
    `;
    openModal('hexModal');

    const tempContainer = document.createElement('div');
    tempContainer.style.position = 'absolute';
    tempContainer.style.left = '-9999px';
    tempContainer.style.width = '900px';
    tempContainer.innerHTML = buildHexCardHTML(item);
    document.body.appendChild(tempContainer);

    setTimeout(() => {
        const cardElem = tempContainer.querySelector('#hexCardCapture');
        html2canvas(cardElem, {
            scale: 2,
            useCORS: true,
            scrollX: 0,
            scrollY: 0,
            windowWidth: 960
        }).then(canvas => {
            const dataUrl = canvas.toDataURL('image/png');
            document.body.removeChild(tempContainer);

            let bottomHtml = '';
            if (isMobile) {
                bottomHtml = `
                    <button id="btnMobileShareTrigger" class="btn-mobile-share-ios">
                        📤 Chia Sẻ / Lưu Ảnh Về Điện Thoại
                    </button>
                `;
            } else {
                bottomHtml = `
                    <div class="desktop-img-hint">
                        💡 <strong>Mẹo:</strong> Nhấp chuột phải vào ảnh để <em>Sao chép hình ảnh</em> hoặc <em>Lưu hình ảnh thành...</em>
                    </div>
                `;
            }

            modalBody.innerHTML = `
                <div class="hex-card-scroll-wrapper">
                    <img src="${dataUrl}" class="hex-native-img" alt="Lá quẻ SIM ${item.sim}" />
                </div>
                ${bottomHtml}
            `;

            if (isMobile) {
                const shareBtn = document.getElementById('btnMobileShareTrigger');
                if (shareBtn) {
                    shareBtn.addEventListener('click', () => {
                        triggerDirectShareOnUserGesture(canvas, formatSimNumber(item.sim));
                    });
                }
            }
        }).catch(err => {
            console.error('html2canvas error:', err);
            document.body.removeChild(tempContainer);
            modalBody.innerHTML = buildHexCardHTML(item);
        });
    }, 100);
}

function triggerDirectShareOnUserGesture(canvas, simNumber) {
    const filename = `la-que-sim-${simNumber.replace(/[^0-9]/g, '')}-${Date.now()}.png`;

    canvas.toBlob(blob => {
        if (!blob) {
            showToast("Không thể khởi tạo file ảnh.");
            return;
        }

        const file = new File([blob], filename, { type: 'image/png' });

        if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
            navigator.share({
                files: [file],
                title: `Lá Quẻ SIM Phong Thủy - ${simNumber}`,
                text: `Lá quẻ Dịch Học SIM Phong Thủy SĐT: ${simNumber}`
            }).then(() => {
                showToast("Đã chia sẻ / lưu ảnh thành công!");
            }).catch(err => {
                if (err.name !== 'AbortError') {
                    fallbackDownloadBlob(blob, filename);
                }
            });
        } else {
            fallbackDownloadBlob(blob, filename);
        }
    }, 'image/png');
}

function fallbackDownloadBlob(blob, filename) {
    const link = document.createElement('a');
    link.download = filename;
    link.href = URL.createObjectURL(blob);
    link.click();
    setTimeout(() => URL.revokeObjectURL(link.href), 2500);
    showToast(`Đã tải ảnh về máy thành công!`);
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
