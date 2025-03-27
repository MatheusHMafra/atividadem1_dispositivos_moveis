// Gerenciamento de autenticação Web Authentication API
class AuthManager {
    constructor() {
        this.authButton = document.getElementById('auth-button');
        this.authStatus = document.getElementById('auth-status');
        this.authSection = document.getElementById('auth-section');
        this.notesSection = document.getElementById('notes-section');
        
        this.isAuthenticated = false;
        
        // Verifica se a WebAuthn é suportada
        if (window.PublicKeyCredential) {
            this.authButton.addEventListener('click', () => this.authenticate());
        } else {
            this.authStatus.textContent = 'WebAuthn não é suportado neste navegador.';
            this.authButton.disabled = true;
        }

        // Verifica se já está autenticado
        this.checkAuthentication();
    }

    checkAuthentication() {
        const authState = localStorage.getItem('authState');
        if (authState === 'authenticated') {
            this.isAuthenticated = true;
            this.authSection.classList.add('hidden');
            this.notesSection.classList.remove('hidden');
        }
    }

    async authenticate() {
        try {
            this.authStatus.textContent = 'Iniciando autenticação...';
            
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
                // Armazenar credencial (em um ambiente real, isso seria feito em um backend)
                localStorage.setItem('authState', 'authenticated');
                
                this.isAuthenticated = true;
                this.authSection.classList.add('hidden');
                this.notesSection.classList.remove('hidden');
                
                this.authStatus.textContent = 'Autenticação bem-sucedida!';
            }
        } catch (error) {
            console.error('Erro de autenticação:', error);
            this.authStatus.textContent = `Erro de autenticação: ${error.message}`;
        }
    }
}

// Inicializar o gerenciador de autenticação quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
    const authManager = new AuthManager();
});
