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

// Carregar imóveis do localStorage
function loadProperties() {
    const properties = JSON.parse(localStorage.getItem('properties')) || [];
    const propertiesContainer = document.querySelector('.properties-grid');
    
    if (propertiesContainer) {
        propertiesContainer.innerHTML = properties
            .filter(property => property.status !== 'Vendido')
            .map(property => `
                <div class="property-card">
                    <div class="property-image">
                        <img src="${property.images && property.images.length > 0 ? property.images[0] : 'https://via.placeholder.com/400x300'}" 
                             alt="${property.title}">
                        <span class="property-status ${property.status.toLowerCase().replace(' ', '-')}">
                            ${property.status}
                        </span>
                    </div>
                    <div class="property-info">
                        <h3>${property.title}</h3>
                        <p class="property-type">${property.type}</p>
                        <p class="property-price">R$ ${property.price.toLocaleString('pt-BR')}</p>
                        <div class="property-features">
                            ${property.area ? `<span><i class="fas fa-ruler-combined"></i> ${property.area}m²</span>` : ''}
                            ${property.bedrooms ? `<span><i class="fas fa-bed"></i> ${property.bedrooms} quartos</span>` : ''}
                            ${property.bathrooms ? `<span><i class="fas fa-bath"></i> ${property.bathrooms} banheiros</span>` : ''}
                            ${property.parking ? `<span><i class="fas fa-car"></i> ${property.parking} vagas</span>` : ''}
                        </div>
                        <div class="property-actions">
                            <button onclick="showPropertyDetails(${property.id})" class="btn-secondary">
                                Ver Detalhes
                            </button>
                            <button onclick="contactProperty(${property.id})" class="btn-primary">
                                Contato
                            </button>
                        </div>
                    </div>
                </div>
            `).join('');
    }
}

// Mostrar detalhes do imóvel
function showPropertyDetails(id) {
    const properties = JSON.parse(localStorage.getItem('properties')) || [];
    const property = properties.find(p => p.id === id);
    
    if (property) {
        const modal = document.getElementById('propertyModal');
        modal.style.display = 'block';
        
        modal.querySelector('.modal-content').innerHTML = `
            <span class="close" onclick="closePropertyModal()">&times;</span>
            <h2>${property.title}</h2>
            <div class="property-images">
                ${property.images.map(img => `
                    <img src="${img}" alt="${property.title}">
                `).join('')}
            </div>
            <div class="property-details">
                <h3>Detalhes</h3>
                <div class="property-features">
                    ${property.area ? `<div><i class="fas fa-ruler-combined"></i> ${property.area}m²</div>` : ''}
                    ${property.bedrooms ? `<div><i class="fas fa-bed"></i> ${property.bedrooms} quartos</div>` : ''}
                    ${property.bathrooms ? `<div><i class="fas fa-bath"></i> ${property.bathrooms} banheiros</div>` : ''}
                    ${property.parking ? `<div><i class="fas fa-car"></i> ${property.parking} vagas</div>` : ''}
                </div>
                <div class="property-description">
                    <h3>Descrição</h3>
                    <p>${property.description || 'Sem descrição disponível.'}</p>
                </div>
                <button onclick="contactProperty(${property.id})" class="btn-primary">
                    Entrar em Contato
                </button>
            </div>
        `;
    }
}

// Fechar modal
function closePropertyModal() {
    document.getElementById('propertyModal').style.display = 'none';
}

// Contato via WhatsApp
function contactProperty(id) {
    const properties = JSON.parse(localStorage.getItem('properties')) || [];
    const property = properties.find(p => p.id === id);
    
    if (property) {
        const message = `Olá! Vi o imóvel "${property.title}" no site e gostaria de mais informações.`;
        const whatsappNumber = '5511999999999'; // Substitua pelo seu número
        window.open(`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`);
    }
}

// Carregar imóveis quando a página carregar
document.addEventListener('DOMContentLoaded', loadProperties);

// Fechar modal quando clicar fora
window.onclick = function(event) {
    const modal = document.getElementById('propertyModal');
    if (event.target === modal) {
        modal.style.display = 'none';
    }
}

// Menu mobile
document.querySelector('.menu-toggle').addEventListener('click', function() {
    document.querySelector('.nav-links').classList.toggle('active');
});

// Scroll suave
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        document.querySelector(this.getAttribute('href')).scrollIntoView({
            behavior: 'smooth'
        });
    });
});

// Header scroll
window.addEventListener('scroll', function() {
    const header = document.querySelector('header');
    if (window.scrollY > 50) {
        header.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.1)';
    } else {
        header.style.boxShadow = 'none';
    }
});

/* Modal */
.modal {
    display: none;
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
    z-index: 1000;
}

.modal-content {
    position: relative;
    background: white;
    width: 90%;
    max-width: 1000px;
    margin: 20px auto;
    padding: 20px;
    border-radius: 8px;
    max-height: 90vh;
    overflow-y: auto;
}

.close {
    position: absolute;
    right: 20px;
    top: 20px;
    font-size: 24px;
    cursor: pointer;
}

.property-images {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 20px;
    margin-bottom: 20px;
}

.property-images img {
    width: 100%;
    height: 300px;
    object-fit: cover;
    border-radius: 8px;
}

.property-features {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 15px;
    margin: 20px 0;
}

.property-features div {
    display: flex;
    align-items: center;
    gap: 10px;
}

.property-features i {
    color: var(--accent-color);
}

.property-description {
    margin: 20px 0;
}

.property-description h3 {
    margin-bottom: 10px;
}

/* Status badges */
.property-status {
    position: absolute;
    top: 10px;
    right: 10px;
    padding: 5px 10px;
    border-radius: 15px;
    font-size: 0.9rem;
    font-weight: 500;
}

.property-status.disponivel {
    background: var(--accent-color-light);
    color: var(--accent-color);
}

.property-status.em-negociacao {
    background: #fff3cd;
    color: #856404;
}

.property-status.vendido {
    background: #d4edda;
    color: #155724;
}

<div id="propertyModal" class="modal">
    <div class="modal-content">
        <!-- O conteúdo será preenchido dinamicamente -->
    </div>
</div>
