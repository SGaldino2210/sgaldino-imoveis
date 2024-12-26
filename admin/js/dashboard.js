class Dashboard {
    constructor(adminPanel) {
        this.admin = adminPanel;
        this.pageContent = document.getElementById('page-content');
    }

    async render() {
        try {
            const [properties, leads] = await Promise.all([
                this.fetchProperties(),
                this.fetchLeads()
            ]);

            const stats = this.calculateStats(properties, leads);
            this.renderDashboard(stats, properties, leads);
        } catch (error) {
            console.error('Erro ao carregar dashboard:', error);
        }
    }

    async fetchProperties() {
        const response = await fetch('/api/properties', {
            headers: { 'x-auth-token': this.admin.token }
        });
        return response.json();
    }

    async fetchLeads() {
        const response = await fetch('/api/leads', {
            headers: { 'x-auth-token': this.admin.token }
        });
        return response.json();
    }

    calculateStats(properties, leads) {
        return {
            totalProperties: properties.length,
            totalLeads: leads.length,
            recentLeads: leads.slice(0, 5),
            propertyTypes: this.countPropertyTypes(properties),
            leadConversion: (leads.length / properties.length * 100).toFixed(1)
        };
    }

    renderDashboard(stats, properties, leads) {
        this.pageContent.innerHTML = `
            <div class="dashboard">
                <div class="stats-grid">
                    <div class="stat-card">
                        <i class="fas fa-home"></i>
                        <div class="stat-info">
                            <h3>Imóveis</h3>
                            <p>${stats.totalProperties}</p>
                        </div>
                    </div>
                    <div class="stat-card">
                        <i class="fas fa-users"></i>
                        <div class="stat-info">
                            <h3>Leads</h3>
                            <p>${stats.totalLeads}</p>
                        </div>
                    </div>
                    <div class="stat-card">
                        <i class="fas fa-chart-line"></i>
                        <div class="stat-info">
                            <h3>Conversão</h3>
                            <p>${stats.leadConversion}%</p>
                        </div>
                    </div>
                </div>

                <div class="dashboard-grid">
                    <div class="dashboard-card">
                        <h3>Leads Recentes</h3>
                        <div class="leads-list">
                            ${this.renderRecentLeads(stats.recentLeads)}
                        </div>
                    </div>
                    <div class="dashboard-card">
                        <h3>Tipos de Imóveis</h3>
                        <div class="property-types">
                            ${this.renderPropertyTypes(stats.propertyTypes)}
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    renderRecentLeads(leads) {
        return leads.map(lead => `
            <div class="lead-item">
                <div class="lead-info">
                    <h4>${lead.name}</h4>
                    <p>${lead.email}</p>
                    <p>${lead.phone}</p>
                </div>
                <div class="lead-property">
                    <small>${lead.property_title}</small>
                    <span>${new Date(lead.created_at).toLocaleDateString()}</span>
                </div>
            </div>
        `).join('');
    }

    renderPropertyTypes(types) {
        return Object.entries(types).map(([type, count]) => `
            <div class="property-type">
                <span>${type}</span>
                <span>${count}</span>
            </div>
        `).join('');
    }

    countPropertyTypes(properties) {
        return properties.reduce((acc, prop) => {
            acc[prop.type] = (acc[prop.type] || 0) + 1;
            return acc;
        }, {});
    }
} 