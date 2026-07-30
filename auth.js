// Cấu hình Firebase
// Hãy thay thế các giá trị bên dưới bằng cấu hình dự án Firebase của bạn
const firebaseConfig = {
  apiKey: "AIzaSyBSoi413dszpafIKJWqO9naMSCTUjATRxc",
  authDomain: "luchaoio.firebaseapp.com",
  projectId: "luchaoio",
  storageBucket: "luchaoio.firebasestorage.app",
  messagingSenderId: "986165751792",
  appId: "1:986165751792:web:c012c3c553e3d7e2c2f735"
};

// Khởi tạo Firebase (sử dụng compat SDK)
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

// Hàm tạo mã định danh (fingerprint) cho thiết bị hiện tại dựa trên thông số máy
function getDeviceFingerprint() {
    const data = [
        navigator.userAgent,
        screen.height,
        screen.width,
        screen.colorDepth,
        Intl.DateTimeFormat().resolvedOptions().timeZone,
        navigator.language,
        navigator.hardwareConcurrency
    ].join('||');
    
    // Thuật toán băm (hash) đơn giản để tạo chuỗi ngắn
    let hash = 0;
    for (let i = 0; i < data.length; i++) {
        const char = data.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Chuyển thành số nguyên 32-bit
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
                // Auth overlays cần display: flex (theo CSS), app content dùng display mặc định
                el.style.display = id.includes('overlay') ? 'flex' : '';
            } else {
                el.style.display = 'none';
            }
        }
    });
}

// ========== GOOGLE IDENTITY SERVICES (GIS) cho PWA Standalone ==========

// Google OAuth Client ID (lấy từ Firebase project config)
const GOOGLE_CLIENT_ID = '986165751792-83u0rnq48cu2drd9rsnd1m4j8tlj94p1.apps.googleusercontent.com';

// Hàm phát hiện app đang chạy ở chế độ PWA standalone (thêm vào màn hình chính)
function isRunningStandalone() {
    return (window.matchMedia('(display-mode: standalone)').matches) 
        || (window.navigator.standalone === true) // iOS Safari
        || document.referrer.includes('android-app://'); // Android TWA
}

// Tải thư viện Google Identity Services
function loadGISScript() {
    return new Promise((resolve, reject) => {
        if (window.google && window.google.accounts) {
            resolve();
            return;
        }
        const script = document.createElement('script');
        script.src = 'https://accounts.google.com/gsi/client';
        script.async = true;
        script.onload = resolve;
        script.onerror = () => reject(new Error('Không thể tải Google Sign-In'));
        document.head.appendChild(script);
    });
}

// Đăng nhập bằng Google Identity Services (One Tap / FedCM)
// Hoạt động trong PWA standalone vì KHÔNG cần popup hay redirect
async function signInWithGIS() {
    await loadGISScript();
    
    return new Promise((resolve, reject) => {
        // Khởi tạo GIS với client ID
        google.accounts.id.initialize({
            client_id: GOOGLE_CLIENT_ID,
            callback: async (response) => {
                try {
                    // Dùng ID token từ GIS để tạo credential Firebase
                    const credential = firebase.auth.GoogleAuthProvider.credential(response.credential);
                    // Đăng nhập Firebase bằng credential (không cần popup/redirect)
                    await auth.signInWithCredential(credential);
                    resolve();
                } catch (error) {
                    console.error('Lỗi signInWithCredential:', error);
                    reject(error);
                }
            },
            auto_select: true,
            cancel_on_tap_outside: false,
            itp_support: true,
        });

        // Thử hiển thị One Tap prompt (FedCM)
        google.accounts.id.prompt((notification) => {
            if (notification.isDisplayed()) {
                // One Tap đang hiển thị, chờ user tương tác
                return;
            }
            
            if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
                const reason = notification.getNotDisplayedReason 
                    ? notification.getNotDisplayedReason() 
                    : (notification.getSkippedReason ? notification.getSkippedReason() : 'unknown');
                console.warn('Google One Tap không hiển thị được:', reason);
                
                // Fallback: Render nút Google Sign-In chính thức
                renderGoogleSignInButton();
                // Không reject — chờ user click nút Google
            }
        });
    });
}

// Render nút đăng nhập Google (fallback khi One Tap không hoạt động)
function renderGoogleSignInButton() {
    // Tạo container cho nút GIS nếu chưa có
    let container = document.getElementById('gis-signin-container');
    if (!container) {
        const originalBtn = document.getElementById('google-signin-btn');
        if (!originalBtn) return;
        
        container = document.createElement('div');
        container.id = 'gis-signin-container';
        container.style.display = 'flex';
        container.style.justifyContent = 'center';
        container.style.marginTop = '8px';
        originalBtn.parentNode.insertBefore(container, originalBtn.nextSibling);
    }
    
    // Ẩn nút custom ban đầu
    const originalBtn = document.getElementById('google-signin-btn');
    if (originalBtn) originalBtn.style.display = 'none';
    
    // Render nút Google Sign-In chính thức (dùng FedCM, không cần popup)
    google.accounts.id.renderButton(container, {
        theme: 'outline',
        size: 'large',
        text: 'signin_with',
        shape: 'rectangular',
        logo_alignment: 'left',
        width: 300,
    });
}

// ========== HÀM ĐĂNG NHẬP CHÍNH ==========

async function signInWithGoogle() {
    try {
        // Cài đặt phiên đăng nhập duy trì ở bộ nhớ cục bộ
        await auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL);
        
        // Hiển thị loading
        const btn = document.getElementById('google-signin-btn');
        if (btn) btn.innerText = "Đang kết nối...";
        
        if (isRunningStandalone()) {
            // === CHẾ ĐỘ PWA STANDALONE ===
            // Dùng Google Identity Services (FedCM/One Tap)
            // Không cần popup hay redirect — hoạt động trực tiếp trong trang
            await signInWithGIS();
        } else {
            // === CHẾ ĐỘ TRÌNH DUYỆT BÌNH THƯỜNG ===
            // Dùng popup như bình thường
            const provider = new firebase.auth.GoogleAuthProvider();
            provider.setCustomParameters({ prompt: 'select_account' });
            await auth.signInWithPopup(provider);
        }
    } catch (error) {
        console.error("Lỗi đăng nhập Google:", error);
        
        // Nếu popup bị chặn ở trình duyệt bình thường, thử GIS
        if (error.code === 'auth/popup-blocked' || error.code === 'auth/popup-closed-by-user') {
            console.log("Popup bị chặn, thử Google Identity Services...");
            try {
                await signInWithGIS();
            } catch (gisError) {
                console.error("GIS cũng thất bại:", gisError);
                showError("Đăng nhập thất bại. Vui lòng thử lại.");
            }
        } else {
            showError("Đăng nhập thất bại: " + error.message);
        }
    }
}

// Hàm hiển thị lỗi trực tiếp lên màn hình đăng nhập
function showError(message) {
    let errEl = document.getElementById('login-error-msg');
    if (!errEl) {
        const btn = document.getElementById('google-signin-btn');
        errEl = document.createElement('p');
        errEl.id = 'login-error-msg';
        errEl.style.color = '#ef4444';
        errEl.style.marginTop = '12px';
        errEl.style.fontWeight = 'bold';
        if (btn && btn.parentNode) {
            btn.parentNode.insertBefore(errEl, btn.nextSibling);
        }
    }
    if (errEl) errEl.innerText = message;
    
    // Đặt lại nút đăng nhập
    const btn = document.getElementById('google-signin-btn');
    if (btn) btn.innerText = "Đăng nhập bằng Google";
}

// Bắt lỗi nếu quá trình Redirect quay về thất bại
auth.getRedirectResult().catch((error) => {
    console.error("Lỗi từ Redirect:", error);
    showError("Lỗi hệ thống đăng nhập: " + error.message);
});
// Xuất hàm signInWithGoogle ra toàn cục (global) để có thể gọi trực tiếp từ giao diện HTML
window.signInWithGoogle = signInWithGoogle;

// Hàm xử lý đăng xuất
async function signOut() {
    try {
        // Revoke GIS nếu đang chạy
        if (window.google && window.google.accounts && window.google.accounts.id) {
            google.accounts.id.disableAutoSelect();
        }
        await auth.signOut();
        showUI('login-overlay');
        // Khôi phục nút đăng nhập gốc nếu đã bị ẩn
        const originalBtn = document.getElementById('google-signin-btn');
        if (originalBtn) {
            originalBtn.style.display = '';
            originalBtn.innerText = 'Đăng nhập bằng Google';
        }
        const gisContainer = document.getElementById('gis-signin-container');
        if (gisContainer) gisContainer.remove();
    } catch (error) {
        console.error("Lỗi đăng xuất:", error);
        showError("Có lỗi xảy ra khi đăng xuất.");
    }
}
// Xuất hàm signOut ra toàn cục
window.signOut = signOut;

// Theo dõi trạng thái xác thực của người dùng liên tục
auth.onAuthStateChanged(async (user) => {
    if (user) {
        const email = user.email.toLowerCase();
        
        try {
            // Kiểm tra xem người dùng có phải là admin không
            const adminDoc = await db.collection('admins').doc(email).get();
            const isAdmin = adminDoc.exists;
            
            // Nếu không phải admin, cần kiểm tra xem email có nằm trong whitelist (danh sách duyệt) hay không
            if (!isAdmin) {
                const whitelistDoc = await db.collection('whitelist').doc(email).get();
                if (!whitelistDoc.exists) {
                    // Tự động lưu thông tin email vào danh sách chờ duyệt trong Firestore
                    try {
                        await db.collection('pending_requests').doc(email).set({
                            email: email,
                            requestedAt: firebase.firestore.FieldValue.serverTimestamp()
                        }, { merge: true });
                    } catch (e) {
                        console.log("Auto-save pending request failed:", e);
                    }

                    // Cập nhật email bị từ chối lên giao diện hiển thị cho người dùng
                    const deniedEmailEl = document.getElementById('denied-email');
                    if (deniedEmailEl) {
                        deniedEmailEl.innerText = email;
                    }
                    showUI('denied-overlay');
                    return;
                }
            }

            // Kiểm tra và cập nhật thiết bị đăng nhập hiện tại
            const deviceId = getDeviceFingerprint();
            const deviceRef = db.collection('user_devices').doc(email);
            
            // Sử dụng transaction để đảm bảo dữ liệu cập nhật an toàn trong Firestore
            await db.runTransaction(async (transaction) => {
                const doc = await transaction.get(deviceRef);
                let devices = [];
                
                if (doc.exists) {
                    devices = doc.data().devices || [];
                }
                
                // Nếu thiết bị hiện tại chưa có trong danh sách đã lưu
                if (!devices.includes(deviceId)) {
                    // Kiểm tra giới hạn tối đa 2 thiết bị đối với user bình thường (admin không bị giới hạn)
                    if (devices.length >= 2 && !isAdmin) {
                        throw new Error('DEVICE_LIMIT_EXCEEDED');
                    }
                    // Thêm thiết bị mới vào danh sách
                    devices.push(deviceId);
                }
                
                // Lưu lại thông tin danh sách thiết bị và cập nhật thời gian đăng nhập
                transaction.set(deviceRef, {
                    devices: devices,
                    lastLogin: firebase.firestore.FieldValue.serverTimestamp()
                }, { merge: true });
            });
            
            // Đăng nhập thành công và thiết bị hợp lệ, tiến hành hiển thị nội dung app chính
            showUI('app-main-content');
            
        } catch (error) {
            console.error("Lỗi kiểm tra quyền truy cập hệ thống:", error);
            if (error.message === 'DEVICE_LIMIT_EXCEEDED') {
                showUI('device-limit-overlay'); // Hiển thị màn hình giới hạn thiết bị
            } else if (error.code === 'permission-denied' || (error.message && error.message.includes('permission'))) {
                // Nếu bị từ chối quyền đọc Firestore (do chưa whitelist hoặc rules Firebase chặn), chuyển về màn hình Từ Chối Truy Cập
                const deniedEmailEl = document.getElementById('denied-email');
                if (deniedEmailEl && user && user.email) {
                    deniedEmailEl.innerText = user.email;
                }
                showUI('denied-overlay');
            } else {
                showError("Lỗi hệ thống: " + (error.code || error.message));
                showUI('login-overlay');
            }
        }
    } else {
        // Nếu người dùng chưa đăng nhập hoặc vừa đăng xuất
        showUI('login-overlay');
        const btn = document.getElementById('google-signin-btn');
        if (btn && btn.innerText === "Đang kết nối...") {
            btn.innerText = "Đăng nhập bằng Google";
        }
    }
});
