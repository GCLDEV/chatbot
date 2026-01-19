import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, ReactNode, useContext, useEffect, useReducer } from 'react';

export interface Message {
  id: string;
  text: string;
  isBot: boolean;
  timestamp: Date;
  type?: 'text' | 'typing';
  isNewMessage?: boolean; // Flag para distinguir mensagens novas das carregadas
}

interface ChatState {
  messages: Message[];
  isTyping: boolean;
  isConnected: boolean;
}

type ChatAction =
  | { type: 'ADD_MESSAGE'; payload: Omit<Message, 'id' | 'timestamp'> }
  | { type: 'LOAD_MESSAGES'; payload: Message[] }
  | { type: 'SET_TYPING'; payload: boolean }
  | { type: 'SET_CONNECTED'; payload: boolean }
  | { type: 'CLEAR_MESSAGES' };

interface ChatContextType {
  state: ChatState;
  isLoaded: boolean;
  addMessage: (message: Omit<Message, 'id' | 'timestamp'>) => void;
  setTyping: (isTyping: boolean) => void;
  setConnected: (isConnected: boolean) => void;
  clearMessages: () => void;
}

const initialState: ChatState = {
  messages: [],
  isTyping: false,
  isConnected: true,
};

function chatReducer(state: ChatState, action: ChatAction): ChatState {
  switch (action.type) {
    case 'ADD_MESSAGE':
      return {
        ...state,
        messages: [
          ...state.messages,
          {
            ...action.payload,
            id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
            timestamp: new Date(),
            isNewMessage: true, // Marca mensagens recém-adicionadas
          },
        ],
      };
    
    case 'LOAD_MESSAGES':
      return {
        ...state,
        messages: action.payload.map(msg => ({ ...msg, isNewMessage: false })), // Mensagens carregadas não são novas
      };
    
    case 'SET_TYPING':
      return {
        ...state,
        isTyping: action.payload,
      };
    
    case 'SET_CONNECTED':
      return {
        ...state,
        isConnected: action.payload,
      };
    
    case 'CLEAR_MESSAGES':
      return {
        ...state,
        messages: [],
      };
    
    default:
      return state;
  }
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

interface ChatProviderProps {
  children: ReactNode;
}

export function ChatProvider({ children }: ChatProviderProps): React.JSX.Element {
  const [state, dispatch] = useReducer(chatReducer, initialState);
  const [isLoaded, setIsLoaded] = React.useState(false);

  // Carregamento do histórico ao inicializar
  useEffect(() => {
    const loadMessages = async () => {
      try {
        const storedMessages = await AsyncStorage.getItem('chatMessages');
        if (storedMessages) {
          const parsedMessages = JSON.parse(storedMessages).map((msg: any) => ({
            ...msg,
            timestamp: new Date(msg.timestamp),
          }));
          
          // Carrega todas as mensagens de uma vez para preservar os IDs
          dispatch({ type: 'LOAD_MESSAGES', payload: parsedMessages });
        }
      } catch (error) {
        console.error('Erro ao carregar mensagens:', error);
      } finally {
        setIsLoaded(true);
      }
    };

    loadMessages();
  }, []);

  // Salvar mensagens sempre que o estado mudar
  useEffect(() => {
    const saveMessages = async () => {
      try {
        await AsyncStorage.setItem('chatMessages', JSON.stringify(state.messages));
      } catch (error) {
        console.error('Erro ao salvar mensagens:', error);
      }
    };

    // Só salva se há mensagens para evitar sobrescrever na inicialização
    if (state.messages.length > 0) {
      saveMessages();
    }
  }, [state.messages]);

  const addMessage = (message: Omit<Message, 'id' | 'timestamp'>) => {
    dispatch({ type: 'ADD_MESSAGE', payload: message });
  };

  const setTyping = (isTyping: boolean) => {
    dispatch({ type: 'SET_TYPING', payload: isTyping });
  };

  const setConnected = (isConnected: boolean) => {
    dispatch({ type: 'SET_CONNECTED', payload: isConnected });
  };

  const clearMessages = async () => {
    dispatch({ type: 'CLEAR_MESSAGES' });
    try {
      await AsyncStorage.removeItem('chatMessages');
    } catch (error) {
      console.error('Erro ao limpar mensagens salvas:', error);
    }
  };

  const contextValue: ChatContextType = {
    state,
    isLoaded,
    addMessage,
    setTyping,
    setConnected,
    clearMessages,
  };

  return (
    <ChatContext.Provider value={contextValue}>
      {children}
    </ChatContext.Provider>
  );
}

export function useChat(): ChatContextType {
  const context = useContext(ChatContext);
  
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  
  return context;
}