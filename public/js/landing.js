class LandingPage {
    constructor() {
        this.propertyId = window.location.pathname.split('/')[2]; // Pega o ID da URL
        this.property = null;
        this.map = null;
        this.init();
    }

    async init() {
        try {
            await this.loadProperty();
            this.initMap();
            this.setupImageGallery();
        } catch (error) {
            console.error('Erro ao carregar imóvel:', error);
        }
    }

    async loadProperty() {
        const response = await fetch(`/api/properties/${this.propertyId}`);
        if (!response.ok) throw new Error('Imóvel não encontrado');
        
        this.property = await response.json();
        this.updateUI();
    }

    updateUI() {
        document.title = `${this.property.title} | SGaldino Imóveis`;
        document.getElementById('property-title').textContent = this.property.title;
        document.getElementById('property-price').textContent = `R$ ${this.formatPrice(this.property.price)}`;
        document.getElementById('property-area').textContent = this.property.area;
        document.getElementById('property-bedrooms').textContent = this.property.bedrooms;
        document.getElementById('property-suites').textContent = this.property.suites;
        document.getElementById('property-bathrooms').textContent = this.property.bathrooms;
        document.getElementById('property-description').textContent = this.property.description;
        document.getElementById('property-location').textContent = this.property.location;

        // Carregar imagens
        if (this.property.images) {
            const images = this.property.images.split(',');
            document.getElementById('main-image').src = images[0];
            
            const thumbnails = document.getElementById('thumbnails');
            thumbnails.innerHTML = images.map(img => `
                <div class="thumbnail" onclick="landingPage.setMainImage('${img}')">
                    <img src="${img}" alt="Thumbnail">
                </div>
            `).join('');
        }

        // Carregar amenidades
        if (this.property.amenities) {
            const amenities = JSON.parse(this.property.amenities);
            document.getElementById('property-amenities').innerHTML = amenities.map(item => `
                <li><i class="fas fa-check"></i> ${this.getAmenityLabel(item)}</li>
            `).join('');
        }
    }

    initMap() {
        if (this.property.latitude && this.property.longitude) {
            this.map = L.map('map').setView([this.property.latitude, this.property.longitude], 15);
            
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '© OpenStreetMap contributors'
            }).addTo(this.map);

            L.marker([this.property.latitude, this.property.longitude])
                .addTo(this.map)
                .bindPopup(this.property.title);
        }
    }

    setMainImage(src) {
        document.getElementById('main-image').src = src;
    }

    contactWhatsApp() {
        const message = encodeURIComponent(
            `Olá! Tenho interesse no imóvel: ${this.property.title}\n` +
            `Valor: R$ ${this.formatPrice(this.property.price)}\n` +
            `Link: ${window.location.href}`
        );
        window.open(`https://wa.me/5511937255009?text=${message}`, '_blank');
    }

    scheduleVisit() {
        const message = encodeURIComponent(
            `Olá! Gostaria de agendar uma visita ao imóvel: ${this.property.title}\n` +
            `Valor: R$ ${this.formatPrice(this.property.price)}\n` +
            `Link: ${window.location.href}`
        );
        window.open(`https://wa.me/5511937255009?text=${message}`, '_blank');
    }

    async submitForm(event) {
        event.preventDefault();
        const form = event.target;
        
        try {
            const response = await fetch('/api/leads', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    name: form.name.value,
                    email: form.email.value,
                    phone: form.phone.value,
                    message: form.message.value,
                    property_id: this.propertyId
                })
            });

            if (response.ok) {
                alert('Mensagem enviada com sucesso! Em breve entraremos em contato.');
                form.reset();
            } else {
                throw new Error('Erro ao enviar mensagem');
            }
        } catch (error) {
            console.error('Erro:', error);
            alert('Erro ao enviar mensagem. Tente novamente.');
        }
    }

    formatPrice(price) {
        return price.toLocaleString('pt-BR');
    }

    getAmenityLabel(value) {
        const labels = {
            'pool': 'Piscina',
            'gym': 'Academia',
            'playground': 'Playground',
            'party-room': 'Salão de Festas',
            'bbq': 'Churrasqueira',
            'sports-court': 'Quadra Esportiva',
            'sauna': 'Sauna',
            'games-room': 'Sala de Jogos'
        };
        return labels[value] || value;
    }
}

const landingPage = new LandingPage(); 