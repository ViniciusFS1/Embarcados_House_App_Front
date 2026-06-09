import React from 'react';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from 'react-native';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <Tabs
      screenOptions={{
        // Cores baseadas no tema do sistema
        tabBarActiveTintColor: isDark ? '#60A5FA' : '#2563EB',
        tabBarInactiveTintColor: '#94a3b8',
        tabBarStyle: {
          backgroundColor: isDark ? '#111827' : '#FFFFFF',
          borderTopWidth: 0,
          height: 60,
          paddingBottom: 8,
        },
        headerShown: true,
        headerStyle: {
          backgroundColor: isDark ? '#1F2937' : '#F8FAFC',
        },
        headerTitleStyle: {
          fontWeight: 'bold',
          color: isDark ? '#F9FAFB' : '#1e293b',
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="grid" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
