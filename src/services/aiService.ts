import axios from 'axios';

interface AIMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface AIResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}

class AIService {
  private baseURL = 'https://api.groq.com/openai/v1/chat/completions';
  private apiKey = process.env.EXPO_PUBLIC_GROQ_API_KEY;

  constructor() {
    if (!this.apiKey) {
      console.warn('⚠️ GROQ_API_KEY não encontrada. Usando respostas simuladas.');
    }
  }

  async generateResponse(userMessage: string): Promise<string> {
    // Se não há API key, retorna resposta simulada
    if (!this.apiKey) {
      return this.getFallbackResponse(userMessage);
    }

    try {
      const messages: AIMessage[] = [
        {
          role: 'system',
          content: 'Você é um assistente virtual amigável e prestativo. Responda de forma clara, concisa e útil. Use um tom conversacional e informal. Mantenha suas respostas relativamente curtas (1-3 frases) a menos que seja necessário mais detalhes.'
        },
        {
          role: 'user',
          content: userMessage
        }
      ];

      const requestData = {
        model: 'llama-3.1-8b-instant', // Modelo rápido e gratuito
        messages,
        temperature: 0.7,
        stream: false,
      };

      const response = await axios.post<AIResponse>(
        this.baseURL,
        requestData,
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
          },
          timeout: 10000, // 10 segundos de timeout
        }
      );

      const aiResponse = response.data.choices[0]?.message?.content?.trim();
      
      if (!aiResponse) {
        throw new Error('Resposta vazia da API');
      }

      return aiResponse;
    } catch (error) {
      console.error('Erro na API da IA:', error);
      
      // Em caso de erro, retorna resposta de fallback
      return this.getFallbackResponse(userMessage);
      
    }
  }

  private getFallbackResponse(userMessage: string): string {
    const message = userMessage.toLowerCase();
    
    // Respostas inteligentes baseadas em palavras-chave
    if (message.includes('olá') || message.includes('oi') || message.includes('boa')) {
      return 'Olá! Como posso ajudá-lo hoje? 😊';
    }
    
    if (message.includes('como') && message.includes('você')) {
      return 'Eu sou um assistente virtual criado para ajudar você! Como posso ser útil?';
    }
    
    if (message.includes('ajuda') || message.includes('socorro')) {
      return 'Claro! Estou aqui para ajudar. Me diga no que posso ser útil! 🤝';
    }
    
    if (message.includes('tchau') || message.includes('adeus') || message.includes('até')) {
      return 'Até mais! Foi um prazer conversar com você! 👋';
    }
    
    if (message.includes('obrigad') || message.includes('valeu')) {
      return 'De nada! Fico feliz em ajudar! 😊';
    }
    
    if (message.includes('nome')) {
      return 'Eu sou o ChatBot Assistant! Prazer em conhecê-lo! 🤖';
    }
    
    // Resposta padrão mais inteligente
    const responses = [
      'Interessante! Me conte mais sobre isso.',
      'Entendi! Como posso ajudar você com isso?',
      'Boa pergunta! Deixe-me pensar... 🤔',
      'Posso ajudar com isso! Precisa de mais informações?',
      'Legal! Há algo específico que você gostaria de saber?'
    ];
    
    return responses[Math.floor(Math.random() * responses.length)];
  }
}

export const aiService = new AIService();