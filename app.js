const properties = [
    {
        id: 1,
        title: "Penthouse aan de Schelde",
        price: "€ 1.250.000",
        priceValue: 1250000,
        type: "Penthouse",
        location: "Antwerpen, Zuid",
        beds: 3,
        baths: 2,
        area: "210 m²",
        image: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&q=80",
        tag: "Nieuw",
        hasVideoTour: true
    },
    {
        id: 2,
        title: "Modern Villa met Zwembad",
        price: "€ 2.400.000",
        priceValue: 2400000,
        type: "Villa",
        location: "Sint-Martens-Latem",
        beds: 5,
        baths: 4,
        area: "450 m²",
        image: "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800&q=80",
        tag: "Exclusief",
        hasVideoTour: true
    },
    {
        id: 3,
        title: "Stadsloft in historisch pand",
        price: "€ 685.000",
        priceValue: 685000,
        type: "Appartement",
        location: "Gent, Centrum",
        beds: 2,
        baths: 1,
        area: "145 m²",
        image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80",
        tag: "Optie",
        hasVideoTour: false
    },
    {
        id: 4,
        title: "Duurzaam Wonen in 't Groen",
        price: "€ 550.000",
        priceValue: 550000,
        type: "Huis",
        location: "Leuven, Kessel-Lo",
        beds: 3,
        baths: 2,
        area: "180 m²",
        image: "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800&q=80",
        tag: "",
        hasVideoTour: true
    }
];

function renderProperties(propertiesToRender = properties) {
    const grid = document.getElementById('property-grid');
    if (!grid) return;

    if (propertiesToRender.length === 0) {
        grid.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 60px; color: var(--text-muted);">
                <i class="ri-home-search-line" style="font-size: 3rem; margin-bottom: 16px; display: block;"></i>
                <p>Geen panden gevonden met deze filters.</p>
            </div>
        `;
        return;
    }

    grid.innerHTML = propertiesToRender.map(property => `
        <article class="property-card reveal-visible" onclick="window.location.href='property.html'">
            <div class="card-image-wrapper">
                <img src="${property.image}" alt="${property.title}">
                <div class="verified-badge"><i class="ri-verified-badge-fill"></i> Vimmo Verified</div>
            </div>
            <div class="card-details">
                <div class="card-meta">
                    <span class="price">${property.price}</span>
                    <div class="specs">
                        <span>${property.beds} slpks</span>
                        <span>${property.area}</span>
                    </div>
                </div>
                <h3>${property.title}</h3>
                <p style="color: var(--text-muted); font-size: 0.9rem;">${property.location}</p>
            </div>
        </article>
    `).join('');
}

function filterProperties() {
    const searchInput = document.querySelector('.search-input-group input');
    const typeSelect = document.querySelector('.filter-group:nth-child(1) select');
    const priceSelect = document.querySelector('.filter-group:nth-child(2) select');
    const bedsSelect = document.querySelector('.filter-group:nth-child(3) select');

    const searchTerm = searchInput ? searchInput.value.toLowerCase() : '';
    const selectedType = typeSelect ? typeSelect.value : 'Alle types';
    const selectedPrice = priceSelect ? priceSelect.value : 'Geen max';
    const selectedBeds = bedsSelect ? bedsSelect.value : 'Min. slaapkamers';

    let filtered = properties.filter(property => {
        // Search filter (location or title)
        const matchesSearch = !searchTerm ||
            property.location.toLowerCase().includes(searchTerm) ||
            property.title.toLowerCase().includes(searchTerm);

        // Type filter
        const matchesType = selectedType === 'Alle types' || property.type === selectedType;

        // Price filter
        let matchesPrice = true;
        if (selectedPrice !== 'Geen max') {
            const maxPrice = parseInt(selectedPrice.replace(/[^\d]/g, ''));
            matchesPrice = property.priceValue <= maxPrice;
        }

        // Beds filter
        let matchesBeds = true;
        if (selectedBeds !== 'Min. slaapkamers') {
            const minBeds = parseInt(selectedBeds);
            matchesBeds = property.beds >= minBeds;
        }

        return matchesSearch && matchesType && matchesPrice && matchesBeds;
    });

    renderProperties(filtered);
}

function initEffects() {
    // Render properties first
    renderProperties();

    // Scroll Reveal with Stagger Effect for Property Cards
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
                // Stagger delay based on card position
                const delay = index * 100;
                setTimeout(() => {
                    entry.target.classList.add('reveal-visible');
                }, delay);
                revealObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

    // Observe property cards
    document.querySelectorAll('.property-card').forEach((card, i) => {
        card.style.transitionDelay = `${i * 0.1}s`;
        revealObserver.observe(card);
    });

    // Count-up Animation for Hero Stats
    const countUp = (element, target, duration = 2000) => {
        const start = 0;
        const increment = target / (duration / 16);
        let current = start;

        const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
                element.textContent = target.toLocaleString('nl-BE') + (element.dataset.suffix || '');
                clearInterval(timer);
            } else {
                element.textContent = Math.floor(current).toLocaleString('nl-BE') + (element.dataset.suffix || '');
            }
        }, 16);
    };

    // Observe hero stats
    const statsObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const target = parseInt(entry.target.dataset.count);
                if (target) countUp(entry.target, target);
                statsObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });

    document.querySelectorAll('[data-count]').forEach(el => statsObserver.observe(el));

    // Cursor Glow
    const glow = document.querySelector('.cursor-glow');
    document.addEventListener('mousemove', (e) => {
        const x = e.clientX;
        const y = e.clientY;
        if (glow) {
            glow.style.transform = `translate(${x - 300}px, ${y - 300}px)`;
            glow.style.opacity = '1';
        }
    });

    // Navbar scroll
    const nav = document.querySelector('.navbar');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            nav.classList.add('scrolled');
        } else {
            nav.classList.remove('scrolled');
        }
    });

    // Search & Filter Event Listeners
    const searchBtn = document.querySelector('.btn-search-main');
    const searchInput = document.querySelector('.search-input-group input');
    const filterSelects = document.querySelectorAll('.filter-group select');

    if (searchBtn) {
        searchBtn.addEventListener('click', (e) => {
            e.preventDefault();
            filterProperties();
        });
    }

    if (searchInput) {
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                filterProperties();
            }
        });
    }

    filterSelects.forEach(select => {
        select.addEventListener('change', filterProperties);
    });
}

// Mobile Menu Toggle Function
function toggleMobileMenu() {
    const mobileMenu = document.getElementById('mobileMenu');
    if (mobileMenu) {
        mobileMenu.classList.toggle('open');
        document.body.style.overflow = mobileMenu.classList.contains('open') ? 'hidden' : '';
    }
}

document.addEventListener('DOMContentLoaded', initEffects);
