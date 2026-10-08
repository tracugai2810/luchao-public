/**
 * Portal Multi-Tab Navigation & Mobile Drawer Controller
 * luchao.io.vn - Lục Hào, Tử Vi, Phong Thủy HKPT, Sim Phong Thủy
 */
(function () {
    function initPortalDrawer() {
        var hamburgerBtn = document.getElementById('portal-hamburger-btn');
        var drawer = document.getElementById('portal-drawer');
        var backdrop = document.getElementById('portal-drawer-backdrop');
        var closeBtn = document.getElementById('portal-drawer-close');

        if (!drawer || !backdrop) return;

        function openDrawer() {
            drawer.classList.add('open');
            backdrop.classList.add('open');
            if (hamburgerBtn) {
                hamburgerBtn.classList.add('open');
                hamburgerBtn.setAttribute('aria-expanded', 'true');
            }
            document.body.style.overflow = 'hidden';
        }

        function closeDrawer() {
            drawer.classList.remove('open');
            backdrop.classList.remove('open');
            if (hamburgerBtn) {
                hamburgerBtn.classList.remove('open');
                hamburgerBtn.setAttribute('aria-expanded', 'false');
            }
            document.body.style.overflow = '';
        }

        if (hamburgerBtn) {
            hamburgerBtn.onclick = function (e) {
                e.stopPropagation();
                if (drawer.classList.contains('open')) {
                    closeDrawer();
                } else {
                    openDrawer();
                }
            };
        }

        if (closeBtn) {
            closeBtn.onclick = function (e) {
                e.stopPropagation();
                closeDrawer();
            };
        }

        backdrop.onclick = function () {
            closeDrawer();
        };

        // Đóng khi nhấn phím Escape
        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape' && drawer.classList.contains('open')) {
                closeDrawer();
            }
        });

        // Đóng khi click vào bất kỳ liên kết môn nào trong drawer
        var drawerLinks = drawer.querySelectorAll('.drawer-item');
        drawerLinks.forEach(function (link) {
            link.addEventListener('click', function () {
                closeDrawer();
            });
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initPortalDrawer);
    } else {
        initPortalDrawer();
    }
})();
