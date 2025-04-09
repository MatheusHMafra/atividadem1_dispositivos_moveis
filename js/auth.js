// Gerenciamento de autenticação Web Authentication API
class AuthManager {
    constructor() {
        this.authButton = document.getElementById('auth-button');
        this.authStatus = document.getElementById('auth-status');
        this.authSection = document.getElementById('auth-section');
        this.notesSection = document.getElementById('notes-section');
        this.bypassAuthBtn = document.getElementById('bypass-auth');
        this.logoutBtn = document.getElementById('logout-btn');

        this.isAuthenticated = false;

        // Verifica se a WebAuthn é suportada
        if (window.PublicKeyCredential) {
            this.authButton.addEventListener('click', () => this.authenticate());

            // Verificar se o browser suporta o tipo de autenticação
            PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable()
                .then(available => {
                    if (!available) {
                        this.showStatus('Seu dispositivo não possui autenticador de plataforma (biometria/PIN).', 'warning');
                    }
                });
        } else {
            this.showStatus('WebAuthn não é suportado neste navegador.', 'error');
            this.authButton.disabled = true;
        }

        this.logoutBtn?.addEventListener('click', () => this.logout());

        // Verifica se já está autenticado
        this.checkAuthentication();
    }

    checkAuthentication() {
        const authState = localStorage.getItem('authState');
        const authExpiry = localStorage.getItem('authExpiry');
        const now = new Date();

        if (authState === 'authenticated' && authExpiry && new Date(authExpiry) > now) {
            this.isAuthenticated = true;
            this.authSection.classList.add('hidden');
            this.notesSection.classList.remove('hidden');
        } else {
            localStorage.removeItem('authState');
            localStorage.removeItem('authExpiry');
        }
    }

    logout() {
        localStorage.removeItem('authState');
        localStorage.removeItem('authExpiry');
        this.isAuthenticated = false;

        this.notesSection.style.opacity = '0';
        this.notesSection.style.transform = 'translateY(-20px)';

        setTimeout(() => {
            this.notesSection.classList.add('hidden');
            this.authSection.classList.remove('hidden');
            this.authSection.style.opacity = '0';
            this.authSection.style.transform = 'translateY(20px)';

            setTimeout(() => {
                this.authSection.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
                this.authSection.style.opacity = '1';
                this.authSection.style.transform = 'translateY(0)';
            }, 50);

            this.logoutBtn?.classList.add('hidden');
            this.showStatus('Você saiu com sucesso.', 'success');
        }, 300);
    }

    async authenticate() {
        try {
            this.showStatus('Iniciando autenticação...', 'info');
            this.authButton.disabled = true;
            this.authButton.innerHTML = '<span class="loading-spinner"></span> Autenticando...';

            // Gerar desafio aleatório
            const challenge = new Uint8Array(32);
            window.crypto.getRandomValues(challenge);

            // Criar opções para a criação de credenciais
            const createOptions = {
                publicKey: {
                    challenge,
                    rp: {
                        name: 'Anotações Protegidas'
                    },
                    user: {
                        id: new Uint8Array([0, 1, 2, 3]), // Identificador de usuário simples
                        name: 'user@example.com',
                        displayName: 'Usuário'
                    },
                    pubKeyCredParams: [
                        { type: 'public-key', alg: -7 } // ES256
                    ],
                    attestation: 'none',
                    timeout: 60000,
                    authenticatorSelection: {
                        authenticatorAttachment: 'platform',
                        userVerification: 'preferred'
                    }
                }
            };

            // Criar credencial
            const credential = await navigator.credentials.create(createOptions);

            if (credential) {
                // Armazenar credencial
                localStorage.setItem('authState', 'authenticated');

                // Definir expiração para 24h
                const expiry = new Date();
                expiry.setHours(expiry.getHours() + 24);
                localStorage.setItem('authExpiry', expiry.toISOString());

                this.isAuthenticated = true;

                this.authButton.innerHTML = '<span>✅ Autenticado!</span>';
                this.showStatus('Autenticação bem-sucedida!', 'success');

                setTimeout(() => this.switchToNotes(), 1000);
            }
        } catch (error) {
            console.error('Erro de autenticação:', error);

            // Tratar diferentes tipos de erros
            if (error.name === 'NotAllowedError') {
                this.showStatus('Autenticação cancelada pelo usuário.', 'warning');
            } else if (error.name === 'NotSupportedError') {
                this.showStatus('Este tipo de autenticação não é suportado no seu dispositivo.', 'error');
            } else if (error.name === 'SecurityError') {
                this.showStatus('Erro de segurança. Verifique se está usando HTTPS em produção.', 'error');
            } else {
                this.showStatus(`Erro de autenticação: ${error.message}`, 'error');
            }

            this.authButton.innerHTML = '<span>🔐 Autenticar</span>';
        } finally {
            this.authButton.disabled = false;
        }
    }

    showStatus(message, type) {
        if (!this.authStatus) return;

        this.authStatus.className = 'status-message';
        if (type) {
            this.authStatus.classList.add(type);
        }

        let icon = '';
        switch (type) {
            case 'error': icon = '❌ '; break;
            case 'success': icon = '✅ '; break;
            case 'warning': icon = '⚠️ '; break;
            case 'info': icon = 'ℹ️ '; break;
        }

        this.authStatus.textContent = icon + message;
        this.authStatus.classList.remove('hidden');

        this.authStatus.style.animation = 'none';
        setTimeout(() => {
            this.authStatus.style.animation = 'fadeIn 0.5s ease-out';
        }, 10);

        if (type === 'success') {
            setTimeout(() => {
                this.authStatus.style.animation = 'fadeOut 0.5s ease-out forwards';
            }, 5000);
        }
    }

    switchToNotes() {
        this.authSection.classList.add('hidden');
        this.notesSection.classList.remove('hidden');
    }
}

// Adicionar estilo para o spinner de carregamento
const style = document.createElement('style');
style.textContent = `
    .loading-spinner {
        display: inline-block;
        width: 16px;
        height: 16px;
        border: 2px solid rgba(255,255,255,0.3);
        border-radius: 50%;
        border-top-color: white;
        animation: spin 1s linear infinite;
        margin-right: 8px;
    }
    
    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }
`;
document.head.appendChild(style);

document.addEventListener('DOMContentLoaded', () => {
    const authManager = new AuthManager();
});
