// Credenciais (em produção, isso viria de um backend)
const CREDENTIALS = {
    username: 'admin',
    password: 'admin123'
};

// Função para verificar se o usuário está logado
function isLoggedIn() {
    return localStorage.getItem('adminLoggedIn') === 'true';
}

// Função para fazer login
function login(username, password) {
    if (username === CREDENTIALS.username && password === CREDENTIALS.password) {
        localStorage.setItem('adminLoggedIn', 'true');
        localStorage.setItem('adminUsername', username);
        return true;
    }
    return false;
}

// Função para fazer logout
function logout() {
    localStorage.removeItem('adminLoggedIn');
    localStorage.removeItem('adminUsername');
    window.location.href = 'login.html';
}

// Verificar se já está logado
if (isLoggedIn() && window.location.pathname.endsWith('login.html')) {
    window.location.href = 'admin.html';
}

// Handler do formulário de login
document.getElementById('loginForm').addEventListener('submit', (e) => {
    e.preventDefault();
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const errorMessage = document.getElementById('errorMessage');
    
    if (login(username, password)) {
        window.location.href = 'admin.html';
    } else {
        errorMessage.style.display = 'block';
        setTimeout(() => {
            errorMessage.style.display = 'none';
        }, 3000);
    }
});
