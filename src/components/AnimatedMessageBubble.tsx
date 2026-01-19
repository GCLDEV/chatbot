import { TypewriterText } from '@/components/TypewriterText';
import { Avatar } from '@/components/ui/avatar';
import { HStack } from '@/components/ui/hstack';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import React, { useEffect, useRef, useState } from 'react';
import { Alert, Animated, Clipboard, Easing, TouchableOpacity, View } from 'react-native';

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

  const copyMessage = async () => {
    try {
      Clipboard.setString(message.text);
      Alert.alert('Copiado!', 'Mensagem copiada para a área de transferência.');
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível copiar a mensagem.');
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
          <Avatar size="sm" className="mt-1 bg-emerald-100 shadow-sm">
            <Icon as={Bot} size="sm" className="text-emerald-700" />
          </Avatar>
        )}
        
        <View className={`max-w-[85%] ${message.isBot ? 'mr-12' : 'ml-12'} relative`}>
          <View
            className={`px-4 py-3 shadow-sm ${
              message.isBot
                ? 'bg-white rounded-tr-2xl rounded-br-2xl rounded-bl-2xl rounded-tl-md border border-gray-200'
                : 'bg-emerald-500 rounded-tl-2xl rounded-bl-2xl rounded-br-2xl rounded-tr-md'
            }`}
          >
            {message.isBot && message.isNewMessage ? (
              <TypewriterText
                text={message.text}
                speed={50}
                className={`leading-5 ${
                  message.isBot ? 'text-gray-800' : 'text-white'
                }`}
                onComplete={() => setShowCopyButton(true)}
              />
            ) : (
              <Text
                className={`leading-5 ${
                  message.isBot ? 'text-gray-800' : 'text-white'
                }`}
              >
                {message.text}
              </Text>
            )}
            <Text
              size="xs"
              className={`mt-1 text-right ${
                message.isBot ? 'text-gray-500' : 'text-emerald-100'
              }`}
            >
              {formatTime(message.timestamp)}
            </Text>
          </View>
          
          {/* Botão de copiar para mensagens do bot */}
          {message.isBot && showCopyButton && (
            <TouchableOpacity
              onPress={copyMessage}
              className="absolute -top-2 -right-2 p-2 rounded-full bg-white shadow-md border border-gray-200"
              style={{ width: 28, height: 28, alignItems: 'center', justifyContent: 'center' }}
            >
              <Icon as={Copy} size="xs" className="text-emerald-600" />
            </TouchableOpacity>
          )}
        </View>

        {!message.isBot && (
          <Avatar size="sm" className="mt-1 bg-blue-100 shadow-sm">
            <Icon as={User} size="sm" className="text-blue-700" />
          </Avatar>
        )}
      </HStack>
    </Animated.View>
  );
}