import { Stack } from 'expo-router';
import { useColorScheme } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import '../../global.css';
import { GluestackUIProvider } from '../components/ui/gluestack-ui-provider';
import { ChatProvider } from '../contexts/ChatContext';

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <SafeAreaProvider>
      <GluestackUIProvider mode={colorScheme === 'dark' ? 'dark' : 'light'}>
        <ChatProvider>
          <Stack
            screenOptions={{
              headerShown: false,
              contentStyle: {
                backgroundColor: colorScheme === 'dark' ? '#000' : '#fff',
              },
            }}
          />
        </ChatProvider>
      </GluestackUIProvider>
    </SafeAreaProvider>
  );
}