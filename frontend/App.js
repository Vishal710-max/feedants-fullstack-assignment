import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AuthProvider } from './src/context/AuthContext';
import { LanguageProvider } from './src/context/LanguageContext';
import CompetitionDetailsScreen from './src/screens/CompetitionDetailsScreen';
import LoginScreen from './src/screens/LoginScreen';
import SubmissionScreen from './src/screens/SubmissionScreen';
import ReviewsScreen from './src/screens/ReviewsScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <SafeAreaProvider>
      <LanguageProvider>
        <AuthProvider>
          <NavigationContainer>
            <StatusBar style="dark" />
            <Stack.Navigator screenOptions={{ headerShown: false }}>
              <Stack.Screen name="CompetitionDetails" component={CompetitionDetailsScreen} />
              <Stack.Screen name="Login" component={LoginScreen} />
              <Stack.Screen name="Submission" component={SubmissionScreen} />
              <Stack.Screen name="Reviews" component={ReviewsScreen} />
            </Stack.Navigator>
          </NavigationContainer>
        </AuthProvider>
      </LanguageProvider>
    </SafeAreaProvider>
  );
}
