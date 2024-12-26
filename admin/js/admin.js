class AdminPanel {
    constructor() {
        this.pageContent = document.getElementById('page-content');
        this.token = localStorage.getItem('token');

        if (!this.token) {
            this.showLoginForm();
        } else {
            this.setupEventListeners();
            this.loadPage('dashboard');
        }
    }

    async init() {
        if (!this.token) {
            this.showLoginForm();
        } else {
            this.setupEventListeners();
            this.loadPage('dashboard');
        }
    }

    showLoginForm() {
        this.pageContent.innerHTML = `
            <div class="login-container">
                <form class="login-form" id="login-form">
                    <h2>Login</h2>
                    <div class="form-group">
                        <label for="username">Usuário</label>
                        <input type="text" id="username" required>
                    </div>
                    <div class="form-group">
                        <label for="password">Senha</label>
                        <input type="password" id="password" required>
                    </div>
                    <button type="submit">Entrar</button>
                </form>
            </div>
        `;

        document.getElementById('login-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;

            try {
                await this.login(username, password);
            } catch (error) {
                console.error('Erro no login:', error);
                alert('Erro ao fazer login: ' + error.message);
            }
        });
    }

    setupEventListeners() {
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const page = e.target.closest('.nav-link').dataset.page;
                this.loadPage(page);
            });
        });

        document.getElementById('logout').addEventListener('click', () => {
            localStorage.removeItem('token');
            window.location.reload();
        });
    }

    async loadPage(page) {
        this.pageContent.innerHTML = '';

        try {
            switch (page) {
                case 'dashboard':
                    await this.showDashboard();
                    break;
                case 'properties':
                    await this.showPropertiesList();
                    break;
                case 'leads':
                    await this.showLeads();
                    break;
                case 'settings':
                    await this.showSettings();
                    break;
            }

            // Atualizar classe active no menu
            document.querySelectorAll('.nav-link').forEach(link => {
                link.classList.remove('active');
                if (link.dataset.page === page) {
                    link.classList.add('active');
                }
            });

        } catch (error) {
            console.error('Erro ao carregar página:', error);
            this.showError('Erro ao carregar informações');
        }
    }

    async showDashboard() {
        try {
            // Buscar dados para o dashboard
            const [propertiesResponse, leadsResponse] = await Promise.all([
                this.fetchWithAuth('/api/properties'),
                this.fetchWithAuth('/api/leads')
            ]);

            // Garantir que temos arrays para trabalhar
            const properties = Array.isArray(propertiesResponse) ? propertiesResponse : 
                              (propertiesResponse.properties || []);
            const leads = Array.isArray(leadsResponse) ? leadsResponse : 
                         (leadsResponse.leads || []);

            // Renderizar o dashboard
            this.pageContent.innerHTML = `
                <div class="dashboard">
                    <div class="stats-grid">
                        <div class="stat-card">
                            <i class="fas fa-home"></i>
                            <div class="stat-info">
                                <h3>Total de Imóveis</h3>
                                <div class="stat-number">${properties.length}</div>
                            </div>
                        </div>
                        
                        <div class="stat-card">
                            <i class="fas fa-users"></i>
                            <div class="stat-info">
                                <h3>Total de Leads</h3>
                                <div class="stat-number">${leads.length}</div>
                            </div>
                        </div>
                        
                        <div class="stat-card">
                            <i class="fas fa-chart-line"></i>
                            <div class="stat-info">
                                <h3>Visitas este Mês</h3>
                                <div class="stat-number">${this.getMonthlyVisits(leads)}</div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="charts-grid">
                        <div class="chart-card">
                            <h3>Leads por Mês</h3>
                            <canvas id="leads-chart"></canvas>
                        </div>
                        
                        <div class="chart-card">
                            <h3>Imóveis por Tipo</h3>
                            <canvas id="imoveis-tipo-chart"></canvas>
                        </div>
                    </div>
                </div>
            `;

            // Inicializar gráficos
            this.initializeCharts(properties, leads);

        } catch (error) {
            console.error('Erro ao carregar dashboard:', error);
            this.showError('Erro ao carregar informações do dashboard');
        }
    }

    getMonthlyVisits(leads) {
        const currentMonth = new Date().getMonth();
        const monthlyLeads = leads.filter(lead => {
            const leadMonth = new Date(lead.created_at).getMonth();
            return leadMonth === currentMonth;
        });
        return monthlyLeads.length;
    }

    initializeCharts(properties, leads) {
        // Gráfico de Leads por Mês
        const leadsChart = new Chart(document.getElementById('leads-chart'), {
            type: 'line',
            data: {
                labels: this.getLastSixMonths(),
                datasets: [{
                    label: 'Leads',
                    data: this.getLeadsPerMonth(leads),
                    borderColor: '#3498db',
                    tension: 0.1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false
            }
        });

        // Gráfico de Imóveis por Tipo
        const imoveisChart = new Chart(document.getElementById('imoveis-tipo-chart'), {
            type: 'doughnut',
            data: {
                labels: ['Apartamentos', 'Casas', 'Terrenos', 'Comercial'],
                datasets: [{
                    data: this.getPropertiesByType(properties),
                    backgroundColor: ['#3498db', '#2ecc71', '#e74c3c', '#f1c40f']
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false
            }
        });
    }

    getLastSixMonths() {
        const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
        const result = [];
        let currentMonth = new Date().getMonth();
        
        for (let i = 5; i >= 0; i--) {
            let month = currentMonth - i;
            if (month < 0) month += 12;
            result.push(months[month]);
        }
        
        return result;
    }

    getLeadsPerMonth(leads) {
        const months = new Array(6).fill(0);
        const currentMonth = new Date().getMonth();
        
        leads.forEach(lead => {
            const leadMonth = new Date(lead.created_at).getMonth();
            const monthsAgo = (currentMonth - leadMonth + 12) % 12;
            if (monthsAgo < 6) {
                months[5 - monthsAgo]++;
            }
        });
        
        return months;
    }

    getPropertiesByType(properties) {
        const types = {
            'Apartamento': 0,
            'Casa': 0,
            'Terreno': 0,
            'Comercial': 0
        };
        
        properties.forEach(property => {
            if (types.hasOwnProperty(property.type)) {
                types[property.type]++;
            }
        });
        
        return Object.values(types);
    }

    async showPropertiesList() {
        try {
            // Carregar o template da lista de imóveis
            this.pageContent.innerHTML = `
                <div class="properties-container">
                    <div class="header">
                        <h2>Gerenciar Imóveis</h2>
                        <button id="add-property" class="btn btn-primary">
                            <i class="fas fa-plus"></i> Adicionar Imóvel
                        </button>
                    </div>
                    <div id="properties-grid" class="properties-grid"></div>
                </div>

                <!-- Template do Formulário de Imóvel -->
                <div id="property-form-template" style="display: none;">
                    <form id="property-form" class="property-form">
                        <h2>Adicionar Imóvel</h2>
                        
                        <div class="form-group">
                            <label for="title">Título</label>
                            <input type="text" id="title" name="title" required>
                        </div>
                        
                        <div class="form-group">
                            <label for="description">Descrição</label>
                            <textarea id="description" name="description" required></textarea>
                        </div>
                        
                        <div class="form-row">
                            <div class="form-group">
                                <label for="price">Preço</label>
                                <input type="number" id="price" name="price" required>
                            </div>
                            
                            <div class="form-group">
                                <label for="type">Tipo</label>
                                <select id="type" name="type" required>
                                    <option value="apartment">Apartamento</option>
                                    <option value="house">Casa</option>
                                    <option value="commercial">Comercial</option>
                                    <option value="land">Terreno</option>
                                </select>
                            </div>
                        </div>
                        
                        <div class="form-group">
                            <label for="location">Localização</label>
                            <input type="text" id="location" name="location" required>
                        </div>
                        
                        <div class="form-row">
                            <div class="form-group">
                                <label for="area">Área (m²)</label>
                                <input type="number" id="area" name="area">
                            </div>
                            
                            <div class="form-group">
                                <label for="bedrooms">Quartos</label>
                                <input type="number" id="bedrooms" name="bedrooms">
                            </div>
                            
                            <div class="form-group">
                                <label for="bathrooms">Banheiros</label>
                                <input type="number" id="bathrooms" name="bathrooms">
                            </div>
                        </div>
                        
                        <div class="form-group">
                            <label for="images">Imagens</label>
                            <input type="file" id="images" name="images" multiple accept="image/*">
                        </div>
                        
                        <div class="form-group">
                            <label>Comodidades</label>
                            <div class="amenities-grid">
                                <label class="checkbox-label">
                                    <input type="checkbox" name="amenities[]" value="pool"> Piscina
                                </label>
                                <label class="checkbox-label">
                                    <input type="checkbox" name="amenities[]" value="gym"> Academia
                                </label>
                                <label class="checkbox-label">
                                    <input type="checkbox" name="amenities[]" value="garage"> Garagem
                                </label>
                                <!-- Adicione mais comodidades conforme necessário -->
                            </div>
                        </div>
                        
                        <div class="form-actions">
                            <button type="submit" class="btn btn-primary">Salvar</button>
                            <button type="button" class="btn btn-secondary" onclick="this.closest('.property-form').remove()">Cancelar</button>
                        </div>
                    </form>
                </div>
            `;

            // Buscar e exibir imóveis
            const properties = await this.fetchWithAuth('/api/properties');
            const propertiesGrid = document.getElementById('properties-grid');
            
            if (properties && properties.length > 0) {
                properties.forEach(property => {
                    const propertyCard = this.createPropertyCard(property);
                    propertiesGrid.appendChild(propertyCard);
                });
            } else {
                propertiesGrid.innerHTML = '<p>Nenhum imóvel cadastrado.</p>';
            }

            // Configurar botão de adicionar
            document.getElementById('add-property').addEventListener('click', () => {
                this.showPropertyForm();
            });

        } catch (error) {
            console.error('Erro ao carregar imóveis:', error);
            this.showError('Erro ao carregar lista de imóveis');
        }
    }

    createPropertyCard(property) {
        const card = document.createElement('div');
        card.className = 'property-card';
        card.innerHTML = `
            <div class="property-image">
                <img src="${property.images?.[0] || '/images/no-image.jpg'}" alt="${property.title}">
                <div class="property-actions">
                    <button class="btn-edit" data-id="${property.id}">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-delete" data-id="${property.id}">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
            <div class="property-info">
                <h3>${property.title}</h3>
                <p class="property-price">R$ ${property.price?.toLocaleString('pt-BR') || '0'}</p>
                <p class="property-location">${property.location || 'Localização não informada'}</p>
            </div>
        `;

        // Adicionar event listeners
        card.querySelector('.btn-edit').addEventListener('click', () => {
            this.showPropertyForm(property);
        });

        card.querySelector('.btn-delete').addEventListener('click', () => {
            if (confirm('Tem certeza que deseja excluir este imóvel?')) {
                this.deleteProperty(property.id);
            }
        });

        return card;
    }

    async showPropertyForm(property = null) {
        try {
            // Criar o formulário diretamente, sem usar template
            this.pageContent.innerHTML = `
                <div class="property-form-container">
                    <form id="property-form" class="property-form">
                        <h2>${property ? 'Editar Imóvel' : 'Adicionar Imóvel'}</h2>
                        
                        <div class="form-group">
                            <label for="title">Título</label>
                            <input type="text" id="title" name="title" value="${property?.title || ''}" required>
                        </div>
                        
                        <div class="form-group">
                            <label for="description">Descrição</label>
                            <textarea id="description" name="description" required>${property?.description || ''}</textarea>
                        </div>
                        
                        <div class="form-row">
                            <div class="form-group">
                                <label for="price">Preço</label>
                                <input type="number" id="price" name="price" value="${property?.price || ''}" required>
                            </div>
                            
                            <div class="form-group">
                                <label for="type">Tipo</label>
                                <select id="type" name="type" required>
                                    <option value="apartment" ${property?.type === 'apartment' ? 'selected' : ''}>Apartamento</option>
                                    <option value="house" ${property?.type === 'house' ? 'selected' : ''}>Casa</option>
                                    <option value="commercial" ${property?.type === 'commercial' ? 'selected' : ''}>Comercial</option>
                                    <option value="land" ${property?.type === 'land' ? 'selected' : ''}>Terreno</option>
                                </select>
                            </div>
                        </div>
                        
                        <div class="form-group">
                            <label for="location">Localização</label>
                            <input type="text" id="location" name="location" value="${property?.location || ''}" required>
                        </div>
                        
                        <div class="form-row">
                            <div class="form-group">
                                <label for="area">Área (m²)</label>
                                <input type="number" id="area" name="area" value="${property?.area || ''}">
                            </div>
                            
                            <div class="form-group">
                                <label for="bedrooms">Quartos</label>
                                <input type="number" id="bedrooms" name="bedrooms" value="${property?.bedrooms || ''}">
                            </div>
                            
                            <div class="form-group">
                                <label for="bathrooms">Banheiros</label>
                                <input type="number" id="bathrooms" name="bathrooms" value="${property?.bathrooms || ''}">
                            </div>
                        </div>
                        
                        <div class="form-group">
                            <label for="images">Imagens</label>
                            <input type="file" id="images" name="images" multiple accept="image/*">
                            ${property?.images ? `
                                <div class="current-images">
                                    <p>Imagens atuais:</p>
                                    <div class="images-grid">
                                        ${property.images.map(img => `
                                            <div class="image-preview">
                                                <img src="${img}" alt="Imagem do imóvel">
                                            </div>
                                        `).join('')}
                                    </div>
                                </div>
                            ` : ''}
                        </div>
                        
                        <div class="form-group">
                            <label>Comodidades</label>
                            <div class="amenities-grid">
                                <label class="checkbox-label">
                                    <input type="checkbox" name="amenities[]" value="pool" 
                                        ${property?.amenities?.includes('pool') ? 'checked' : ''}> Piscina
                                </label>
                                <label class="checkbox-label">
                                    <input type="checkbox" name="amenities[]" value="gym"
                                        ${property?.amenities?.includes('gym') ? 'checked' : ''}> Academia
                                </label>
                                <label class="checkbox-label">
                                    <input type="checkbox" name="amenities[]" value="garage"
                                        ${property?.amenities?.includes('garage') ? 'checked' : ''}> Garagem
                                </label>
                            </div>
                        </div>
                        
                        <div class="form-actions">
                            <button type="submit" class="btn btn-primary">Salvar</button>
                            <button type="button" class="btn btn-secondary" onclick="this.closest('.property-form-container').remove()">Cancelar</button>
                        </div>
                    </form>
                </div>
            `;

            // Configurar o handler do formulário
            const form = document.getElementById('property-form');
            form.addEventListener('submit', async (e) => {
                e.preventDefault();
                const formData = new FormData(form);

                try {
                    const url = property ? `/api/properties/${property.id}` : '/api/properties';
                    const method = property ? 'PUT' : 'POST';

                    const response = await this.fetchWithAuth(url, {
                        method,
                        body: formData
                    });

                    alert(property ? 'Imóvel atualizado com sucesso!' : 'Imóvel cadastrado com sucesso!');
                    this.loadPage('properties');
                } catch (error) {
                    console.error('Erro ao salvar:', error);
                    alert('Erro ao salvar imóvel');
                }
            });

        } catch (error) {
            console.error('Erro ao mostrar formulário:', error);
            this.showError('Erro ao carregar formulário');
        }
    }

    async deleteProperty(id) {
        try {
            const response = await this.fetchWithAuth(`/api/properties/${id}`, {
                method: 'DELETE'
            });
            
            if (response.ok) {
                alert('Imóvel excluído com sucesso!');
                this.loadPage('properties');
            } else {
                throw new Error('Erro ao excluir imóvel');
            }
        } catch (error) {
            console.error('Erro ao excluir:', error);
            alert('Erro ao excluir imóvel');
        }
    }

    async showLeads() {
        try {
            const leads = await this.fetchWithAuth('/api/leads');
            
            this.pageContent.innerHTML = `
                <div class="leads-container">
                    <h2>Leads</h2>
                    <div class="leads-list">
                        ${leads.map(lead => `
                            <div class="lead-card">
                                <h3>${lead.name}</h3>
                                <p>Email: ${lead.email}</p>
                                <p>Telefone: ${lead.phone}</p>
                                <p>Imóvel: ${lead.property_title || 'N/A'}</p>
                                <p>Mensagem: ${lead.message}</p>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        } catch (error) {
            console.error('Erro ao carregar leads:', error);
            this.showError('Erro ao carregar leads');
        }
    }

    async showSettings() {
        this.pageContent.innerHTML = `
            <div class="settings-container">
                <h2>Configurações</h2>
                <form id="settings-form">
                    <div class="form-group">
                        <label for="whatsapp">Número WhatsApp</label>
                        <input type="text" id="whatsapp" name="whatsapp" required>
                    </div>
                    <button type="submit" class="btn btn-primary">Salvar</button>
                </form>
            </div>
        `;
    }

    async fetchWithAuth(url, options = {}) {
        try {
            const token = localStorage.getItem('token');
            
            if (!token) {
                throw new Error('Token não encontrado');
            }

            const defaultOptions = {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            };

            if (options.body instanceof FormData) {
                delete defaultOptions.headers['Content-Type'];
            }

            const finalOptions = {
                ...defaultOptions,
                ...options,
                headers: {
                    ...defaultOptions.headers,
                    ...options.headers
                }
            };

            console.log('Requisição:', url, finalOptions);

            const response = await fetch(url, finalOptions);
            
            if (response.status === 401) {
                localStorage.removeItem('token');
                window.location.reload();
                throw new Error('Sessão expirada');
            }

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            console.log('Resposta:', data);
            return data;

        } catch (error) {
            console.error('Erro no fetchWithAuth:', error);
            throw error;
        }
    }

    showError(message) {
        this.pageContent.innerHTML = `
            <div class="error-message">
                <p>${message}</p>
            </div>
        `;
    }

    async login(username, password) {
        try {
            console.log('Tentando login com:', { username, password });
            
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, password })
            });

            console.log('Resposta do servidor:', response);
            const data = await response.json();
            console.log('Dados:', data);

            if (!response.ok) {
                throw new Error(data.error || 'Erro ao fazer login');
            }

            // Armazenar o token
            localStorage.setItem('token', data.token);
            
            // Inicializar o painel admin
            this.token = data.token;
            this.setupEventListeners();
            this.loadPage('dashboard');

        } catch (error) {
            console.error('Erro no login:', error);
            alert('Erro ao fazer login: ' + error.message);
        }
    }
}

// Função para extrair coordenadas do link do Google Maps
function extractCoordsFromGoogleMaps(url) {
    try {
        // Tentar diferentes formatos de URL do Google Maps
        let coords = null;
        
        // Formato: @-23.5505,-46.6333,15z
        let match = url.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
        if (match) {
            return {
                lat: parseFloat(match[1]),
                lng: parseFloat(match[2])
            };
        }
        
        // Formato: ll=-23.5505,-46.6333
        match = url.match(/ll=(-?\d+\.\d+),(-?\d+\.\d+)/);
        if (match) {
            return {
                lat: parseFloat(match[1]),
                lng: parseFloat(match[2])
            };
        }
        
        // Formato: q=-23.5505,-46.6333
        match = url.match(/q=(-?\d+\.\d+),(-?\d+\.\d+)/);
        if (match) {
            return {
                lat: parseFloat(match[1]),
                lng: parseFloat(match[2])
            };
        }

        return null;
    } catch (error) {
        console.error('Erro ao extrair coordenadas:', error);
        return null;
    }
}

// Inicializar painel admin
const admin = new AdminPanel(); 

function loadDashboard() {
    const content = document.getElementById('page-content');
    fetch('/admin/templates/dashboard.html')
        .then(response => response.text())
        .then(html => {
            content.innerHTML = html;
            initializeCharts();
        });
}

function initializeCharts() {
    // Gráfico de Leads
    const leadsChart = new Chart(document.getElementById('leads-chart'), {
        type: 'line',
        data: {
            labels: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun'],
            datasets: [{
                label: 'Leads',
                data: [12, 19, 15, 25, 22, 30],
                borderColor: '#3498db',
                tension: 0.1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false
        }
    });

    // Gráfico de Imóveis por Tipo
    const imoveisChart = new Chart(document.getElementById('imoveis-tipo-chart'), {
        type: 'doughnut',
        data: {
            labels: ['Apartamentos', 'Casas', 'Terrenos', 'Comercial'],
            datasets: [{
                data: [15, 12, 8, 7],
                backgroundColor: ['#3498db', '#2ecc71', '#e74c3c', '#f1c40f']
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false
        }
    });
}

// Adicionar ao código de navegação existente
document.querySelectorAll('.nav-menu a').forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const page = link.dataset.page;
        
        if (page === 'dashboard') {
            loadDashboard();
        }
        // ... outros casos existentes ...
    });
}); 