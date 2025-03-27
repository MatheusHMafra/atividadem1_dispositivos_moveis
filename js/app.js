// Função principal da aplicação
document.addEventListener('DOMContentLoaded', () => {
    // Verificar suporte a recursos principais
    checkFeatures();
    
    // Adicionar listener para instalação
    installPWA();
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
        alert(`Os seguintes recursos não são suportados neste navegador: ${unsupportedFeatures.join(', ')}\nA aplicação pode não funcionar corretamente.`);
    }
}

// Detectar e lidar com o evento de instalação
let deferredPrompt;

function installPWA() {
    window.addEventListener('beforeinstallprompt', (e) => {
        // Prevenir o prompt automático
        e.preventDefault();
        // Guardar o evento para uso posterior
        deferredPrompt = e;
        
        // Mostrar um botão de instalação personalizado
        const installBtn = document.createElement('button');
        installBtn.textContent = 'Instalar App';
        installBtn.className = 'install-button';
        installBtn.style.position = 'fixed';
        installBtn.style.bottom = '20px';
        installBtn.style.right = '20px';
        installBtn.style.zIndex = '999';
        
        installBtn.addEventListener('click', async () => {
            if (deferredPrompt) {
                // Mostrar o prompt
                deferredPrompt.prompt();
                // Esperar pelo resultado
                const { outcome } = await deferredPrompt.userChoice;
                // Limpar o prompt salvo
                deferredPrompt = null;
                
                if (outcome === 'accepted') {
                    console.log('Usuário aceitou o prompt de instalação');
                    // Remover o botão após a instalação
                    installBtn.remove();
                } else {
                    console.log('Usuário rejeitou o prompt de instalação');
                }
            }
        });
        
        document.body.appendChild(installBtn);
    });
    
    // Detectar quando a PWA foi instalada
    window.addEventListener('appinstalled', (e) => {
        console.log('PWA instalada com sucesso!');
    });
}
