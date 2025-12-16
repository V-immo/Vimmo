/**
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
        created: '2024-01-15'
    },
    'prop-2': {
        id: 'prop-2',
        name: 'Penthouse - Schelde',
        emoji: '🏢',
        address: 'Scheldekaai 45, 2000 Antwerpen',
        type: 'Penthouse',
        status: 'active',
        created: '2024-02-20'
    },
    'prop-3': {
        id: 'prop-3',
        name: 'Villa - Brasschaat',
        emoji: '🏡',
        address: 'Bredabaan 78, 2930 Brasschaat',
        type: 'Villa',
        status: 'active',
        created: '2024-03-10'
    }
};

class PropertyContext {
    constructor() {
        // Get current property from localStorage or default to first
        this.currentProperty = localStorage.getItem('currentProperty') || 'prop-1';
        
        // Initialize properties in localStorage if not exists
        if (!localStorage.getItem('properties')) {
            localStorage.setItem('properties', JSON.stringify(PROPERTIES));
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
        requests.push(request);
        this.saveData('requests', requests);
        this.incrementStat('requests');
        return request;
    }

    // Update request status
    updateRequest(requestId, updates) {
        const requests = this.getRequests();
        const index = requests.findIndex(r => r.id === requestId);
        if (index !== -1) {
            requests[index] = { ...requests[index], ...updates };
            this.saveData('requests', requests);
            return requests[index];
        }
        return null;
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
                photos: []
            }, 'prop-2');

            this.saveData('stats', {
                views: 389,
                saves: 34,
                requests: 23,
                messages: 12
            }, 'prop-2');

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
                photos: []
            }, 'prop-3');

            this.saveData('stats', {
                views: 156,
                saves: 12,
                requests: 8,
                messages: 3
            }, 'prop-3');

            console.log('Demo data initialized for all properties');
        }
    }
}

// Create global instance
const propertyContext = new PropertyContext();

// Initialize demo data on first load
propertyContext.initDemoData();

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { propertyContext, PROPERTIES };
}
