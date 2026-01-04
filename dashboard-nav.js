//**
 * Dashboard Navigation & Transitions
    * Handles smooth SPA - like transitions between dashboard pages
        */

function updateSidebarCounts() {
    if (!window.propertyContext) return;

    const requests = propertyContext.getRequests() || [];
    const newRequestsCount = requests.filter(r => r.status === 'Nieuw').length;

    // In a real app we'd count unread messages, for now use a realistic number linked to requests
    const messageCount = Math.max(0, requests.filter(r => r.status === 'In behandeling').length);

    const props = propertyContext.getAll();
    const activePropsCount = Object.values(props).filter(p => p.status === 'active').length;

    // Update Aanvragen Badge
    const aanvragenBadge = document.querySelector('a[href="aanvragen-particulier.html"] span');
    if (aanvragenBadge) {
        aanvragenBadge.textContent = newRequestsCount;
        aanvragenBadge.style.display = newRequestsCount > 0 ? 'flex' : 'none';
    }

    // Update Berichten Badge
    const berichtenBadge = document.querySelector('a[href="berichten-particulier.html"] span');
    if (berichtenBadge) {
        berichtenBadge.textContent = messageCount;
        berichtenBadge.style.display = messageCount > 0 ? 'flex' : 'none';
    }

    // Update Pakket Badge
    const pakketBadge = document.getElementById('sidebar-package-usage');
    if (pakketBadge) {
        pakketBadge.textContent = `${activePropsCount}/3`;
    }
}

// Global initialization for all pages using this script
document.addEventListener('DOMContentLoaded', () => {
    // Initial update
    updateSidebarCounts();

    // Listen for property changes to refresh counts
    window.addEventListener('propertyChanged', updateSidebarCounts);

    // Polling fallback to ensure sync (optional)
    setInterval(updateSidebarCounts, 5000);
});

// Dashboard Navigation - Smooth View Transitions
// This script enables smooth page transitions within dashboards

(function () {
    'use strict';

    // Check if View Transitions API is supported
    const supportsViewTransitions = 'startViewTransition' in document;

    // Dashboard link patterns - only apply smooth transitions to dashboard navigation
    const dashboardPatterns = [
        '-particulier.html',
        '-makelaars.html',
        '-zoeker.html',
        'dashboard-',
        'instellingen-',
        'berichten-',
        'agenda-',
        'advertentie-',
        'beschikbaarheid-',
        'opgeslagen-',
        'pakket-beheer.html',
        'zoekopdrachten-',
        'chat-',
        '/api/'
    ];

    // Auth Guard - Lock the dashboard
    function checkAuth() {
        const userRole = localStorage.getItem('userRole');
        const path = window.location.pathname;

        // Determine required role from path
        let requiredRole = null;
        if (path.includes('-particulier') || path.includes('pakket-beheer')) requiredRole = 'particulier';
        else if (path.includes('-makelaars')) requiredRole = 'makelaar';
        else if (path.includes('-zoeker')) requiredRole = 'zoeker';

        if (requiredRole && userRole !== requiredRole) {
            console.warn(`[AUTH] Access denied. Required: ${requiredRole}, Found: ${userRole}`);

            // If logged in as someone else, redirect to THEIR dashboard instead of login
            if (userRole) {
                switch (userRole) {
                    case 'particulier': window.location.href = 'dashboard-particulier.html'; break;
                    case 'makelaar': window.location.href = 'dashboard-makelaars.html'; break;
                    case 'zoeker': window.location.href = 'dashboard-zoeker.html'; break;
                    default: window.location.href = 'login.html';
                }
            } else {
                window.location.href = 'login.html';
            }
        }
    }

    // Run auth check immediately
    checkAuth();

    // Global Logout
    window.logout = function () {
        localStorage.removeItem('userRole');
        localStorage.removeItem('authToken');
        localStorage.removeItem('userName');
        window.location.href = 'login.html';
    };

    function isDashboardLink(href) {
        return dashboardPatterns.some(pattern => href.includes(pattern));
    }

    // Apply instant navigation for same-dashboard links
    async function handleNavigation(e) {
        const link = e.target.closest('a');
        if (!link) return;

        const originalHref = link.getAttribute('href');
        if (!originalHref || originalHref.startsWith('http') || originalHref.startsWith('javascript:')) return;

        // Same-page anchor handling for instant "locked" feel
        if (originalHref.startsWith('#')) {
            e.preventDefault();
            const id = originalHref.substring(1);
            const el = document.getElementById(id);
            if (el) {
                el.scrollIntoView({ behavior: 'smooth' });
                history.pushState(null, null, originalHref);
                return;
            }
        }

        // Only apply SPA transitions to dashboard navigation
        if (!isDashboardLink(originalHref) && !isDashboardLink(window.location.pathname)) return;

        e.preventDefault();

        // 1. Prepare Final URL (append listingId)
        let targetUrl = originalHref;
        if (window.propertyContext) {
            const id = propertyContext.getCurrentId();
            if (id) {
                const hashIdx = targetUrl.indexOf('#');
                const hash = hashIdx !== -1 ? targetUrl.substring(hashIdx) : '';
                let base = hashIdx !== -1 ? targetUrl.substring(0, hashIdx) : targetUrl;
                base += (base.includes('?') ? '&' : '?') + `listingId=${id}`;
                targetUrl = base + hash;
            }
        }

        // 2. Determine if same-page base with different hash
        const targetPathFull = new URL(targetUrl, window.location.origin).pathname;
        const currentPathFull = window.location.pathname;
        const targetHashIdx = targetUrl.indexOf('#');
        const targetHash = targetHashIdx !== -1 ? targetUrl.substring(targetHashIdx) : '';

        if (targetPathFull === currentPathFull && targetHash) {
            const id = targetHash.substring(1);
            const el = document.getElementById(id);
            if (el) {
                el.scrollIntoView({ behavior: 'smooth' });
                history.pushState(null, null, targetUrl);
                return;
            }
        }

        // 3. Perform SPA Transition
        if (supportsViewTransitions) {
            document.startViewTransition(async () => {
                try {
                    const response = await fetch(targetUrl + (targetUrl.includes('?') ? '&' : '?') + 'spa_v=' + Date.now());
                    if (!response.ok) throw new Error('Network response was not ok');
                    const html = await response.text();

                    const parser = new DOMParser();
                    const newDoc = parser.parseFromString(html, 'text/html');

                    // Standard SPA Update
                    document.title = newDoc.title;
                    document.body.className = newDoc.body.className;

                    // Copy body attributes (like role-particulier)
                    Array.from(newDoc.body.attributes).forEach(attr => {
                        document.body.setAttribute(attr.name, attr.value);
                    });

                    document.body.innerHTML = newDoc.body.innerHTML;

                    // Execute scripts (essential for dashboard-actions/context)
                    const scripts = Array.from(document.body.querySelectorAll('script'));
                    for (const oldScript of scripts) {
                        const newScript = document.createElement('script');
                        Array.from(oldScript.attributes).forEach(attr => newScript.setAttribute(attr.name, attr.value));
                        newScript.textContent = oldScript.textContent;
                        oldScript.parentNode.replaceChild(newScript, oldScript);
                    }

                    // Update URL
                    history.pushState({}, '', targetUrl);

                    // Re-init
                    initNavigation();

                    // Handle anchor scrolling AFTER transition
                    if (targetHash) {
                        const id = targetHash.substring(1);
                        const el = document.getElementById(id);
                        if (el) {
                            setTimeout(() => el.scrollIntoView({ behavior: 'smooth' }), 50);
                        }
                    } else {
                        window.scrollTo(0, 0);
                    }
                } catch (error) {
                    console.error('SPA Transition failed:', error);
                    window.location.href = targetUrl;
                }
            });
        } else {
            window.location.href = targetUrl;
        }
    }

    // Handle browser back/forward
    window.addEventListener('popstate', async () => {
        if (supportsViewTransitions) {
            document.startViewTransition(async () => {
                const response = await fetch(window.location.href);
                const html = await response.text();
                const parser = new DOMParser();
                const newDoc = parser.parseFromString(html, 'text/html');
                document.title = newDoc.title;
                document.body.innerHTML = newDoc.body.innerHTML;
                initNavigation();
            });
        } else {
            window.location.reload();
        }
    });

    function updateBadges() {
        if (!window.propertyContext) return;
        const role = localStorage.getItem('userRole');

        if (role === 'particulier') {
            const prop = propertyContext.getCurrent();
            const requests = propertyContext.getRequests() || [];
            const activeProps = Object.values(propertyContext.getAll()).filter(p => p.status === 'active');

            // 1. Aanvragen Badge (New/Pending)
            const newApps = requests.filter(r => r.status === 'Nieuw' || r.status === 'In behandeling').length;
            const aanvragenBadge = document.querySelector('a[href="aanvragen-particulier.html"] span');
            if (aanvragenBadge) aanvragenBadge.textContent = newApps;

            // 2. Berichten Badge (Simulated or from data)
            const msgBadge = document.querySelector('a[href="berichten-particulier.html"] span');
            if (msgBadge) msgBadge.textContent = '2'; // Keeping demo static for now

            // 3. Pakket Beheer Badge
            const packageBadge = document.querySelector('a[href="pakket-beheer.html"] span');
            if (packageBadge) packageBadge.textContent = `${activeProps.length}/3`;
        } else if (role === 'zoeker') {
            // Zoeker specific badges if any
        }
    }

    function initNavigation() {
        // Add click handlers to all sidebar links
        document.querySelectorAll('.sidebar-nav a, .nav-item').forEach(link => {
            link.addEventListener('click', handleNavigation);
        });

        // Initialize mobile toggle if present
        const mobileToggle = document.querySelector('.particulier-mobile-toggle') || 
                             document.querySelector('.zoeker-mobile-toggle') ||
                             document.querySelector('.makelaar-mobile-toggle');
        if (mobileToggle) {
            mobileToggle.addEventListener('click', toggleSidebar);
        }

        // Update badges
        updateBadges();
    }

    // Global toggle function
    window.toggleSidebar = function () {
        const sidebar = document.querySelector('.sidebar');
        if (sidebar) {
            sidebar.classList.toggle('active');

            // Toggle orientation of icon
            const icon = document.querySelector('.particulier-mobile-toggle i, .zoeker-mobile-toggle i, .makelaar-mobile-toggle i');
            if (icon) {
                if (sidebar.classList.contains('active')) {
                    icon.classList.remove('ri-menu-line');
                    icon.classList.add('ri-close-line');
                } else {
                    icon.classList.remove('ri-close-line');
                    icon.classList.add('ri-menu-line');
                }
            }
        }
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initNavigation);
    } else {
        initNavigation();
    }
})();
