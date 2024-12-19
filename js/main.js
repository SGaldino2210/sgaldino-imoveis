// Dados dos imóveis
const properties = [
    {
        id: 1,
        title: 'Apartamento Moderno',
        location: 'Cidade Vargas, São Paulo',
        price: 'R$ 450.000',
        bedrooms: 2,
        bathrooms: 2,
        area: '65m²',
        image: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?ixlib=rb-4.0.3'
    },
    {
        id: 2,
        title: 'Casa Espaçosa',
        location: 'Jabaquara, São Paulo',
        price: 'R$ 850.000',
        bedrooms: 3,
        bathrooms: 2,
        area: '120m²',
        image: 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?ixlib=rb-4.0.3'
    },
    {
        id: 3,
        title: 'Cobertura Duplex',
        location: 'Vila Mariana, São Paulo',
        price: 'R$ 1.200.000',
        bedrooms: 4,
        bathrooms: 3,
        area: '200m²',
        image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?ixlib=rb-4.0.3'
    }
];

// Função para converter preço em número
function priceToNumber(priceString) {
    return parseInt(priceString.replace(/[^\d]/g, ''));
}

// Função para filtrar imóveis
function searchProperties(query, priceRange, bedroomCount) {
    let filteredProperties = properties;

    // Filtrar por texto de busca
    if (query) {
        query = query.toLowerCase();
        filteredProperties = filteredProperties.filter(property =>
            property.title.toLowerCase().includes(query) ||
            property.location.toLowerCase().includes(query)
        );
    }

    // Filtrar por faixa de preço
    if (priceRange) {
        const [min, max] = priceRange.split('-').map(Number);
        filteredProperties = filteredProperties.filter(property => {
            const price = priceToNumber(property.price);
            if (max) {
                return price >= min && price <= max;
            } else {
                return price >= min;
            }
        });
    }

    // Filtrar por número de quartos
    if (bedroomCount) {
        if (bedroomCount === '4+') {
            filteredProperties = filteredProperties.filter(property => property.bedrooms >= 4);
        } else {
            const bedrooms = parseInt(bedroomCount);
            filteredProperties = filteredProperties.filter(property => property.bedrooms === bedrooms);
        }
    }

    return filteredProperties;
}

// Função para renderizar os imóveis
function renderProperties(properties = window.properties) {
    const propertyGrid = document.querySelector('.properties-grid');
    if (!propertyGrid) return;

    propertyGrid.innerHTML = properties.map(property => createPropertyCard(property)).join('');
}

// Função para criar cards de imóveis
function createPropertyCard(property) {
    return `
        <div class="property-card">
            <div class="property-image">
                <img src="${property.image}" alt="${property.title}">
            </div>
            <div class="property-info">
                <h3>${property.title}</h3>
                <p class="location">${property.location}</p>
                <div class="details">
                    <span><i class="fas fa-bed"></i> ${property.bedrooms} Quartos</span>
                    <span><i class="fas fa-bath"></i> ${property.bathrooms} Banheiros</span>
                    <span><i class="fas fa-ruler-combined"></i> ${property.area}</span>
                </div>
                <p class="price">${property.price}</p>
                <a href="https://wa.me/5511937255009?text=Olá! Gostaria de mais informações sobre o imóvel: ${property.title}" 
                   class="btn-primary" 
                   target="_blank" 
                   rel="noopener noreferrer">
                    <i class="fab fa-whatsapp"></i> Entrar em Contato
                </a>
            </div>
        </div>
    `;
}

// Carregar imóveis quando a página carregar
document.addEventListener('DOMContentLoaded', () => {
    // Renderizar todos os imóveis inicialmente
    renderProperties();

    // Configurar busca
    const searchInput = document.querySelector('.search-input');
    const priceRange = document.getElementById('priceRange');
    const bedroomCount = document.getElementById('bedrooms');
    const searchButton = document.querySelector('.btn-primary');

    if (searchButton) {
        searchButton.addEventListener('click', () => {
            const query = searchInput ? searchInput.value : '';
            const selectedPriceRange = priceRange ? priceRange.value : '';
            const selectedBedroomCount = bedroomCount ? bedroomCount.value : '';

            // Filtrar e renderizar imóveis
            const filteredProperties = searchProperties(query, selectedPriceRange, selectedBedroomCount);
            renderProperties(filteredProperties);
        });
    }
});
