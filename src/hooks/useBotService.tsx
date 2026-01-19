import { aiService } from '@/services/aiService';
import { useCallback } from 'react';

interface BotResponse {
  text: string;
  delay?: number;
}

export function useBotService() {
  const getBotResponse = useCallback(async (userInput: string): Promise<BotResponse> => {
    try {
      // Simula delay de digitação mais realista
      const typingDelay = Math.random() * 1000 + 1500; // 1.5s - 2.5s
      
      // Chama o serviço de IA
      const aiResponse = await aiService.generateResponse(userInput);
      
      return {
        text: aiResponse,
        delay: typingDelay,
      };
    } catch (error) {
      console.error('Erro no serviço do bot:', error);
      
      // Fallback em caso de erro
      return {
        text: 'Desculpe, tive um problema para processar sua mensagem. Pode tentar novamente? 😅',
        delay: 1000,
      };
    }
  }, []);

  return { getBotResponse };
}