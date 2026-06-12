// app/index.tsx
import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, ScrollView, SafeAreaView, useColorScheme, ActivityIndicator, Alert } from 'react-native';
import { SystemToggleButton } from '../components/SystemToggleButton';
import { SensorCard } from '../components/SensorCard';

const API_BASE_URL = 'http://192.168.15.117:8000';
const WS_BASE_URL = 'ws://192.168.15.117:8000';

// Definição da estrutura dos sensores do sistema
interface SensorStates {
  ultrassonico: boolean;
  pir: boolean;
  obstaculos: boolean;
  porta_principal: boolean;
  janela: boolean;
}

const initialSensorState: SensorStates = {
  ultrassonico: false,
  pir: false,
  obstaculos: false,
  porta_principal: false,
  janela: false,
};

export default function HomeScreen() {
  const [isArmed, setIsArmed] = useState<boolean>(false);
  const [sensorAlerts, setSensorAlerts] = useState<SensorStates>(initialSensorState);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isServerOnline, setIsServerOnline] = useState<boolean>(false);
  
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const ws = useRef<WebSocket | null>(null);
  const reconnectTimeout = useRef<NodeJS.Timeout | null>(null);

  const fetchInitialStatus = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/status`);
      if (!response.ok) throw new Error();
      const data = await response.json();
      setIsArmed(data.armed === 1);
      setIsServerOnline(true);
    } catch (error) {
      setIsServerOnline(false);
      Alert.alert("Erro de Conexão", "Não foi possível buscar o status inicial.");
    } finally {
      setIsLoading(false);
    }
  };

  const connectWebSocket = () => {
    ws.current = new WebSocket(`${WS_BASE_URL}/ws/alerts`);
    
    ws.current.onopen = () => setIsServerOnline(true);
    
    ws.current.onmessage = (e) => {
      try {
        const data = JSON.parse(e.data);
        
        // Espera um JSON do tipo: { "sensor": "pir", "alert": true }
        if (data.sensor && data.alert !== undefined) {
          setSensorAlerts(prev => ({
            ...prev,
            [data.sensor]: data.alert
          }));
        }
      } catch (err) {
        console.error("Erro ao processar mensagem do WS:", err);
      }
    };
    
    ws.current.onerror = () => setIsServerOnline(false);
    
    ws.current.onclose = () => {
      setIsServerOnline(false);
      if (reconnectTimeout.current) clearTimeout(reconnectTimeout.current);
      reconnectTimeout.current = setTimeout(connectWebSocket, 5000);
    };
  };

  const toggleSystemControl = async () => {
    const nextState = isArmed ? 0 : 1;
    try {
      const response = await fetch(`${API_BASE_URL}/control?ativo=${nextState}`, { method: 'POST' });
      if (response.ok) {
        setIsArmed(nextState === 1);
        // Reseta todos os alertas se o alarme for desligado pelo usuário
        if (nextState === 0) setSensorAlerts(initialSensorState);
      } else {
        throw new Error();
      }
    } catch (error) { 
      Alert.alert("Erro", "Falha ao comunicar com o ESP32."); 
    }
  };

  useEffect(() => {
    fetchInitialStatus();
    connectWebSocket();
    
    return () => { 
      ws.current?.close(); 
      if (reconnectTimeout.current) clearTimeout(reconnectTimeout.current);
    };
  }, []);

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={isDark ? '#fff' : '#000'} />
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: isDark ? '#111827' : '#F8FAFC' }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        <SystemToggleButton isArmed={isArmed} onPress={toggleSystemControl} />
        
        <View style={styles.grid}>
          <SensorCard 
            name="Garagem (Ultrassônico)" 
            icon="arrow-expand-horizontal" 
            isTriggered={isArmed && sensorAlerts.ultrassonico} 
            isConnected={isServerOnline} 
          />
          <SensorCard 
            name="Presença Sala (PIR)" 
            icon="motion-sensor" 
            isTriggered={isArmed && sensorAlerts.pir} 
            isConnected={isServerOnline} 
          />
          <SensorCard 
            name="Corredor (Obstáculos)" 
            icon="sensor" 
            isTriggered={isArmed && sensorAlerts.obstaculos} 
            isConnected={isServerOnline} 
          />
          <SensorCard 
            name="Porta Principal (Reed 1)" 
            icon="door" 
            isTriggered={isArmed && sensorAlerts.porta_principal} 
            isConnected={isServerOnline} 
          />
          <SensorCard 
            name="Janela (Reed 2)" 
            icon="window-maximize" 
            isTriggered={isArmed && sensorAlerts.janela} 
            isConnected={isServerOnline} 
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  scrollContent: { padding: 20, gap: 20 }, // Adicionado gap para separar botão do grid
  grid: { gap: 16 }
});
