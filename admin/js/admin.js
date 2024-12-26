class AdminPanel {
    constructor() {
        this.token = localStorage.getItem('token');
        this.pageContent = document.getElementById('page-content');
        this.init();
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
                        <label for="email">Email</label>
                        <input type="email" id="email" required>
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
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;

            try {
                const response = await fetch('/api/auth/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ email, password })
                });

                const data = await response.json();

                if (response.ok) {
                    localStorage.setItem('token', data.token);
                    window.location.reload();
                } else {
                    alert(data.msg || 'Credenciais inválidas');
                }
            } catch (error) {
                console.error('Erro no login:', error);
                alert('Erro ao fazer login');
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

        switch (page) {
            case 'dashboard':
                await this.showDashboard();
                break;
            case 'properties':
                await this.showPropertyForm();
                break;
            case 'leads':
                await this.showLeads();
                break;
            case 'settings':
                await this.showSettings();
                break;
        }
    }

    async showDashboard() {
        try {
            const [properties, leads] = await Promise.all([
                this.fetchWithAuth('/api/properties'),
                this.fetchWithAuth('/api/leads')
            ]);

            this.pageContent.innerHTML = `
                <div class="dashboard">
                    <h2>Dashboard</h2>
                    <div class="dashboard-stats">
                        <div class="stat-card">
                            <h3>Imóveis</h3>
                            <p>${properties.length}</p>
                        </div>
                        <div class="stat-card">
                            <h3>Leads</h3>
                            <p>${leads.length}</p>
                        </div>
                    </div>
                </div>
            `;
        } catch (error) {
            console.error('Erro ao carregar dashboard:', error);
            this.showError('Erro ao carregar informações');
        }
    }

    async showPropertyForm() {
        const template = document.getElementById('property-form-template');
        const content = template.content.cloneNode(true);
        this.pageContent.appendChild(content);

        const form = this.pageContent.querySelector('#property-form');
        const locationInput = form.querySelector('#location');
        const latitudeInput = form.querySelector('#latitude');
        const longitudeInput = form.querySelector('#longitude');
        const mapDiv = form.querySelector('#map');

        const map = L.map('map').setView([-23.550520, -46.633308], 13);
        
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors'
        }).addTo(map);

        const marker = L.marker([-23.550520, -46.633308], {
            draggable: true
        }).addTo(map);

        // Atualizar coordenadas quando o marcador é movido
        marker.on('dragend', function() {
            const position = marker.getLatLng();
            latitudeInput.value = position.lat;
            longitudeInput.value = position.lng;
            
            // Atualizar endereço usando Nominatim (serviço gratuito do OpenStreetMap)
            fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${position.lat}&lon=${position.lng}`)
                .then(response => response.json())
                .then(data => {
                    locationInput.value = data.display_name;
                });
        });

        // Adicionar campo para link do Google Maps
        locationInput.addEventListener('paste', async (e) => {
            // Pegar o texto colado
            const pastedText = (e.clipboardData || window.clipboardData).getData('text');
            
            // Verificar se é um link do Google Maps
            if (pastedText.includes('google.com/maps')) {
                e.preventDefault(); // Prevenir a colagem normal
                
                try {
                    // Extrair coordenadas do link
                    let coords = extractCoordsFromGoogleMaps(pastedText);
                    
                    if (coords) {
                        // Atualizar o mapa
                        map.setView([coords.lat, coords.lng], 16);
                        marker.setLatLng([coords.lat, coords.lng]);
                        
                        // Atualizar inputs
                        latitudeInput.value = coords.lat;
                        longitudeInput.value = coords.lng;
                        
                        // Buscar endereço usando as coordenadas
                        fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${coords.lat}&lon=${coords.lng}`)
                            .then(response => response.json())
                            .then(data => {
                                locationInput.value = data.display_name;
                            });
                    }
                } catch (error) {
                    console.error('Erro ao processar link:', error);
                }
            }
        });

        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.handlePropertySubmit(form);
        });
    }

    async handlePropertySubmit(form) {
        try {
            const formData = new FormData(form);
            const amenities = Array.from(form.querySelectorAll('input[name="amenities"]:checked'))
                .map(checkbox => checkbox.value);

            const data = {
                ...Object.fromEntries(formData),
                amenities: JSON.stringify(amenities),
                latitude: parseFloat(form.querySelector('#latitude').value),
                longitude: parseFloat(form.querySelector('#longitude').value)
            };

            const response = await this.fetchWithAuth('/api/properties', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });

            if (response.ok) {
                alert('Imóvel salvo com sucesso!');
                this.loadPage('dashboard');
            } else {
                throw new Error('Erro ao salvar imóvel');
            }
        } catch (error) {
            console.error('Erro:', error);
            alert('Erro ao salvar imóvel');
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
        const response = await fetch(url, {
            ...options,
            headers: {
                ...options.headers,
                'x-auth-token': this.token
            }
        });

        if (response.status === 401) {
            localStorage.removeItem('token');
            window.location.reload();
            throw new Error('Não autorizado');
        }

        return response.json();
    }

    showError(message) {
        this.pageContent.innerHTML = `
            <div class="error-message">
                <p>${message}</p>
            </div>
        `;
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