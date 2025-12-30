/**
 * VIMMO Decision Card Component with Buyer Profile
 * Features: Vimmo Score, Fit Score, quality/match ranking, profile UI
 * 
 * Usage:
 * 1. Include this script + particulier-utils.js
 * 2. Add: <div id="vimmoProfileBar"></div><div id="resultsGrid" class="vimmo-result-grid"></div>
 * 3. Auto-renders on load
 */
(function () {
    'use strict';

    const STORAGE_KEY = "vimmo_buyer_profile";
    const SORT_KEY = "vimmo_sort_mode";

    let propsCache = [];
    let currentProfile = null;
    let sortMode = "fit"; // "fit" or "quality"

    // Load from localStorage
    function loadProfile() {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            if (raw) currentProfile = JSON.parse(raw);
        } catch (e) { }
        return currentProfile || {};
    }

    function saveProfile(profile) {
        currentProfile = profile;
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
        } catch (e) { }
    }

    function loadSortMode() {
        try {
            sortMode = localStorage.getItem(SORT_KEY) || "fit";
        } catch (e) { }
        return sortMode;
    }

    function saveSortMode(mode) {
        sortMode = mode;
        try {
            localStorage.setItem(SORT_KEY, mode);
        } catch (e) { }
    }

    const VimmoResultCards = {
        gridId: "resultsGrid",
        profileBarId: "vimmoProfileBar",

        euro(n) {
            const v = Number(n);
            if (!v) return "Prijs op aanvraag";
            return "€" + v.toLocaleString("nl-BE");
        },

        addressOf(p) {
            if (p.postcode && p.address) return `${p.postcode} ${p.address}`;
            return p.location || "Locatie niet ingevuld";
        },

        heroOf(p) {
            const photos = Array.isArray(p.photos) ? p.photos.filter(x => x && x.dataUrl && !x.__loading) : [];
            const coverId = p.coverPhoto;
            const cover = coverId ? photos.find(x => x.id === coverId) : null;
            return (cover?.dataUrl || photos[0]?.dataUrl || "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=1200&q=80");
        },

        trustBadges(p) {
            const docs = p.docs || {};
            const hasEpc = !!(docs.doc_epc && docs.doc_epc.ok);
            const hasAsbest = !!(docs.doc_asbest && docs.doc_asbest.ok);
            const hasBodem = !!(docs.doc_bodem && docs.doc_bodem.ok);
            const ownerOk = !!p.ownerVerified;

            const b = (label, ok) =>
                `<span class="vimmo-trust ${ok ? "ok" : "warn"}"><span class="dot"></span>${label}</span>`;

            return `
                <div class="vimmo-trustrow">
                    ${b("EPC", hasEpc)}
                    ${b("Asbest", hasAsbest)}
                    ${b("Bodem", hasBodem)}
                    ${b("Owner", ownerOk)}
                </div>
            `;
        },

        statusPill(p) {
            const st = String(p.listingStatus || "Concept").toLowerCase();
            if (st.includes("actief")) return `<span class="vimmo-pill live">Live</span>`;
            if (st.includes("gepauzeerd")) return `<span class="vimmo-pill">Gepauzeerd</span>`;
            return `<span class="vimmo-pill concept">Concept</span>`;
        },

        getVimmoScore(p) {
            if (typeof computeVimmoScore === "function") {
                return computeVimmoScore(p, window.propertyContext);
            }
            return { score: 0, breakdown: [], tips: [] };
        },

        getFitScore(p) {
            const profile = loadProfile();
            if (typeof computeFitScore === "function" && Object.keys(profile).length > 0) {
                return computeFitScore(p, profile, window.propertyContext);
            }
            return null;
        },

        fitReasons(p) {
            const fit = this.getFitScore(p);
            if (!fit || !fit.reasons || fit.reasons.length === 0) return "";

            return `
                <div class="vimmo-fit-reasons">
                    ${fit.reasons.slice(0, 3).map(r => {
                const isOk = r.startsWith("✓");
                return `<span class="vimmo-fit-reason ${isOk ? '' : 'warn'}">${r}</span>`;
            }).join("")}
                </div>
            `;
        },

        getSlaScore(p) {
            if (typeof computeSlaScore === "function") {
                return computeSlaScore(p);
            }
            return { score: 1.0, badge: "—", label: "Geen data" };
        },

        slaBadge(p) {
            const sla = this.getSlaScore(p);
            if (!sla.avgMinutes) return ""; // No data yet

            const isFast = sla.avgMinutes <= 360; // < 6 hours
            const isSlow = sla.avgMinutes > 720;  // > 12 hours

            return `<span class="vimmo-sla-badge ${isFast ? 'fast' : isSlow ? 'slow' : ''}" title="${sla.label}">${sla.badge}</span>`;
        },

        card(p) {
            const vimmoScore = this.getVimmoScore(p);
            const fitScore = this.getFitScore(p);
            const hasProfile = Object.keys(loadProfile()).length > 0;
            const gate = (typeof getQualityGate === "function") ? getQualityGate(p) : null;

            // Tier badge
            const tierPill = gate ?
                (gate.tier === "gold" ? `<span class="vimmo-pill live" data-act="why" style="cursor:pointer;">🏅 ${gate.label}</span>` :
                    gate.tier === "silver" ? `<span class="vimmo-pill live" data-act="why" style="cursor:pointer;">✓ ${gate.label}</span>` :
                        `<span class="vimmo-pill concept" data-act="why" style="cursor:pointer;">⚠ ${gate.label}</span>`) : "";

            return `
                <article class="vimmo-result-card" data-prop="${p.id}">
                    <div class="vimmo-result-hero">
                        <img src="${this.heroOf(p)}" alt="">
                        <div class="overlay"></div>
                        <div class="toprow">
                            ${tierPill}
                            ${fitScore ? `<span class="vimmo-fit-pill" data-act="fit" style="cursor:pointer;" title="Fit Score: match met jouw profiel">💚 ${fitScore.score}/10</span>` : ""}
                            <span class="vimmo-pill" data-act="score" style="cursor:pointer;" title="Vimmo Score: kwaliteit">⭐ ${vimmoScore.score}/10</span>
                            <span class="vimmo-pill">${p.transactionType ? String(p.transactionType) : "Te koop"}</span>
                        </div>
                    </div>

                    <div class="vimmo-result-body">
                        <div class="vimmo-result-title">${p.name || "Advertentie"}</div>
                        <div class="vimmo-result-addr">${this.addressOf(p)}</div>

                        ${hasProfile ? this.fitReasons(p) : ""}

                        <div style="display:flex; gap:6px; flex-wrap:wrap; align-items:center;">
                            ${this.trustBadges(p)}
                            ${this.slaBadge(p)}
                        </div>

                        <div class="vimmo-result-kpis">
                            <div class="vimmo-kpi">🛏 ${p.bedrooms || "—"}</div>
                            <div class="vimmo-kpi">🛁 ${p.bathrooms || "—"}</div>
                            <div class="vimmo-kpi">📐 ${p.surface ? Number(p.surface).toLocaleString("nl-BE") : "—"} m²</div>
                            <div class="vimmo-kpi">🏷 EPC ${p.epcLabel ? String(p.epcLabel).toUpperCase() : "—"}</div>
                        </div>
                    </div>

                    <div class="vimmo-result-bottom">
                        <div class="vimmo-price">${this.euro(p.price)}</div>
                        <button class="vimmo-why-link" data-act="why">Waarom deze ranking?</button>
                        <div class="vimmo-cta">
                            <button class="vimmo-btn-sm" data-act="preview">Preview</button>
                            <button class="vimmo-btn-sm primary" data-act="open">Open</button>
                        </div>
                    </div>
                </article>
            `;
        },

        renderProfileBar() {
            const bar = document.getElementById(this.profileBarId);
            if (!bar) return;

            const profile = loadProfile();
            loadSortMode();

            bar.innerHTML = `
                <div class="vimmo-profile-bar">
                    <div class="vimmo-profile-header">
                        <div class="vimmo-profile-title">
                            <span>🎯</span> Jouw Zoekprofiel
                        </div>
                        <div class="vimmo-sort-toggle">
                            <button class="vimmo-sort-btn ${sortMode === 'fit' ? 'active' : ''}" data-sort="fit">💚 Beste Match</button>
                            <button class="vimmo-sort-btn ${sortMode === 'quality' ? 'active' : ''}" data-sort="quality">⭐ Beste Kwaliteit</button>
                        </div>
                    </div>
                    <div class="vimmo-profile-form">
                        <div class="vimmo-profile-field">
                            <label>Type</label>
                            <select id="vpf-tx">
                                <option value="">Alles</option>
                                <option value="koop" ${profile.transactionType === 'koop' ? 'selected' : ''}>Te Koop</option>
                                <option value="huur" ${profile.transactionType === 'huur' ? 'selected' : ''}>Te Huur</option>
                            </select>
                        </div>
                        <div class="vimmo-profile-field">
                            <label>Max Budget</label>
                            <input type="number" id="vpf-maxb" placeholder="€450.000" value="${profile.maxBudget || ''}">
                        </div>
                        <div class="vimmo-profile-field">
                            <label>Regio's</label>
                            <input type="text" id="vpf-regions" placeholder="Brugge, Gent..." value="${(profile.regions || []).join(', ')}">
                        </div>
                        <div class="vimmo-profile-field">
                            <label>Min Slaapkamers</label>
                            <input type="number" id="vpf-beds" placeholder="2" value="${profile.minBedrooms || ''}">
                        </div>
                        <div class="vimmo-profile-field">
                            <label>Min m²</label>
                            <input type="number" id="vpf-surf" placeholder="100" value="${profile.minSurface || ''}">
                        </div>
                        <div class="vimmo-profile-field">
                            <label>Min EPC</label>
                            <select id="vpf-epc">
                                <option value="">Geen voorkeur</option>
                                <option value="A+" ${profile.minEpcLabel === 'A+' ? 'selected' : ''}>A+</option>
                                <option value="A" ${profile.minEpcLabel === 'A' ? 'selected' : ''}>A</option>
                                <option value="B" ${profile.minEpcLabel === 'B' ? 'selected' : ''}>B</option>
                                <option value="C" ${profile.minEpcLabel === 'C' ? 'selected' : ''}>C</option>
                                <option value="D" ${profile.minEpcLabel === 'D' ? 'selected' : ''}>D</option>
                            </select>
                        </div>
                        <div class="vimmo-profile-actions">
                            <button class="vimmo-profile-save" id="vpf-save">Opslaan & Filteren</button>
                        </div>
                    </div>
                </div>
            `;

            // Event handlers
            bar.querySelector("#vpf-save")?.addEventListener("click", () => {
                const newProfile = {
                    transactionType: bar.querySelector("#vpf-tx")?.value || "",
                    maxBudget: Number(bar.querySelector("#vpf-maxb")?.value) || 0,
                    regions: (bar.querySelector("#vpf-regions")?.value || "").split(",").map(s => s.trim()).filter(Boolean),
                    minBedrooms: Number(bar.querySelector("#vpf-beds")?.value) || 0,
                    minSurface: Number(bar.querySelector("#vpf-surf")?.value) || 0,
                    minEpcLabel: bar.querySelector("#vpf-epc")?.value || ""
                };
                saveProfile(newProfile);
                this.render();
                if (window.VIMMO) window.VIMMO.toast("Profiel opgeslagen!");
            });

            bar.querySelectorAll("[data-sort]").forEach(btn => {
                btn.addEventListener("click", () => {
                    saveSortMode(btn.dataset.sort);
                    this.renderProfileBar();
                    this.render();
                });
            });
        },

        render(containerId) {
            const grid = document.getElementById(containerId || this.gridId);
            if (!grid) return;

            const ctx = window.propertyContext;
            if (!ctx) {
                grid.innerHTML = `<div style="padding:18px; border:1px dashed rgba(0,0,0,.18); border-radius:18px; font-weight:900; color:rgba(0,0,0,.55);">
                    PropertyContext niet geladen.
                </div>`;
                return;
            }

            let props = (typeof ctx.getActive === "function") ? ctx.getActive() : [];
            if (!props.length) {
                grid.innerHTML = `<div style="padding:18px; border:1px dashed rgba(0,0,0,.18); border-radius:18px; background:rgba(255,255,255,.7); font-weight:900; color:rgba(0,0,0,.55);">
                    Geen resultaten gevonden.
                </div>`;
                return;
            }

            const profile = loadProfile();
            const hasProfile = Object.keys(profile).length > 0;
            loadSortMode();

            // Sort based on mode
            if (sortMode === "fit" && hasProfile && typeof computeFitScore === "function") {
                props = props.slice().sort((a, b) => {
                    // Tier priority first
                    if (typeof getQualityGate === "function") {
                        const gateA = getQualityGate(a);
                        const gateB = getQualityGate(b);
                        if (gateB.tierRank !== gateA.tierRank) return gateB.tierRank - gateA.tierRank;
                    }
                    // Then Fit Score with SLA multiplier
                    let fa = computeFitScore(a, profile, ctx).score;
                    let fb = computeFitScore(b, profile, ctx).score;
                    // Apply SLA multiplier
                    if (typeof computeSlaScore === "function") {
                        const slaA = computeSlaScore(a).score;
                        const slaB = computeSlaScore(b).score;
                        fa = fa * (1 + slaA / 5);
                        fb = fb * (1 + slaB / 5);
                    }
                    if (fb !== fa) return fb - fa;
                    // Fallback to Vimmo Score
                    if (typeof computeVimmoScore === "function") {
                        const qa = computeVimmoScore(a, ctx).score;
                        const qb = computeVimmoScore(b, ctx).score;
                        return qb - qa;
                    }
                    return 0;
                });
            } else if (typeof computeVimmoScore === "function") {
                props = props.slice().sort((a, b) => {
                    // Tier priority first
                    if (typeof getQualityGate === "function") {
                        const gateA = getQualityGate(a);
                        const gateB = getQualityGate(b);
                        if (gateB.tierRank !== gateA.tierRank) return gateB.tierRank - gateA.tierRank;
                    }
                    // Then Vimmo Score with SLA multiplier
                    let sa = computeVimmoScore(a, ctx).score;
                    let sb = computeVimmoScore(b, ctx).score;
                    // Apply SLA multiplier
                    if (typeof computeSlaScore === "function") {
                        const slaA = computeSlaScore(a).score;
                        const slaB = computeSlaScore(b).score;
                        sa = sa * (1 + slaA / 5); // max +50% boost
                        sb = sb * (1 + slaB / 5);
                    }
                    return sb - sa;
                });
            }

            propsCache = props;
            grid.innerHTML = props.map(p => this.card(p)).join("");
        },

        openScoreModal(prop, type) {
            let s, title;
            if (type === "fit") {
                s = this.getFitScore(prop);
                title = "Fit Score - Match met jouw profiel";
            } else {
                s = this.getVimmoScore(prop);
                title = "Vimmo Score - Kwaliteit & Vertrouwen";
            }

            if (!s) return;

            const rows = s.breakdown.map(r => `
                <div style="display:flex; justify-content:space-between; gap:12px; padding:10px 12px; border:1px solid rgba(0,0,0,.08); border-radius:16px; background:#f8fafc; margin-top:10px;">
                    <div style="font-weight:900;">${r.label}</div>
                    <div style="font-weight:900; color:rgba(0,0,0,.70);">${r.pts}/${r.max}</div>
                </div>
            `).join("");

            const tips = (s.tips || []).slice(0, 6).map(t => `
                <div style="padding:10px 12px; border-radius:16px; border:1px solid rgba(16,185,129,.18); background:rgba(16,185,129,.08); font-weight:900; margin-top:10px;">
                    💡 ${t}
                </div>
            `).join("");

            const reasons = (s.reasons || []).slice(0, 5).map(r => {
                const isOk = r.startsWith("✓");
                return `<span class="vimmo-fit-reason ${isOk ? '' : 'warn'}" style="margin-right:6px;">${r}</span>`;
            }).join("");

            const html = `
                <div style="padding:14px; border-radius:18px; border:1px solid rgba(0,0,0,.08); background:#fff;">
                    <div style="font-weight:900; font-size:22px;">${type === 'fit' ? '💚' : '⭐'} ${s.score}/10</div>
                    <div style="margin-top:6px; font-weight:800; color:rgba(0,0,0,.55);">${title}</div>
                    ${reasons ? `<div style="margin-top:10px;">${reasons}</div>` : ""}
                </div>
                <div style="margin-top:12px; font-weight:900;">Breakdown</div>
                ${rows}
                ${tips ? `<div style="margin-top:14px; font-weight:900;">Verbeterpunten</div>${tips}` : ""}
            `;

            if (window.VimmoScoreModal && typeof window.VimmoScoreModal.open === "function") {
                window.VimmoScoreModal.open(html);
            } else {
                this.createModal();
                setTimeout(() => {
                    if (window.VimmoScoreModal) window.VimmoScoreModal.open(html);
                }, 50);
            }
        },

        openWhyModal(prop) {
            const profile = loadProfile();
            const ctx = window.propertyContext;

            // Use the unified explainRanking function
            if (typeof explainRanking !== "function") return;

            const expl = explainRanking(prop, profile, ctx);

            const tierColors = {
                gold: "background:linear-gradient(135deg, #fbbf24, #f59e0b);",
                silver: "background:linear-gradient(135deg, #94a3b8, #64748b);",
                bronze: "background:linear-gradient(135deg, #d97706, #92400e);"
            };

            const tierIcons = { gold: "🏅", silver: "✓", bronze: "⚠" };
            const tierLabels = { gold: "Gold Verified", silver: "Verified", bronze: "Beperkte verificatie" };

            // Reasons section
            const reasonsHtml = expl.reasons.map(r =>
                `<div style="padding:12px 14px; border-radius:16px; background:#f8fafc; border:1px solid rgba(0,0,0,.08); font-weight:800; margin-top:10px;">${r}</div>`
            ).join("");

            // Comparison section
            const compareHtml = expl.compared.length
                ? expl.compared.map(r =>
                    `<div style="margin-top:8px; font-weight:800; color:rgba(0,0,0,.55);">• ${r}</div>`
                ).join("")
                : `<div style="margin-top:8px; font-weight:800; color:#059669;">✓ Deze woning behoort tot de topresultaten</div>`;

            // Improvement tips
            const tipsHtml = expl.tips.length
                ? `<div style="margin-top:16px; font-weight:900; font-size:14px;">💡 Verbeter je ranking</div>` +
                expl.tips.map(t =>
                    `<div style="padding:10px 14px; border-radius:14px; border:1px solid rgba(16,185,129,.18); background:rgba(16,185,129,.08); font-weight:800; margin-top:8px;">${t}</div>`
                ).join("")
                : "";

            const html = `
                <div style="padding:18px; border-radius:18px; ${tierColors[expl.tier] || tierColors.bronze} color:#fff; text-align:center;">
                    <div style="font-size:32px; margin-bottom:6px;">${tierIcons[expl.tier]}</div>
                    <div style="font-weight:900; font-size:22px;">${tierLabels[expl.tier]}</div>
                </div>

                <div style="margin-top:16px; padding:14px; border-radius:16px; border:1px solid rgba(59,130,246,.15); background:rgba(59,130,246,.05);">
                    <div style="font-weight:900; font-size:16px; color:#1e40af;">${expl.headline}</div>
                </div>

                <div style="margin-top:16px; font-weight:900; font-size:14px;">Ranking factoren</div>
                ${reasonsHtml}

                <div style="margin-top:16px; font-weight:900; font-size:14px;">Vergelijking met andere woningen</div>
                ${compareHtml}

                ${tipsHtml}
            `;

            if (window.VimmoScoreModal && typeof window.VimmoScoreModal.open === "function") {
                window.VimmoScoreModal.open(html);
            } else {
                this.createModal();
                setTimeout(() => {
                    if (window.VimmoScoreModal) window.VimmoScoreModal.open(html);
                }, 50);
            }
        },

        createModal() {
            if (document.getElementById("vimmoScoreModal")) return;

            const modalHtml = `
                <div id="vimmoScoreModal" style="display:none; position:fixed; inset:0; background:rgba(0,0,0,.55); z-index:9999; justify-content:center; align-items:center;">
                    <div style="background:#fff; width:min(760px, 92vw); max-height:90vh; overflow-y:auto; border-radius:22px; padding:18px; box-shadow:0 24px 70px rgba(0,0,0,.25);">
                        <div style="display:flex; justify-content:space-between; align-items:center; gap:12px;">
                            <div style="font-weight:900; font-size:18px;">Score Details</div>
                            <button type="button" id="vimmoScoreClose" style="border:none; background:transparent; font-size:26px; cursor:pointer; color:rgba(0,0,0,.55);">&times;</button>
                        </div>
                        <div id="vimmoScoreBody" style="margin-top:12px;"></div>
                    </div>
                </div>
            `;
            document.body.insertAdjacentHTML("beforeend", modalHtml);

            const modal = document.getElementById("vimmoScoreModal");
            const body = document.getElementById("vimmoScoreBody");
            const close = document.getElementById("vimmoScoreClose");

            function hide() { modal.style.display = "none"; }

            close?.addEventListener("click", hide);
            modal?.addEventListener("click", (e) => { if (e.target === modal) hide(); });
            document.addEventListener("keydown", (e) => { if (e.key === "Escape" && modal?.style.display === "flex") hide(); });

            window.VimmoScoreModal = {
                open(html) {
                    body.innerHTML = html;
                    modal.style.display = "flex";
                }
            };
        },

        init(containerId) {
            const grid = document.getElementById(containerId || this.gridId);
            if (!grid) return;

            // Load saved data
            loadProfile();
            loadSortMode();

            // Create modal
            this.createModal();

            // Render profile bar
            this.renderProfileBar();

            // Click handlers
            grid.addEventListener("click", (e) => {
                const btn = e.target.closest("[data-act]");
                if (!btn) return;
                const act = btn.getAttribute("data-act");
                const cardEl = btn.closest("[data-prop]");
                if (!cardEl) return;
                const id = cardEl.getAttribute("data-prop");

                if (act === "preview") {
                    window.location.href = "listing-preview.html?prop=" + encodeURIComponent(id);
                }
                if (act === "open") {
                    window.location.href = "advertentie-particulier.html?prop=" + encodeURIComponent(id);
                }
                if (act === "score") {
                    const prop = propsCache.find(x => String(x.id) === String(id));
                    if (prop) this.openScoreModal(prop, "vimmo");
                }
                if (act === "fit") {
                    const prop = propsCache.find(x => String(x.id) === String(id));
                    if (prop) this.openScoreModal(prop, "fit");
                }
                if (act === "why") {
                    const prop = propsCache.find(x => String(x.id) === String(id));
                    if (prop) this.openWhyModal(prop);
                }
            });

            // Initial render
            this.render(containerId);

            // Re-render on property changes
            window.addEventListener("propertyChanged", () => setTimeout(() => this.render(containerId), 50));
        }
    };

    // Auto-init on DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => VimmoResultCards.init());
    } else {
        VimmoResultCards.init();
    }

    // Expose globally
    window.VimmoResultCards = VimmoResultCards;
})();
