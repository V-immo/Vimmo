/**
 * 

 
 * PropertyContext - Central Property Management System
 * Links ALL data to specific properties for multi-property makelaars
 */

// Central Property Registry
const PROPERTIES = {
    'prop-1': {
        id: 'prop-1',
        name: 'Moderne Woning - Antwerpen',
        emoji: '🏠',
        address: 'Kerkstraat 123, 2000 Antwerpen',
        type: 'Huis',
        status: 'active',
        listingStatus: 'Actief',
        created: '2024-01-15'
    },
    'prop-2': {
        id: 'prop-2',
        name: 'Penthouse - Schelde',
        emoji: '🏢',
        address: 'Scheldekaai 45, 2000 Antwerpen',
        type: 'Penthouse',
        status: 'active',
        listingStatus: 'Gepauzeerd',
        created: '2024-02-20'
    },
    'prop-3': {
        id: 'prop-3',
        name: 'Villa - Brasschaat',
        emoji: '🏡',
        address: 'Bredabaan 78, 2930 Brasschaat',
        type: 'Villa',
        status: 'active',
        listingStatus: 'Concept',
        created: '2024-03-10'
    }
};

const AUDIT_ACTIONS = {
    LISTING_CREATED: 'Advertentie aangemaakt',
    LISTING_PUBLISHED: 'Advertentie gepubliceerd',
    LISTING_PAUSED: 'Advertentie gepauzeerd',
    LISTING_DELETED: 'Advertentie verwijderd',
    REQUEST_RECEIVED: 'Aanvraag ontvangen',
    REQUEST_STATUS_CHANGE: 'Aanvraag status gewijzigd',
    VIEWING_SCHEDULED: 'Bezichtiging gepland',
    VIEWING_CANCELLED: 'Bezichtiging geannuleerd',
    REPLY_SENT: 'REPLY_SENT',
    DOCUMENTS_VERIFIED: 'DOCUMENTS_VERIFIED',
    UNMASK_CONTACT: 'UNMASK_CONTACT',
    BLOCK_LEAD: 'BLOCK_LEAD',
    REPORT_LEAD: 'REPORT_LEAD',
    DOCUMENT_UPLOADED: 'Document geüpload',
    AVAILABILITY_CHANGED: 'Beschikbaarheid gewijzigd',
    ONBOARDING_STARTED: 'Onboarding gestart',
    PACKAGE_UPGRADED: 'Pakket geüpgraded',
    BOOST_APPLIED: 'Listing geboost',
    BOOST_REMOVED: 'Boost verwijderd'
};


class PropertyContext {
    constructor() {
        // Get current property from localStorage or default to first
        this.currentProperty = localStorage.getItem('currentProperty') || 'prop-1';

        // Initialize properties in localStorage if not exists, otherwise load
        const stored = localStorage.getItem('properties');
        if (stored) {
            try {
                const parsed = JSON.parse(stored);
                if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
                    // Merge into the base PROPERTIES object
                    Object.keys(parsed).forEach(id => {
                        if (parsed[id]) PROPERTIES[id] = parsed[id];
                    });
                }
            } catch (e) {
                console.error('VIMMO: Failed to parse properties from localStorage:', e);
            }
        }

        // Migration/Sanitization: Ensure every property has a status and is a valid object
        Object.keys(PROPERTIES).forEach(id => {
            if (!PROPERTIES[id] || typeof PROPERTIES[id] !== 'object') {
                delete PROPERTIES[id];
                return;
            }
            if (!PROPERTIES[id].status) PROPERTIES[id].status = 'active';
            if (!PROPERTIES[id].id) PROPERTIES[id].id = id;
        });

        this.properties = PROPERTIES;
        try {
            localStorage.setItem('properties', JSON.stringify(PROPERTIES));
        } catch (e) { console.error('VIMMO: LocalStorage write failed', e); }

        // Initialize Account data
        const storedAccount = localStorage.getItem('vimmo_account');
        if (storedAccount) {
            this.account = JSON.parse(storedAccount);
        } else {
            this.account = {
                tier: 'Optimaal',
                slots: 3,
                activeSince: '2023-12-01',
                expiresAt: '2024-01-30',
                nextBillAmount: 149
            };
            localStorage.setItem('vimmo_account', JSON.stringify(this.account));
        }

        // Initialize default demo data if not exists
        this._initializeDemoData();
    }

    // Initialize demo data for demonstration purposes
    _initializeDemoData() {
        // Default requests if none exist or if empty
        const existingRequests = localStorage.getItem('requests_prop-1');
        if (!existingRequests || JSON.parse(existingRequests).length === 0) {
            const mockRequests = [
                {
                    id: 'req-1',
                    name: 'Emma Janssen',
                    emoji: '👩',
                    date: '16 Dec',
                    time: '14:00',
                    type: 'Bezichtiging',
                    status: 'Nieuw',
                    verification: 'ITSME',
                    createdAt: new Date().toISOString(),
                    snapshot: {
                        personal: { name: 'Emma Janssen', email: 'emma@example.com', phone: '+32 475 12 34 56', city: 'Antwerpen' },
                        housing: { occupants: '2 Personen', pets: 'Nee', moveInDate: '1 maart 2024' },
                        work: { status: 'Werknemer', employer: 'Deloitte', seniority: '3 jaar', income: '€ 3.200' }
                    }
                },
                {
                    id: 'req-2',
                    name: 'Michael De Vries',
                    emoji: '👨',
                    date: '14 Dec',
                    time: '10:30',
                    type: 'Dossier',
                    status: 'In behandeling',
                    verification: 'Basis',
                    createdAt: new Date().toISOString(),
                    snapshot: {
                        personal: { name: 'Michael De Vries', email: 'michael@example.com', phone: '+32 486 98 76 54', city: 'Gent' },
                        housing: { occupants: '1 Persoon', pets: 'Kat', moveInDate: 'Flexibel' },
                        work: { status: 'Zelfstandige', employer: 'Eigen zaak', seniority: '5 jaar', income: '€ 4.000' }
                    }
                },
                {
                    id: 'req-3',
                    name: 'Sophie Claes',
                    emoji: '👩',
                    date: '12 Dec',
                    time: '16:00',
                    type: 'Bezichtiging',
                    status: 'Bevestigd',
                    verification: 'ITSME',
                    createdAt: new Date().toISOString()
                }
            ];
            localStorage.setItem('requests_prop-1', JSON.stringify(mockRequests));
        }

        // Default messages if none exist or if empty
        const existingMessages = localStorage.getItem('messages_prop-1');
        if (!existingMessages || JSON.parse(existingMessages).length === 0) {
            const mockMessages = [
                {
                    id: 'msg-1',
                    sender: 'Michael De Vries',
                    timestamp: new Date().toISOString(),
                    message: 'Hallo, ik ben geïnteresseerd in de woning en zou graag een bezichtiging plannen. Is er volgende week een mogelijkheid?',
                    read: false
                }
            ];
            localStorage.setItem('messages_prop-1', JSON.stringify(mockMessages));
        }

        // Default stats if none exist
        if (!localStorage.getItem('stats_prop-1')) {
            const mockStats = { views: 1247, saves: 18, requests: 12, messages: 5 };
            localStorage.setItem('stats_prop-1', JSON.stringify(mockStats));
        }
    }

    // Get current property object
    getCurrent() {
        return PROPERTIES[this.currentProperty];
    }

    // Get current property ID
    getCurrentId() {
        return this.currentProperty;
    }

    // Get property by ID (SLA compatibility)
    getById(propertyId) {
        return PROPERTIES[propertyId] || null;
    }

    // Get all properties
    getAll() {
        return PROPERTIES;
    }

    // Get active properties only
    getActive() {
        return Object.values(PROPERTIES).filter(p => p.status === 'active');
    }

    // Switch to different property
    switch(propertyId) {
        if (!PROPERTIES[propertyId]) {
            console.error('Property not found:', propertyId);
            return;
        }

        this.currentProperty = propertyId;
        localStorage.setItem('currentProperty', propertyId);

        // Trigger global property change event
        window.dispatchEvent(new CustomEvent('propertyChanged', {
            detail: {
                propertyId: propertyId,
                property: PROPERTIES[propertyId]
            }
        }));

        console.log('Switched to property:', PROPERTIES[propertyId].name);
    }

    // Get data for specific type and property
    getData(type, propertyId = null) {
        const id = propertyId || this.currentProperty;
        const key = `${type}_${id}`;
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : null;
    }

    // Save data for specific type and property
    saveData(type, data, propertyId = null) {
        const id = propertyId || this.currentProperty;
        const key = `${type}_${id}`;
        localStorage.setItem(key, JSON.stringify(data));
        console.log(`Saved ${type} for property ${id}`);
    }

    // Get all properties for portfolio view
    getAll() {
        return this.properties || [];
    }

    // Get metadata by key
    // Get all data of a type across all properties
    getAllData(type) {
        const result = {};
        Object.keys(PROPERTIES).forEach(propId => {
            result[propId] = this.getData(type, propId);
        });
        return result;
    }

    // Delete data for specific property
    deleteData(type, propertyId = null) {
        const id = propertyId || this.currentProperty;
        const key = `${type}_${id}`;
        localStorage.removeItem(key);
    }

    // Update property with partial data (non-destructive merge)
    updateProperty(propertyId, data) {
        if (!propertyId) {
            console.error("updateProperty: propertyId ontbreekt");
            return;
        }

        const existing = PROPERTIES[propertyId];

        if (!existing) {
            console.error("updateProperty: property niet gevonden", propertyId);
            return;
        }

        // Merge data (non-destructive)
        const updated = {
            ...existing,
            ...data,
            updatedAt: new Date().toISOString()
        };

        // Save in memory
        PROPERTIES[propertyId] = updated;

        // Persist to localStorage
        try {
            localStorage.setItem('properties', JSON.stringify(PROPERTIES));
        } catch (e) {
            console.error("updateProperty: localStorage write failed", e);
        }

        // Fire global update event
        window.dispatchEvent(new CustomEvent("propertyChanged", {
            detail: { propertyId, property: updated }
        }));

        console.log('Updated property:', propertyId, data);
        return updated;
    }

    // Archive property
    archive(propertyId) {
        if (PROPERTIES[propertyId]) {
            PROPERTIES[propertyId].status = 'archived';
            PROPERTIES[propertyId].archivedDate = new Date().toISOString();
            localStorage.setItem('properties', JSON.stringify(PROPERTIES));
        }
    }

    // Activate property
    activate(propertyId) {
        if (PROPERTIES[propertyId]) {
            PROPERTIES[propertyId].status = 'active';
            delete PROPERTIES[propertyId].archivedDate;
            localStorage.setItem('properties', JSON.stringify(PROPERTIES));
        }
    }

    // Delete property and all its associated data
    deleteProperty(propertyId) {
        if (!PROPERTIES[propertyId]) return false;

        // 1. Remove associated data blocks
        const dataTypes = ['advertentie', 'stats', 'requests', 'settings'];
        dataTypes.forEach(type => {
            const key = `${type}_${propertyId}`;
            localStorage.removeItem(key);
        });

        // 2. Remove from PROPERTIES object
        delete PROPERTIES[propertyId];
        localStorage.setItem('properties', JSON.stringify(PROPERTIES));

        console.log('Deleted property:', propertyId);

        // 3. If we deleted the current property, switch to another one
        if (this.currentProperty === propertyId) {
            const remainingIds = Object.keys(PROPERTIES);
            if (remainingIds.length > 0) {
                this.switch(remainingIds[0]);
            } else {
                this.currentProperty = null;
                localStorage.removeItem('currentProperty');
                window.location.reload();
            }
        } else {
            window.dispatchEvent(new CustomEvent('propertyChanged', {
                detail: { propertyId: this.currentProperty, property: PROPERTIES[this.currentProperty] }
            }));
        }

        return true;
    }

    // Create new property
    createProperty(data = {}) {
        const id = `prop-${Date.now()}`;
        const newProperty = {
            id: id,
            name: data.name || 'Nieuwe Woning',
            emoji: '🏠',
            address: data.address || '',
            location: data.location || '',
            type: 'Huis',
            status: 'active',
            listingStatus: data.listingStatus || 'Concept',
            created: new Date().toISOString().split('T')[0]
        };

        PROPERTIES[id] = newProperty;
        localStorage.setItem('properties', JSON.stringify(PROPERTIES));

        // Log onboarding start
        this.addAuditEntry(id, AUDIT_ACTIONS.ONBOARDING_STARTED, { source: data.source || 'Dashboard' });

        console.log('Created new property:', newProperty.name);
        this.switch(id);
        return id;
    }

    // Get stats for current property
    getStats() {
        return this.getData('stats') || {
            views: 0,
            saves: 0,
            requests: 0,
            messages: 0
        };
    }

    // Update stats for current property
    updateStats(updates) {
        const stats = this.getStats();
        const newStats = { ...stats, ...updates };
        this.saveData('stats', newStats);
        return newStats;
    }

    // --- ACCOUNT & MONETIZATION ---
    getAccount() {
        return this.account;
    }

    updatePackage(tier) {
        const tiers = {
            'Basis': { slots: 1, nextBillAmount: 49 },
            'Optimaal': { slots: 3, nextBillAmount: 149 },
            'Premium': { slots: 10, nextBillAmount: 299 }
        };

        if (!tiers[tier]) return false;

        this.account.tier = tier;
        this.account.slots = tiers[tier].slots;
        this.account.nextBillAmount = tiers[tier].nextBillAmount;

        // Push expiry 30 days
        const d = new Date();
        d.setDate(d.getDate() + 30);
        this.account.expiresAt = d.toISOString().split('T')[0];

        localStorage.setItem('vimmo_account', JSON.stringify(this.account));
        this.addAuditEntry(null, AUDIT_ACTIONS.PACKAGE_UPGRADED, { tier: tier });

        window.dispatchEvent(new CustomEvent('accountChanged', { detail: this.account }));
        return true;
    }

    applyBoost(propId) {
        const prop = PROPERTIES[propId];
        if (!prop) return false;

        prop.boostedUntil = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(); // 7 days boost
        localStorage.setItem('properties', JSON.stringify(PROPERTIES));

        this.addAuditEntry(propId, AUDIT_ACTIONS.BOOST_APPLIED, { durationDays: 7 });
        window.dispatchEvent(new CustomEvent('propertyChanged', { detail: { propertyId: propId } }));
        return true;
    }

    /**
     * getRankingMultiplier
     * The single source of truth for listing visibility power.
     * Pure function (reads data only).
     */
    getRankingMultiplier(propId) {
        const prop = PROPERTIES[propId];
        if (!prop) return { multiplier: 1.0, breakdown: {}, warnings: [], isEligible: false };

        let multiplier = 1.0;
        const breakdown = { base: 1.0 };
        const warnings = [];
        let capApplied = false;

        // 1. Package Base Multiplier
        const packageMultipliers = {
            'Basis': 1.0,
            'Optimaal': 1.15,
            'Premium': 1.25
        };
        const baseMult = packageMultipliers[this.account.tier] || 1.0;
        multiplier *= baseMult;
        breakdown.package = baseMult;

        // 2. Health Factor Adjustment
        // Note: Requires ParticulierUtils globally available
        let healthFactor = 1.0;
        let healthScore = 100;

        if (window.ParticulierUtils && ParticulierUtils.computeListingHealth) {
            const health = ParticulierUtils.computeListingHealth(prop, this);
            healthScore = health.score;

            if (health.blockers && health.blockers.length > 0) {
                // Publish blockers = zero boost effectiveness
                healthFactor = 0.5; // Severe penalty for blockers
                warnings.push("Kritieke blockers gedetecteerd - Ranking zwaar beperkt.");
            } else {
                if (healthScore >= 85) healthFactor = 1.0;
                else if (healthScore >= 70) healthFactor = 0.95;
                else if (healthScore >= 55) healthFactor = 0.85;
                else if (healthScore >= 40) healthFactor = 0.75;
                else healthFactor = 0.70;
            }
        }

        multiplier *= healthFactor;
        breakdown.healthFactor = healthFactor;
        if (healthFactor < 1.0) {
            const lossPercent = Math.round((1 - healthFactor) * 100);
            warnings.push(`ROI Verlies: -${lossPercent}% rankingkracht door lage health score.`);
        }

        // 3. Boost Multiplier
        const isBoosted = prop.boostedUntil && new Date(prop.boostedUntil) > new Date();
        if (isBoosted) {
            const boostMult = 1.5; // Boost gives +50% visibility
            multiplier *= boostMult;
            breakdown.boost = boostMult;
        }

        // 4. Hard Cap (Pay-to-win prevention)
        const HARD_CAP = 2.0;
        if (multiplier > HARD_CAP) {
            multiplier = HARD_CAP;
            capApplied = true;
        }

        return {
            multiplier: Math.round(multiplier * 100) / 100,
            breakdown,
            warnings,
            isEligible: true,
            capApplied,
            isBoosted,
            healthScore
        };
    }

    // Increment stat counter
    incrementStat(statName) {
        const stats = this.getStats();
        stats[statName] = (stats[statName] || 0) + 1;
        this.saveData('stats', stats);
        return stats[statName];
    }

    // Get requests for current property
    getRequests() {
        return this.getData('requests') || [];
    }

    // Add request for current property
    addRequest(request) {
        const requests = this.getRequests();
        request.propertyId = this.currentProperty;
        request.id = `req-${Date.now()}`;
        request.createdAt = new Date().toISOString();

        // Auto-create snapshot for dossier-based applications
        if (request.type === 'Dossier' || request.type === 'Bezichtiging') {
            request.snapshot = this.getDossierData();
        }

        requests.push(request);
        this.saveData('requests', requests);
        this.incrementStat('requests');

        this.addAuditEntry(this.currentProperty, AUDIT_ACTIONS.REQUEST_RECEIVED, {
            requestId: request.id,
            name: request.name,
            type: request.type
        });

        return request;
    }

    // --- Messaging Methods ---
    getMessages(requestId) {
        if (!requestId) return [];
        const key = `messages_${requestId}`;
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : [];
    }

    addMessage(requestId, message) {
        if (!requestId) return;
        const messages = this.getMessages(requestId);
        const newMessage = {
            id: `msg-${Date.now()}`,
            timestamp: new Date().toISOString(),
            ...message
        };
        messages.push(newMessage);
        localStorage.setItem(`messages_${requestId}`, JSON.stringify(messages));

        // Fire event for UI updates
        window.dispatchEvent(new CustomEvent('messageAdded', {
            detail: { requestId, message: newMessage }
        }));

        return newMessage;
    }

    // --- Technical Hygiene: Rate Limiting ---
    checkRateLimit(requestId) {
        if (!requestId) return true;
        const messages = this.getMessages(requestId);
        if (messages.length === 0) return true;

        const lastMessage = messages[messages.length - 1];
        if (lastMessage.type !== 'sent') return true;

        const lastTime = new Date(lastMessage.timestamp).getTime();
        const now = Date.now();
        const diff = now - lastTime;

        return diff >= 2000; // 2 seconds limit
    }

    // --- Technical Hygiene: Block & Report ---
    blockRequest(requestId) {
        const requests = this.getRequests();
        const idx = requests.findIndex(r => r.id === requestId);
        if (idx === -1) return false;

        requests[idx].status = 'Blocked';
        requests[idx].lastUpdate = new Date().toISOString();
        this.saveData('requests', requests);

        this.addAuditEntry(requests[idx].propertyId, AUDIT_ACTIONS.BLOCK_LEAD, {
            requestId,
            name: requests[idx].name
        });

        // Fire event
        window.dispatchEvent(new CustomEvent('requestUpdated', { detail: { requestId, status: 'Blocked' } }));
        return true;
    }

    reportRequest(requestId, reason = "Spam/Inappropriate") {
        const requests = this.getRequests();
        const lead = requests.find(r => r.id === requestId);
        if (!lead) return false;

        this.addAuditEntry(lead.propertyId, AUDIT_ACTIONS.REPORT_LEAD, {
            requestId,
            name: lead.name,
            reason
        });

        // In a real app, this would send data to a moderation server
        console.warn(`LEAD REPORTED: ${requestId} - Reason: ${reason}`);
        return true;
    }

    // --- Trust & Verification Methods ---
    getTrustLevel(requestId) {
        const requests = this.getRequests();
        const lead = requests.find(r => r.id === requestId);
        if (!lead) return 0;

        let score = 0;
        if (lead.verification === 'ITSME') score += 50;
        else if (lead.verification === 'Basis') score += 20;

        if (lead.snapshot && lead.snapshot.documents && lead.snapshot.documents.length > 0) {
            const verifiedDocs = lead.snapshot.documents.filter(d => d.verified).length;
            score += (verifiedDocs * 15);
        }

        // Status based trust
        const trustStatuses = ['Bezichtiging', 'Beslissing', 'Overeenkomst'];
        if (trustStatuses.includes(lead.status)) score += 30;

        return Math.min(100, score);
    }

    // --- Audit Log Methods ---
    getAuditLog(propertyId = null) {
        return this.getData('audit_log', propertyId) || [];
    }

    addAuditEntry(propertyId, action, details = {}) {
        const id = propertyId || this.currentProperty;
        const log = this.getAuditLog(id);
        const entry = {
            id: `audit-${Date.now()}`,
            timestamp: new Date().toISOString(),
            action: action,
            details: details
        };
        log.unshift(entry); // Newest first
        this.saveData('audit_log', log, id);
        return entry;
    }

    // --- Availability Methods ---
    getAvailability(propertyId = null) {
        const id = propertyId || this.currentProperty;
        return this.getData('availability', id) || {
            mode: 'Automatisch', // 'Automatisch' or 'Eerst review'
            duration: 30, // minutes
            buffer: 15, // minutes
            maxDossiersPerSlot: 1,
            timezone: 'Europe/Brussels',
            slots: {} // { '2025-12-23': [{ id: 'slot-1', time: '10:00', active: true, booked: false }] }
        };
    }

    saveAvailability(data, propertyId = null) {
        const id = propertyId || this.currentProperty;
        this.saveData('availability', data, id);
        this.addAuditEntry(id, AUDIT_ACTIONS.AVAILABILITY_CHANGED);
    }

    toggleSlot(date, slotTime, propertyId = null) {
        const id = propertyId || this.currentProperty;
        const avail = this.getAvailability(id);
        if (!avail.slots[date]) avail.slots[date] = [];

        const index = avail.slots[date].findIndex(s => s.time === slotTime);
        if (index !== -1) {
            avail.slots[date][index].active = !avail.slots[date][index].active;
        } else {
            avail.slots[date].push({
                id: `slot-${Date.now()}`,
                time: slotTime,
                active: true,
                booked: false
            });
        }
        this.saveAvailability(avail, id);
    }

    // --- Settings & Notifications ---
    getSettings() {
        return this.getData('account_settings', 'global') || {
            notifications: {
                emailReports: true,
                whatsappUpdates: false,
                browserPush: true
            },
            verification: {
                emailVerified: true,
                phoneVerified: false,
                idVerified: false
            },
            privacy: {
                sharePhoneEarly: false
            }
        };
    }

    saveSettings(settings) {
        this.saveData('account_settings', settings, 'global');
    }

    // Capture current searcher dossier as an immutable snapshot
    getDossierData() {
        // In a real app, this would fetch from the user's profile
        // For this demo, we return a realistic set of data
        return {
            personal: {
                name: 'Anouk Kerstens',
                email: 'anouk.kerstens@example.com',
                phone: '+32 475 98 76 54',
                city: 'Antwerpen'
            },
            housing: {
                occupants: '2 Volwassenen',
                pets: 'Nee',
                moveInDate: '1 Maart 2026'
            },
            work: {
                status: 'Bediende (Onbepaalde duur)',
                employer: 'Vimmo Marketing',
                seniority: '3 jaar',
                income: '€ 3.100'
            },
            documents: [
                { name: 'Identiteitskaart.pdf', verified: true },
                { name: 'Loonbrief_Nov.pdf', verified: false },
                { name: 'Arbeidsovereenkomst.pdf', verified: false }
            ],
            snapshotDate: new Date().toISOString()
        };
    }

    // Update request status
    updateRequest(requestId, updates) {
        const requests = this.getRequests();
        const index = requests.findIndex(r => r.id === requestId);
        const prevStatus = requests[index].status;
        requests[index] = { ...requests[index], ...updates };
        this.saveData('requests', requests);

        if (updates.status && updates.status !== prevStatus) {
            this.addAuditEntry(this.currentProperty, AUDIT_ACTIONS.REQUEST_STATUS_CHANGE, {
                requestId: requestId,
                from: prevStatus,
                to: updates.status
            });
        }

        return null;
    }

    // --- Zoeker specific Methods ---

    // Get favorite properties for current searcher
    getFavorites() {
        const favs = localStorage.getItem('zoeker_favorites');
        return favs ? JSON.parse(favs) : [];
    }

    // Toggle favorite status
    toggleFavorite(propertyId) {
        let favs = this.getFavorites();
        if (favs.includes(propertyId)) {
            favs = favs.filter(id => id !== propertyId);
        } else {
            favs.push(propertyId);
        }
        localStorage.setItem('zoeker_favorites', JSON.stringify(favs));
        return favs;
    }

    // Initialize demo data for testing
    initDemoData() {
        // Only init if no data exists
        if (!this.getData('advertentie', 'prop-1')) {
            // Property 1 - Moderne Woning
            this.saveData('advertentie', {
                title: 'Moderne Woning in Antwerpen',
                price: 450000,
                location: 'Antwerpen, Zuid',
                description: 'Prachtige moderne woning in het hart van Antwerpen Zuid.',
                bedrooms: 3,
                bathrooms: 2,
                surface: 150,
                type: 'Huis',
                photos: []
            }, 'prop-1');

            this.saveData('stats', {
                views: 247,
                saves: 18,
                requests: 12,
                messages: 5
            }, 'prop-1');

            this.saveData('requests', [
                { id: '1', name: 'Emma Peeters', status: 'In behandeling', type: 'Dossier', date: '18 Dec', time: '14:00 - 15:00', emoji: '👩‍💼', verification: 'ITSME®' },
                { id: '2', name: 'Lucas Vermeulen', status: 'Nieuw', type: 'Bezichtiging', date: '20 Dec', time: '10:30 - 11:30', emoji: '👨‍💻', verification: 'ITSME®' },
                { id: '3', name: 'Sophie Dubois', status: 'Voltooid', type: 'Beslissing', date: '22 Dec', time: '15:00 - 16:00', emoji: '🎨' },
                { id: '4', name: 'Mark Janssens', status: 'Nieuw', type: 'Dossier', date: '24 Dec', time: '09:00 - 10:00', emoji: '🏗️' },
                { id: '5', name: 'Lisa De Smet', status: 'In behandeling', type: 'Bezichtiging', date: '24 Dec', time: '11:00 - 12:00', emoji: '👩‍⚕️', verification: 'ITSME®' }
            ], 'prop-1');

            // Property 2 - Penthouse
            this.saveData('advertentie', {
                title: 'Penthouse aan de Schelde',
                price: 1250000,
                location: 'Antwerpen, Scheldekaaien',
                description: 'Luxueus penthouse met adembenemend uitzicht.',
                bedrooms: 4,
                bathrooms: 3,
                surface: 220,
                type: 'Penthouse',
                listingStatus: 'Gepauzeerd',
                photos: []
            }, 'prop-2');

            this.saveData('stats', {
                views: 389,
                saves: 34,
                requests: 23,
                messages: 12
            }, 'prop-2');

            this.saveData('requests', [
                { id: 'req-4', name: 'Jan Janssens', type: 'Informatie', status: 'Nieuw', date: '2024-12-24', time: '09:00', propertyId: 'prop-2' }
            ], 'prop-2');

            // Property 3 - Villa
            this.saveData('advertentie', {
                title: 'Villa met Zwembad - Brasschaat',
                price: 890000,
                location: 'Brasschaat',
                description: 'Ruime villa met privé zwembad en grote tuin.',
                bedrooms: 5,
                bathrooms: 3,
                surface: 320,
                type: 'Villa',
                listingStatus: 'Concept',
                photos: []
            }, 'prop-3');

            this.saveData('stats', {
                views: 156,
                saves: 12,
                requests: 8,
                messages: 3
            }, 'prop-3');

            // Zoeker demo data
            if (!localStorage.getItem('zoeker_favorites')) {
                localStorage.setItem('zoeker_favorites', JSON.stringify(['prop-1', 'prop-2']));
            }

            console.log('Demo data initialized for all properties');

            // Seed initial messages for demo leads
            const requests = this.getRequests('prop-1');
            if (requests.length > 0) {
                const emma = requests.find(r => r.name.includes('Emma Janssen') || r.name.includes('Emma Peeters'));
                if (emma && this.getMessages(emma.id).length === 0) {
                    this.addMessage(emma.id, { type: 'received', text: 'Beste Tomas, ik heb interesse in uw woning. Is het mogelijk om deze week nog te kijken?' });
                    this.addMessage(emma.id, { type: 'sent', text: 'Beste Emma, dat kan zeker! Ik heb de agenda bijgewerkt.' });
                    this.addMessage(emma.id, { type: 'received', text: 'Perfect, ik heb zojuist gekeken. Ik zou graag vrijdag om 14:00 uur komen.' });
                }
            }
        }
    }
}

// Create global instance
window.propertyContext = new PropertyContext();
const propertyContext = window.propertyContext;

// Initialize demo data on first load
propertyContext.initDemoData();

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { propertyContext, PROPERTIES };
}
