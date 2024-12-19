// Dados simulados (agora usando localStorage)
let properties = JSON.parse(localStorage.getItem('properties')) || [
    {
        id: 1,
        title: "Apartamento Moderno em Cidade Vargas",
        type: "apartamento",
        price: 650000,
        status: "Disponível",
        image: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&auto=format&fit=crop"
    },
    {
        id: 2,
        title: "Casa Espaçosa no Jabaquara",
        type: "casa",
        price: 850000,
        status: "Disponível",
        image: "https://images.unsplash.com/photo-1583608205776-bfd35f0d9f83?w=800&auto=format&fit=crop"
    },
    {
        id: 3,
        title: "Cobertura Duplex com Vista Panorâmica",
        type: "cobertura",
        price: 1200000,
        status: "Em Negociação",
        image: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&auto=format&fit=crop"
    }
];

let leads = JSON.parse(localStorage.getItem('leads')) || [
    {
        id: 1,
        name: "João Silva",
        email: "joao@email.com",
        phone: "(11) 98765-4321",
        property: "Apartamento Moderno em Cidade Vargas",
        date: "2024-01-15",
        status: "Novo"
    },
    {
        id: 2,
        name: "Maria Santos",
        email: "maria@email.com",
        phone: "(11) 98765-4322",
        property: "Casa Espaçosa no Jabaquara",
        date: "2024-01-14",
        status: "Em Contato"
    }
];

// Função para salvar no localStorage
function saveData() {
    localStorage.setItem('properties', JSON.stringify(properties));
    localStorage.setItem('leads', JSON.stringify(leads));
}

// Funções de Navegação
function showSection(sectionId) {
    // Esconde todas as seções
    document.querySelectorAll('.content-section').forEach(section => {
        section.classList.remove('active');
    });

    // Remove classe active de todos os links
    document.querySelectorAll('.sidebar-nav li').forEach(li => {
        li.classList.remove('active');
    });

    // Mostra a seção selecionada
    document.getElementById(sectionId).classList.add('active');

    // Adiciona classe active ao link selecionado
    document.querySelector(`[data-section="${sectionId}"]`).parentElement.classList.add('active');
}

// Navegação da Sidebar
document.querySelectorAll('.sidebar-nav a').forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const sectionId = e.currentTarget.getAttribute('data-section');
        showSection(sectionId);
    });
});

// Toggle Menu Mobile
document.querySelector('.menu-toggle').addEventListener('click', () => {
    document.querySelector('.sidebar').classList.toggle('active');
});

// Formatação de Preço
function formatPrice(price) {
    return price.toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    });
}

// Funções para Imóveis
function renderProperties() {
    const tbody = document.getElementById('propertiesTableBody');
    tbody.innerHTML = properties.map(property => `
        <tr>
            <td><img src="${property.image}" alt="${property.title}"></td>
            <td>${property.title}</td>
            <td>${property.type}</td>
            <td>${formatPrice(property.price)}</td>
            <td><span class="status">${property.status}</span></td>
            <td>
                <div class="action-buttons">
                    <button class="edit-button" onclick="editProperty(${property.id})">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="delete-button" onclick="deleteProperty(${property.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

// Funções para Leads
function renderLeads() {
    const tbody = document.getElementById('leadsTableBody');
    tbody.innerHTML = leads.map(lead => `
        <tr>
            <td>${lead.name}</td>
            <td>${lead.email}</td>
            <td>${lead.phone}</td>
            <td>${lead.property}</td>
            <td>${new Date(lead.date).toLocaleDateString('pt-BR')}</td>
            <td><span class="status">${lead.status}</span></td>
        </tr>
    `).join('');
}

// Modal de Imóveis
function openPropertyModal() {
    document.getElementById('propertyModal').style.display = 'block';
}

function closePropertyModal() {
    document.getElementById('propertyModal').style.display = 'none';
}

// Formulário de Imóveis
document.getElementById('propertyForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    
    // Lidar com upload de imagem
    const imageFile = formData.get('images');
    let imageUrl = 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&auto=format&fit=crop'; // Imagem padrão
    
    if (imageFile && imageFile.size > 0) {
        // Converter imagem para Base64
        const reader = new FileReader();
        imageUrl = await new Promise(resolve => {
            reader.onload = e => resolve(e.target.result);
            reader.readAsDataURL(imageFile);
        });
    }
    
    // Criar novo imóvel
    const newProperty = {
        id: Date.now(), // Usar timestamp como ID
        title: formData.get('title'),
        type: formData.get('type'),
        price: Number(formData.get('price')),
        status: 'Disponível',
        image: imageUrl,
        area: Number(formData.get('area')),
        bedrooms: Number(formData.get('bedrooms')),
        bathrooms: Number(formData.get('bathrooms')),
        parking: Number(formData.get('parking')),
        description: formData.get('description')
    };

    if (e.target.dataset.editingId) {
        const editingId = Number(e.target.dataset.editingId);
        const index = properties.findIndex(p => p.id === editingId);
        if (index !== -1) {
            properties[index] = newProperty;
        }
        e.target.dataset.editingId = '';
    } else {
        properties.push(newProperty);
    }
    
    saveData(); // Salvar no localStorage
    renderProperties();
    closePropertyModal();
    e.target.reset();
});

// Formulário de Configurações
document.getElementById('settingsForm').addEventListener('submit', (e) => {
    e.preventDefault();
    // Aqui você implementaria a lógica para salvar as configurações
    alert('Configurações salvas com sucesso!');
});

// Funções de Edição e Deleção
function editProperty(id) {
    const property = properties.find(p => p.id === id);
    if (property) {
        openPropertyModal();
        // Preencher formulário com dados do imóvel
        const form = document.getElementById('propertyForm');
        form.title.value = property.title;
        form.type.value = property.type;
        form.price.value = property.price;
        form.area.value = property.area || '';
        form.bedrooms.value = property.bedrooms || '';
        form.bathrooms.value = property.bathrooms || '';
        form.parking.value = property.parking || '';
        form.description.value = property.description || '';
        
        // Adicionar ID do imóvel sendo editado
        form.dataset.editingId = id;
    }
}

function deleteProperty(id) {
    if (confirm('Tem certeza que deseja excluir este imóvel?')) {
        properties = properties.filter(p => p.id !== id);
        saveData(); // Salvar no localStorage
        renderProperties();
    }
}

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
    renderProperties();
    renderLeads();
    showSection('dashboard');
});
