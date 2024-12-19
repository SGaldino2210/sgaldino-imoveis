// Dados dos imóveis (simulando uma API/banco de dados)
const properties = [
    {
        id: 1,
        title: "Apartamento Moderno em Cidade Vargas",
        description: "Lindo apartamento com 3 dormitórios, sendo 1 suíte, 2 vagas de garagem",
        price: 650000,
        type: "apartamento",
        location: "Cidade Vargas, São Paulo",
        area: 85,
        bedrooms: 3,
        bathrooms: 2,
        parking: 2,
        image: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&auto=format&fit=crop"
    },
    {
        id: 2,
        title: "Casa Espaçosa no Jabaquara",
        description: "Casa térrea com 4 dormitórios, quintal amplo e área gourmet",
        price: 850000,
        type: "casa",
        location: "Jabaquara, São Paulo",
        area: 150,
        bedrooms: 4,
        bathrooms: 3,
        parking: 3,
        image: "https://images.unsplash.com/photo-1583608205776-bfd35f0d9f83?w=800&auto=format&fit=crop"
    },
    {
        id: 3,
        title: "Cobertura Duplex com Vista Panorâmica",
        description: "Cobertura duplex com terraço gourmet e vista para a cidade",
        price: 1200000,
        type: "cobertura",
        location: "Cidade Vargas, São Paulo",
        area: 180,
        bedrooms: 4,
        bathrooms: 4,
        parking: 3,
        image: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&auto=format&fit=crop"
    }
];

// Função para formatar preço em reais
function formatPrice(price) {
    return price.toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    });
}

// Função para criar card de imóvel
function createPropertyCard(property) {
    return `
        <div class="property-card">
            <div class="property-image">
                <img src="${property.image}" alt="${property.title}">
            </div>
            <div class="property-info">
                <h3 class="property-title">${property.title}</h3>
                <p class="property-price">${formatPrice(property.price)}</p>
                <div class="property-details">
                    <span><i class="fas fa-ruler-combined"></i> ${property.area}m²</span>
                    <span><i class="fas fa-bed"></i> ${property.bedrooms}</span>
                    <span><i class="fas fa-bath"></i> ${property.bathrooms}</span>
                    <span><i class="fas fa-car"></i> ${property.parking}</span>
                </div>
                <p>${property.description}</p>
                <button class="property-button" onclick="contactProperty(${property.id})">
                    Mais Informações
                </button>
            </div>
        </div>
    `;
}

// Função para renderizar imóveis
function renderProperties(propertiesList = properties) {
    const propertyGrid = document.querySelector('.property-grid');
    propertyGrid.innerHTML = propertiesList.map(property => createPropertyCard(property)).join('');
}

// Função para filtrar imóveis
function filterProperties() {
    const searchInput = document.querySelector('.search-input').value.toLowerCase();
    const typeSelect = document.getElementById('propertyType').value;
    const priceRange = document.getElementById('priceRange').value;

    let filtered = properties.filter(property => {
        const matchSearch = property.location.toLowerCase().includes(searchInput) ||
                          property.title.toLowerCase().includes(searchInput);
        const matchType = !typeSelect || property.type === typeSelect;
        
        let matchPrice = true;
        if (priceRange) {
            const [min, max] = priceRange.split('-').map(Number);
            if (max) {
                matchPrice = property.price >= min && property.price <= max;
            } else {
                matchPrice = property.price >= min;
            }
        }

        return matchSearch && matchType && matchPrice;
    });

    renderProperties(filtered);
}

// Função para contato via WhatsApp
function contactProperty(propertyId) {
    const property = properties.find(p => p.id === propertyId);
    if (property) {
        const message = encodeURIComponent(`Olá! Gostaria de mais informações sobre o imóvel: ${property.title}`);
        window.open(`https://wa.me/5511937255009?text=${message}`, '_blank');
    }
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    // Renderizar imóveis iniciais
    renderProperties();

    // Adicionar listeners para filtros
    document.querySelector('.search-input').addEventListener('input', filterProperties);
    document.getElementById('propertyType').addEventListener('change', filterProperties);
    document.getElementById('priceRange').addEventListener('change', filterProperties);

    // Mobile menu toggle
    const mobileMenu = document.querySelector('.mobile-menu');
    const navLinks = document.querySelector('.nav-links');
    
    mobileMenu.addEventListener('click', () => {
        navLinks.style.display = navLinks.style.display === 'flex' ? 'none' : 'flex';
    });

    // Smooth scroll para links internos
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth'
                });
                // Fechar menu mobile se estiver aberto
                if (window.innerWidth <= 768) {
                    navLinks.style.display = 'none';
                }
            }
        });
    });
});

// Animação de scroll
window.addEventListener('scroll', () => {
    const header = document.querySelector('.header');
    if (window.scrollY > 50) {
        header.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.1)';
    } else {
        header.style.boxShadow = 'none';
    }
});
