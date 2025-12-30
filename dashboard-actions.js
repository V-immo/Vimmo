(() => {
    const routes = {
        "go-overzicht": "dashboard-particulier.html",
        "go-mijn-aanbod": "advertentie-particulier.html",
        "go-beschikbaarheid": "beschikbaarheid-particulier.html",
        "go-aanvragen": "aanvragen-particulier.html",
        "go-aanvragen-nieuw": "aanvragen-particulier.html?tab=nieuw",
        "go-geinteresseerden": "aanvragen-particulier.html?filter=opgeslagen",
        "go-stats": "statistieken-particulier.html",
        "go-berichten": "berichten-particulier.html",
        "go-pakket": "pakket-beheer.html",
        "go-instellingen": "instellingen-particulier.html"
    };

    const editRoutes = {
        "fix-photos": "advertentie-particulier.html?tab=fotos",
        "fix-description": "advertentie-particulier.html?tab=beschrijving",
        "fix-epc": "advertentie-particulier.html?tab=epc",
        "open-add-listing": "advertentie-particulier.html?new=true"
    };

    // KPI card routes - triggered by data-kpi attribute
    const kpiRoutes = {
        "views": "statistieken-particulier.html",
        "aanvragen": "aanvragen-particulier.html",
        "opgeslagen": "aanvragen-particulier.html?filter=opgeslagen"
    };

    function ensureToast() {
        let el = document.getElementById("vimmoToast");
        if (el) return el;

        el = document.createElement("div");
        el.id = "vimmoToast";
        el.style.position = "fixed";
        el.style.right = "22px";
        el.style.bottom = "22px";
        el.style.zIndex = "9999";
        el.style.padding = "12px 14px";
        el.style.borderRadius = "14px";
        el.style.background = "rgba(255,255,255,0.92)";
        el.style.border = "1px solid rgba(16,185,129,0.22)";
        el.style.boxShadow = "0 16px 50px rgba(0,0,0,0.10)";
        el.style.backdropFilter = "blur(10px)";
        el.style.fontWeight = "700";
        el.style.color = "#065f46";
        el.style.maxWidth = "320px";
        el.style.display = "none";
        document.body.appendChild(el);
        return el;
    }

    function toast(message) {
        const el = ensureToast();
        el.textContent = message;
        el.style.display = "block";
        clearTimeout(el._t);
        el._t = setTimeout(() => (el.style.display = "none"), 1400);
    }

    function ensureModal() {
        let overlay = document.getElementById("vimmoModalOverlay");
        if (overlay) return overlay;

        overlay = document.createElement("div");
        overlay.id = "vimmoModalOverlay";
        overlay.style.position = "fixed";
        overlay.style.inset = "0";
        overlay.style.background = "rgba(0,0,0,0.35)";
        overlay.style.zIndex = "9998";
        overlay.style.display = "none";
        overlay.style.alignItems = "center";
        overlay.style.justifyContent = "center";
        overlay.style.padding = "20px";

        const modal = document.createElement("div");
        modal.id = "vimmoModal";
        modal.style.width = "min(520px, 95vw)";
        modal.style.borderRadius = "22px";
        modal.style.background = "rgba(255,255,255,0.96)";
        modal.style.border = "1px solid rgba(16,185,129,0.22)";
        modal.style.boxShadow = "0 20px 70px rgba(0,0,0,0.18)";
        modal.style.backdropFilter = "blur(12px)";
        modal.style.padding = "22px";

        modal.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:flex-start; gap:12px;">
        <div>
          <div id="vimmoModalTitle" style="font-size:1.05rem; font-weight:900; color:#0f172a; margin-bottom:6px;"></div>
          <div id="vimmoModalText" style="color:#475569; font-weight:600; line-height:1.5;"></div>
        </div>
        <button id="vimmoModalClose" style="border:none; background:transparent; cursor:pointer; font-size:20px; font-weight:900; color:#64748b;">×</button>
      </div>
      <div id="vimmoModalActions" style="display:flex; justify-content:flex-end; gap:10px; margin-top:16px; flex-wrap:wrap;"></div>
    `;

        overlay.appendChild(modal);
        document.body.appendChild(overlay);

        overlay.addEventListener("click", (e) => {
            if (e.target === overlay) closeModal();
        });

        modal.querySelector("#vimmoModalClose").addEventListener("click", closeModal);

        return overlay;
    }

    function openModal({ title, text, actions = [] }) {
        const overlay = ensureModal();
        overlay.style.display = "flex";
        document.getElementById("vimmoModalTitle").textContent = title;
        document.getElementById("vimmoModalText").textContent = text;

        const area = document.getElementById("vimmoModalActions");
        area.innerHTML = "";

        actions.forEach(a => {
            const btn = document.createElement("button");
            btn.textContent = a.label;
            btn.style.border = "none";
            btn.style.cursor = "pointer";
            btn.style.fontWeight = "900";
            btn.style.borderRadius = "14px";
            btn.style.padding = "10px 14px";
            btn.style.background = a.variant === "primary" ? "#10b981" : "rgba(148,163,184,0.22)";
            btn.style.color = a.variant === "primary" ? "#ffffff" : "#0f172a";
            btn.addEventListener("click", () => a.onClick?.());
            area.appendChild(btn);
        });

        if (actions.length === 0) {
            const btn = document.createElement("button");
            btn.textContent = "Sluiten";
            btn.style.border = "none";
            btn.style.cursor = "pointer";
            btn.style.fontWeight = "900";
            btn.style.borderRadius = "14px";
            btn.style.padding = "10px 14px";
            btn.style.background = "#10b981";
            btn.style.color = "#ffffff";
            btn.addEventListener("click", closeModal);
            area.appendChild(btn);
        }
    }

    function closeModal() {
        const overlay = document.getElementById("vimmoModalOverlay");
        if (overlay) overlay.style.display = "none";
    }

    function safeNavigate(url) {
        if (!url) return;

        // Same-page anchor logic for instant "locked" feel
        const hashIdx = url.indexOf('#');
        if (hashIdx !== -1) {
            const base = url.substring(0, hashIdx);
            const hash = url.substring(hashIdx);
            const currentPath = window.location.pathname.split('/').pop();

            // If we are already on the base page, just scroll
            if (base === "" || base === currentPath) {
                const id = hash.substring(1);
                const el = document.getElementById(id);
                if (el) {
                    el.scrollIntoView({ behavior: 'smooth' });
                    // Update URL without reload
                    history.pushState(null, null, url);
                    return;
                }
            }
        }

        // Append listingId if context exists, BEFORE the hash
        let finalUrl = url;
        const targetHashIdx = finalUrl.indexOf('#');
        const targetHash = targetHashIdx !== -1 ? finalUrl.substring(targetHashIdx) : '';
        let targetBase = targetHashIdx !== -1 ? finalUrl.substring(0, targetHashIdx) : finalUrl;

        if (window.propertyContext) {
            const id = propertyContext.getCurrentId();
            if (id) {
                targetBase += (targetBase.includes('?') ? '&' : '?') + `listingId=${id}`;
            }
        }
        finalUrl = targetBase + targetHash;

        // Instant navigation for better "locked" feel, no more artificial delays
        window.location.href = finalUrl;
    }

    function handleAction(action, el) {

        if (routes[action]) return safeNavigate(routes[action]);
        if (editRoutes[action]) return safeNavigate(editRoutes[action]);

        if (action === "nav") {
            const href = el.dataset.href;
            if (!href) return toast("Ontbrekende link");
            return safeNavigate(href);
        }

        if (action === "modal") {
            const title = el.dataset.modalTitle || "Informatie";
            const text = el.dataset.modalText || "Deze functie is momenteel in ontwikkeling.";
            return openModal({ title, text });
        }

        // open-aanvraag: Navigate to specific request using data-request-id
        if (action === "open-aanvraag") {
            const requestId = el.dataset.requestId;
            if (requestId) {
                return safeNavigate(`aanvragen-particulier.html?requestId=${requestId}`);
            }
            return safeNavigate("aanvragen-particulier.html");
        }

        if (typeof window[action] === 'function') {
            return window[action](el);
        }

        openModal({
            title: "Actie niet gekoppeld",
            text: `De actie '${action}' heeft nog geen actieve route.`,
            actions: [{ label: "Oké", variant: "primary", onClick: closeModal }]
        });
    }

    // CRITICAL: Ensure we prevent default to avoid double-navigation or "3 clicks" feel
    if (!window._vimmoActionsInitialized) {
        document.addEventListener("click", (e) => {
            // Handle data-action clicks
            const actionEl = e.target.closest("[data-action]");
            if (actionEl) {
                e.preventDefault();
                const action = actionEl.getAttribute("data-action");
                handleAction(action, actionEl);
                return;
            }

            // Handle data-kpi clicks (KPI cards)
            const kpiEl = e.target.closest("[data-kpi]");
            if (kpiEl) {
                e.preventDefault();
                const kpi = kpiEl.getAttribute("data-kpi");
                if (kpiRoutes[kpi]) {
                    toast(`Navigeren naar ${kpi}...`);
                    safeNavigate(kpiRoutes[kpi]);
                } else {
                    toast(`KPI '${kpi}' nog niet gekoppeld`);
                }
                return;
            }
        });
        window._vimmoActionsInitialized = true;
    }

    window.VIMMO = window.VIMMO || {};
    window.VIMMO.refreshOverview = function ({ listingsCount = 0 } = {}) {
        const empty = document.getElementById("listingEmptyState");
        if (!empty) return;
        empty.style.display = listingsCount > 0 ? "none" : "block";
    };

    window.VIMMO.toast = toast;
    window.VIMMO.openModal = openModal;
})();
