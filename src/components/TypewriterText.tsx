import { Text } from '@/components/ui/text';
import React, { useEffect, useState } from 'react';

interface TypewriterTextProps {
  text: string;
  speed?: number; // milliseconds per character
  className?: string;
  onComplete?: () => void;
}

export function TypewriterText({ 
  text, 
  speed = 50, // Aumentado para 50ms
  className, 
  onComplete 
}: TypewriterTextProps) {
  const [displayedText, setDisplayedText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (currentIndex < text.length) {
      const timer = setTimeout(() => {
        setDisplayedText(prev => prev + text[currentIndex]);
        setCurrentIndex(prev => prev + 1);
      }, speed);

      return () => clearTimeout(timer);
    } else if (onComplete && currentIndex === text.length) {
      onComplete();
    }
  }, [currentIndex, text, speed, onComplete]);

  // Reset when text changes
  useEffect(() => {
    setDisplayedText('');
    setCurrentIndex(0);
  }, [text]);

  return (
    <Text className={className}>
      {displayedText}
      {currentIndex < text.length && (
        <Text className="animate-pulse">|</Text>
      )}
    </Text>
  );
}