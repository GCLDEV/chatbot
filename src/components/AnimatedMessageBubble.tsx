import { TypewriterText } from '@/components/TypewriterText';
import { AlertDialog, AlertDialogBackdrop, AlertDialogBody, AlertDialogContent, AlertDialogFooter, AlertDialogHeader } from '@/components/ui/alert-dialog';
import { Avatar } from '@/components/ui/avatar';
import { Button, ButtonText } from '@/components/ui/button';
import { Heading } from '@/components/ui/heading';
import { HStack } from '@/components/ui/hstack';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, Clipboard, Easing, TouchableOpacity, View } from 'react-native';

import { Bot, Copy, User } from 'lucide-react-native';

interface AnimatedMessageBubbleProps {
  message: {
    id: string;
    text: string;
    isBot: boolean;
    timestamp: Date;
    isNewMessage?: boolean;
  };
  index: number;
}

export function AnimatedMessageBubble({ message }: AnimatedMessageBubbleProps) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;
  // Botão de copiar aparece imediatamente para mensagens antigas, após digitação para novas
  const [showCopyButton, setShowCopyButton] = useState(!message.isBot || !message.isNewMessage);
  const [showCopyDialog, setShowCopyDialog] = useState(false);
  const [copyMessage, setCopyMessage] = useState('');

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        easing: Easing.bezier(0.4, 0.0, 0.2, 1),
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 400,
        easing: Easing.bezier(0.4, 0.0, 0.2, 1),
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, slideAnim]);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('pt-BR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const handleCopyMessage = async () => {
    try {
      Clipboard.setString(message.text);
      setCopyMessage('Mensagem copiada para a área de transferência!');
      setShowCopyDialog(true);
    } catch (error) {
      setCopyMessage('Não foi possível copiar a mensagem.');
      setShowCopyDialog(true);
    }
  };

  return (
    <Animated.View
      style={{
        opacity: fadeAnim,
        transform: [
          {
            translateY: slideAnim,
          },
        ],
      }}
      className="mb-2"
    >
      <HStack
        space="sm"
        className={`${message.isBot ? 'justify-start' : 'justify-end'} px-1`}
      >
        {message.isBot && (
          <Avatar size="sm" className="mt-1 bg-emerald-500 shadow-lg border border-emerald-400">
            <Icon as={Bot} size="sm" className="text-white" />
          </Avatar>
        )}
        
        <View className={`max-w-[85%] ${message.isBot ? 'mr-12' : 'ml-12'} relative`}>
          <View
            className={`px-4 py-3 shadow-lg ${
              message.isBot
                ? 'bg-gray-700 rounded-tr-2xl rounded-br-2xl rounded-bl-2xl rounded-tl-md border border-gray-600'
                : 'bg-emerald-500 rounded-tl-2xl rounded-bl-2xl rounded-br-2xl rounded-tr-md'
            }`}
          >
            {message.isBot && message.isNewMessage ? (
              <TypewriterText
                text={message.text}
                speed={50}
                className={`leading-5 ${
                  message.isBot ? 'text-gray-100' : 'text-white'
                }`}
                onComplete={() => setShowCopyButton(true)}
              />
            ) : (
              <Text
                className={`leading-5 ${
                  message.isBot ? 'text-gray-100' : 'text-white'
                }`}
              >
                {message.text}
              </Text>
            )}
            <Text
              size="xs"
              className={`mt-1 text-right ${
                message.isBot ? 'text-gray-400' : 'text-emerald-100'
              }`}
            >
              {formatTime(message.timestamp)}
            </Text>
          </View>
          
          {/* Botão de copiar para mensagens do bot */}
          {message.isBot && showCopyButton && (
            <TouchableOpacity
              onPress={handleCopyMessage}
              className="absolute -top-2 -right-2 p-2 rounded-full bg-gray-600 shadow-lg border border-gray-500"
              style={{ width: 28, height: 28, alignItems: 'center', justifyContent: 'center' }}
            >
              <Icon as={Copy} size="xs" className="text-emerald-400" />
            </TouchableOpacity>
          )}
        </View>

        {!message.isBot && (
          <Avatar size="sm" className="mt-1 bg-blue-500 shadow-lg border border-blue-400">
            <Icon as={User} size="sm" className="text-white" />
          </Avatar>
        )}
      </HStack>

      {/* AlertDialog para feedback de cópia */}
      <AlertDialog isOpen={showCopyDialog} onClose={() => setShowCopyDialog(false)}>
        <AlertDialogBackdrop />
        <AlertDialogContent className="bg-gray-800 border border-gray-700">
          <AlertDialogHeader>
            <Heading className="text-gray-100" size="md">
              {copyMessage.includes('copiada') ? 'Copiado!' : 'Erro'}
            </Heading>
          </AlertDialogHeader>
          <AlertDialogBody>
            <Text className="text-gray-300">
              {copyMessage}
            </Text>
          </AlertDialogBody>
          <AlertDialogFooter>
            <Button
              className="bg-emerald-500 mt-8"
              onPress={() => setShowCopyDialog(false)}
            >
              <ButtonText className="text-white">OK</ButtonText>
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Animated.View>
  );
}