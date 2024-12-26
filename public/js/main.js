class RealEstateApp {
    constructor() {
        this.propertiesGrid = document.getElementById('properties-grid');
        this.searchInput = document.querySelector('.search-box input');
        this.searchButton = document.querySelector('.search-box button');
        this.properties = [];
        this.init();
    }

    async init() {
        await this.loadProperties();
        this.setupEventListeners();
    }

    async loadProperties() {
        try {
            const response = await fetch('/api/properties');
            if (!response.ok) throw new Error('Erro ao carregar imóveis');
            
            this.properties = await response.json();
            this.renderProperties(this.properties);
        } catch (error) {
            console.error('Erro ao carregar imóveis:', error);
            this.showError('Não foi possível carregar os imóveis');
        }
    }

    renderProperties(properties) {
        if (properties.length === 0) {
            this.propertiesGrid.innerHTML = `
                <div class="no-properties">
                    <p>Nenhum imóvel encontrado</p>
                </div>
            `;
            return;
        }

        this.propertiesGrid.innerHTML = properties.map(property => {
            const amenities = JSON.parse(property.amenities || '[]');
            const amenitiesList = amenities.length ? `
                <div class="property-amenities">
                    <h4>Lazer:</h4>
                    <ul>
                        ${amenities.map(item => `<li><i class="fas fa-check"></i> ${this.getAmenityLabel(item)}</li>`).join('')}
                    </ul>
                </div>
            ` : '';

            return `
                <div class="property-card">
                    <img src="${property.images ? property.images.split(',')[0] : '/img/no-image.jpg'}" 
                         alt="${property.title}">
                    <div class="property-info">
                        <h3>${property.title}</h3>
                        <p>${property.description}</p>
                        <div class="property-details">
                            <span><i class="fas fa-ruler-combined"></i> ${property.area}m²</span>
                            <span><i class="fas fa-bed"></i> ${property.bedrooms} quartos</span>
                            <span><i class="fas fa-star"></i> ${property.suites} suítes</span>
                            <span><i class="fas fa-bath"></i> ${property.bathrooms} banheiros</span>
                        </div>
                        ${amenitiesList}
                        <p class="price">R$ ${this.formatPrice(property.price)}</p>
                        <div class="property-actions">
                            <button class="btn-saiba-mais" onclick="app.openPropertyDetails('${property.id}')">
                                <i class="fas fa-info-circle"></i> Saiba Mais
                            </button>
                            <button class="btn-whatsapp" onclick="app.contactWhatsApp('${property.id}', '${property.title}', ${property.price})">
                                <i class="fab fa-whatsapp"></i> Contatar
                            </button>
                        </div>
                        <div class="property-location">
                            <div id="map-${property.id}" style="height: 200px;"></div>
                        </div>
                    </div>
                </div>
            `;
        }).join('');

        // Inicializar mapas
        properties.forEach(property => {
            if (property.latitude && property.longitude) {
                const map = L.map(`map-${property.id}`).setView([property.latitude, property.longitude], 15);
                
                L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                    attribution: '© OpenStreetMap contributors'
                }).addTo(map);

                L.marker([property.latitude, property.longitude])
                    .addTo(map)
                    .bindPopup(property.title);
            }
        });
    }

    contactWhatsApp(propertyId, title, price) {
        const phoneNumber = '5511937255009'; // Substitua pelo seu número
        const message = encodeURIComponent(
            `Olá! Tenho interesse no imóvel: ${title} - R$ ${this.formatPrice(price)}\n` +
            `Gostaria de mais informações.\n` +
            `Link: ${window.location.origin}/imovel/${propertyId}`
        );
        window.open(`https://wa.me/${phoneNumber}?text=${message}`, '_blank');
    }

    formatPrice(price) {
        return price.toLocaleString('pt-BR');
    }

    setupEventListeners() {
        this.searchButton.addEventListener('click', () => this.searchProperties());
        this.searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.searchProperties();
        });
    }

    searchProperties() {
        const searchTerm = this.searchInput.value.toLowerCase();
        const filtered = this.properties.filter(property => 
            property.title.toLowerCase().includes(searchTerm) ||
            property.description.toLowerCase().includes(searchTerm) ||
            property.location.toLowerCase().includes(searchTerm)
        );
        this.renderProperties(filtered);
    }

    showError(message) {
        this.propertiesGrid.innerHTML = `
            <div class="error-message">
                <p>${message}</p>
            </div>
        `;
    }

    openWhatsApp(event) {
        event.preventDefault();
        const phoneNumber = '5511937255009'; // Substitua pelo seu número
        const message = encodeURIComponent('Olá! Gostaria de mais informações sobre os imóveis disponíveis.');
        window.open(`https://wa.me/${phoneNumber}?text=${message}`, '_blank');
    }

    getAmenityLabel(value) {
        const labels = {
            'pool': 'Piscina',
            'gym': 'Academia',
            'playground': 'Playground',
            'party-room': 'Salão de Festas',
            'bbq': 'Churrasqueira',
            'sports-court': 'Quadra Esportiva',
            'sauna': 'Sauna',
            'games-room': 'Sala de Jogos'
        };
        return labels[value] || value;
    }

    openLandingPage() {
        window.location.href = '/landing-page'; // Será criada depois
    }

    openPropertyDetails(propertyId) {
        if (!propertyId) return;
        window.location.href = `/imovel/${propertyId}/landing`;
    }
}

// Inicializar aplicação
const app = new RealEstateApp(); 