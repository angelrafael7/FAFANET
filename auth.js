// auth.js - Sistema SIMPLIFICADO usando SessionManager
const Auth = {
    USERS_KEY: 'iptracker_users',
    REMEMBER_KEY: 'iptracker_remember',
    
    // ==================== REGISTRO ====================
    register: function(userData) {
        try {
            console.log('📝 Registrando usuário:', userData.email);
            
            const users = this.getUsers();
            const emailLower = userData.email.toLowerCase().trim();
            
            // Verificar se email já existe
            if (users[emailLower]) {
                return { 
                    success: false, 
                    error: 'Este e-mail já está cadastrado. Faça login.' 
                };
            }
            
            // Validar dados
            if (!userData.name || userData.name.trim().length < 2) {
                return { 
                    success: false, 
                    error: 'Nome deve ter pelo menos 2 caracteres' 
                };
            }
            
            if (!this.validateEmail(userData.email)) {
                return { 
                    success: false, 
                    error: 'E-mail inválido' 
                };
            }
            
            if (!userData.password || userData.password.length < 6) {
                return { 
                    success: false, 
                    error: 'Senha deve ter pelo menos 6 caracteres' 
                };
            }
            
            // Criar usuário
            const newUser = {
                id: this.generateId(),
                name: userData.name.trim(),
                email: emailLower,
                password: userData.password,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };
            
            // Salvar usuário
            users[emailLower] = newUser;
            localStorage.setItem(this.USERS_KEY, JSON.stringify(users));
            
            console.log('✅ Usuário registrado:', newUser.email);
            
            // Criar sessão automaticamente após registro
            if (typeof SessionManager !== 'undefined') {
                SessionManager.saveSession(
                    { id: newUser.id, name: newUser.name, email: newUser.email },
                    this.generateToken()
                );
            }
            
            return { 
                success: true, 
                user: {
                    id: newUser.id,
                    name: newUser.name,
                    email: newUser.email
                }
            };
            
        } catch (error) {
            console.error('❌ Erro no registro:', error);
            return { 
                success: false, 
                error: 'Erro ao criar conta' 
            };
        }
    },
    
    // ==================== LOGIN ====================
    login: function(email, password, rememberMe = false) {
        try {
            console.log('🔐 Tentando login para:', email);
            
            const users = this.getUsers();
            const emailLower = email.toLowerCase().trim();
            const user = users[emailLower];
            
            // Verificar se usuário existe
            if (!user) {
                return { 
                    success: false, 
                    error: 'E-mail não cadastrado. Crie uma conta primeiro.' 
                };
            }
            
            // Verificar senha (comparação direta)
            if (user.password !== password) {
                return { 
                    success: false, 
                    error: 'Senha incorreta' 
                };
            }
            
            console.log('✅ Login bem-sucedido!');
            
            // Salvar email para lembrar
            if (rememberMe) {
                localStorage.setItem(this.REMEMBER_KEY, emailLower);
            } else {
                localStorage.removeItem(this.REMEMBER_KEY);
            }
            
            // Criar dados do usuário para a sessão
            const userData = {
                id: user.id,
                name: user.name,
                email: user.email,
                createdAt: user.createdAt
            };
            
            const token = this.generateToken();
            
            // Salvar sessão usando SessionManager
            if (typeof SessionManager !== 'undefined') {
                const saved = SessionManager.saveSession(userData, token);
                if (!saved) {
                    throw new Error('Erro ao salvar sessão');
                }
            } else {
                console.warn('⚠️ SessionManager não disponível, usando fallback');
                // Fallback básico
                sessionStorage.setItem('auth_user', JSON.stringify(userData));
                sessionStorage.setItem('auth_token', token);
            }
            
            return { 
                success: true, 
                user: userData,
                token: token,
                message: 'Login realizado com sucesso!'
            };
            
        } catch (error) {
            console.error('❌ Erro no login:', error);
            return { 
                success: false, 
                error: error.message || 'Erro ao fazer login. Tente novamente.' 
            };
        }
    },
    
    // ==================== VERIFICAÇÕES (usando SessionManager) ====================
    isAuthenticated: function() {
        if (typeof SessionManager !== 'undefined') {
            return SessionManager.isAuthenticated();
        }
        
        // Fallback
        try {
            return !!sessionStorage.getItem('auth_user');
        } catch {
            return false;
        }
    },
    
    getCurrentUser: function() {
        if (typeof SessionManager !== 'undefined') {
            return SessionManager.getCurrentUser();
        }
        
        // Fallback
        try {
            const user = sessionStorage.getItem('auth_user');
            return user ? JSON.parse(user) : null;
        } catch {
            return null;
        }
    },
    
    requireAuth: function(redirectTo = 'login.html') {
        if (!this.isAuthenticated()) {
            window.location.href = redirectTo;
            return null;
        }
        return this.getCurrentUser();
    },
    
    logout: function() {
        if (typeof SessionManager !== 'undefined') {
            SessionManager.clearSession();
        } else {
            // Fallback
            sessionStorage.removeItem('auth_user');
            sessionStorage.removeItem('auth_token');
        }
        return true;
    },
    
    // ==================== UTILITÁRIOS ====================
    getUsers: function() {
        try {
            const users = localStorage.getItem(this.USERS_KEY);
            return users ? JSON.parse(users) : {};
        } catch (error) {
            return {};
        }
    },
    
    validateEmail: function(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    },
    
    generateId: function() {
        return 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    },
    
    generateToken: function() {
        return 'token_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    },
    
    getRememberedEmail: function() {
        return localStorage.getItem(this.REMEMBER_KEY) || '';
    },
    
    // ==================== DEBUG ====================
    debugUsers: function() {
        const users = this.getUsers();
        console.log('🔧 DEBUG - Usuários cadastrados:');
        Object.keys(users).forEach(email => {
            console.log(`- ${email}: ${users[email].name}`);
        });
    },
    
    clearAll: function() {
        localStorage.removeItem(this.USERS_KEY);
        localStorage.removeItem(this.REMEMBER_KEY);
        
        if (typeof SessionManager !== 'undefined') {
            SessionManager.clearSession();
        } else {
            sessionStorage.clear();
        }
        
        console.log('🧹 Todos os dados foram limpos');
    }
};

// Auto-inicialização
document.addEventListener('DOMContentLoaded', function() {
    console.log('🔐 Auth.js carregado');
    
    // Verificar se estamos em uma página protegida
    const currentPage = window.location.pathname;
    const isAuthPage = currentPage.includes('login.html') || currentPage.includes('register.html');
    
    if (!isAuthPage && !Auth.isAuthenticated()) {
        console.log('⚠️ Não autenticado em página protegida, redirecionando...');
        window.location.href = 'login.html';
    }
});

// Exportar para uso global
window.Auth = Auth;