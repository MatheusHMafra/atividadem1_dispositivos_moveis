// Função principal da aplicação
document.addEventListener('DOMContentLoaded', () => {
    // Verificar suporte a recursos principais
    checkFeatures();
    
    // Adicionar listener para instalação
    installPWA();
    
    // Melhorar experiência de carregamento
    enhanceLoadingExperience();
    
    // Solicitar permissão para notificações
    requestNotificationPermission();
});

// Verificar suporte aos recursos do navegador
function checkFeatures() {
    const unsupportedFeatures = [];
    
    if (!('localStorage' in window)) {
        unsupportedFeatures.push('Web Storage API');
    }
    
    if (!('serviceWorker' in navigator)) {
        unsupportedFeatures.push('Service Workers');
    }
    
    if (!window.PublicKeyCredential) {
        unsupportedFeatures.push('Web Authentication API');
    }
    
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
        console.warn('Speech Recognition API não é suportada neste navegador.');
    }
    
    if (!('share' in navigator)) {
        console.warn('Web Share API não é suportada neste navegador.');
    }
    
    // Mostrar alerta se houver recursos não suportados
    if (unsupportedFeatures.length > 0) {
        showCompatibilityWarning(unsupportedFeatures);
    }
}

// Mostrar aviso de compatibilidade de forma mais amigável
function showCompatibilityWarning(features) {
    const warningDiv = document.createElement('div');
    warningDiv.className = 'status-message warning';
    warningDiv.innerHTML = `
        <strong>⚠️ Atenção:</strong> Os seguintes recursos não são suportados neste navegador:
        <ul>${features.map(f => `<li>${f}</li>`).join('')}</ul>
        <p>A aplicação pode não funcionar corretamente. Recomendamos usar um navegador mais recente como Chrome, Edge ou Safari.</p>
    `;
    
    document.querySelector('main').prepend(warningDiv);
    
    // Temporizar para fechar após 15s
    setTimeout(() => {
        warningDiv.style.opacity = '0';
        setTimeout(() => warningDiv.remove(), 500);
    }, 15000);
}

// Detectar e lidar com o evento de instalação
let deferredPrompt;

function installPWA() {
    window.addEventListener('beforeinstallprompt', (e) => {
        // Prevenir o prompt automático
        e.preventDefault();
        // Guardar o evento para uso posterior
        deferredPrompt = e;
        
        // Criar botão de instalação apenas se ainda não houver um
        if (!document.querySelector('.install-button')) {
            // Mostrar um botão de instalação personalizado
            const installBtn = document.createElement('button');
            installBtn.className = 'install-button';
            installBtn.setAttribute('aria-label', 'Instalar aplicativo');
            installBtn.setAttribute('title', 'Instalar como aplicativo');
            
            installBtn.addEventListener('click', showInstallPrompt);
            
            document.body.appendChild(installBtn);
        }
    });
    
    // Detectar quando a PWA foi instalada
    window.addEventListener('appinstalled', (e) => {
        console.log('PWA instalada com sucesso!');
        // Remover botão se existir
        const installBtn = document.querySelector('.install-button');
        if (installBtn) installBtn.remove();
        
        // Mostrar mensagem de sucesso
        const successMsg = document.createElement('div');
        successMsg.className = 'status-message success fade-in';
        successMsg.innerHTML = '<strong>✅ Sucesso!</strong> Aplicativo instalado com sucesso!';
        document.querySelector('main').prepend(successMsg);
        
        // Auto remover após 3 segundos
        setTimeout(() => {
            successMsg.classList.replace('fade-in', 'fade-out');
            setTimeout(() => successMsg.remove(), 500);
        }, 3000);
        
        // Limpar o deferredPrompt
        deferredPrompt = null;
    });
}

async function showInstallPrompt() {
    if (!deferredPrompt) return;
    
    // Mostrar o prompt
    deferredPrompt.prompt();
    
    // Esperar pelo resultado
    const { outcome } = await deferredPrompt.userChoice;
    
    // Limpar o prompt salvo
    deferredPrompt = null;
    
    // Se rejeitado, permitir que o usuário instale depois
    if (outcome === 'dismissed') {
        console.log('Usuário rejeitou o prompt de instalação');
        
        // Reexibir depois de um tempo
        setTimeout(() => {
            const installBtn = document.querySelector('.install-button');
            if (installBtn) installBtn.style.display = 'flex';
        }, 1000 * 60 * 5); // 5 minutos
    }
}

// Melhorar experiência de carregamento
function enhanceLoadingExperience() {
    // Mostrar botão de logout quando autenticado
    const authState = localStorage.getItem('authState');
    if (authState === 'authenticated') {
        document.getElementById('logout-btn')?.classList.remove('hidden');
    }
    
    // Adicionar indicadores de carregamento
    document.addEventListener('notesLoading', () => {
        const noteList = document.querySelector('note-list');
        if (noteList && noteList.shadowRoot) {
            const container = noteList.shadowRoot.querySelector('#notes-container');
            if (container) {
                container.innerHTML = `
                    <div class="skeleton"></div>
                    <div class="skeleton"></div>
                    <div class="skeleton" style="height: 80px;"></div>
                `;
            }
        }
    });
    
    // Melhorar feedback visual
    document.querySelectorAll('button').forEach(btn => {
        btn.addEventListener('click', function() {
            this.classList.add('clicked');
            setTimeout(() => this.classList.remove('clicked'), 300);
        });
    });
}

// Adicionar suporte para notificações
function requestNotificationPermission() {
    if ('Notification' in window && Notification.permission !== 'granted' && Notification.permission !== 'denied') {
        // Aguardar um tempo antes de solicitar permissão
        setTimeout(() => {
            Notification.requestPermission().then(permission => {
                if (permission === 'granted') {
                    console.log('Notificações permitidas');
                    // Mostrar notificação de boas-vindas
                    showWelcomeNotification();
                }
            });
        }, 5000); // Atraso de 5 segundos para não assustar o usuário imediatamente
    }
}

function showWelcomeNotification() {
    if ('Notification' in window && Notification.permission === 'granted') {
        const notification = new Notification('Anotações Protegidas', {
            body: 'Bem-vindo! As notificações estão ativadas.',
            icon: 'image/icon.png'
        });
        
        notification.onclick = function() {
            window.focus();
            this.close();
        };
    }
}
