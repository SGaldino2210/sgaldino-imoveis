class LeadsManager {
    constructor(adminPanel) {
        this.admin = adminPanel;
        this.pageContent = document.getElementById('page-content');
        this.leads = [];
        this.filters = {
            status: 'all',
            date: 'all'
        };
    }

    async render() {
        await this.loadLeads();
        this.renderLeadsPage();
        this.setupEventListeners();
    }

    async loadLeads() {
        try {
            const response = await fetch('/api/leads', {
                headers: { 'x-auth-token': this.admin.token }
            });
            this.leads = await response.json();
        } catch (error) {
            console.error('Erro ao carregar leads:', error);
            this.leads = [];
        }
    }

    renderLeadsPage() {
        this.pageContent.innerHTML = `
            <div class="leads-container">
                <div class="leads-header">
                    <h2>Gerenciamento de Leads</h2>
                    <div class="leads-filters">
                        <select id="status-filter">
                            <option value="all">Todos os Status</option>
                            <option value="new">Novos</option>
                            <option value="contacted">Contatados</option>
                            <option value="negotiating">Em Negociação</option>
                            <option value="closed">Fechados</option>
                            <option value="lost">Perdidos</option>
                        </select>
                        <select id="date-filter">
                            <option value="all">Todas as Datas</option>
                            <option value="today">Hoje</option>
                            <option value="week">Esta Semana</option>
                            <option value="month">Este Mês</option>
                        </select>
                        <button id="export-leads" class="btn-secondary">
                            <i class="fas fa-download"></i> Exportar
                        </button>
                    </div>
                </div>

                <div class="leads-stats">
                    <div class="stat-card">
                        <h4>Total de Leads</h4>
                        <p>${this.leads.length}</p>
                    </div>
                    <div class="stat-card">
                        <h4>Leads Novos</h4>
                        <p>${this.leads.filter(l => l.status === 'new').length}</p>
                    </div>
                    <div class="stat-card">
                        <h4>Taxa de Conversão</h4>
                        <p>${this.calculateConversionRate()}%</p>
                    </div>
                </div>

                <div class="leads-table-container">
                    <table class="leads-table">
                        <thead>
                            <tr>
                                <th>Data</th>
                                <th>Nome</th>
                                <th>Contato</th>
                                <th>Imóvel</th>
                                <th>Status</th>
                                <th>Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${this.renderLeadsTableRows()}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    }

    renderLeadsTableRows() {
        return this.leads
            .filter(this.filterLead.bind(this))
            .map(lead => `
                <tr data-lead-id="${lead.id}">
                    <td>${new Date(lead.created_at).toLocaleDateString()}</td>
                    <td>${lead.name}</td>
                    <td>
                        <div class="contact-info">
                            <span>${lead.email}</span>
                            <span>${lead.phone}</span>
                        </div>
                    </td>
                    <td>${lead.property_title}</td>
                    <td>
                        <select class="status-select" onchange="leadsManager.updateLeadStatus(${lead.id}, this.value)">
                            <option value="new" ${lead.status === 'new' ? 'selected' : ''}>Novo</option>
                            <option value="contacted" ${lead.status === 'contacted' ? 'selected' : ''}>Contatado</option>
                            <option value="negotiating" ${lead.status === 'negotiating' ? 'selected' : ''}>Em Negociação</option>
                            <option value="closed" ${lead.status === 'closed' ? 'selected' : ''}>Fechado</option>
                            <option value="lost" ${lead.status === 'lost' ? 'selected' : ''}>Perdido</option>
                        </select>
                    </td>
                    <td>
                        <div class="lead-actions">
                            <button onclick="leadsManager.contactViaWhatsApp(${lead.id})" title="Contatar via WhatsApp">
                                <i class="fab fa-whatsapp"></i>
                            </button>
                            <button onclick="leadsManager.showLeadDetails(${lead.id})" title="Ver Detalhes">
                                <i class="fas fa-eye"></i>
                            </button>
                            <button onclick="leadsManager.addNote(${lead.id})" title="Adicionar Nota">
                                <i class="fas fa-note-sticky"></i>
                            </button>
                        </div>
                    </td>
                </tr>
            `).join('');
    }

    setupEventListeners() {
        document.getElementById('status-filter').addEventListener('change', (e) => {
            this.filters.status = e.target.value;
            this.renderLeadsPage();
        });

        document.getElementById('date-filter').addEventListener('change', (e) => {
            this.filters.date = e.target.value;
            this.renderLeadsPage();
        });

        document.getElementById('export-leads').addEventListener('click', () => {
            this.exportLeads();
        });
    }

    filterLead(lead) {
        if (this.filters.status !== 'all' && lead.status !== this.filters.status) {
            return false;
        }

        if (this.filters.date !== 'all') {
            const leadDate = new Date(lead.created_at);
            const today = new Date();
            
            switch (this.filters.date) {
                case 'today':
                    return leadDate.toDateString() === today.toDateString();
                case 'week':
                    const weekAgo = new Date(today.setDate(today.getDate() - 7));
                    return leadDate >= weekAgo;
                case 'month':
                    return leadDate.getMonth() === today.getMonth() &&
                           leadDate.getFullYear() === today.getFullYear();
            }
        }

        return true;
    }

    async updateLeadStatus(leadId, newStatus) {
        try {
            const response = await fetch(`/api/leads/${leadId}/status`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'x-auth-token': this.admin.token
                },
                body: JSON.stringify({ status: newStatus })
            });

            if (response.ok) {
                const lead = this.leads.find(l => l.id === leadId);
                if (lead) {
                    lead.status = newStatus;
                    if (newStatus === 'contacted') {
                        this.scheduleFollowUp(leadId);
                    }
                }
            }
        } catch (error) {
            console.error('Erro ao atualizar status:', error);
            alert('Erro ao atualizar status do lead');
        }
    }

    async contactViaWhatsApp(leadId) {
        const lead = this.leads.find(l => l.id === leadId);
        if (!lead) return;

        try {
            const settings = await this.getWhatsAppSettings();
            const message = this.formatWhatsAppMessage(lead, settings.whatsapp.message);
            const url = `https://api.whatsapp.com/send?phone=${lead.phone}&text=${encodeURIComponent(message)}`;
            
            window.open(url, '_blank');
            
            // Atualizar status para 'contacted' se ainda estiver como 'new'
            if (lead.status === 'new') {
                this.updateLeadStatus(leadId, 'contacted');
            }
        } catch (error) {
            console.error('Erro ao contatar via WhatsApp:', error);
            alert('Erro ao abrir WhatsApp');
        }
    }

    async getWhatsAppSettings() {
        const response = await fetch('/api/settings', {
            headers: { 'x-auth-token': this.admin.token }
        });
        return await response.json();
    }

    formatWhatsAppMessage(lead, template) {
        return template
            .replace('{name}', lead.name)
            .replace('{property_title}', lead.property_title);
    }

    scheduleFollowUp(leadId) {
        const lead = this.leads.find(l => l.id === leadId);
        if (!lead) return;

        // Agendar lembrete para 24 horas depois
        const followUpDate = new Date();
        followUpDate.setHours(followUpDate.getHours() + 24);

        // Criar notificação no navegador
        if (Notification.permission === 'granted') {
            const notification = new Notification('Lembrete de Follow-up', {
                body: `Fazer follow-up com ${lead.name} sobre ${lead.property_title}`,
                icon: '/img/logo.png'
            });
        }
    }

    exportLeads() {
        const filteredLeads = this.leads.filter(this.filterLead.bind(this));
        const csv = this.convertToCSV(filteredLeads);
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        
        link.setAttribute('href', url);
        link.setAttribute('download', 'leads.csv');
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    convertToCSV(leads) {
        const headers = ['Data', 'Nome', 'Email', 'Telefone', 'Imóvel', 'Status'];
        const rows = leads.map(lead => [
            new Date(lead.created_at).toLocaleDateString(),
            lead.name,
            lead.email,
            lead.phone,
            lead.property_title,
            lead.status
        ]);

        return [headers, ...rows]
            .map(row => row.join(','))
            .join('\n');
    }

    calculateConversionRate() {
        const closedLeads = this.leads.filter(l => l.status === 'closed').length;
        return ((closedLeads / this.leads.length) * 100).toFixed(1);
    }
} 