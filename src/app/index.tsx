import { StatusBar } from 'expo-status-bar';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Alert, Clipboard, Keyboard, KeyboardAvoidingView, Platform, TouchableOpacity, useColorScheme, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Avatar } from '@/components/ui/avatar';
import { Heading } from '@/components/ui/heading';
import { HStack } from '@/components/ui/hstack';
import { Icon } from '@/components/ui/icon';
import { Input, InputField } from '@/components/ui/input';
import { ScrollView } from '@/components/ui/scroll-view';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';

import { Bot, MoreVertical, Send, Trash2 } from 'lucide-react-native';

import { AnimatedMessageBubble } from '@/components/AnimatedMessageBubble';
import { TypingIndicator } from '@/components/TypingIndicator';
import { useChat } from '@/contexts/ChatContext';
import { useBotService } from '@/hooks/useBotService';

export default function ChatBotScreen() {
  const { state, isLoaded, addMessage, setTyping, clearMessages } = useChat();
  const { getBotResponse } = useBotService();
  const [inputText, setInputText] = useState('');
  const [isMounted, setIsMounted] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const scrollViewRef = useRef<ScrollView>(null);
  const colorScheme = useColorScheme();

  // Set mounted flag and add welcome message
  useEffect(() => {
    setIsMounted(true);
    return () => setIsMounted(false);
  }, []);

  // Add welcome message only after loading and if no messages exist
  useEffect(() => {
    if (isLoaded && state.messages.length === 0) {
      const timer = setTimeout(() => {
        addMessage({
          text: 'Olá! Sou seu assistente virtual. Como posso te ajudar hoje?',
          isBot: true,
        });
      }, 100);
      
      return () => clearTimeout(timer);
    }
  }, [isLoaded, state.messages.length, addMessage]);

  // Auto scroll to bottom when new messages arrive
  const scrollToBottom = useCallback(() => {
    if (isMounted && scrollViewRef.current) {
      scrollViewRef.current.scrollToEnd({ animated: true });
    }
  }, [isMounted]);

  // Keyboard listeners for better control
  useEffect(() => {
    const showSubscription = Keyboard.addListener('keyboardDidShow', (e) => {
      setKeyboardHeight(e.endCoordinates.height);
      setTimeout(() => scrollToBottom(), 100);
    });

    const hideSubscription = Keyboard.addListener('keyboardDidHide', () => {
      setKeyboardHeight(0);
    });

    return () => {
      showSubscription?.remove();
      hideSubscription?.remove();
    };
  }, [scrollToBottom]);

  const clearChat = useCallback(() => {
    Alert.alert(
      'Limpar conversa',
      'Tem certeza que deseja apagar todas as mensagens? Esta ação não pode ser desfeita.',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Limpar',
          style: 'destructive',
          onPress: () => {
            clearMessages();
          },
        },
      ]
    );
  }, [clearMessages]);

  const copyLastBotMessage = useCallback(async () => {
    const lastBotMessage = [...state.messages]
      .reverse()
      .find(msg => msg.isBot);
    
    if (lastBotMessage) {
      try {
        Clipboard.setString(lastBotMessage.text);
        Alert.alert('Copiado!', 'Mensagem copiada para a área de transferência.');
      } catch (error) {
        Alert.alert('Erro', 'Não foi possível copiar a mensagem.');
      }
    } else {
      Alert.alert('Nenhuma mensagem', 'Não há mensagens do bot para copiar.');
    }
  }, [state.messages]);

  const sendMessage = useCallback(async () => {
    if (!inputText.trim() || !isMounted) return;

    // Add user message
    addMessage({
      text: inputText.trim(),
      isBot: false,
    });

    const currentInput = inputText.trim();
    setInputText('');
    setTyping(true);

    // Dismiss keyboard
    Keyboard.dismiss();

    try {
      // Get bot response (now async)
      const { text: botText, delay = 1000 } = await getBotResponse(currentInput);

      setTimeout(() => {
        if (isMounted) {
          // Para o indicador de digitação quando a mensagem começar a aparecer
          setTyping(false);
          addMessage({
            text: botText,
            isBot: true,
          });
        }
      }, delay);
    } catch (error) {
      console.error('Erro ao obter resposta do bot:', error);
      setTimeout(() => {
        if (isMounted) {
          setTyping(false);
          addMessage({
            text: 'Ops, algo deu errado. Pode tentar novamente? 😅',
            isBot: true,
          });
        }
      }, 1000);
    }
  }, [inputText, addMessage, setTyping, getBotResponse, isMounted]);

  const TypingBubble = useMemo(() =>
    React.memo(() => (
      <View className="mb-2 px-1">
        <HStack space="sm" className="justify-start">
          <Avatar size="sm" className="mt-1 bg-emerald-100 shadow-sm">
            <Icon as={Bot} size="sm" className="text-emerald-700" />
          </Avatar>
          <View className="max-w-[85%] mr-12">
            <TypingIndicator />
          </View>
        </HStack>
      </View>
    )),
    []);

  useEffect(() => {
    if (!isMounted) return;

    const timer = setTimeout(() => {
      scrollToBottom();
    }, 100);

    return () => clearTimeout(timer);
  }, [state.messages, state.isTyping, scrollToBottom, isMounted]);

  const isDark = colorScheme === 'dark';

  return (
    <SafeAreaView className="flex-1 bg-slate-950">
      <StatusBar style={isDark ? 'light' : 'dark'} />

      {/* WhatsApp-style Header */}
      <View className="bg-emerald-600 px-4 py-3 shadow-lg">
        <HStack space="md" className="items-center justify-between">
          <HStack space="md" className="items-center flex-1">
            <Avatar size="md" className="bg-emerald-100 border-2 border-white">
              <Icon as={Bot} size="md" className="text-emerald-700" />
            </Avatar>
            <VStack className="flex-1">
              <Heading size="lg" className="text-white font-semibold">
                ChatBot Assistant
              </Heading>
              <Text size="xs" className="text-emerald-100 font-medium">
                {state.isTyping ? 'digitando...' : 'online'}
              </Text>
            </VStack>
          </HStack>
          
          {/* Ações */}
          <HStack space="sm" className="items-center">
            <TouchableOpacity
              onPress={copyLastBotMessage}
              className="p-2 rounded-full"
              disabled={!state.messages.some(msg => msg.isBot)}
            >
              <Icon 
                as={MoreVertical} 
                className={state.messages.some(msg => msg.isBot) ? "text-white" : "text-emerald-300"} 
                size="sm" 
              />
            </TouchableOpacity>
            
            <TouchableOpacity
              onPress={clearChat}
              className="p-2 rounded-full"
              disabled={state.messages.length === 0}
            >
              <Icon 
                as={Trash2} 
                className={state.messages.length > 0 ? "text-white" : "text-emerald-300"} 
                size="sm" 
              />
            </TouchableOpacity>
          </HStack>
        </HStack>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
        style={{ paddingBottom: Platform.OS === 'android' ? keyboardHeight : 0 }}
      >

        {/* Chat Area with WhatsApp-style background */}
        <View className="flex-1" style={{
          backgroundColor: '#0f172a',
          backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(30, 41, 59, 0.1) 10px, rgba(30, 41, 59, 0.1) 20px)'
        }}>
          <ScrollView
            ref={scrollViewRef}
            className="flex-1 px-3 py-2"
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 20 }}
            onContentSizeChange={scrollToBottom}
            onLayout={scrollToBottom}
          >
            <VStack space="sm">
              {state.messages.map((message, index) => (
                <AnimatedMessageBubble
                  key={message.id}
                  message={message}
                  index={index}
                />
              ))}

              {state.isTyping && <TypingBubble />}
            </VStack>
          </ScrollView>
        </View>

        {/* WhatsApp-style Input Area */}
        <View className="px-3 py-3 bg-slate-900 border-t border-slate-800">
          <HStack space="sm" className="items-end">
            <Input className="flex-1 bg-slate-800 rounded-3xl border border-slate-700 min-h-[44px]">
              <InputField
                placeholder="Digite uma mensagem"
                placeholderTextColor="#64748b"
                value={inputText}
                onChangeText={setInputText}
                multiline={true}
                maxLength={500}
                returnKeyType={Platform.OS === 'ios' ? 'send' : 'done'}
                onSubmitEditing={sendMessage}
                blurOnSubmit={false}
                className="text-white text-base px-4 py-2"
                style={{
                  lineHeight: 20,
                  textAlignVertical: 'center',
                  minHeight: 24,
                  maxHeight: 120
                }}
              />
            </Input>
            <TouchableOpacity
              onPress={sendMessage}
              disabled={!inputText.trim() || state.isTyping}
              className={`w-12 h-12 rounded-full items-center justify-center ${inputText.trim() && !state.isTyping ? 'bg-emerald-600' : 'bg-slate-700'
                }`}
            >
              <Icon
                as={Send}
                className={inputText.trim() && !state.isTyping ? 'text-white' : 'text-slate-500'}
                size="sm"
              />
            </TouchableOpacity>
          </HStack>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
