// Cấu hình Firebase
const firebaseConfig = {
  apiKey: "AIzaSyBSoi413dszpafIKJWqO9naMSCTUjATRxc",
  authDomain: "luchaoio.firebaseapp.com",
  projectId: "luchaoio",
  storageBucket: "luchaoio.firebasestorage.app",
  messagingSenderId: "986165751792",
  appId: "1:986165751792:web:c012c3c553e3d7e2c2f735"
};

// Khởi tạo Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

// Key lưu email trong localStorage
const EMAIL_STORAGE_KEY = 'luchao_user_email';

// Hàm tạo mã định danh (fingerprint) cho thiết bị hiện tại
// KHÔNG dùng navigator.userAgent vì nó khác nhau giữa Safari và PWA standalone trên cùng 1 máy
function getDeviceFingerprint() {
    const data = [
        screen.height,
        screen.width,
        screen.colorDepth,
        Intl.DateTimeFormat().resolvedOptions().timeZone,
        navigator.language,
        navigator.hardwareConcurrency
    ].join('||');
    
    let hash = 0;
    for (let i = 0; i < data.length; i++) {
        const char = data.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
    }
    return 'dev_' + Math.abs(hash).toString(36);
}

// Hàm quản lý hiển thị các màn hình UI khác nhau
function showUI(activeElementId) {
    const uiElements = [
        'login-overlay', 
        'denied-overlay', 
        'device-limit-overlay', 
        'app-main-content'
    ];
    
    uiElements.forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            if (id === activeElementId) {
                el.style.display = id.includes('overlay') ? 'flex' : '';
            } else {
                el.style.display = 'none';
            }
        }
    });
}

// Hàm hiển thị lỗi trên màn hình đăng nhập
function showError(message) {
    let errEl = document.getElementById('login-error-msg');
    if (!errEl) {
        const form = document.getElementById('email-login-form');
        if (!form) return;
        errEl = document.createElement('p');
        errEl.id = 'login-error-msg';
        errEl.style.color = '#ef4444';
        errEl.style.marginTop = '12px';
        errEl.style.fontWeight = 'bold';
        errEl.style.fontSize = '0.9em';
        errEl.style.textAlign = 'center';
        form.appendChild(errEl);
    }
    errEl.innerText = message;
}

function clearError() {
    const errEl = document.getElementById('login-error-msg');
    if (errEl) errEl.innerText = '';
}

// ========== ĐĂNG NHẬP BẰNG EMAIL ==========

// Đảm bảo có quyền truy cập Firestore (dùng Anonymous Auth)
async function ensureFirestoreAccess() {
    if (!auth.currentUser) {
        await auth.signInAnonymously();
    }
}

// Xử lý logic đăng nhập: kiểm tra email trong whitelist/admins
async function processLogin(email) {
    email = email.toLowerCase().trim();
    
    await ensureFirestoreAccess();
    
    // Kiểm tra admin
    const adminDoc = await db.collection('admins').doc(email).get();
    const isAdmin = adminDoc.exists;
    
    let maxDevices = 2; // Mặc định là 2 thiết bị
    
    // Nếu không phải admin, kiểm tra whitelist
    if (!isAdmin) {
        const whitelistDoc = await db.collection('whitelist').doc(email).get();
        if (!whitelistDoc.exists) {
            // Lưu vào danh sách chờ duyệt
            try {
                await db.collection('pending_requests').doc(email).set({
                    email: email,
                    requestedAt: firebase.firestore.FieldValue.serverTimestamp()
                }, { merge: true });
            } catch (e) {
                console.log("Auto-save pending request failed:", e);
            }
            
            // Hiển thị màn hình từ chối
            const deniedEmailEl = document.getElementById('denied-email');
            if (deniedEmailEl) deniedEmailEl.innerText = email;
            showUI('denied-overlay');
            return false;
        }
        
        // Lấy giới hạn thiết bị tùy chỉnh nếu có
        const wData = whitelistDoc.data();
        if (wData && typeof wData.maxDevices === 'number' && wData.maxDevices > 0) {
            maxDevices = wData.maxDevices;
        }
    }
    
    // Kiểm tra giới hạn thiết bị
    const deviceId = getDeviceFingerprint();
    const deviceRef = db.collection('user_devices').doc(email);
    
    try {
        await db.runTransaction(async (transaction) => {
            const doc = await transaction.get(deviceRef);
            let devices = [];
            if (doc.exists) {
                devices = doc.data().devices || [];
            }
            
            if (!devices.includes(deviceId)) {
                if (devices.length >= maxDevices && !isAdmin) {
                    const err = new Error('DEVICE_LIMIT_EXCEEDED');
                    err.maxLimit = maxDevices;
                    err.userEmail = email;
                    throw err;
                }
                devices.push(deviceId);
            }
            
            transaction.set(deviceRef, {
                devices: devices,
                lastLogin: firebase.firestore.FieldValue.serverTimestamp()
            }, { merge: true });
        });
    } catch (err) {
        if (err.message === 'DEVICE_LIMIT_EXCEEDED') {
            const limitEmailEl = document.getElementById('limit-email');
            const limitMaxEl = document.getElementById('limit-max-count');
            if (limitEmailEl) limitEmailEl.innerText = err.userEmail || email;
            if (limitMaxEl) limitMaxEl.innerText = err.maxLimit || maxDevices;
            showUI('device-limit-overlay');
            return false;
        }
        throw err;
    }
    
    // Đăng nhập thành công! Lưu email vào localStorage
    localStorage.setItem(EMAIL_STORAGE_KEY, email);
    showUI('app-main-content');
    return true;
}

// Hàm xử lý khi user bấm nút Đăng nhập (gọi từ HTML)
async function loginWithEmail() {
    const input = document.getElementById('email-login-input');
    const btn = document.getElementById('email-login-btn');
    if (!input || !btn) return;
    
    const email = input.value.trim();
    
    // Validate email
    if (!email) {
        showError("Vui lòng nhập email.");
        return;
    }
    if (!email.includes('@') || !email.includes('.')) {
        showError("Email không hợp lệ.");
        return;
    }
    
    clearError();
    btn.innerText = "Đang xác thực...";
    btn.disabled = true;
    
    try {
        await processLogin(email);
    } catch (error) {
        console.error("Lỗi đăng nhập:", error);
        if (error.message === 'DEVICE_LIMIT_EXCEEDED') {
            const limitEmailEl = document.getElementById('limit-email');
            const limitMaxEl = document.getElementById('limit-max-count');
            if (limitEmailEl) limitEmailEl.innerText = error.userEmail || email;
            if (limitMaxEl) limitMaxEl.innerText = error.maxLimit || 2;
            showUI('device-limit-overlay');
        } else if (error.code === 'permission-denied' || (error.message && error.message.includes('permission'))) {
            showError("Lỗi quyền truy cập hệ thống. Liên hệ Admin.");
        } else {
            showError("Lỗi: " + (error.code || error.message));
        }
    } finally {
        btn.innerText = "Đăng nhập";
        btn.disabled = false;
    }
}
window.loginWithEmail = loginWithEmail;

// Hỗ trợ nhấn Enter để đăng nhập
function handleEmailKeypress(event) {
    if (event.key === 'Enter') {
        loginWithEmail();
    }
}
window.handleEmailKeypress = handleEmailKeypress;

// ========== ĐĂNG XUẤT ==========

async function signOut() {
    try {
        const email = localStorage.getItem(EMAIL_STORAGE_KEY);
        
        // Xóa thiết bị hiện tại khỏi Firestore → giải phóng slot cho thiết bị khác
        if (email) {
            try {
                await ensureFirestoreAccess();
                const deviceId = getDeviceFingerprint();
                const deviceRef = db.collection('user_devices').doc(email.toLowerCase());
                const doc = await deviceRef.get();
                if (doc.exists) {
                    const devices = (doc.data().devices || []).filter(d => d !== deviceId);
                    await deviceRef.update({ devices: devices });
                }
            } catch (e) {
                console.log("Không thể xóa thiết bị khi đăng xuất:", e);
            }
        }
        
        localStorage.removeItem(EMAIL_STORAGE_KEY);
        await auth.signOut();
        showUI('login-overlay');
        // Reset input
        const input = document.getElementById('email-login-input');
        if (input) input.value = '';
        clearError();
    } catch (error) {
        console.error("Lỗi đăng xuất:", error);
    }
}
window.signOut = signOut;

// ========== KHỞI TẠO ==========

// Chờ Firebase Auth khởi tạo xong, rồi quyết định hiển thị gì
function waitForAuthInit() {
    return new Promise((resolve) => {
        const unsubscribe = auth.onAuthStateChanged((user) => {
            unsubscribe();
            resolve(user);
        });
    });
}

async function initAuth() {
    const savedEmail = localStorage.getItem(EMAIL_STORAGE_KEY);
    const currentUser = await waitForAuthInit();
    
    if (currentUser && currentUser.email) {
        // Trường hợp còn session Google cũ → dùng luôn email đó
        try {
            await processLogin(currentUser.email);
        } catch (error) {
            console.error("Lỗi auto-login Google:", error);
            showUI('login-overlay');
        }
    } else if (savedEmail) {
        // Có email đã lưu → tự động đăng nhập
        try {
            await processLogin(savedEmail);
        } catch (error) {
            console.error("Lỗi auto-login:", error);
            if (error.message === 'DEVICE_LIMIT_EXCEEDED') {
                const limitEmailEl = document.getElementById('limit-email');
                const limitMaxEl = document.getElementById('limit-max-count');
                if (limitEmailEl) limitEmailEl.innerText = error.userEmail || savedEmail;
                if (limitMaxEl) limitMaxEl.innerText = error.maxLimit || 2;
                showUI('device-limit-overlay');
            } else {
                localStorage.removeItem(EMAIL_STORAGE_KEY);
                showUI('login-overlay');
            }
        }
    } else {
        // Chưa đăng nhập → hiện form đăng nhập
        showUI('login-overlay');
    }
}

// Bắt đầu
initAuth();
