// Utilitários compartilhados
const Utils = {
    formatDate(dateString) {
        const dateOptions = { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        };
        return new Date(dateString).toLocaleDateString('pt-BR', dateOptions);
    },
    
    debounce(func, delay = 300) {
        let timer;
        return function(...args) {
            clearTimeout(timer);
            timer = setTimeout(() => func.apply(this, args), delay);
        };
    },
    
    escapeHTML(text) {
        if (!text) return '';
        return text
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }
};

// Gerenciador de notas para centralizar acesso ao localStorage
const NotesManager = {
    getAllNotes() {
        try {
            return JSON.parse(localStorage.getItem('notes') || '[]');
        } catch (e) {
            console.error('Erro ao ler notas:', e);
            return [];
        }
    },
    
    saveNote(note) {
        const notes = this.getAllNotes();
        notes.push(note);
        localStorage.setItem('notes', JSON.stringify(notes));
        this.notifyUpdate();
        return note;
    },
    
    deleteNote(id) {
        const notes = this.getAllNotes();
        const updatedNotes = notes.filter(note => note.id !== id);
        localStorage.setItem('notes', JSON.stringify(updatedNotes));
        this.notifyUpdate();
    },
    
    notifyUpdate() {
        document.dispatchEvent(new CustomEvent('notesUpdated'));
    }
};

// Componente para o editor de notas
class NoteEditor extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this._elements = {}; // Cache de elementos DOM
    }

    connectedCallback() {
        this.render();
        this.setupListeners();
    }
    
    getStyles() {
        return `
            :host {
                display: block;
                margin-bottom: 2rem;
                padding: 1.5rem;
                border-radius: var(--border-radius, 10px);
                box-shadow: var(--box-shadow, 0 2px 10px rgba(0,0,0,0.1));
                background-color: var(--card-bg, rgba(255, 255, 255, 0.8));
                transition: all 0.3s ease;
                backdrop-filter: blur(10px);
                -webkit-backdrop-filter: blur(10px);
            }
            
            :host(:hover) {
                box-shadow: 0 5px 15px rgba(0,0,0,0.15);
            }
            
            h2 {
                margin-top: 0;
                color: var(--accent-color, #4361ee);
                border-bottom: 1px solid rgba(128, 128, 128, 0.2);
                padding-bottom: 0.8rem;
                font-size: 1.5rem;
            }

            textarea, input {
                width: 100%;
                padding: 15px;
                margin-bottom: 15px;
                border: 1px solid rgba(128, 128, 128, 0.2);
                border-radius: var(--border-radius, 8px);
                background-color: rgba(255, 255, 255, 0.1);
                color: var(--secondary-color, black);
                box-sizing: border-box;
                font-family: inherit;
                font-size: 1rem;
                transition: all 0.3s ease;
                box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.05);
            }

            textarea:focus, input:focus {
                outline: none;
                border-color: var(--accent-color, #4361ee);
                box-shadow: 0 0 0 3px rgba(67, 97, 238, 0.2), inset 0 2px 4px rgba(0, 0, 0, 0.05);
            }

            .actions {
                display: flex;
                gap: 12px;
                flex-wrap: wrap;
            }

            button {
                display: inline-flex;
                align-items: center;
                justify-content: center;
                gap: 8px;
                padding: 12px 20px;
                background-color: var(--accent-color, #4361ee);
                color: white;
                border: none;
                border-radius: var(--border-radius, 8px);
                cursor: pointer;
                transition: all 0.3s ease;
                font-weight: 500;
                box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                position: relative;
                overflow: hidden;
            }

            button:hover {
                background-color: var(--accent-hover, #3a56d4);
                transform: translateY(-2px);
                box-shadow: 0 6px 10px rgba(0, 0, 0, 0.15);
            }
            
            button:active {
                transform: translateY(1px);
                box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
            }

            button:disabled {
                opacity: 0.6;
                cursor: not-allowed;
                transform: none;
                box-shadow: none;
            }
            
            #voice-btn {
                background-color: var(--success-color, #2ecc71);
            }
            
            #voice-btn:hover {
                background-color: rgba(46, 204, 113, 0.9);
            }
            
            #voice-btn.listening {
                animation: pulse 1.5s infinite;
                background-color: #e74c3c;
            }
            
            @keyframes pulse {
                0% { transform: scale(1); }
                50% { transform: scale(1.05); box-shadow: 0 0 15px rgba(231, 76, 60, 0.6); }
                100% { transform: scale(1); }
            }
            
            #clear-btn {
                background-color: #95a5a6;
            }
            
            #clear-btn:hover {
                background-color: rgba(149, 165, 166, 0.9);
            }

            #status-message {
                padding: 15px;
                border-radius: var(--border-radius, 8px);
                margin: 15px 0 0 0;
                font-size: 0.95rem;
                transition: all 0.3s ease;
                opacity: 0;
                max-height: 0;
                overflow: hidden;
            }
            
            #status-message.visible {
                opacity: 0.7;
                max-height: 200px;
                margin-top: 15px;
            }
            
            #status-message.error {
                background-color: rgba(231, 76, 60, 0.1);
                color: var(--danger-color, #e74c3c);
                border-left: 4px solid var(--danger-color, #e74c3c);
            }
            
            #status-message.success {
                background-color: rgba(46, 204, 113, 0.1);
                color: var(--success-color, #2ecc71);
                border-left: 4px solid var(--success-color, #2ecc71);
            }
            
            #status-message.warning {
                background-color: rgba(243, 156, 18, 0.1);
                color: var(--warning-color, #f39c12);
                border-left: 4px solid var(--warning-color, #f39c12);
            }
            
            .icon {
                font-size: 1.2rem;
                line-height: 1;
            }
            
            @media (max-width: 600px) {
                .actions {
                    flex-direction: column;
                }
                
                button {
                    width: 100%;
                }
            }
        `;
    }

    render() {
        this.shadowRoot.innerHTML = `
            <style>${this.getStyles()}</style>
            
            <h2>✨ Nova Anotação</h2>
            <input type="text" id="note-title" placeholder="Título da anotação" autocomplete="off">
            <textarea id="note-content" placeholder="Conteúdo da anotação" rows="5"></textarea>
            <div class="actions">
                <button id="save-btn"><span class="icon">💾</span> Salvar</button>
                <button id="voice-btn"><span class="icon">🎤</span> Usar Voz</button>
                <button id="clear-btn"><span class="icon">🧹</span> Limpar</button>
            </div>
            <div id="status-message"></div>
        `;
        
        // Cache de elementos DOM frequentemente acessados
        this._elements = {
            saveBtn: this.shadowRoot.getElementById('save-btn'),
            voiceBtn: this.shadowRoot.getElementById('voice-btn'),
            clearBtn: this.shadowRoot.getElementById('clear-btn'),
            titleInput: this.shadowRoot.getElementById('note-title'),
            contentInput: this.shadowRoot.getElementById('note-content'),
            statusMessage: this.shadowRoot.getElementById('status-message')
        };
    }

    setupListeners() {
        const { saveBtn, voiceBtn, clearBtn, titleInput, contentInput } = this._elements;

        saveBtn.addEventListener('click', this.handleSave.bind(this));
        voiceBtn.addEventListener('click', this.handleVoiceRecognition.bind(this));
        clearBtn.addEventListener('click', this.handleClear.bind(this));
        
        // Auto-resize para textarea com debounce
        contentInput.addEventListener('input', Utils.debounce((e) => {
            e.target.style.height = 'auto';
            e.target.style.height = (e.target.scrollHeight) + 'px';
        }, 100));
    }
    
    handleSave() {
        const { saveBtn, titleInput, contentInput } = this._elements;
        
        if (!titleInput.value.trim()) {
            this.showStatusMessage('O título não pode estar vazio.', 'error');
            titleInput.focus();
            return;
        }
        
        if (!contentInput.value.trim()) {
            this.showStatusMessage('O conteúdo da anotação não pode estar vazio.', 'error');
            contentInput.focus();
            return;
        }

        const note = {
            id: Date.now(),
            title: titleInput.value,
            content: contentInput.value,
            createdAt: new Date().toISOString()
        };

        try {
            NotesManager.saveNote(note);

            // Adicionar efeito visual
            saveBtn.innerHTML = '<span class="icon">✅</span> Salvo!';
            setTimeout(() => {
                saveBtn.innerHTML = '<span class="icon">💾</span> Salvar';
            }, 2000);

            // Limpar campos
            titleInput.value = '';
            contentInput.value = '';
            contentInput.style.height = 'auto';
            
            this.showStatusMessage('Anotação salva com sucesso!', 'success');
        } catch (error) {
            console.error('Erro ao salvar nota:', error);
            this.showStatusMessage('Erro ao salvar a anotação. Tente novamente.', 'error');
        }
    }
    
    handleVoiceRecognition() {
        const { voiceBtn, contentInput } = this._elements;
        
        if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
            this.showStatusMessage('Reconhecimento de voz não suportado neste navegador.', 'error');
            return;
        }

        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        const recognition = new SpeechRecognition();
        recognition.lang = 'pt-BR';
        recognition.continuous = false;
        recognition.interimResults = true;

        recognition.onstart = () => {
            this.showStatusMessage('Ouvindo... Fale agora.', 'success');
            voiceBtn.disabled = true;
            voiceBtn.innerHTML = '<span class="icon">🎙️</span> Ouvindo...';
            voiceBtn.classList.add('listening');
        };

        recognition.onresult = (event) => {
            const interimTranscript = Array.from(event.results)
                .map(result => result[0].transcript)
                .join('');
            
            contentInput.value += ' ' + interimTranscript;
            
            // Atualizar status enquanto fala
            this.showStatusMessage('Reconhecendo: ' + interimTranscript, 'success');
        };

        recognition.onerror = (event) => {
            console.error('Erro de reconhecimento:', event.error);
            
            if (event.error === 'not-allowed') {
                this.showStatusMessage('Permissão de microfone negada. Verifique as configurações do seu navegador.', 'error');
            } else if (event.error === 'no-speech') {
                this.showStatusMessage('Nenhuma fala detectada. Tente novamente.', 'warning');
            } else {
                this.showStatusMessage(`Erro: ${event.error}`, 'error');
            }
            
            this.resetVoiceButton();
        };

        recognition.onend = () => {
            this.showStatusMessage('Reconhecimento de voz finalizado.', 'success');
            this.resetVoiceButton();
        };

        try {
            recognition.start();
        } catch (e) {
            console.error('Erro ao iniciar reconhecimento:', e);
            this.showStatusMessage('Erro ao iniciar o reconhecimento de voz.', 'error');
            this.resetVoiceButton();
        }
    }
    
    resetVoiceButton() {
        const { voiceBtn } = this._elements;
        voiceBtn.disabled = false;
        voiceBtn.innerHTML = '<span class="icon">🎤</span> Usar Voz';
        voiceBtn.classList.remove('listening');
    }
    
    handleClear() {
        const { titleInput, contentInput, statusMessage } = this._elements;
        
        // Animação de limpeza
        titleInput.style.transition = "opacity 0.3s";
        contentInput.style.transition = "opacity 0.3s";
        
        titleInput.style.opacity = "0.5";
        contentInput.style.opacity = "0.5";
        
        setTimeout(() => {
            titleInput.value = '';
            contentInput.value = '';
            titleInput.style.opacity = "1";
            contentInput.style.opacity = "1";
            contentInput.style.height = 'auto';
            statusMessage.textContent = '';
            statusMessage.className = '';
        }, 300);
    }

    showStatusMessage(message, type = '') {
        const { statusMessage } = this._elements;
        statusMessage.textContent = message;
        statusMessage.className = type;
        statusMessage.classList.add('visible');
        
        // Auto-hide após 5 segundos para mensagens de sucesso
        if (type === 'success') {
            setTimeout(() => {
                statusMessage.classList.remove('visible');
            }, 5000);
        }
    }
}

// Componente para a lista de notas
class NoteList extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.notes = [];
    }

    connectedCallback() {
        this.loadNotes();
        this.render();
        
        // Adicionar listener para o evento notesUpdated
        document.addEventListener('notesUpdated', this.handleNotesUpdated.bind(this));
    }
    
    disconnectedCallback() {
        // Remover listener ao desmontar componente para evitar vazamentos de memória
        document.removeEventListener('notesUpdated', this.handleNotesUpdated.bind(this));
    }
    
    handleNotesUpdated() {
        this.loadNotes();
        this.render();
    }

    loadNotes() {
        this.notes = NotesManager.getAllNotes();
        // Organizar notas por data (mais recentes primeiro)
        this.notes.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }
    
    getStyles() {
        return `
            :host {
                display: block;
            }
            
            h2 {
                color: var(--accent-color, #4361ee);
                font-size: 1.5rem;
                margin-bottom: 1.2rem;
            }
            
            .note-item {
                border: none;
                border-radius: var(--border-radius, 10px);
                padding: 1.5rem;
                margin-bottom: 1.5rem;
                background-color: var(--card-bg, rgba(255, 255, 255, 0.8));
                box-shadow: var(--card-shadow, 0 8px 16px rgba(0,0,0,0.1));
                transition: all 0.3s ease;
                position: relative;
                backdrop-filter: blur(10px);
                -webkit-backdrop-filter: blur(10px);
                animation: fadeIn 0.5s ease-out;
            }
            
            @keyframes fadeIn {
                from { opacity: 0; transform: translateY(20px); }
                to { opacity: 1; transform: translateY(0); }
            }
            
            .note-item:hover {
                transform: translateY(-5px);
                box-shadow: 0 12px 20px rgba(0,0,0,0.2);
            }
            
            h3 {
                margin-top: 0;
                margin-bottom: 1rem;
                color: var(--accent-color, #4361ee);
                border-bottom: 1px solid rgba(128, 128, 128, 0.2);
                padding-bottom: 0.8rem;
            }
            
            .note-content {
                margin-bottom: 1rem;
                line-height: 1.6;
                white-space: pre-wrap;
            }
            
            .note-meta {
                font-size: 0.85rem;
                color: #666;
                margin-bottom: 1rem;
                font-style: italic;
            }
            
            .note-actions {
                display: flex;
                gap: 10px;
                margin-top: 1rem;
                flex-wrap: wrap;
            }
            
            button {
                display: inline-flex;
                align-items: center;
                justify-content: center;
                gap: 8px;
                padding: 10px 15px;
                background-color: var(--accent-color, #4361ee);
                color: white;
                border: none;
                border-radius: var(--border-radius, 8px);
                cursor: pointer;
                transition: all 0.3s ease;
                font-weight: 500;
                box-shadow: 0 2px 5px rgba(0,0,0,0.1);
            }
            
            button:hover {
                transform: translateY(-2px);
                box-shadow: 0 4px 8px rgba(0,0,0,0.15);
            }
            
            button:active {
                transform: translateY(1px);
            }
            
            .delete-btn {
                background-color: var(--danger-color, #e74c3c);
            }
            
            .share-btn {
                background-color: var(--success-color, #2ecc71);
            }
            
            .icon {
                font-size: 1.2rem;
                line-height: 1;
            }
            
            .empty-state {
                text-align: center;
                padding: 3rem 1rem;
                color: #666;
                background-color: var(--card-bg, rgba(255, 255, 255, 0.8));
                border-radius: var(--border-radius, 10px);
                box-shadow: var(--card-shadow, 0 8px 16px rgba(0,0,0,0.1));
            }
            
            .empty-icon {
                font-size: 3rem;
                margin-bottom: 1rem;
                opacity: 0.5;
            }
            
            .empty-hint {
                font-style: italic;
                opacity: 0.7;
            }
            
            @media (max-width: 600px) {
                .note-actions {
                    flex-direction: column;
                }
                
                button {
                    width: 100%;
                }
            }
        `;
    }
    
    getEmptyState() {
        return `
            <div class="empty-state">
                <div class="empty-icon">📝</div>
                <p>Nenhuma anotação encontrada.</p>
                <p class="empty-hint">Crie sua primeira anotação usando o formulário acima.</p>
            </div>`;
    }
    
    getNoteHTML(note) {
        const formattedDate = Utils.formatDate(note.createdAt);
        
        return `
            <div class="note-item" data-id="${note.id}">
                <h3>${Utils.escapeHTML(note.title)}</h3>
                <div class="note-content">${this.formatContent(note.content)}</div>
                <div class="note-meta">Criado em: ${formattedDate}</div>
                <div class="note-actions">
                    <button class="share-btn" data-id="${note.id}"><span class="icon">📤</span> Compartilhar</button>
                    <button class="delete-btn" data-id="${note.id}"><span class="icon">🗑️</span> Excluir</button>
                </div>
            </div>
        `;
    }

    render() {
        let notesHTML = this.notes.length === 0 
            ? this.getEmptyState() 
            : this.notes.map(note => this.getNoteHTML(note)).join('');

        this.shadowRoot.innerHTML = `
            <style>${this.getStyles()}</style>
            <h2>📋 Suas Anotações</h2>
            <div id="notes-container">${notesHTML}</div>
        `;

        this.setupListeners();
    }

    formatContent(content) {
        if (!content) return '<em>Sem conteúdo</em>';
        
        // Escape HTML para prevenir XSS
        const escaped = Utils.escapeHTML(content);
        
        // Converter URLs para links clicáveis
        return escaped.replace(
            /(https?:\/\/[^\s]+)/g, 
            '<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>'
        );
    }

    setupListeners() {
        // Event delegation para melhor performance
        const container = this.shadowRoot.getElementById('notes-container');
        
        if (!container) return;
        
        container.addEventListener('click', (e) => {
            const target = e.target.closest('button');
            if (!target) return;
            
            const noteId = parseInt(target.dataset.id);
            
            if (target.classList.contains('share-btn')) {
                this.shareNote(noteId, target);
            } else if (target.classList.contains('delete-btn')) {
                this.deleteNote(noteId, target.closest('.note-item'));
            }
        });
    }
    
    shareNote(id, button) {
        const note = this.notes.find(n => n.id === id);
        if (!note) return;
        
        if (navigator.share) {
            navigator.share({
                title: note.title,
                text: note.content,
            }).then(() => {
                // Mostrar feedback de sucesso
                button.textContent = "Compartilhado!";
                setTimeout(() => {
                    button.innerHTML = '<span class="icon">📤</span> Compartilhar';
                }, 2000);
            }).catch(err => {
                console.error('Falha ao compartilhar:', err);
            });
        } else {
            alert('Compartilhamento não suportado neste navegador.');
        }
    }
    
    deleteNote(id, noteElement) {
        // Confirmar exclusão
        if (confirm('Tem certeza que deseja excluir esta anotação?')) {
            // Adicionar efeito visual antes de remover
            noteElement.style.opacity = '0';
            noteElement.style.transform = 'scale(0.9) translateY(-10px)';
            
            setTimeout(() => {
                NotesManager.deleteNote(id);
            }, 300);
        }
    }
}

// Registrar os componentes
customElements.define('note-editor', NoteEditor);
customElements.define('note-list', NoteList);
