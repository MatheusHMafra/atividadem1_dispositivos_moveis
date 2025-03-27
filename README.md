<!-- markdownlint-disable MD029 -->
# Aplicativo de Anotações Protegidas (PWA)

Uma Aplicação Web Progressiva (PWA) para criar, armazenar e compartilhar anotações de forma segura, com autenticação biométrica.

## Funcionalidades

- **Autenticação Segura**: Utiliza Web Authentication API para proteger o acesso ao aplicativo
- **Anotações por Voz**: Permite criar anotações utilizando reconhecimento de voz
- **Compartilhamento**: Compartilhamento de anotações com Web Share API
- **Armazenamento Local**: Salva anotações localmente usando Web Storage API
- **Funcionamento Offline**: Acesse suas anotações mesmo sem conexão com internet
- **Instalável**: Pode ser instalado como um aplicativo nativo

## Requisitos Técnicos

- Navegador moderno com suporte a:
  - Web Components e Shadow DOM
  - Web Authentication API
  - Speech Recognition API
  - Web Share API
  - Service Workers
  - Web Storage API

## Instalação e Execução

### Pré-requisitos

- Python 3.7 ou superior
- pip (gerenciador de pacotes do Python)

### Passos para instalação

1. Clone ou baixe este repositório
2. Navegue até a pasta do projeto
3. Instale as dependências:

```bash
pip install -r requirements.txt
```

4. Execute o servidor:

```bash
python app.py
```

5. Acesse a aplicação em seu navegador:
   - URL: [http://localhost:80](http://localhost:80)

### Solução de problemas

Se encontrar um erro relacionado ao `url_quote` ao iniciar o servidor:

```text
ImportError: cannot import name 'url_quote' from 'werkzeug.urls'
```

Significa que há um problema de compatibilidade com as versões do Flask e Werkzeug. Execute:

```bash
pip uninstall flask werkzeug
pip install flask==2.0.1 werkzeug==2.0.1
```

## Como usar

1. **Autenticação**: Ao abrir o aplicativo, clique em "Autenticar" e siga as instruções de autenticação do seu dispositivo
2. **Criar anotações**:
   - Digite título e conteúdo no formulário
   - Ou use o botão "Usar Voz" para ditar o conteúdo
3. **Gerenciar anotações**:
   - Visualize todas as suas anotações na lista
   - Use o botão "Compartilhar" para enviar a anotação para outros aplicativos
   - Exclua anotações com o botão "Excluir"
4. **Instalar como aplicativo**:
   - Clique no botão "Instalar App" quando disponível
   - Ou use a opção do navegador para instalar o site como aplicativo

## Tecnologias Utilizadas

- HTML5, CSS3, JavaScript (ES6+)
- Web Components e Shadow DOM para componentes reutilizáveis
- Service Workers para funcionamento offline
- Web Storage API para armazenamento local
- APIs modernas:
  - Web Authentication API
  - Speech Recognition API
  - Web Share API
- Flask e Waitress para servir a aplicação

## Estrutura do Projeto

```text
/
├── index.html           # Página principal da aplicação
├── manifest.json        # Configuração da PWA
├── sw.js               # Service Worker para funcionalidade offline
├── app.py              # Servidor Python usando Flask e Waitress
├── requirements.txt    # Dependências Python
├── css/
│   └── style.css       # Estilos globais
├── js/
│   ├── app.js          # Lógica principal da aplicação
│   ├── auth.js         # Gerenciamento de autenticação
│   └── components.js   # Web Components
└── image/
    └── icon.png        # Ícone da aplicação
```

## Limitações conhecidas

- A autenticação WebAuthn requer HTTPS em produção (localmente funciona em HTTP)
- Nem todos os navegadores suportam todas as APIs utilizadas (verificação feita na inicialização)
- O compartilhamento via Web Share API só funciona em dispositivos móveis ou navegadores compatíveis

---

Desenvolvido como trabalho para a disciplina de Dispositivos Móveis - Univali
