class Settings {
    constructor(adminPanel) {
        this.admin = adminPanel;
        this.pageContent = document.getElementById('page-content');
    }

    async render() {
        const settings = await this.fetchSettings();
        this.renderSettings(settings);
        this.setupEventListeners();
    }

    async fetchSettings() {
        try {
            const response = await fetch('/api/settings', {
                headers: { 'x-auth-token': this.admin.token }
            });
            return await response.json();
        } catch (error) {
            console.error('Erro ao carregar configurações:', error);
            return {};
        }
    }

    renderSettings(settings) {
        this.pageContent.innerHTML = `
            <div class="settings-container">
                <h2>Configurações</h2>
                
                <div class="settings-section">
                    <h3>Configurações do WhatsApp</h3>
                    <form id="whatsapp-settings">
                        <div class="form-group">
                            <label for="whatsapp_number">Número do WhatsApp</label>
                            <input type="text" id="whatsapp_number" 
                                value="${settings.whatsapp_number || ''}" 
                                placeholder="Ex: 5511999999999">
                            <small>Inclua código do país (55) e DDD</small>
                        </div>

                        <div class="form-group">
                            <label for="whatsapp_message">Mensagem Padrão</label>
                            <textarea id="whatsapp_message" rows="4">${settings.whatsapp_message || ''}</textarea>
                            <small>Use {property_title} para incluir o nome do imóvel</small>
                        </div>

                        <div class="form-group">
                            <label>Notificações</label>
                            <div class="checkbox-group">
                                <label>
                                    <input type="checkbox" id="notify_new_leads" 
                                        ${settings.notify_new_leads ? 'checked' : ''}>
                                    Novos Leads
                                </label>
                                <label>
                                    <input type="checkbox" id="notify_property_views" 
                                        ${settings.notify_property_views ? 'checked' : ''}>
                                    Visualizações de Imóveis
                                </label>
                            </div>
                        </div>
                    </form>
                </div>

                <div class="settings-section">
                    <h3>Configurações de SEO</h3>
                    <form id="seo-settings">
                        <div class="form-group">
                            <label for="site_title">Título do Site</label>
                            <input type="text" id="site_title" 
                                value="${settings.site_title || ''}">
                        </div>

                        <div class="form-group">
                            <label for="meta_description">Descrição Meta</label>
                            <textarea id="meta_description" rows="3">${settings.meta_description || ''}</textarea>
                        </div>

                        <div class="form-group">
                            <label for="meta_keywords">Palavras-chave</label>
                            <input type="text" id="meta_keywords" 
                                value="${settings.meta_keywords || ''}"
                                placeholder="Separe por vírgulas">
                        </div>
                    </form>
                </div>

                <div class="settings-section">
                    <h3>Configurações de API</h3>
                    <form id="api-settings">
                        <div class="form-group">
                            <label for="google_analytics_id">ID do Google Analytics</label>
                            <input type="text" id="google_analytics_id" 
                                value="${settings.google_analytics_id || ''}">
                        </div>

                        <div class="form-group">
                            <label for="facebook_pixel_id">ID do Facebook Pixel</label>
                            <input type="text" id="facebook_pixel_id" 
                                value="${settings.facebook_pixel_id || ''}">
                        </div>
                    </form>
                </div>

                <div class="form-actions">
                    <button type="button" class="btn-primary" id="save-settings">
                        Salvar Configurações
                    </button>
                </div>
            </div>
        `;
    }

    setupEventListeners() {
        document.getElementById('save-settings').addEventListener('click', () => {
            this.saveSettings();
        });

        // Preview da mensagem do WhatsApp
        const messageInput = document.getElementById('whatsapp_message');
        if (messageInput) {
            messageInput.addEventListener('input', (e) => {
                const preview = e.target.value.replace('{property_title}', 'Apartamento Exemplo');
                document.getElementById('message-preview').textContent = preview;
            });
        }
    }

    async saveSettings() {
        const settings = {
            whatsapp: {
                number: document.getElementById('whatsapp_number').value,
                message: document.getElementById('whatsapp_message').value,
                notify_new_leads: document.getElementById('notify_new_leads').checked,
                notify_property_views: document.getElementById('notify_property_views').checked
            },
            seo: {
                site_title: document.getElementById('site_title').value,
                meta_description: document.getElementById('meta_description').value,
                meta_keywords: document.getElementById('meta_keywords').value
            },
            api: {
                google_analytics_id: document.getElementById('google_analytics_id').value,
                facebook_pixel_id: document.getElementById('facebook_pixel_id').value
            }
        };

        try {
            const response = await fetch('/api/settings', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-auth-token': this.admin.token
                },
                body: JSON.stringify(settings)
            });

            if (response.ok) {
                alert('Configurações salvas com sucesso!');
            } else {
                throw new Error('Erro ao salvar configurações');
            }
        } catch (error) {
            console.error('Erro:', error);
            alert('Erro ao salvar configurações');
        }
    }
} 