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
        'zoekopdrachten-'
    ];

    function isDashboardLink(href) {
        return dashboardPatterns.some(pattern => href.includes(pattern));
    }

    // Apply instant navigation for same-dashboard links
    function handleNavigation(e) {
        const link = e.target.closest('a');
        if (!link) return;

        const href = link.getAttribute('href');
        if (!href || href.startsWith('#') || href.startsWith('http')) return;

        // Only apply to dashboard navigation
        if (!isDashboardLink(href) && !isDashboardLink(window.location.pathname)) return;

        // Prevent default navigation
        e.preventDefault();

        // Use View Transitions if supported
        if (supportsViewTransitions) {
            document.startViewTransition(async () => {
                // Fetch new page
                const response = await fetch(href);
                const html = await response.text();

                // Parse new document
                const parser = new DOMParser();
                const newDoc = parser.parseFromString(html, 'text/html');

                // Update title
                document.title = newDoc.title;

                // Replace body content
                document.body.innerHTML = newDoc.body.innerHTML;

                // Update URL
                history.pushState({}, '', href);

                // Re-attach event listeners
                initNavigation();

                // Scroll to top
                window.scrollTo(0, 0);
            });
        } else {
            // Fallback: just navigate normally
            window.location.href = href;
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

    function initNavigation() {
        // Add click handlers to all sidebar links
        document.querySelectorAll('.sidebar-nav a, .nav-item').forEach(link => {
            link.addEventListener('click', handleNavigation);
        });
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initNavigation);
    } else {
        initNavigation();
    }
})();
