import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider } from 'react-redux';
import { store } from './src/store/store';
import AppNavigator from './src/navigation/AppNavigator';
import { ToastProvider } from './src/context/ToastContext';
// 1. Add this import
import { GestureHandlerRootView } from 'react-native-gesture-handler';

export default function App(): React.JSX.Element {
  return (
    <Provider store={store}>
      {/* 2. Wrap everything in GestureHandlerRootView */}
      <GestureHandlerRootView style={{ flex: 1 }}>
        <SafeAreaProvider>
          <ToastProvider>
            <AppNavigator />
          </ToastProvider>
        </SafeAreaProvider>
      </GestureHandlerRootView>
    </Provider>
  );
}