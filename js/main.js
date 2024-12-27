console.log('Script carregado!');

// Função para verificar localStorage
function checkLocalStorage() {
    try {
        const properties = localStorage.getItem('properties');
        console.log('Raw properties from localStorage:', properties);
        console.log('Parsed properties:', JSON.parse(properties || '[]'));
    } catch (error) {
        console.error('Erro ao verificar localStorage:', error);
    }
}

// Carregar imóveis do localStorage
function loadProperties() {
    try {
        checkLocalStorage(); // Debug

        const properties = JSON.parse(localStorage.getItem('properties')) || [];
        const propertiesContainer = document.querySelector('.property-grid');
        
        console.log('Carregando imóveis:', properties);
        console.log('Container:', propertiesContainer);
        console.log('Container HTML antes:', propertiesContainer?.innerHTML);
        
        if (propertiesContainer) {
            const htmlContent = properties
                .filter(property => property.status === "Disponível")
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
                            <p class="property-price">R$ ${Number(property.price).toLocaleString('pt-BR')}</p>
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

            console.log('HTML gerado:', htmlContent); // Debug
            propertiesContainer.innerHTML = htmlContent;
            console.log('Container HTML depois:', propertiesContainer.innerHTML); // Debug
        } else {
            console.error('Container .property-grid não encontrado!');
        }
    } catch (error) {
        console.error('Erro ao carregar imóveis:', error);
    }
}

// Mostrar detalhes do imóvel
function showPropertyDetails(id) {
    try {
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
    } catch (error) {
        console.error('Erro ao mostrar detalhes do imóvel:', error);
    }
}

// Fechar modal
function closePropertyModal() {
    document.getElementById('propertyModal').style.display = 'none';
}

// Contato via WhatsApp
function contactProperty(id) {
    try {
        const properties = JSON.parse(localStorage.getItem('properties')) || [];
        const property = properties.find(p => p.id === id);
        
        if (property) {
            const message = `Olá! Vi o imóvel "${property.title}" no site e gostaria de mais informações.`;
            const whatsappNumber = '5511937255009';
            window.open(`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`);
        }
    } catch (error) {
        console.error('Erro ao contatar sobre imóvel:', error);
    }
}

// Função para filtrar imóveis
function filterProperties() {
    try {
        const properties = JSON.parse(localStorage.getItem('properties')) || [];
        const searchInput = document.querySelector('.search-input').value.toLowerCase();
        const typeSelect = document.getElementById('propertyType').value;
        const priceRange = document.getElementById('priceRange').value;

        let filtered = properties.filter(property => {
            // Não mostrar imóveis vendidos
            if (property.status !== "Disponível") return false;

            const matchSearch = property.title.toLowerCase().includes(searchInput);
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

        const propertiesContainer = document.querySelector('.property-grid');
        if (propertiesContainer) {
            propertiesContainer.innerHTML = filtered.map(property => `
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
                        <p class="property-price">R$ ${Number(property.price).toLocaleString('pt-BR')}</p>
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
    } catch (error) {
        console.error('Erro ao filtrar imóveis:', error);
    }
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM carregado!');
    
    // Carregar imóveis iniciais
    loadProperties();
    console.log('loadProperties() chamado!');

    // Adicionar listeners para filtros
    const searchInput = document.querySelector('.search-input');
    const propertyType = document.getElementById('propertyType');
    const priceRange = document.getElementById('priceRange');

    if (searchInput) searchInput.addEventListener('input', filterProperties);
    if (propertyType) propertyType.addEventListener('change', filterProperties);
    if (priceRange) priceRange.addEventListener('change', filterProperties);

    // Mobile menu toggle
    const mobileMenu = document.querySelector('.mobile-menu');
    const navLinks = document.querySelector('.nav-links');
    
    if (mobileMenu && navLinks) {
        mobileMenu.addEventListener('click', () => {
            navLinks.classList.toggle('active');
        });
    }

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
                if (window.innerWidth <= 768 && navLinks) {
                    navLinks.classList.remove('active');
                }
            }
        });
    });
});

// Animação de scroll
window.addEventListener('scroll', () => {
    const header = document.querySelector('.header');
    if (header) {
        if (window.scrollY > 50) {
            header.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.1)';
        } else {
            header.style.boxShadow = 'none';
        }
    }
});

// Fechar modal quando clicar fora
window.onclick = function(event) {
    const modal = document.getElementById('propertyModal');
    if (event.target === modal) {
        modal.style.display = 'none';
    }
}

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
