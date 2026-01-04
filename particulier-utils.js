/**
 * Particulier Utils - Shared UI components and helper functions
 */

const ParticulierUtils = {
    // --- Toasts ---
    toast: (message, type = 'success') => {
        const container = document.getElementById('toast-container') || (() => {
            const div = document.createElement('div');
            div.id = 'toast-container';
            div.style.cssText = 'position: fixed; bottom: 30px; left: 50%; transform: translateX(-50%); z-index: 9999; display: flex; flex-direction: column; gap: 10px; pointer-events: none;';
            document.body.appendChild(div);
            return div;
        })();

        const toast = document.createElement('div');
        const bg = type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#1e293b';
        const icon = type === 'success' ? 'ri-checkbox-circle-line' : type === 'error' ? 'ri-error-warning-line' : 'ri-information-line';

        toast.style.cssText = `
            background: ${bg};
            color: white;
            padding: 12px 24px;
            border-radius: 12px;
            font-weight: 600;
            box-shadow: 0 10px 25px rgba(0,0,0,0.1);
            display: flex;
            align-items: center;
            gap: 10px;
            animation: toastIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
            pointer-events: auto;
        `;

        toast.innerHTML = `<i class="${icon}"></i> <span>${message}</span>`;
        container.appendChild(toast);

        // Add keyframes if not exists
        if (!document.getElementById('particulier-animations')) {
            const style = document.createElement('style');
            style.id = 'particulier-animations';
            style.innerHTML = `
                @keyframes toastIn { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
                @keyframes toastOut { from { transform: translateY(0); opacity: 1; } to { transform: translateY(-20px); opacity: 0; } }
            `;
            document.head.appendChild(style);
        }

        setTimeout(() => {
            toast.style.animation = 'toastOut 0.3s ease forwards';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    },

    // --- Modals ---
    confirm: (title, message, confirmText = 'Bevestigen', type = 'normal') => {
        return new Promise((resolve) => {
            const overlay = document.createElement('div');
            overlay.style.cssText = 'position: fixed; inset: 0; background: rgba(0,0,0,0.6); backdrop-filter: blur(5px); z-index: 10000; display: flex; align-items: center; justify-content: center;';

            const modal = document.createElement('div');
            modal.className = 'glass-panel';
            modal.style.cssText = 'width: 400px; padding: 30px; text-align: center;';

            const isDanger = type === 'danger';
            const accentColor = isDanger ? '#ef4444' : '#10b981';

            modal.innerHTML = `
                <div style="width: 60px; height: 60px; border-radius: 50%; background: ${isDanger ? '#fee2e2' : '#f0fdf4'}; color: ${accentColor}; display: flex; align-items: center; justify-content: center; margin: 0 auto 20px; font-size: 1.5rem;">
                    <i class="${isDanger ? 'ri-error-warning-line' : 'ri-question-line'}"></i>
                </div>
                <h3 style="margin-bottom: 15px; font-weight: 800;">${title}</h3>
                <p style="color: #64748b; font-size: 0.95rem; margin-bottom: 30px; line-height: 1.5;">${message}</p>
                ${isDanger ? `<div style="margin-bottom: 20px;"><input type="text" id="confirm-type" placeholder="Typ 'VERWIJDEREN' om te bevestigen" style="width: 100%; padding: 12px; border: 2px solid #fee2e2; border-radius: 12px; outline: none; text-align: center; font-weight: 700;"></div>` : ''}
                <div style="display: flex; flex-direction: column; gap: 10px;">
                    <button id="confirm-btn" style="width: 100%; padding: 14px; border-radius: 12px; border: none; background: ${accentColor}; color: white; font-weight: 700; cursor: pointer;">${confirmText}</button>
                    <button id="cancel-btn" style="width: 100%; padding: 14px; border-radius: 12px; border: 1px solid #e2e8f0; background: transparent; color: #64748b; font-weight: 600; cursor: pointer;">Annuleren</button>
                </div>
            `;

            overlay.appendChild(modal);
            document.body.appendChild(overlay);

            const confirmBtn = modal.querySelector('#confirm-btn');
            const cancelBtn = modal.querySelector('#cancel-btn');
            const typeInput = modal.querySelector('#confirm-type');

            if (isDanger && typeInput) {
                confirmBtn.style.opacity = '0.5';
                confirmBtn.style.pointerEvents = 'none';
                typeInput.addEventListener('input', (e) => {
                    const valid = e.target.value === 'VERWIJDEREN';
                    confirmBtn.style.opacity = valid ? '1' : '0.5';
                    confirmBtn.style.pointerEvents = valid ? 'auto' : 'none';
                });
            }

            confirmBtn.onclick = () => {
                overlay.remove();
                resolve(true);
            };
            cancelBtn.onclick = () => {
                overlay.remove();
                resolve(false);
            };
        });
    },

    // --- Prompts ---
    prompt: (title, message, defaultValue = '') => {
        return new Promise((resolve) => {
            const overlay = document.createElement('div');
            overlay.style.cssText = 'position: fixed; inset: 0; background: rgba(0,0,0,0.6); backdrop-filter: blur(5px); z-index: 10000; display: flex; align-items: center; justify-content: center;';

            const modal = document.createElement('div');
            modal.className = 'glass-panel';
            modal.style.cssText = 'width: 450px; padding: 35px; text-align: left;';

            modal.innerHTML = `
                <h3 style="margin-bottom: 10px; font-weight: 800; font-size: 1.2rem;">${title}</h3>
                <p style="color: #64748b; font-size: 0.9rem; margin-bottom: 20px;">${message}</p>
                <div style="margin-bottom: 25px;">
                    <input type="text" id="prompt-input" value="${defaultValue}" 
                        style="width: 100%; padding: 15px; border: 2px solid #f1f5f9; border-radius: 12px; outline: none; font-weight: 600; font-size: 1rem; transition: border-color 0.3s;"
                        onfocus="this.style.borderColor='#10b981'" onblur="this.style.borderColor='#f1f5f9'">
                </div>
                <div style="display: flex; gap: 12px; justify-content: flex-end;">
                    <button id="cancel-btn" style="padding: 12px 20px; border-radius: 12px; border: 1px solid #e2e8f0; background: transparent; color: #64748b; font-weight: 700; cursor: pointer;">Annuleren</button>
                    <button id="confirm-btn" style="padding: 12px 30px; border-radius: 12px; border: none; background: #10b981; color: white; font-weight: 700; cursor: pointer; box-shadow: 0 4px 12px rgba(16, 185, 129, 0.2);">Opslaan</button>
                </div>
            `;

            overlay.appendChild(modal);
            document.body.appendChild(overlay);

            const input = modal.querySelector('#prompt-input');
            const confirmBtn = modal.querySelector('#confirm-btn');
            const cancelBtn = modal.querySelector('#cancel-btn');

            input.focus();
            input.select();

            input.addEventListener('keyup', (e) => {
                if (e.key === 'Enter') confirmBtn.click();
                if (e.key === 'Escape') cancelBtn.click();
            });

            confirmBtn.onclick = () => {
                const val = input.value;
                overlay.remove();
                resolve(val);
            };
            cancelBtn.onclick = () => {
                overlay.remove();
                resolve(null);
            };
        });
    },

    // --- Alerts ---
    alert: (title, message) => {
        return new Promise((resolve) => {
            const overlay = document.createElement('div');
            overlay.style.cssText = 'position: fixed; inset: 0; background: rgba(0,0,0,0.6); backdrop-filter: blur(5px); z-index: 10000; display: flex; align-items: center; justify-content: center;';

            const modal = document.createElement('div');
            modal.className = 'glass-panel';
            modal.style.cssText = 'width: 450px; padding: 35px; text-align: center;';

            modal.innerHTML = `
                <div style="width: 60px; height: 60px; border-radius: 50%; background: #f0fdf4; color: #10b981; display: flex; align-items: center; justify-content: center; margin: 0 auto 20px; font-size: 1.5rem;">
                    <i class="ri-information-line"></i>
                </div>
                <h3 style="margin-bottom: 15px; font-weight: 800;">${title}</h3>
                <div style="color: #64748b; font-size: 0.95rem; margin-bottom: 30px; line-height: 1.6; text-align: left;">${message}</div>
                <button id="close-btn" style="width: 100%; padding: 14px; border-radius: 12px; border: none; background: #1e293b; color: white; font-weight: 700; cursor: pointer;">Sluiten</button>
            `;

            overlay.appendChild(modal);
            document.body.appendChild(overlay);

            modal.querySelector('#close-btn').onclick = () => {
                overlay.remove();
                resolve();
            };
        });
    },

    // --- Loading State ---
    setLoading: (btn, isLoading) => {
        if (isLoading) {
            btn.dataset.originalHtml = btn.innerHTML;
            btn.disabled = true;
            btn.style.opacity = '0.8';
            btn.innerHTML = '<i class="ri-loader-4-line ri-spin"></i> Bezig...';
        } else {
            btn.innerHTML = btn.dataset.originalHtml || btn.innerHTML;
            btn.disabled = false;
            btn.style.opacity = '1';
        }
    },

    // --- Tooltips for Binnenkort Beschikbaar ---
    initTooltips: () => {
        const disabledElems = document.querySelectorAll('.nav-item.disabled, .btn:disabled, [title="Binnenkort beschikbaar"]');
        disabledElems.forEach(el => {
            el.addEventListener('mouseenter', (e) => {
                const tooltip = document.createElement('div');
                tooltip.id = 'temp-tooltip';
                tooltip.style.cssText = 'position: fixed; background: #1e293b; color: white; padding: 6px 12px; border-radius: 6px; font-size: 0.75rem; z-index: 10001; pointer-events: none; transform: translateY(-100%); margin-top: -10px; font-weight: 600;';
                tooltip.textContent = 'Binnenkort beschikbaar';
                document.body.appendChild(tooltip);

                const rect = el.getBoundingClientRect();
                tooltip.style.left = rect.left + 'px';
                tooltip.style.top = rect.top + 'px';
            });
            el.addEventListener('mouseleave', () => {
                const tt = document.getElementById('temp-tooltip');
                if (tt) tt.remove();
            });
        });
    },

    /**
     * computeListingHealth
     * Deterministic world-class health engine
     */
    computeListingHealth: (prop, ctx) => {
        const p = prop || {};
        const norm = (v) => (v === undefined || v === null) ? "" : String(v).trim();
        const blockers = [];
        const penalties = [];
        const tips = [];

        // --- 1. Content Completeness (28%) ---
        let contentScore = 100;
        const title = norm(p.name);
        const desc = norm(p.description);
        const postcode = norm(p.postcode);
        const price = Number(p.price || 0);

        // Title (20% of category)
        if (title.length < 28) {
            contentScore -= 15;
            blockers.push({ id: "title_short", severity: "blocker", label: "Titel te kort", hint: "Minimum 28 tekens voor optimale SEO.", fixAction: "focus", fixTarget: "title" });
        } else if (title.length > 78) {
            contentScore -= 5;
            tips.push({ id: "title_long", label: "Titel erg lang", hint: "Houdt het tussen 28 en 78 tekens voor Google." });
        }
        if (title === title.toUpperCase() && title.length > 5) {
            contentScore -= 10;
            penalties.push({ id: "title_caps", severity: "penalty", label: "Titel in ALL CAPS", hint: "Gebruik kleine letters voor een premium uitstraling.", fixAction: "focus", fixTarget: "title" });
        }

        // Description (25% of category)
        if (desc.length < 700) {
            contentScore -= 20;
            const severity = desc.length === 0 ? "blocker" : "penalty";
            const item = { id: "desc_short", severity, label: desc.length === 0 ? "Beschrijving ontbreekt" : "Beschrijving te kort", hint: "Voeg minstens 700 tekens toe (nu: " + desc.length + ").", fixAction: "focus", fixTarget: "description" };
            if (severity === "blocker") blockers.push(item); else penalties.push(item);
        }

        // Location (20% of category)
        if (!postcode) {
            contentScore -= 20;
            blockers.push({ id: "loc_none", severity: "blocker", label: "Locatie ontbreekt", hint: "Postcode is verplicht voor publicatie.", fixAction: "focus", fixTarget: "location" });
        }

        // Specs & Features (35% of category)
        const hasSpecs = p.type && p.surface && p.bedrooms;
        if (!hasSpecs) {
            contentScore -= 15;
            blockers.push({ id: "specs_incomplete", severity: "blocker", label: "Kenmerken incompleet", hint: "Oppervlakte en slaapkamers zijn verplicht.", fixAction: "scroll", fixTarget: "specs" });
        }

        // --- 2. Media Quality (18%) ---
        let mediaScore = 100;
        const photos = Array.isArray(p.photos) ? p.photos.filter(x => x && x.dataUrl) : [];
        if (photos.length === 0) {
            mediaScore = 0;
            blockers.push({ id: "media_none", severity: "blocker", label: "Geen foto's", hint: "Advertenties zonder foto's worden niet gepubliceerd.", fixAction: "scroll", fixTarget: "media" });
        } else if (photos.length < 4) {
            mediaScore = 20;
            blockers.push({ id: "media_vlow", severity: "blocker", label: "Kritiek weinig foto's", hint: "Minstens 4 foto's nodig om te kunnen publiceren.", fixAction: "scroll", fixTarget: "media" });
        } else if (photos.length < 8) {
            mediaScore = 50;
            penalties.push({ id: "media_low", severity: "penalty", label: "Te weinig foto's voor ranking", hint: "Voeg minstens 8 foto's toe voor een goede ranking (nu: " + photos.length + ").", fixAction: "scroll", fixTarget: "media" });
        } else if (photos.length < 15) {
            mediaScore = 80;
            tips.push({ id: "media_pro", label: "Voeg meer foto's toe", hint: "Panden met 15+ foto's krijgen 40% meer aanvragen." });
        }

        // --- 3. Trust & Verification (18%) ---
        let trustScore = 70; // Baseline
        if (p.ownerVerified) trustScore += 30;
        else penalties.push({ id: "trust_owner", severity: "penalty", label: "Eigenaarschap niet geverifieerd", hint: "Start verificatie voor een 'Verified' badge en betere ranking.", fixAction: "scroll", fixTarget: "trust" });

        const epcDoc = p.docs?.doc_epc?.ok;
        if (epcDoc) trustScore += 10; else tips.push({ id: "trust_epc", label: "Geen EPC document", hint: "Upload je EPC attest voor 20% meer vertrouwen." });
        trustScore = Math.min(100, trustScore);

        // --- 4. Pricing & Market Fit (12%) ---
        let priceScore = 100;
        if (price <= 0) {
            priceScore = 0;
            blockers.push({ id: "price_zero", severity: "blocker", label: "Prijs ontbreekt", hint: "Voer een geldige vraagprijs in.", fixAction: "focus", fixTarget: "price" });
        }

        // --- 5. Responsiveness & SLA (12%) ---
        let slaScore = 70; // Default for new listings
        const sla = window.computeSlaScore ? window.computeSlaScore(p, ctx) : { score: 1.0, avgMinutes: null };
        if (sla.avgMinutes !== null) {
            slaScore = (sla.score / 2.5) * 100;
            if (slaScore < 55) penalties.push({ id: "sla_slow", severity: "penalty", label: "Lage responstijd", hint: "Beantwoord leads sneller om je ranking te verbeteren.", fixAction: "scroll", fixTarget: "sla" });
        }

        // --- 6. Availability & Scheduling (6%) ---
        let availScore = 80;
        const hasSlots = Array.isArray(p.viewingSlots) && p.viewingSlots.length > 0;
        if (!hasSlots) {
            availScore = 40;
            tips.push({ id: "avail_none", label: "Geen bezichtigingsmomenten", hint: "Stel slots in zodat zoekers direct kunnen boeken." });
        }

        // --- 7. Compliance & Legal (6%) ---
        let legalScore = 100;
        if (!p.epcLabel) {
            legalScore = 30;
            blockers.push({ id: "legal_epc", severity: "blocker", label: "EPC Label ontbreekt", hint: "Dit is wettelijk verplicht bij publicatie.", fixAction: "scroll", fixTarget: "epc" });
        }

        // Final Calculation
        const totalScore = (
            (contentScore * 0.28) +
            (mediaScore * 0.18) +
            (trustScore * 0.18) +
            (priceScore * 0.12) +
            (slaScore * 0.12) +
            (availScore * 0.06) +
            (legalScore * 0.06)
        );

        let label = "Kritiek";
        let tier = "critical";
        if (totalScore >= 85) { label = "Excellent"; tier = "excellent"; }
        else if (totalScore >= 70) { label = "Goed"; tier = "good"; }
        else if (totalScore >= 55) { label = "Oké"; tier = "ok"; }
        else if (totalScore >= 40) { label = "Zwak"; tier = "weak"; }

        return {
            score: Math.round(totalScore),
            label,
            tier,
            blockers,
            penalties,
            tips,
            categories: {
                content: Math.max(0, contentScore),
                media: Math.max(0, mediaScore),
                trust: Math.max(0, trustScore),
                price: Math.max(0, priceScore),
                sla: Math.max(0, slaScore),
                availability: Math.max(0, availScore),
                legal: Math.max(0, legalScore)
            }
        };
    },

    unmaskLeadData: (lead) => {
        if (!lead) return { phone: '***', email: '***' };

        const phone = lead.phone || lead.personal?.phone || '+32 470 00 00 00';
        const email = lead.email || lead.personal?.email || 'user@example.com';

        // Reveal if high trust status or high trust score
        const isRevealed = ['Bezichtiging', 'Beslissing', 'Overeenkomst'].includes(lead.status) ||
            (window.propertyContext && propertyContext.getTrustLevel(lead.id) >= 70);

        if (isRevealed) {
            return { phone, email, isRevealed: true };
        } else {
            const maskedPhone = phone.substring(0, 7) + ' ** ** ' + phone.substring(phone.length - 2);
            const [user, domain] = email.split('@');
            const maskedEmail = user.substring(0, 3) + '***@' + (domain || 'example.com');
            return { phone: maskedPhone, email: maskedEmail, isRevealed: false };
        }
    }
};

window.ParticulierUtils = ParticulierUtils;
window.VIMMO = ParticulierUtils; // Global alias for unified access

/* =========================================================
   VIMMO SCORE ENGINE (0–10)
   Local-first, no backend required
   Works with: prop.photos, prop.docs, prop.ownerVerified,
               getPublishState(prop), ctx.getRequests(propId)
   ========================================================= */
function computeVimmoScore(prop, ctx) {
    const p = prop || {};
    const norm = (v) => (v === undefined || v === null) ? "" : String(v).trim();

    const photos = Array.isArray(p.photos) ? p.photos.filter(x => x && x.dataUrl && !x.__loading) : [];
    const photoCount = photos.length;

    const docs = p.docs || {};
    const hasEpc = !!(docs.doc_epc && docs.doc_epc.ok);
    const hasAsbest = !!(docs.doc_asbest && docs.doc_asbest.ok);
    const hasBodem = !!(docs.doc_bodem && docs.doc_bodem.ok);
    const ownerOk = !!p.ownerVerified;

    const titleLen = norm(p.name).length;

    const publishState = (typeof getPublishState === "function") ? getPublishState(p) : null;
    const publishAllOk = publishState ? !!publishState.allOk : false;

    let requests = [];
    try {
        if (ctx && typeof ctx.getRequests === "function") {
            requests = ctx.getRequests(p.id) || [];
        }
    } catch (e) { }

    function clamp(n, min, max) { return Math.max(min, Math.min(max, n)); }
    function hoursBetween(a, b) { return Math.abs((a - b) / 36e5); }

    function scoreCompleteness() {
        if (!publishState) return { pts: 0, max: 3.0, label: "Volledigheid", note: "Geen publish state" };

        const total = publishState.items.length || 6;
        const ok = publishState.items.filter(x => x.ok).length;
        const ratio = total ? (ok / total) : 0;

        const pts = 3.0 * ratio;
        return { pts, max: 3.0, label: "Volledigheid", note: `${ok}/${total}` };
    }

    function scoreMedia() {
        const max = 2.0;

        if (photoCount <= 0) return { pts: 0, max, label: "Media", note: "0 foto's" };
        if (photoCount < 4) return { pts: 0.6, max, label: "Media", note: `${photoCount} foto's` };
        if (photoCount < 8) return { pts: 1.2, max, label: "Media", note: `${photoCount} foto's` };
        if (photoCount < 12) return { pts: 1.7, max, label: "Media", note: `${photoCount} foto's` };

        return { pts: 2.0, max, label: "Media", note: `${photoCount} foto's` };
    }

    function scoreTrust() {
        const max = 3.0;

        let pts = 0;
        if (hasEpc) pts += 1.0;
        if (hasAsbest) pts += 0.8;
        if (hasBodem) pts += 0.8;
        if (ownerOk) pts += 0.4;

        pts = clamp(pts, 0, max);
        return { pts, max, label: "Trust", note: `EPC:${hasEpc ? "✓" : "✗"} Asbest:${hasAsbest ? "✓" : "✗"} Bodem:${hasBodem ? "✓" : "✗"} Owner:${ownerOk ? "✓" : "✗"}` };
    }

    function scoreResponsiveness() {
        const max = 1.2;

        if (!Array.isArray(requests) || requests.length === 0) {
            return { pts: 0.6, max, label: "Snelheid", note: "Nog geen aanvragen" };
        }

        const replied = requests.filter(r => r && (r.status === "Beantwoord" || r.status === "beantwoord" || r.repliedAt));
        if (replied.length === 0) {
            return { pts: 0.2, max, label: "Snelheid", note: "Nog geen replies" };
        }

        const times = replied
            .map(r => {
                const created = r.createdAt ? new Date(r.createdAt).getTime() : null;
                const repliedAt = r.repliedAt ? new Date(r.repliedAt).getTime() : null;
                if (!created || !repliedAt) return null;
                return hoursBetween(repliedAt, created);
            })
            .filter(x => typeof x === "number" && isFinite(x));

        if (times.length === 0) return { pts: 0.7, max, label: "Snelheid", note: "Replies zonder timing" };

        const avgH = times.reduce((a, b) => a + b, 0) / times.length;

        let pts = 0.2;
        if (avgH <= 1) pts = 1.2;
        else if (avgH <= 6) pts = 1.0;
        else if (avgH <= 24) pts = 0.8;
        else if (avgH <= 72) pts = 0.5;
        else pts = 0.3;

        return { pts, max, label: "Snelheid", note: `Gem. ${avgH.toFixed(1)}u` };
    }

    function scoreListingQuality() {
        const max = 0.8;

        let pts = 0;
        if (titleLen >= 6) pts += 0.2;
        if (titleLen >= 14) pts += 0.2;
        if (Number(p.price) > 0) pts += 0.2;
        if (Number(p.surface) > 0) pts += 0.1;
        if (Number(p.bedrooms) > 0) pts += 0.1;

        pts = clamp(pts, 0, max);
        return { pts, max, label: "Kwaliteit", note: `Titel:${titleLen} Prijs:${Number(p.price) > 0 ? "✓" : "✗"}` };
    }

    const parts = [
        scoreCompleteness(),
        scoreMedia(),
        scoreTrust(),
        scoreResponsiveness(),
        scoreListingQuality()
    ];

    const totalMax = parts.reduce((a, p) => a + p.max, 0);
    const raw = parts.reduce((a, p) => a + p.pts, 0);

    // Convert to 0–10
    let score = totalMax ? (raw / totalMax) * 10 : 0;

    // Tiny boost for active + complete listings
    if (String(p.listingStatus || "").toLowerCase().includes("actief") && publishAllOk) {
        score += 0.2;
    }

    score = clamp(score, 0, 10);

    const rounded = Math.round(score * 10) / 10;

    const tips = [];
    if (photoCount < 8) tips.push(`Voeg foto's toe (${photoCount}/8) voor meer vertrouwen en clicks.`);
    if (!hasEpc) tips.push("Upload EPC attest. Dit is één van de grootste trust boosts.");
    if (!hasAsbest) tips.push("Upload asbestattest voor transparantie en minder afhakers.");
    if (!hasBodem) tips.push("Upload bodemattest. Dit verhoogt je geloofwaardigheid.");
    if (!ownerOk) tips.push("Start eigenaarsverificatie. Verified listings converteren beter.");
    if (titleLen < 14) tips.push("Maak je titel specifieker (minstens 14 tekens) voor hogere doorklikratio.");
    if (!publishAllOk) tips.push("Maak je checklist volledig groen. Publiceer pas als alles klopt.");

    return {
        score: rounded,
        breakdown: parts.map(x => ({
            label: x.label,
            pts: Math.round(x.pts * 10) / 10,
            max: x.max,
            note: x.note
        })),
        tips
    };
}

window.computeVimmoScore = computeVimmoScore;

/* =========================================================
   VIMMO FIT SCORE (0–10)
   Doel: match woning ↔ koperprofiel (budget, regio, EPC, size)
   Local-first, werkt meteen met propertyContext data
   ========================================================= */
function computeFitScore(prop, profile, ctx) {
    const p = prop || {};
    const prof = profile || {};

    const norm = (v) => (v === undefined || v === null) ? "" : String(v).trim().toLowerCase();
    const clamp = (n, min, max) => Math.max(min, Math.min(max, n));

    // Helpers
    const price = Number(p.price || 0);
    const beds = Number(p.bedrooms || 0);
    const surface = Number(p.surface || 0);
    const epc = norm(p.epcLabel || "").toUpperCase();

    const addr = norm(`${p.postcode || ""} ${p.address || ""} ${p.location || ""}`);
    const city = norm(p.location || "");

    const wantsBuy = norm(prof.transactionType || "");
    const listingTx = norm(p.transactionType || "");

    // EPC mapping (A best -> G worst)
    const EPC_ORDER = ["A+", "A", "B", "C", "D", "E", "F", "G"];
    function epcRank(label) {
        const u = String(label || "").toUpperCase();
        const idx = EPC_ORDER.indexOf(u);
        return idx === -1 ? null : idx;
    }

    function containsRegion(text, regions) {
        const t = norm(text);
        const arr = Array.isArray(regions) ? regions : [];
        return arr.some(r => {
            const rr = norm(r);
            if (!rr) return false;
            return t.includes(rr);
        });
    }

    // 1) Transaction match (max 1.0)
    let txPts = 0.6;
    if (wantsBuy) {
        txPts = (listingTx && listingTx.includes(wantsBuy)) ? 1.0 : 0.2;
    }

    // 2) Budget fit (max 3.0)
    const minB = Number(prof.minBudget || 0);
    const maxB = Number(prof.maxBudget || 0);
    const softPct = Number(prof.softOverBudgetPct || 7);
    let budgetPts = 1.5;

    if (maxB > 0 && price > 0) {
        if (price <= maxB) {
            const ratio = price / maxB;
            budgetPts = 3.0 - (ratio * 0.8);
        } else {
            const over = (price - maxB) / maxB * 100;
            if (over <= softPct) budgetPts = 1.4;
            else if (over <= 15) budgetPts = 0.7;
            else budgetPts = 0.2;
        }
    } else if (minB > 0 && price > 0 && price < minB) {
        budgetPts = 0.8;
    }
    budgetPts = clamp(budgetPts, 0, 3.0);

    // 3) Region fit (max 2.2)
    const regions = prof.regions || [];
    let regionPts = 1.0;
    if (Array.isArray(regions) && regions.length) {
        const ok = containsRegion(addr, regions) || containsRegion(city, regions);
        regionPts = ok ? 2.2 : 0.3;
    }
    regionPts = clamp(regionPts, 0, 2.2);

    // 4) Size fit (bedrooms + surface) (max 2.0)
    const minBeds = Number(prof.minBedrooms || 0);
    const minSurf = Number(prof.minSurface || 0);

    let bedScore = 0.5;
    if (minBeds > 0) {
        if (beds >= minBeds) bedScore = 1.0;
        else if (beds === minBeds - 1) bedScore = 0.6;
        else bedScore = 0.2;
    } else {
        bedScore = beds > 0 ? 0.9 : 0.6;
    }

    let surfScore = 0.5;
    if (minSurf > 0) {
        if (surface >= minSurf) surfScore = 1.0;
        else if (surface >= minSurf * 0.9) surfScore = 0.7;
        else surfScore = 0.25;
    } else {
        surfScore = surface > 0 ? 0.9 : 0.6;
    }

    const sizePts = clamp((bedScore + surfScore), 0, 2.0);

    // 5) Energy preference (max 1.2)
    let energyPts = 0.7;
    const pref = String(prof.minEpcLabel || "").toUpperCase();
    const prefRank = epcRank(pref);
    const listingRank = epcRank(epc);

    if (prefRank !== null) {
        if (listingRank === null) energyPts = 0.35;
        else {
            if (listingRank <= prefRank) energyPts = 1.2;
            else if (listingRank === prefRank + 1) energyPts = 0.7;
            else energyPts = 0.25;
        }
    } else {
        energyPts = listingRank !== null ? 0.9 : 0.7;
    }

    // 6) Trust + quality bonus (max 0.6)
    let trustBonus = 0.3;
    if (typeof computeVimmoScore === "function") {
        const s = computeVimmoScore(p, ctx);
        trustBonus = clamp((Number(s.score || 0) / 10) * 0.6, 0, 0.6);
    }

    // Total
    const parts = [
        { k: "Transactie", pts: txPts, max: 1.0 },
        { k: "Budget", pts: budgetPts, max: 3.0 },
        { k: "Regio", pts: regionPts, max: 2.2 },
        { k: "Woning match", pts: sizePts, max: 2.0 },
        { k: "Energie", pts: energyPts, max: 1.2 },
        { k: "Zekerheid", pts: trustBonus, max: 0.6 }
    ];

    const raw = parts.reduce((a, x) => a + x.pts, 0);
    const max = parts.reduce((a, x) => a + x.max, 0);

    let score = max ? (raw / max) * 10 : 0;
    score = clamp(score, 0, 10);
    score = Math.round(score * 10) / 10;

    // Reasons (uitlegbaar, decision-first)
    const reasons = [];
    if (maxB > 0 && price > 0) {
        reasons.push(price <= maxB ? "✓ Binnen budget" : "⚠ Boven budget");
    }
    if (Array.isArray(regions) && regions.length) {
        reasons.push(regionPts > 1.2 ? "✓ In jouw regio" : "⚠ Buiten jouw regio");
    }
    if (minBeds > 0) reasons.push(beds >= minBeds ? "✓ Voldoende slaapkamers" : "⚠ Te weinig slaapkamers");
    if (minSurf > 0) reasons.push(surface >= minSurf ? "✓ Voldoende m²" : "⚠ Minder m² dan gewenst");
    if (pref) reasons.push(energyPts >= 0.7 ? "✓ EPC match ok" : "⚠ EPC onder voorkeur");

    const tips = [];
    if (regionPts < 1.0 && regions.length) tips.push("Pas regio's aan of voeg extra omliggende gemeenten toe.");
    if (budgetPts < 1.0 && maxB > 0) tips.push("Verhoog budget of zet 'soft over budget' op 10%.");
    if (energyPts < 0.5 && prefRank !== null) tips.push("Verlaag EPC voorkeur of focus op renovatiepanden.");
    if (sizePts < 1.0 && (minBeds > 0 || minSurf > 0)) tips.push("Verlaag minimale eisen of splits je zoekopdracht.");

    return {
        score,
        breakdown: parts.map(x => ({
            label: x.k,
            pts: Math.round(x.pts * 10) / 10,
            max: x.max
        })),
        reasons: reasons.slice(0, 5),
        tips: tips.slice(0, 4)
    };
}

window.computeFitScore = computeFitScore;

/* =========================================================
   QUALITY GATES (Bronze/Silver/Gold)
   Anti-fraude + trust gates met ranking gevolgen
   ========================================================= */
function getQualityGate(prop) {
    const p = prop || {};
    const docs = p.docs || {};
    const photos = Array.isArray(p.photos) ? p.photos.filter(x => x && x.dataUrl && !x.__loading) : [];

    const hasEpc = !!(docs.doc_epc && docs.doc_epc.ok);
    const hasAsbest = !!(docs.doc_asbest && docs.doc_asbest.ok);
    const hasBodem = !!(docs.doc_bodem && docs.doc_bodem.ok);
    const ownerOk = !!p.ownerVerified;

    const minMedia = photos.length >= 6;
    const trustReady = hasEpc && ownerOk;

    let tier = "bronze";
    if (trustReady && minMedia) tier = "silver";
    if (trustReady && photos.length >= 10 && (hasAsbest || hasBodem)) tier = "gold";

    const tierRank = tier === "gold" ? 3 : tier === "silver" ? 2 : 1;

    return {
        trustReady,
        minMedia,
        tier,
        tierRank,
        label:
            tier === "gold" ? "Gold Verified" :
                tier === "silver" ? "Verified" : "Beperkte verificatie",
        icon:
            tier === "gold" ? "🏅" :
                tier === "silver" ? "✓" : "⚠",
        reasons: [
            hasEpc ? "✓ EPC attest" : "✗ Geen EPC",
            ownerOk ? "✓ Owner verified" : "✗ Niet geverifieerd",
            photos.length >= 10 ? `✓ ${photos.length} foto's` :
                photos.length >= 6 ? `○ ${photos.length} foto's (min. 10 voor Gold)` :
                    `✗ ${photos.length} foto's (min. 6)`,
            (hasAsbest || hasBodem) ? "✓ Extra attesten" : "○ Geen extra attesten"
        ]
    };
}

window.getQualityGate = getQualityGate;

/* =========================================================
   EXPLAINABLE RANKING
   Human-readable explanation for why listing ranks where it does
   ========================================================= */
function explainRanking(prop, profile, ctx) {
    const gate = getQualityGate(prop);
    const vimmo = computeVimmoScore(prop, ctx);
    const fit = profile && Object.keys(profile).length > 0 ? computeFitScore(prop, profile, ctx) : null;

    const reasons = [];

    // Tier explanation
    if (gate.tier === "gold") {
        reasons.push("🏅 Gold Verified: EPC + eigenaar geverifieerd, uitgebreide documentatie");
    } else if (gate.tier === "silver") {
        reasons.push("✓ Verified: EPC en eigenaar geverifieerd");
    } else {
        reasons.push("⚠ Beperkte verificatie: minder documenten of media");
    }

    // Fit Score explanation
    if (fit) {
        const fitReasons = (fit.reasons || []).filter(r => r.startsWith("✓")).join(", ");
        reasons.push(`💚 Fit Score ${fit.score}/10${fitReasons ? ": " + fitReasons : ""}`);
    }

    // Vimmo Score explanation
    reasons.push(`⭐ Vimmo Score ${vimmo.score}/10: kwaliteit, media en vertrouwen`);

    // SLA explanation
    const sla = computeSlaScore(prop);
    if (sla.avgMinutes !== null) {
        reasons.push(`🕒 Respons: ${sla.label} (${sla.replyRate}% beantwoord)`);
    }

    // Comparison notes
    const compared = [];
    if (gate.tier === "bronze") {
        compared.push("Lager gerankt dan woningen met volledige verificatie");
    }
    if (fit && fit.score < 7) {
        compared.push("Minder goede match met jouw profiel dan topresultaten");
    }
    if (vimmo.score < 7) {
        compared.push("Lagere kwaliteitsscore dan best scorende listings");
    }

    // Improvement tips
    const tips = [];
    if (gate.tier !== "gold") {
        if (!gate.trustReady) tips.push("Upload EPC attest en verifieer eigenaarschap voor Silver status");
        if (!gate.minMedia) tips.push("Voeg meer foto's toe (min. 6 voor Silver, 10 voor Gold)");
        if (gate.tier === "silver") tips.push("Upload asbest- of bodemattest voor Gold status");
    }

    return {
        tier: gate.tier,
        headline:
            gate.tier === "gold"
                ? "Deze woning staat hoog omdat ze betrouwbaar en goed gematcht is"
                : gate.tier === "silver"
                    ? "Deze woning scoort goed maar mist Gold-status documenten"
                    : "Deze woning scoort lager door beperkte verificatie of match",
        reasons,
        compared,
        tips,
        scores: {
            vimmo: vimmo.score,
            fit: fit ? fit.score : null,
            tier: gate.tierRank
        }
    };
}

window.explainRanking = explainRanking;

/* =========================================================
   UNIFIED LEADS ADAPTER
   Single source of truth for leads - no double state
   ========================================================= */
function getLeadsForProperty(ctx, propId) {
    if (!ctx || !propId) return [];

    // Prefer canonical prop.leads
    try {
        const p = (ctx.getCurrentId && ctx.getCurrentId() === propId && ctx.getCurrent)
            ? ctx.getCurrent()
            : (ctx.getById ? ctx.getById(propId) : null);

        if (p && Array.isArray(p.leads)) return p.leads;
    } catch (e) { }

    // Fallback to old requests API
    try {
        if (typeof ctx.getRequests === "function") {
            const reqs = ctx.getRequests(propId);
            if (Array.isArray(reqs)) return reqs;
        }
    } catch (e) { }

    return [];
}

window.getLeadsForProperty = getLeadsForProperty;

/* =========================================================
   SLA SCORE ENGINE (0–2.5) - PRODUCTION READY
   Response time + reply rate = ranking factor
   Auto-replies weighted less for speed (anti-gaming)
   ========================================================= */
function computeSlaScore(prop, ctx) {
    // Use unified leads adapter
    const leads = ctx
        ? getLeadsForProperty(ctx, prop.id || prop._id)
        : (Array.isArray(prop.leads) ? prop.leads : []);

    // No leads yet = neutral score
    if (leads.length === 0) {
        return {
            score: 1.0,
            avgMinutes: null,
            replyRate: null,
            label: "Geen leads",
            badge: "—",
            leadCount: 0,
            repliedCount: 0,
            autoCount: 0
        };
    }

    const replied = leads.filter(l => l && l.firstReplyAt);
    const rate = replied.length / leads.length;

    // Calculate weighted average (auto-replies count 30% for speed)
    // EDGE CASE: Weight is based on FINAL replyMeta.auto state
    // - If manual followed auto, auto becomes false → weight = 1.0 (correct)
    // - Multiple auto replies don't stack; firstReplyAt is immutable
    // - Leads without createdAt are excluded from speed but count toward replyRate
    const minutes = replied.map(l => {
        const created = l.createdAt ? new Date(l.createdAt).getTime() : null;
        const repliedAt = l.firstReplyAt ? new Date(l.firstReplyAt).getTime() : null;

        // EDGE CASE: No createdAt → exclude from speed calculation (defensive)
        if (!created || !repliedAt) return null;

        const min = (repliedAt - created) / 60000;
        if (!isFinite(min) || min < 0) return null;

        // EDGE CASE: Use final auto state (manual overrides previous auto)
        const isAuto = !!(l.replyMeta && l.replyMeta.auto === true);
        return { min, weight: isAuto ? 0.3 : 1.0, isAuto };
    }).filter(Boolean);

    // Weighted average
    const wSum = minutes.reduce((a, x) => a + x.weight, 0) || 1;
    const avg = minutes.reduce((a, x) => a + x.min * x.weight, 0) / wSum;
    const autoCount = minutes.filter(m => m.isAuto).length;

    let score = 0;

    // Speed component (max 1.5)
    if (minutes.length > 0) {
        if (avg <= 60) score += 1.5;
        else if (avg <= 120) score += 1.2;
        else if (avg <= 360) score += 1.0;
        else if (avg <= 720) score += 0.6;
        else if (avg <= 1440) score += 0.3;
        else score += 0.1;
    } else {
        score += 0.5; // pending replies
    }

    // Reply rate component (max 1.0)
    if (rate >= 0.95) score += 1.0;
    else if (rate >= 0.85) score += 0.8;
    else if (rate >= 0.70) score += 0.6;
    else if (rate >= 0.50) score += 0.3;
    else score += 0.1;

    score = Math.min(2.5, Math.max(0, score));

    // =========================================================
    // SMOOTHING: Bayesian prior for stable badges at low volume
    // Formula: smoothedScore = (rawScore * n + prior * k) / (n + k)
    // - n = repliedCount (data points)
    // - k = smoothingFactor (prior strength, fades as n grows)
    // - prior = neutral score (middle tier, ~"ok" performance)
    // =========================================================
    const SLA_SMOOTHING_FACTOR = 3;  // Tune this: higher = more smoothing
    const SLA_PRIOR = 1.25;          // Neutral prior (~50% of max 2.5)

    const n = replied.length;
    const rawScore = score;

    // Apply smoothing only when we have some data (avoid pure prior for 0 replies)
    if (n > 0) {
        score = (rawScore * n + SLA_PRIOR * SLA_SMOOTHING_FACTOR) / (n + SLA_SMOOTHING_FACTOR);
        score = Math.min(2.5, Math.max(0, score));
    }
    // Note: When n=0, score stays at raw (0.5 + rate component)

    // Human-readable label
    let label, badge;
    const displayAvg = minutes.length > 0 ? avg : null;

    if (displayAvg !== null) {
        if (displayAvg <= 60) {
            label = "Reageert binnen 1 uur";
            badge = "🚀 <1u";
        } else if (displayAvg <= 120) {
            label = "Reageert binnen 2 uur";
            badge = "⚡ <2u";
        } else if (displayAvg <= 360) {
            label = "Reageert binnen 6 uur";
            badge = "✓ <6u";
        } else if (displayAvg <= 720) {
            label = "Reageert binnen 12 uur";
            badge = "○ <12u";
        } else if (displayAvg <= 1440) {
            label = "Reageert binnen 24 uur";
            badge = "⚠ <24u";
        } else {
            label = "Trage reactie (>24u)";
            badge = "⚠ Traag";
        }
    } else {
        label = "Nog geen reacties";
        badge = "—";
    }

    return {
        score: Math.round(score * 10) / 10,
        avgMinutes: displayAvg ? Math.round(displayAvg) : null,
        replyRate: Math.round(rate * 100),
        label,
        badge,
        leadCount: leads.length,
        repliedCount: replied.length,
        autoCount
    };
}

window.computeSlaScore = computeSlaScore;

/* =========================================================
   AUTO-RESPONSE TEMPLATES
   Instant professional replies = SLA boost
   ========================================================= */
const AUTO_TEMPLATES = {
    instant: {
        id: "instant",
        name: "Snelle bevestiging",
        message: "Dank voor je interesse! Ik neem zo snel mogelijk contact met je op.",
        icon: "⚡"
    },
    viewing: {
        id: "viewing",
        name: "Bezichtiging voorstellen",
        message: "Dank voor je bericht! Wanneer past een bezichtiging voor jou? Ik kan {{dagen}} beschikbaar zijn.",
        icon: "📅"
    },
    info: {
        id: "info",
        name: "Extra info toesturen",
        message: "Bedankt voor je interesse in {{pand}}! Ik stuur je zo extra informatie over de woning.",
        icon: "📋"
    },
    price: {
        id: "price",
        name: "Prijs bespreekbaar",
        message: "Dank je! De vraagprijs is {{prijs}}, maar deze is bespreekbaar. Laat maar weten als je vragen hebt.",
        icon: "💰"
    },
    unavailable: {
        id: "unavailable",
        name: "Tijdelijk afwezig",
        message: "Dank voor je bericht! Ik ben momenteel even afwezig maar neem zo snel mogelijk contact met je op.",
        icon: "🏖️"
    }
};

// Template personalization
function personalizeTemplate(templateId, prop, leadName) {
    const tpl = AUTO_TEMPLATES[templateId];
    if (!tpl) return null;

    let msg = tpl.message;
    msg = msg.replace("{{pand}}", prop.name || "de woning");
    msg = msg.replace("{{prijs}}", prop.price ? `€${Number(prop.price).toLocaleString("nl-BE")}` : "op aanvraag");
    msg = msg.replace("{{dagen}}", "maandag t/m vrijdag");
    if (leadName) msg = msg.replace("{{naam}}", leadName);

    return {
        ...tpl,
        personalizedMessage: msg
    };
}

window.AUTO_TEMPLATES = AUTO_TEMPLATES;
window.personalizeTemplate = personalizeTemplate;

/* =========================================================
   MARK LEAD REPLIED (core helper)
   ========================================================= */
function markLeadReplied(propId, leadId, ctx, meta) {
    if (!ctx) return false;

    // Support both direct property leads and propertyContext requests
    let lead = null;
    let leads = [];
    let isContext = typeof ctx.getRequests === "function";

    if (isContext) {
        leads = ctx.getRequests(propId);
        lead = leads.find(l => l && String(l.id) === String(leadId));
    } else {
        const prop = ctx.getById ? ctx.getById(propId) : null;
        if (!prop) return false;
        leads = Array.isArray(prop.leads) ? prop.leads.slice() : [];
        lead = leads.find(l => l && String(l.id) === String(leadId));
    }

    if (!lead) return false;

    const now = new Date().toISOString();
    const existingMeta = lead.replyMeta || {};
    const incomingAuto = !!(meta && meta.auto);

    // Speed weight shifts
    if (lead.status === "replied" && existingMeta.auto === false && incomingAuto) return false;
    const finalAuto = incomingAuto && existingMeta.auto !== false ? true : (meta && meta.auto === false ? false : existingMeta.auto);

    if (!lead.firstReplyAt) lead.firstReplyAt = now;
    lead.lastReplyAt = now;
    lead.status = "replied";

    lead.replyMeta = {
        ...existingMeta,
        ...(meta || {}),
        auto: finalAuto,
        repliedAt: now
    };

    if (existingMeta.auto === true && finalAuto === false) delete lead.replyMeta.templateId;

    if (isContext) {
        ctx.saveData('requests', leads, propId);
    } else {
        ctx.updateProperty(propId, { leads });
    }

    return true;
}

window.markLeadReplied = markLeadReplied;

/* =========================================================
   SEND AUTO-REPLY (marks as replied + auto flag for SLA)
   ========================================================= */
function sendAutoReply(propId, leadId, templateId, ctx) {
    // Get personalized message
    const prop = ctx && ctx.getById ? ctx.getById(propId) : null;
    const tpl = personalizeTemplate(templateId, prop || {});

    // Mark as replied with auto flag (weighted 30% in SLA speed)
    const success = markLeadReplied(propId, leadId, ctx, {
        auto: true,
        templateId,
        message: tpl ? tpl.personalizedMessage : null
    });

    return success;
}

window.sendAutoReply = sendAutoReply;

/* =========================================================
   SEND MANUAL REPLY (full SLA credit)
   ========================================================= */
function sendManualReply(propId, leadId, message, ctx) {
    return markLeadReplied(propId, leadId, ctx, {
        auto: false,
        message: message || null
    });
}

window.sendManualReply = sendManualReply;
