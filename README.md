# Aplicativo de Anotações Protegidas (PWA)

Uma Aplicação Web Progressiva (PWA) para criar, armazenar e compartilhar anotações de forma segura, com autenticação biométrica.

**[➡️ Como Usar](#como-usar)**

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

## Como usar

Entre nesse [link](https://anotacoes.squareweb.app/) ou nesse [link](https://matheushmafra.github.io/atividadem1_dispositivos_moveis/)

ou baixe o código fonte e execute localmente.

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

- HTML5, CSS3, JavaScript
- Web Components e Shadow DOM para componentes reutilizáveis
- Service Workers para funcionamento offline
- Web Storage API para armazenamento local
- APIs modernas:
  - Web Authentication API
  - Speech Recognition API
  - Web Share API
- Flask e Waitress para servir a aplicação no servidor
- Python para backend (opcional, apenas para servir a aplicação)

## Estrutura do Projeto

```text
/
├── index.html           # Página principal da aplicação
├── manifest.json        # Configuração da PWA
├── sw.js               # Service Worker para funcionalidade offline
├── app.py              # Servidor Python usando Flask e Waitress, usado para servir a aplicação
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
