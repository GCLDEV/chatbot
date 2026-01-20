import { StatusBar } from 'expo-status-bar';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Clipboard, Keyboard, KeyboardAvoidingView, Platform, TouchableOpacity, useColorScheme, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AlertDialog, AlertDialogBackdrop, AlertDialogBody, AlertDialogCloseButton, AlertDialogContent, AlertDialogFooter, AlertDialogHeader } from '@/components/ui/alert-dialog';
import { Avatar } from '@/components/ui/avatar';
import { Button, ButtonText } from '@/components/ui/button';
import { Heading } from '@/components/ui/heading';
import { HStack } from '@/components/ui/hstack';
import { Icon } from '@/components/ui/icon';
import { Input, InputField } from '@/components/ui/input';
import { ScrollView } from '@/components/ui/scroll-view';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';

import { Bot, Send, Trash2 } from 'lucide-react-native';

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
  const [showClearDialog, setShowClearDialog] = useState(false);
  const [showCopyDialog, setShowCopyDialog] = useState(false);
  const [copyDialogMessage, setCopyDialogMessage] = useState('');
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
    setShowClearDialog(true);
  }, []);

  const handleClearConfirm = useCallback(() => {
    clearMessages();
    setShowClearDialog(false);
  }, [clearMessages]);

  const copyLastBotMessage = useCallback(async () => {
    const lastBotMessage = [...state.messages]
      .reverse()
      .find(msg => msg.isBot);
    
    if (lastBotMessage) {
      try {
        Clipboard.setString(lastBotMessage.text);
        setCopyDialogMessage('Mensagem copiada para a área de transferência!');
        setShowCopyDialog(true);
      } catch (error) {
        setCopyDialogMessage('Não foi possível copiar a mensagem.');
        setShowCopyDialog(true);
      }
    } else {
      setCopyDialogMessage('Não há mensagens do bot para copiar.');
      setShowCopyDialog(true);
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
          <Avatar size="sm" className="mt-1 bg-emerald-500 shadow-lg border border-emerald-400">
            <Icon as={Bot} size="sm" className="text-white" />
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
    <SafeAreaView className="flex-1 bg-gray-900">
      <StatusBar style="light" />

      {/* Modern Dark Header */}
      <View className="bg-gray-800 px-4 py-3 shadow-lg border-b border-gray-700">
        <HStack space="md" className="items-center justify-between">
          <HStack space="md" className="items-center flex-1">
            <Avatar size="md" className="bg-emerald-500 border-2 border-emerald-400 shadow-lg">
              <Icon as={Bot} size="md" className="text-white" />
            </Avatar>
            <VStack className="flex-1">
              <Heading size="lg" className="text-gray-100 font-bold">
                ChatBot Assistant
              </Heading>
              <Text size="xs" className="text-emerald-400 font-medium">
                {state.isTyping ? 'digitando...' : 'online'}
              </Text>
            </VStack>
          </HStack>
          
          {/* Ações */}
          <HStack space="sm" className="items-center">                        
            <TouchableOpacity
              onPress={clearChat}
              className="p-2 rounded-full bg-red-500/10 hover:bg-red-500/20"
              disabled={state.messages.length === 0}
            >
              <Icon 
                as={Trash2} 
                className={state.messages.length > 0 ? "text-red-400" : "text-gray-500"} 
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

        {/* Chat Area with Modern Dark background */}
        <View className="flex-1 bg-gray-900">
          <ScrollView
            ref={scrollViewRef}
            className="flex-1 px-3 py-2"
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 20 }}
            onContentSizeChange={scrollToBottom}
            onLayout={scrollToBottom}
          >
            <VStack space="sm" className='mt-4'>
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

        {/* Modern Dark Input Area */}
        <View className="px-3 py-3 bg-gray-800 border-t border-gray-700">
          <HStack space="sm" className="items-end">
            <Input className="flex-1 bg-gray-700 rounded-3xl border border-gray-600 min-h-[44px] shadow-lg">
              <InputField
                placeholder="Digite uma mensagem"
                placeholderTextColor="#9CA3AF"
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
              className={`w-12 h-12 rounded-full items-center justify-center shadow-lg ${
                inputText.trim() && !state.isTyping ? 'bg-emerald-500' : 'bg-gray-600'
                }`}
            >
              <Icon
                as={Send}
                className={inputText.trim() && !state.isTyping ? 'text-white' : 'text-gray-400'}
                size="sm"
              />
            </TouchableOpacity>
          </HStack>
        </View>
      </KeyboardAvoidingView>

      {/* AlertDialog para limpar conversa */}
      <AlertDialog isOpen={showClearDialog} onClose={() => setShowClearDialog(false)}>
        <AlertDialogBackdrop />
        <AlertDialogContent className="bg-gray-800 border border-gray-700">
          <AlertDialogHeader>
            <Heading className="text-gray-100" size="md">
              Limpar conversa
            </Heading>
            <AlertDialogCloseButton>
              <Icon as={Trash2} size="sm" className="text-gray-400" />
            </AlertDialogCloseButton>
          </AlertDialogHeader>
          <AlertDialogBody>
            <Text className="text-gray-300">
              Tem certeza que deseja apagar todas as mensagens? Esta ação não pode ser desfeita.
            </Text>
          </AlertDialogBody>
          <AlertDialogFooter className="gap-3 mt-8">
            <Button
              variant="outline"
              onPress={() => setShowClearDialog(false)}
              className="border-gray-600"
            >
              <ButtonText className="text-gray-300">Cancelar</ButtonText>
            </Button>
            <Button
              className="bg-red-600"
              onPress={handleClearConfirm}
            >
              <ButtonText className="text-white">Limpar</ButtonText>
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* AlertDialog para feedback de cópia */}
      <AlertDialog isOpen={showCopyDialog} onClose={() => setShowCopyDialog(false)}>
        <AlertDialogBackdrop />
        <AlertDialogContent className="bg-gray-800 border border-gray-700">
          <AlertDialogHeader>
            <Heading className="text-gray-100" size="md">
              {copyDialogMessage.includes('copiada') ? 'Copiado!' : copyDialogMessage.includes('possível') ? 'Erro' : 'Aviso'}
            </Heading>
            <AlertDialogCloseButton>
              <Icon as={Bot} size="sm" className="text-gray-400" />
            </AlertDialogCloseButton>
          </AlertDialogHeader>
          <AlertDialogBody>
            <Text className="text-gray-300">
              {copyDialogMessage}
            </Text>
          </AlertDialogBody>
          <AlertDialogFooter>
            <Button
              className="bg-emerald-500"
              onPress={() => setShowCopyDialog(false)}
            >
              <ButtonText className="text-white">OK</ButtonText>
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </SafeAreaView>
  );
}
