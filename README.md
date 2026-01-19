# 🤖 ChatBot Assistant

Um chatbot moderno e inteligente construído com React Native, Expo e integração com IA usando Groq API. Interface inspirada no WhatsApp com efeitos de digitação naturais e persistência de dados.

## ✨ Funcionalidades

- 🎯 **Interface Moderna**: Design inspirado no WhatsApp com tema escuro
- 🤖 **Integração com IA**: Powered by Groq API (Llama-3.1-8b-instant)
- ⌨️ **Efeito de Digitação**: Animação natural de typewriter para respostas do bot
- 💾 **Persistência**: Histórico de mensagens salvo com AsyncStorage
- 📋 **Copiar Mensagens**: Copie facilmente as respostas do bot
- 🗑️ **Limpar Chat**: Remova todo o histórico com confirmação
- 📱 **Responsivo**: Layout adaptativo com suporte a teclado
- 🎨 **Animações Fluidas**: Transições suaves e feedback visual

## 🛠️ Stack Tecnológica

### Core
- **React Native** 0.83.1
- **Expo SDK** ~54.0.31
- **TypeScript** - Tipagem estática
- **React Navigation** - Navegação

### UI/UX
- **Gluestack UI v3** - Componentes modernos
- **NativeWind** 4.2.1 - Tailwind CSS para React Native
- **Lucide React Native** - Ícones vetoriais
- **React Native Safe Area Context** - Área segura

### Funcionalidades
- **Groq API** - Integração com IA (Llama-3.1-8b-instant)
- **AsyncStorage** - Persistência de dados
- **Axios** - Cliente HTTP
- **React Native Clipboard** - Copiar texto

### Animações
- **React Native Animated** - Animações nativas
- **Custom TypewriterText** - Efeito de digitação

## 📋 Pré-requisitos

- Node.js (versão 18 ou superior)
- npm ou yarn
- Expo CLI (`npm install -g @expo/cli`)
- Conta no [Groq](https://console.groq.com/) para obter API key

## 🚀 Como executar

### 1. Clone o repositório
```bash
git clone https://github.com/gldev/chatbot.git
cd chatbot
```

### 2. Instale as dependências
```bash
npm install
# ou
yarn install
```

### 3. Configure as variáveis de ambiente
Crie um arquivo `.env` na raiz do projeto:
```env
EXPO_PUBLIC_GROQ_API_KEY=sua_groq_api_key_aqui
```

### 4. Inicie o projeto
```bash
npx expo start
```

### 5. Execute no dispositivo
- **Android**: Escaneie o QR code com o app Expo Go
- **iOS**: Escaneie o QR code com a câmera do iPhone
- **Web**: Pressione `w` no terminal

## ⚙️ Configuração da API

### Groq API Setup

1. Acesse [console.groq.com](https://console.groq.com/)
2. Crie uma conta gratuita
3. Gere uma nova API Key
4. Adicione a key no arquivo `.env` como `EXPO_PUBLIC_GROQ_API_KEY`

### Modelos Disponíveis
O projeto está configurado para usar o modelo `llama-3.1-8b-instant`, mas você pode alterar no arquivo `src/services/aiService.ts` para outros modelos suportados:
- `llama3-70b-8192`
- `mixtral-8x7b-32768`

### Modo Fallback
Se não configurar a API key, o chatbot funciona com:
- Respostas simuladas inteligentes
- Detecção de contexto por palavras-chave
- Personalidade amigável
- Respostas variadas e naturais

## 📁 Estrutura do Projeto

```
src/
├── app/                    # Telas principais
│   ├── _layout.tsx        # Layout raiz
│   └── index.tsx          # Tela do chat
├── components/            # Componentes reutilizáveis
│   ├── AnimatedMessageBubble.tsx
│   ├── TypewriterText.tsx
│   ├── TypingIndicator.tsx
│   └── ui/               # Componentes Gluestack UI
├── contexts/             # Context API
│   └── ChatContext.tsx   # Estado global do chat
├── hooks/                # Custom hooks
│   └── useBotService.tsx # Lógica do bot
├── services/             # Serviços externos
│   └── aiService.ts      # Integração com Groq API
└── assets/               # Assets estáticos
```

## 🎨 Principais Componentes

### ChatContext
- Gerencia estado global das mensagens
- Persistência com AsyncStorage
- Controle de typing indicator

### TypewriterText
- Efeito de digitação natural
- Velocidade configurável (50ms por caractere)
- Aplicado apenas a mensagens novas do bot

### AnimatedMessageBubble
- Animações de entrada suaves
- Diferenciação visual usuário/bot
- Botão de copiar integrado
- Timestamps formatados

### AIService
- Integração com Groq API
- Sistema de fallback robusto
- Tratamento de erros inteligente
- Sem limite de tokens

## 📱 Funcionalidades Detalhadas

### 💬 Chat Interface
- Layout similar ao WhatsApp
- Bubbles diferenciados para usuário e bot
- Timestamps em cada mensagem
- Auto-scroll para novas mensagens
- KeyboardAvoidingView otimizado

### 🤖 Bot Features
- Respostas contextuais ilimitadas
- Efeito typewriter apenas para mensagens novas
- Mensagens antigas aparecem instantaneamente
- Typing indicator durante processamento
- Modelo Llama-3.1-8b-instant

### 💾 Persistência
- Histórico salvo automaticamente no AsyncStorage
- Carregamento na inicialização do app
- Função limpar chat com diálogo de confirmação
- IDs únicos para prevenir duplicatas

### 📋 Clipboard
- Copiar última resposta (botão no header)
- Copiar mensagem específica (botão na bubble)
- Feedback visual de confirmação
- Tratamento de erros

## 🔧 Scripts Disponíveis

```bash
# Desenvolvimento
npm start               # Inicia o Expo
npx expo start --clear  # Inicia com cache limpo
npm run android        # Build Android
npm run ios           # Build iOS
npm run web           # Versão web

# Utilidades
npx expo install <package>  # Instalar pacotes compatíveis
npx expo doctor            # Verificar problemas
```

## 📈 Performance & Otimizações

### Implementadas
- ⚡ Componentes memoizados com React.memo
- 🔄 useCallback para funções otimizadas
- 💾 AsyncStorage para persistência eficiente
- 🎭 Animações nativas com useNativeDriver
- 📱 KeyboardAvoidingView otimizado por plataforma
- 🧹 Cleanup automático de timers e listeners

### Métricas
- 🚀 Inicialização: <2s
- ⚡ Resposta do bot: <3s  
- 💾 Histórico carregado: <1s
- 🎨 60 FPS em animações
- 🔋 Battery-friendly

## 🐛 Solução de Problemas

### Problemas Comuns

**1. Erro de API Key**
```bash
⚠️ GROQ_API_KEY não encontrada. Usando respostas simuladas.
```
- Solução: Configure a variável no arquivo `.env`

## 🛠️ Tecnologias Utilizadas

- **React Native** + **Expo**
- **TypeScript**
- **Gluestack UI v3**
- **Tailwind CSS (NativeWind)**
- **Axios**
- **Groq API**
- **Lucide Icons**