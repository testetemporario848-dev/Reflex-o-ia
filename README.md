# Reflexo - Mentor de Vida AI 🧘‍♂️✨

O **Reflexo** é um Mentor de Vida digital que utiliza a inteligência artificial do Google Gemini para fornecer reflexões profundas, conselhos práticos e afirmações positivas baseadas no contexto real do usuário.

Este projeto foi desenvolvido como um **Web App Progressivo (PWA)**, o que significa que ele pode ser instalado como um aplicativo nativo no Android e iOS, e é 100% compatível com ferramentas de conversão como **WebIntoApp**.

## 🚀 Funcionalidades Principais

- **Reflexões Sob Medida:** IA que entende o contexto emocional e prático de qualquer situação.
- **Categorias Dinâmicas:** Crie suas próprias áreas de foco (ex: "Relacionamento", "Paternidade", "Carreira") com ícones personalizados.
- **Diário Integrado:** Espaço para anotar seus insights após cada reflexão.
- **Modo Aleatório:** Pílulas de sabedoria instantâneas para momentos de pressa.
- **Sistema de Temas:** Modos Claro, Escuro e Sépia (para leitura confortável).
- **Compartilhamento Completo:** Botões dedicados para WhatsApp, Twitter, E-mail e links compartilháveis que permitem que outros vejam a mesma reflexão.

## 🛠️ Como Hospedar no GitHub Pages

Para colocar o seu aplicativo no ar gratuitamente usando o GitHub:

1. Crie um novo repositório no seu GitHub.
2. Suba todos os arquivos desta pasta para a raiz do repositório.
3. Vá em **Settings** > **Pages**.
4. Em **Build and deployment**, selecione a branch `main` (ou `master`) e a pasta `/ (root)`.
5. Clique em salvar. Em alguns minutos, seu app estará online em `https://seu-usuario.github.io/nome-do-repositorio/`.

## 📱 Transformando em App Nativo (WebIntoApp)

Este código já está preparado para o [WebIntoApp](https://www.webintoapp.com/):

1. Acesse o site do WebIntoApp e crie um novo projeto.
2. Insira a URL do seu GitHub Pages (ex: `https://seu-usuario.github.io/reflexo/`).
3. O WebIntoApp lerá automaticamente o `manifest.json` e as meta-tags do `index.html`.
4. Siga as instruções para gerar o arquivo `.apk` (Android) ou `.ipa` (iOS).

## 🔑 Configuração da API Key

O aplicativo utiliza a **Google Gemini API**. 
- Se você estiver usando o ambiente de desenvolvimento padrão deste projeto, a chave já é injetada via `process.env.API_KEY`.
- Para rodar de forma independente em outro servidor, você precisará configurar a variável de ambiente `API_KEY` com sua chave obtida em [ai.google.dev](https://ai.google.dev/).

## 📁 Estrutura do Projeto

- `App.tsx`: Lógica principal e interface do usuário.
- `index.html`: Casca do aplicativo com meta-tags de PWA e SEO.
- `sw.js`: Service Worker para funcionamento offline.
- `manifest.json`: Definições de instalação para mobile.
- `services/geminiService.ts`: Integração com a API de Inteligência Artificial.

---
Desenvolvido para ajudar você a encontrar clareza em meio ao caos. 🌿