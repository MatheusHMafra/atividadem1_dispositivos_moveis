// Função principal da aplicação
document.addEventListener('DOMContentLoaded', () => {
    checkFeatures();

    installPWA();

    loadPage();
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

    if (unsupportedFeatures.length > 0) {
        showCompatibilityWarning(unsupportedFeatures);
    }
}

// Aviso de compatibilidade
function showCompatibilityWarning(features) {
    const warningDiv = document.createElement('div');
    warningDiv.className = 'status-message warning';
    warningDiv.innerHTML = `
        <strong>⚠️ Atenção:</strong> Os seguintes recursos não são suportados neste navegador:
        <ul>${features.map(f => `<li>${f}</li>`).join('')}</ul>
        <p>A aplicação pode não funcionar corretamente. Recomendamos usar um navegador mais recente como Chrome, Edge ou Safari.</p>
    `;

    document.querySelector('main').prepend(warningDiv);

    setTimeout(() => {
        warningDiv.style.opacity = '0';
        setTimeout(() => warningDiv.remove(), 500);
    }, 15000);
}

let deferredPrompt;

function installPWA() {
    window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault();
        deferredPrompt = e;

        if (!document.querySelector('.install-button')) {
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
        const installBtn = document.querySelector('.install-button');
        if (installBtn) installBtn.remove();

        const successMsg = document.createElement('div');
        successMsg.className = 'status-message success fade-in';
        successMsg.innerHTML = '<strong>✅ Sucesso!</strong> Aplicativo instalado com sucesso!';
        document.querySelector('main').prepend(successMsg);

        setTimeout(() => {
            successMsg.classList.replace('fade-in', 'fade-out');
            setTimeout(() => successMsg.remove(), 500);
        }, 3000);

        deferredPrompt = null;
    });
}

async function showInstallPrompt() {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();

    const { outcome } = await deferredPrompt.userChoice;

    deferredPrompt = null;

    if (outcome === 'dismissed') {
        console.log('Usuário rejeitou o prompt de instalação');

        setTimeout(() => {
            const installBtn = document.querySelector('.install-button');
            if (installBtn) installBtn.style.display = 'flex';
        }, 1000 * 60 * 5);
    }
}

function loadPage() {
    const authState = localStorage.getItem('authState');
    if (authState === 'authenticated') {
        document.getElementById('logout-btn')?.classList.remove('hidden');
    }

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

    document.querySelectorAll('button').forEach(btn => {
        btn.addEventListener('click', function () {
            this.classList.add('clicked');
            setTimeout(() => this.classList.remove('clicked'), 300);
        });
    });
}