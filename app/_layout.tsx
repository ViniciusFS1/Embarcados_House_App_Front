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
        
        // CORREÇÃO NATIVA: Faz a barra de abas respeitar os botões do sistema operacional
        tabBarSafeAreaInsets: {
          bottom: true,
        },
        
        // Estilos da barra ajustados para flexibilidade dinâmica
        tabBarStyle: {
          backgroundColor: isDark ? '#111827' : '#FFFFFF',
          borderTopWidth: 0,
          elevation: 8, // Sombra no Android para destacar dos botões do sistema
          shadowColor: '#000', // Sombra no iOS
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.08,
          shadowRadius: 4,
        },
        
        // Ajuste dos rótulos para não embolar com os botões inferiores
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
          marginBottom: 4,
        },
        
        headerShown: true,
        headerStyle: {
          backgroundColor: isDark ? '#1F2937' : '#F8FAFC',
          borderBottomWidth: 1,
          borderBottomColor: isDark ? '#374151' : '#e2e8f0', // Linha sutil sob o cabeçalho
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
            <Ionicons name="grid" size={size - 2} color={color} />
          ),
        }}
      />
      {/* NOVA ABA: Tela de histórico de disparos adicionada */}
      <Tabs.Screen
        name="historico"
        options={{
          title: 'Histórico',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="time" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
