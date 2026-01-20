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
      <GluestackUIProvider mode="dark">
        <ChatProvider>
          <Stack
            screenOptions={{
              headerShown: false,
              contentStyle: {
                backgroundColor: '#111827', // gray-900
              },
            }}
          />
        </ChatProvider>
      </GluestackUIProvider>
    </SafeAreaProvider>
  );
}