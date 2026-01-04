// session-manager.js - Gerencia sessões entre páginas
const SessionManager = {
    SESSION_KEY: 'iptracker_user_session',
    
    // Salvar sessão
    saveSession: function(userData, token) {
        try {
            const session = {
                user: userData,
                token: token,
                timestamp: Date.now(),
                expires: Date.now() + (24 * 60 * 60 * 1000) // 24 horas
            };
            
            // Salvar em localStorage e sessionStorage para redundância
            localStorage.setItem(this.SESSION_KEY, JSON.stringify(session));
            sessionStorage.setItem(this.SESSION_KEY, JSON.stringify(session));
            
            console.log('✅ Sessão salva:', userData.email);
            return true;
        } catch (error) {
            console.error('❌ Erro ao salvar sessão:', error);
            return false;
        }
    },
    
    // Carregar sessão
    loadSession: function() {
        try {
            // Tentar localStorage primeiro
            let session = localStorage.getItem(this.SESSION_KEY);
            
            if (!session) {
                // Tentar sessionStorage
                session = sessionStorage.getItem(this.SESSION_KEY);
            }
            
            if (session) {
                const parsed = JSON.parse(session);
                
                // Verificar se expirou
                if (Date.now() > parsed.expires) {
                    this.clearSession();
                    return null;
                }
                
                console.log('✅ Sessão carregada:', parsed.user.email);
                return parsed;
            }
            
            return null;
        } catch (error) {
            console.error('❌ Erro ao carregar sessão:', error);
            return null;
        }
    },
    
    // Verificar se está autenticado
    isAuthenticated: function() {
        const session = this.loadSession();
        return session !== null;
    },
    
    // Obter usuário atual
    getCurrentUser: function() {
        const session = this.loadSession();
        return session ? session.user : null;
    },
    
    // Obter token
    getToken: function() {
        const session = this.loadSession();
        return session ? session.token : null;
    },
    
    // Limpar sessão (logout)
    clearSession: function() {
        try {
            localStorage.removeItem(this.SESSION_KEY);
            sessionStorage.removeItem(this.SESSION_KEY);
            console.log('✅ Sessão limpa');
            return true;
        } catch (error) {
            console.error('❌ Erro ao limpar sessão:', error);
            return false;
        }
    },
    
    // Verificar e redirecionar se não autenticado
    requireAuth: function(redirectUrl = 'login.html') {
        if (!this.isAuthenticated()) {
            console.log('❌ Não autenticado, redirecionando para:', redirectUrl);
            window.location.href = redirectUrl;
            return null;
        }
        return this.getCurrentUser();
    },
    
    // Debug: Mostrar informações da sessão
    debug: function() {
        const session = this.loadSession();
        console.log('🔍 DEBUG - Session Manager:');
        console.log('- Is authenticated:', this.isAuthenticated());
        console.log('- Current user:', this.getCurrentUser());
        console.log('- Token:', this.getToken());
        console.log('- Full session:', session);
    }
};

// Auto-inicialização para páginas protegidas
document.addEventListener('DOMContentLoaded', function() {
    const currentPage = window.location.pathname;
    const protectedPages = ['dashboard.html', 'index.html'];
    const isProtectedPage = protectedPages.some(page => currentPage.includes(page));
    
    if (isProtectedPage && !SessionManager.isAuthenticated()) {
        console.log('⚠️ Página protegida sem autenticação, redirecionando...');
        SessionManager.clearSession();
        window.location.href = 'login.html';
    }
});

// Exportar para uso global
window.SessionManager = SessionManager;