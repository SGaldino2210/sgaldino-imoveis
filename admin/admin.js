// Variáveis globais
let selectedImages = [];
let properties = [];
let leads = [];

// Carregar dados do localStorage
function loadData() {
    try {
        const savedProperties = localStorage.getItem('properties');
        const savedLeads = localStorage.getItem('leads');
        
        properties = savedProperties ? JSON.parse(savedProperties) : [];
        leads = savedLeads ? JSON.parse(savedLeads) : [];
        
        console.log('Dados carregados:', { properties, leads });
    } catch (error) {
        console.error('Erro ao carregar dados:', error);
        properties = [];
        leads = [];
    }
}

// Salvar dados no localStorage
function saveData() {
    try {
        localStorage.setItem('properties', JSON.stringify(properties));
        localStorage.setItem('leads', JSON.stringify(leads));
        console.log('Dados salvos:', { properties, leads });
        updateDashboard();
    } catch (error) {
        console.error('Erro ao salvar dados:', error);
    }
}

// Função para processar imagem
async function processImage(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = async (e) => {
            try {
                const img = new Image();
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    const ctx = canvas.getContext('2d');
                    
                    // Calcular dimensões mantendo proporção
                    let width = img.width;
                    let height = img.height;
                    const maxSize = 800;
                    
                    if (width > height && width > maxSize) {
                        height = (height * maxSize) / width;
                        width = maxSize;
                    } else if (height > maxSize) {
                        width = (width * maxSize) / height;
                        height = maxSize;
                    }
                    
                    canvas.width = width;
                    canvas.height = height;
                    
                    // Desenhar e comprimir imagem
                    ctx.drawImage(img, 0, 0, width, height);
                    const compressedBase64 = canvas.toDataURL('image/jpeg', 0.7);
                    
                    resolve(compressedBase64);
                };
                img.onerror = reject;
                img.src = e.target.result;
            } catch (error) {
                reject(error);
            }
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

// Função para adicionar imagens
async function handleImageUpload(files) {
    try {
        for (const file of files) {
            if (file.type.startsWith('image/')) {
                const base64 = await processImage(file);
                selectedImages.push({
                    id: Date.now() + Math.random(),
                    base64: base64
                });
            }
        }
        updateImagePreview();
    } catch (error) {
        console.error('Erro ao processar imagens:', error);
        alert('Erro ao processar algumas imagens. Por favor, tente novamente.');
    }
}

// Função para salvar imóvel
async function saveProperty(event) {
    event.preventDefault();
    
    try {
        const form = event.target;
        const editingId = form.dataset.editingId;
        
        const property = {
            id: editingId ? parseInt(editingId) : Date.now(),
            title: form.title.value,
            type: form.type.value,
            price: parseFloat(form.price.value),
            area: form.area.value,
            bedrooms: form.bedrooms.value,
            bathrooms: form.bathrooms.value,
            parking: form.parking.value,
            description: form.description.value,
            status: "Disponível",
            images: selectedImages.map(img => img.base64)
        };
        
        if (editingId) {
            const index = properties.findIndex(p => p.id === parseInt(editingId));
            if (index !== -1) {
                properties[index] = property;
            }
        } else {
            properties.push(property);
        }
        
        saveData();
        renderProperties();
        closePropertyModal();
        
        // Limpar formulário
        form.reset();
        selectedImages = [];
        updateImagePreview();
        delete form.dataset.editingId;
        
        console.log('Imóvel salvo com sucesso:', property);
    } catch (error) {
        console.error('Erro ao salvar imóvel:', error);
        alert('Erro ao salvar imóvel. Por favor, tente novamente.');
    }
}

// Função para salvar no localStorage
function saveData() {
    localStorage.setItem('properties', JSON.stringify(properties));
    localStorage.setItem('leads', JSON.stringify(leads));
    updateDashboard(); // Atualiza o dashboard quando os dados mudam
}

// Função para atualizar o dashboard
function updateDashboard() {
    // Atualizar contadores
    document.querySelector('.dashboard-cards .card:nth-child(1) p').textContent = properties.length;
    document.querySelector('.dashboard-cards .card:nth-child(2) p').textContent = '150'; // Visualizações (exemplo)
    document.querySelector('.dashboard-cards .card:nth-child(3) p').textContent = leads.length;
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

// Função para formatar preço
function formatPrice(price) {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    }).format(price);
}

// Funções para Imóveis
function renderProperties() {
    const tbody = document.getElementById('propertiesTableBody');
    if (!tbody) {
        console.error('Elemento propertiesTableBody não encontrado');
        return;
    }

    try {
        tbody.innerHTML = properties.map(property => {
            const imageUrl = property.images && property.images.length > 0 
                ? property.images[0] 
                : 'https://via.placeholder.com/150';
                
            return `
                <tr>
                    <td>
                        <img src="${imageUrl}" 
                             alt="${property.title}" 
                             style="width: 100px; height: 70px; object-fit: cover; border-radius: 4px;"
                             onerror="this.src='https://via.placeholder.com/150'">
                    </td>
                    <td>${property.title || ''}</td>
                    <td>${property.type || ''}</td>
                    <td>${formatPrice(property.price || 0)}</td>
                    <td><span class="status ${(property.status || 'disponivel').toLowerCase().replace(' ', '-')}">${property.status || 'Disponível'}</span></td>
                    <td>
                        <div class="action-buttons">
                            <button onclick="editProperty(${property.id})" class="edit-button">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button onclick="deleteProperty(${property.id})" class="delete-button">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        }).join('');
        
        console.log('Imóveis renderizados:', properties.length);
    } catch (error) {
        console.error('Erro ao renderizar imóveis:', error);
        tbody.innerHTML = '<tr><td colspan="6">Erro ao carregar imóveis</td></tr>';
    }
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

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
    // Carregar dados
    loadData();
    
    // Inicializar elementos da UI
    initializeUI();
    
    // Renderizar dados
    renderProperties();
    renderLeads();
    updateDashboard();
    
    // Verificar autenticação
    checkAuth();
});

// Inicializar elementos da UI
function initializeUI() {
    // Formulário de propriedades
    const propertyForm = document.getElementById('propertyForm');
    if (propertyForm) {
        propertyForm.addEventListener('submit', saveProperty);
    }
    
    // Área de upload de imagens
    const imageUploadArea = document.getElementById('imageUploadArea');
    const imageInput = document.getElementById('images');
    const imagePreviewContainer = document.getElementById('imagePreviewContainer');
    
    if (imageUploadArea && imageInput) {
        // Eventos de Drag & Drop
        imageUploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            imageUploadArea.classList.add('drag-over');
        });

        imageUploadArea.addEventListener('dragleave', () => {
            imageUploadArea.classList.remove('drag-over');
        });

        imageUploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            imageUploadArea.classList.remove('drag-over');
            const files = e.dataTransfer.files;
            handleImageUpload(files);
        });

        imageUploadArea.addEventListener('click', () => {
            imageInput.click();
        });

        imageInput.addEventListener('change', (e) => {
            handleImageUpload(e.target.files);
        });
    }
    
    // Formulário de configurações
    const settingsForm = document.getElementById('settingsForm');
    if (settingsForm) {
        settingsForm.addEventListener('submit', (e) => {
            e.preventDefault();
            alert('Configurações salvas com sucesso!');
        });
    }
    
    // Botões de navegação
    const menuToggle = document.querySelector('.menu-toggle');
    if (menuToggle) {
        menuToggle.addEventListener('click', () => {
            document.querySelector('.sidebar').classList.toggle('active');
        });
    }
}

// Verificar autenticação
function checkAuth() {
    if (localStorage.getItem('adminLoggedIn') !== 'true') {
        window.location.href = 'login.html';
    }
}

// Adicionar nome do usuário
const username = localStorage.getItem('adminUsername');
if (username) {
    document.querySelector('.user-info span').textContent = username;
}

// Função de logout
function logout() {
    localStorage.removeItem('adminLoggedIn');
    localStorage.removeItem('adminUsername');
    window.location.href = 'login.html';
}

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
        
        // Carregar imagens existentes
        selectedImages = property.images ? property.images.map((base64, index) => ({
            id: Date.now() + index,
            base64: base64
        })) : [];
        updateImagePreview();
        
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

// Gerenciamento de Imagens
function updateImagePreview() {
    const imagePreviewContainer = document.getElementById('imagePreviewContainer');
    if (imagePreviewContainer) {
        imagePreviewContainer.innerHTML = selectedImages.map(image => `
            <div class="image-preview">
                <img src="${image.base64}" alt="Preview">
                <button class="remove-image" onclick="removeImage(${image.id})">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `).join('');
    }
}

// Função para remover imagem
function removeImage(id) {
    selectedImages = selectedImages.filter(image => image.id !== id);
    updateImagePreview();
}
