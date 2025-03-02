import React, { useEffect, useState } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View } from 'react-native';
import { Provider } from 'react-redux';
import { NavigationContainer } from '@react-navigation/native';
import * as FileSystem from 'expo-file-system';
import './src/services/firebase';
import { store } from './src/store';
import RootNavigator from './src/navigation/RootNavigator';
import Loading from './src/components/Loading';

export default function App() {
  const [isAppReady, setIsAppReady] = useState(false);

  useEffect(() => {
    const prepare = async () => {
      try {
        
        // Ensure app directories exist
        const appDir = FileSystem.documentDirectory;
        const profileImagesDir = `${appDir}profileImages/`;
        const scenarioImagesDir = `${appDir}scenarioImages/`;
        
        // Check if directories exist, create if not
        const profileDirInfo = await FileSystem.getInfoAsync(profileImagesDir);
        if (!profileDirInfo.exists) {
          await FileSystem.makeDirectoryAsync(profileImagesDir, { intermediates: true });
        }
        
        const scenarioDirInfo = await FileSystem.getInfoAsync(scenarioImagesDir);
        if (!scenarioDirInfo.exists) {
          await FileSystem.makeDirectoryAsync(scenarioImagesDir, { intermediates: true });
        }
        
        // Simulate some loading time
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (e) {
        console.warn('Error initializing app:', e);
      } finally {
        setIsAppReady(true);
      }
    };

    prepare();
  }, []);

  if (!isAppReady) {
    return <Loading />;
  }

  return (
    <Provider store={store}>
      <SafeAreaProvider>
        <NavigationContainer>
          <View style={styles.container}>
            <StatusBar style="auto" />
            <RootNavigator />
          </View>
        </NavigationContainer>
      </SafeAreaProvider>
    </Provider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});