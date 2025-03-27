// Componente para o editor de notas
class NoteEditor extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    connectedCallback() {
        this.render();
        this.setupListeners();
    }

    render() {
        this.shadowRoot.innerHTML = `
            <style>
                :host {
                    display: block;
                    margin-bottom: 2rem;
                    padding: 1rem;
                    border: 1px solid var(--secondary-color);
                    border-radius: 8px;
                }
                
                h2 {
                    margin-top: 0;
                }

                textarea, input {
                    width: 100%;
                    padding: 10px;
                    margin-bottom: 10px;
                    border: 1px solid var(--secondary-color);
                    border-radius: 4px;
                    box-sizing: border-box;
                }

                .actions {
                    display: flex;
                    gap: 10px;
                }

                button {
                    padding: 10px 15px;
                    background-color: var(--secondary-color);
                    color: var(--primary-color);
                    border: none;
                    border-radius: 4px;
                    cursor: pointer;
                }

                button:hover {
                    opacity: 0.9;
                }
            </style>
            
            <h2>Nova Anotação</h2>
            <input type="text" id="note-title" placeholder="Título da anotação">
            <textarea id="note-content" placeholder="Conteúdo da anotação" rows="5"></textarea>
            <div class="actions">
                <button id="save-btn">Salvar</button>
                <button id="voice-btn">Usar Voz</button>
                <button id="clear-btn">Limpar</button>
            </div>
            <p id="status-message"></p>
        `;
    }

    setupListeners() {
        const saveBtn = this.shadowRoot.getElementById('save-btn');
        const voiceBtn = this.shadowRoot.getElementById('voice-btn');
        const clearBtn = this.shadowRoot.getElementById('clear-btn');
        const titleInput = this.shadowRoot.getElementById('note-title');
        const contentInput = this.shadowRoot.getElementById('note-content');
        const statusMessage = this.shadowRoot.getElementById('status-message');

        saveBtn.addEventListener('click', () => {
            if (!titleInput.value.trim()) {
                statusMessage.textContent = 'O título não pode estar vazio.';
                return;
            }

            const note = {
                id: Date.now(),
                title: titleInput.value,
                content: contentInput.value,
                createdAt: new Date().toISOString()
            };

            // Salvar no localStorage
            const notes = JSON.parse(localStorage.getItem('notes') || '[]');
            notes.push(note);
            localStorage.setItem('notes', JSON.stringify(notes));

            // Limpar campos
            titleInput.value = '';
            contentInput.value = '';

            // Atualizar a lista de notas
            document.dispatchEvent(new CustomEvent('notesUpdated'));
            
            statusMessage.textContent = 'Anotação salva com sucesso!';
            setTimeout(() => {
                statusMessage.textContent = '';
            }, 3000);
        });

        voiceBtn.addEventListener('click', () => {
            if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
                statusMessage.textContent = 'Reconhecimento de voz não suportado neste navegador.';
                return;
            }

            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            const recognition = new SpeechRecognition();
            recognition.lang = 'pt-BR';
            recognition.continuous = false;

            recognition.onstart = () => {
                statusMessage.textContent = 'Ouvindo...';
                voiceBtn.disabled = true;
            };

            recognition.onresult = (event) => {
                const transcript = event.results[0][0].transcript;
                contentInput.value += ' ' + transcript;
            };

            recognition.onerror = (event) => {
                statusMessage.textContent = `Erro: ${event.error}`;
                voiceBtn.disabled = false;
            };

            recognition.onend = () => {
                statusMessage.textContent = 'Reconhecimento de voz finalizado.';
                voiceBtn.disabled = false;
                setTimeout(() => {
                    statusMessage.textContent = '';
                }, 3000);
            };

            recognition.start();
        });

        clearBtn.addEventListener('click', () => {
            titleInput.value = '';
            contentInput.value = '';
            statusMessage.textContent = '';
        });
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
        
        // Ouvir por atualizações nas notas
        document.addEventListener('notesUpdated', () => {
            this.loadNotes();
            this.render();
        });
    }

    loadNotes() {
        this.notes = JSON.parse(localStorage.getItem('notes') || '[]');
        // Organizar notas por data (mais recentes primeiro)
        this.notes.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    render() {
        let notesHTML = '';
        
        if (this.notes.length === 0) {
            notesHTML = '<p>Nenhuma anotação encontrada. Crie uma nova anotação acima.</p>';
        } else {
            notesHTML = this.notes.map(note => `
                <div class="note-item" data-id="${note.id}">
                    <h3>${note.title}</h3>
                    <p>${note.content}</p>
                    <div class="note-actions">
                        <button class="share-btn">Compartilhar</button>
                        <button class="delete-btn">Excluir</button>
                    </div>
                </div>
            `).join('');
        }

        this.shadowRoot.innerHTML = `
            <style>
                :host {
                    display: block;
                }
                
                .note-item {
                    border: 1px solid var(--secondary-color);
                    border-radius: 8px;
                    padding: 1rem;
                    margin-bottom: 1rem;
                    background-color: rgba(255, 255, 255, 0.1);
                }
                
                h3 {
                    margin-top: 0;
                }
                
                .note-actions {
                    display: flex;
                    gap: 10px;
                    margin-top: 10px;
                }
                
                button {
                    padding: 8px 12px;
                    background-color: var(--secondary-color);
                    color: var(--primary-color);
                    border: none;
                    border-radius: 4px;
                    cursor: pointer;
                }
                
                button:hover {
                    opacity: 0.9;
                }
            </style>
            
            <h2>Suas Anotações</h2>
            <div id="notes-container">
                ${notesHTML}
            </div>
        `;

        this.setupListeners();
    }

    setupListeners() {
        const shareBtns = this.shadowRoot.querySelectorAll('.share-btn');
        const deleteBtns = this.shadowRoot.querySelectorAll('.delete-btn');

        shareBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const noteItem = e.target.closest('.note-item');
                const noteId = parseInt(noteItem.dataset.id);
                const note = this.notes.find(n => n.id === noteId);
                
                if (!note) return;

                if (navigator.share) {
                    navigator.share({
                        title: note.title,
                        text: note.content,
                    }).catch(err => {
                        console.error('Falha ao compartilhar:', err);
                    });
                } else {
                    alert('Compartilhamento não suportado neste navegador.');
                }
            });
        });

        deleteBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const noteItem = e.target.closest('.note-item');
                const noteId = parseInt(noteItem.dataset.id);
                
                // Remover a nota do localStorage
                const updatedNotes = this.notes.filter(n => n.id !== noteId);
                localStorage.setItem('notes', JSON.stringify(updatedNotes));
                
                // Atualizar a lista
                this.loadNotes();
                this.render();
            });
        });
    }
}

// Registrar os componentes
customElements.define('note-editor', NoteEditor);
customElements.define('note-list', NoteList);
