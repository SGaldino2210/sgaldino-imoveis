const axios = require('axios');
require('dotenv').config();

class WhatsAppService {
    constructor() {
        this.apiUrl = process.env.WHATSAPP_API_URL;
        this.apiToken = process.env.WHATSAPP_API_TOKEN;
    }

    async sendMessage(to, message) {
        try {
            const response = await axios.post(`${this.apiUrl}/messages`, {
                messaging_product: 'whatsapp',
                to: this.formatPhoneNumber(to),
                type: 'text',
                text: { body: message }
            }, {
                headers: {
                    'Authorization': `Bearer ${this.apiToken}`,
                    'Content-Type': 'application/json'
                }
            });

            return response.data;
        } catch (error) {
            console.error('Erro ao enviar mensagem WhatsApp:', error);
            throw error;
        }
    }

    async sendTemplate(to, templateName, components) {
        try {
            const response = await axios.post(`${this.apiUrl}/messages`, {
                messaging_product: 'whatsapp',
                to: this.formatPhoneNumber(to),
                type: 'template',
                template: {
                    name: templateName,
                    language: { code: 'pt_BR' },
                    components
                }
            }, {
                headers: {
                    'Authorization': `Bearer ${this.apiToken}`,
                    'Content-Type': 'application/json'
                }
            });

            return response.data;
        } catch (error) {
            console.error('Erro ao enviar template WhatsApp:', error);
            throw error;
        }
    }

    formatPhoneNumber(phone) {
        // Remover caracteres não numéricos
        return phone.replace(/\D/g, '');
    }

    async sendPropertyInfo(to, property) {
        const message = `
🏠 *${property.title}*

📍 ${property.location}
💰 R$ ${property.price.toLocaleString()}

🏗️ Detalhes:
• Área: ${property.area}m²
• Quartos: ${property.bedrooms}
• Banheiros: ${property.bathrooms}
• Vagas: ${property.parking}

📝 ${property.description}

Interessado? Responda esta mensagem para mais informações!
        `;

        return this.sendMessage(to, message);
    }

    async scheduleFollowUp(leadId, date) {
        // Implementar lógica de agendamento
        // Pode usar um serviço de agendamento como node-cron
    }
}

module.exports = new WhatsAppService(); 