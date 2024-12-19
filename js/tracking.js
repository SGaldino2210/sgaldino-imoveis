// Rastreamento de eventos
const TrackingEvents = {
    // Rastrear visualização de imóvel
    viewProperty: function(property) {
        fbq('track', 'ViewContent', {
            content_type: 'property',
            content_name: property.name,
            content_ids: [property.id],
            content_category: 'Real Estate',
            value: property.price,
            currency: 'BRL'
        });

        window.dataLayer.push({
            'event': 'view_property',
            'property_id': property.id,
            'property_name': property.name,
            'property_price': property.price
        });
    },

    // Rastrear contato via WhatsApp
    trackWhatsAppClick: function(property) {
        fbq('track', 'Contact', {
            content_type: 'property',
            content_name: property.name,
            content_ids: [property.id],
            content_category: 'WhatsApp Contact'
        });

        window.dataLayer.push({
            'event': 'whatsapp_click',
            'property_id': property.id,
            'property_name': property.name
        });
    },

    // Rastrear busca
    trackSearch: function(searchQuery, filters) {
        fbq('track', 'Search', {
            search_string: searchQuery,
            filters: JSON.stringify(filters)
        });

        window.dataLayer.push({
            'event': 'property_search',
            'search_query': searchQuery,
            'search_filters': filters
        });
    }
};

// Adicionar listeners para eventos
document.addEventListener('DOMContentLoaded', function() {
    // Rastrear cliques no WhatsApp
    document.querySelectorAll('.whatsapp-button').forEach(button => {
        button.addEventListener('click', function() {
            const propertyId = this.closest('.property-card').dataset.id;
            const property = properties.find(p => p.id === parseInt(propertyId));
            if (property) {
                TrackingEvents.trackWhatsAppClick(property);
            }
        });
    });

    // Rastrear buscas
    const searchButton = document.querySelector('.search-button');
    if (searchButton) {
        searchButton.addEventListener('click', function() {
            const searchQuery = document.querySelector('.search-input').value;
            const filters = {
                price: document.getElementById('priceRange').value,
                bedrooms: document.getElementById('bedroomCount').value
            };
            TrackingEvents.trackSearch(searchQuery, filters);
        });
    }
});
