import { HStack } from '@/components/ui/hstack';
import { Text } from '@/components/ui/text';
import React, { useEffect, useRef } from 'react';
import { Animated, View } from 'react-native';

interface TypingIndicatorProps {
  className?: string;
}

export function TypingIndicator({ className = '' }: TypingIndicatorProps) {
  return (
    <View className={`bg-gray-700 px-4 py-3 rounded-tr-2xl rounded-br-2xl rounded-bl-2xl rounded-tl-md border border-gray-600 shadow-lg ${className}`}>
      <HStack space="xs" className="items-center">
        <Text size="sm" className="text-gray-300 mr-2">digitando</Text>
        <HStack space="xs" className="items-center">
          <TypingDot delay={0} />
          <TypingDot delay={200} />
          <TypingDot delay={400} />
        </HStack>
      </HStack>
    </View>
  );
}

function TypingDot({ delay }: { delay: number }) {
  const opacityAnim = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 0.3,
          duration: 300,
          useNativeDriver: true,
        }),
      ])
    );

    const timer = setTimeout(() => {
      animation.start();
    }, delay);

    return () => {
      clearTimeout(timer);
      animation.stop();
    };
  }, [opacityAnim, delay]);

  return (
    <Animated.View
      style={{
        opacity: opacityAnim,
      }}
    >
      <View className="w-2 h-2 bg-emerald-400 rounded-full" />
    </Animated.View>
  );
}