// Gerenciamento de estado dos imóveis
let properties = JSON.parse(localStorage.getItem('properties')) || [];

// Elementos do DOM
const propertyForm = document.getElementById('propertyForm');
const propertyList = document.getElementById('propertyList');
const imageInput = document.getElementById('propertyImages'); 
const imagePreview = document.getElementById('imagePreview');

// Formatador de moeda
const currencyFormatter = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
});

// Preview de imagens
imageInput.addEventListener('change', function(e) {
    imagePreview.innerHTML = '';
    const files = Array.from(e.target.files);
    
    files.forEach(file => {
        if (file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = function(e) {
                const img = document.createElement('img');
                img.src = e.target.result;
                img.className = 'preview-image';
                imagePreview.appendChild(img);
            };
            reader.readAsDataURL(file);
        }
    });
});

// Formatar input de preço
const priceInput = document.getElementById('price');
priceInput.addEventListener('input', function(e) {
    let value = e.target.value.replace(/\D/g, '');
    if (value) {
        value = (parseInt(value) / 100).toFixed(2);
        e.target.value = currencyFormatter.format(value);
    }
});

// Manipulação do formulário
propertyForm.addEventListener('submit', async function(e) {
    e.preventDefault();

    // Coletar dados do formulário
    const formData = new FormData(propertyForm);
    const propertyData = {
        id: Date.now().toString(),
        name: formData.get('propertyName'),
        neighborhood: formData.get('neighborhood'),
        city: formData.get('city'),
        state: formData.get('state'),
        area: formData.get('area'),
        bedrooms: formData.get('quartos'), 
        suites: formData.get('suites'), 
        parkingSpaces: formData.get('parkingSpaces'),
        price: formData.get('price'),
        description: formData.get('description'),
        whatsapp: formData.get('whatsapp'),
        images: [],
        createdAt: new Date().toISOString()
    };

    // Processar imagens
    const files = Array.from(imageInput.files); 
    for (const file of files) {
        if (file.type.startsWith('image/')) {
            const base64 = await convertToBase64(file);
            propertyData.images.push(base64);
        }
    }

    // Salvar imóvel
    properties.push(propertyData);
    localStorage.setItem('properties', JSON.stringify(properties));
    
    // Atualizar lista
    renderProperties();
    
    // Limpar formulário
    propertyForm.reset();
    imagePreview.innerHTML = '';
    
    alert('Imóvel cadastrado com sucesso!');
});

// Converter imagem para Base64
function convertToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
        reader.readAsDataURL(file);
    });
}

// Renderizar lista de imóveis
function renderProperties() {
    if (!propertyList) return;
    
    propertyList.innerHTML = '';
    properties.forEach(property => {
        const card = document.createElement('div');
        card.className = 'property-card';
        card.innerHTML = `
            <div class="property-image">
                <img src="${property.images[0] || 'placeholder.jpg'}" alt="${property.name}">
            </div>
            <div class="property-info">
                <h3>${property.name}</h3>
                <p>${property.neighborhood}, ${property.city} - ${property.state}</p>
                <p>Área: ${property.area}m² | Quartos: ${property.bedrooms} | Suítes: ${property.suites}</p>
                <p>Preço: ${property.price}</p>
                <div class="property-actions">
                    <button onclick="editProperty('${property.id}')" class="btn-edit">Editar</button>
                    <button onclick="deleteProperty('${property.id}')" class="btn-delete">Excluir</button>
                </div>
            </div>
        `;
        propertyList.appendChild(card);
    });
}

// Inicializar lista de imóveis
renderProperties();
