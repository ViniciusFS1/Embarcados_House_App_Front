// app/index.tsx
import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, ScrollView, SafeAreaView, useColorScheme, ActivityIndicator, Alert, Pressable } from 'react-native';
import { SystemToggleButton } from '../components/SystemToggleButton';
import { SensorCard } from '../components/SensorCard';

const API_BASE_URL = 'https://embarcados.glitchdev.cloud';
const WS_BASE_URL = 'ws://embarcados.glitchdev.cloud';

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
  const [isToggling, setIsToggling] = useState<boolean>(false); 
  
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  
  const ws = useRef<WebSocket | null>(null);
  const reconnectTimeout = useRef<NodeJS.Timeout | null>(null);
  const statusInterval = useRef<NodeJS.Timeout | null>(null);
  const isUpdatingBackground = useRef<boolean>(false);

  const verifyCurrentStatus = async (showErrorAlert = false) => {
    try {
      const response = await fetch(`${API_BASE_URL}/status`);
      if (!response.ok) throw new Error();
      const data = await response.json();
      
      const serverArmed = data.armed === 1;
      
      // Só altera o estado se o valor bruto realmente mudou
      setIsArmed(prev => (prev !== serverArmed ? serverArmed : prev));
      setIsServerOnline(true);
    } catch (error) {
      setIsServerOnline(false);
      if (showErrorAlert) {
        Alert.alert("Erro de Conexão", "Não foi possível sincronizar com o servidor.");
      }
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
    if (isToggling) return; 
    setIsToggling(true); 

    const nextState = isArmed ? 0 : 1;
    const targetUrl = `${API_BASE_URL}/control?ativo=${nextState}`;

    try {
      const response = await fetch(targetUrl, { method: 'POST' });
      
      if (response.ok) {
        setIsArmed(nextState === 1);
        if (nextState === 0) setSensorAlerts(initialSensorState);
      } else {
        throw new Error();
      }
    } catch (error) { 
      Alert.alert("Erro de Controle", "Falha ao enviar comando para o sistema."); 
      await verifyCurrentStatus(false);
    } finally {
      setIsToggling(false); 
    }
  };

  useEffect(() => {
    verifyCurrentStatus(true);
    connectWebSocket();
    
    statusInterval.current = setInterval(() => {
      if (!isToggling && !isUpdatingBackground.current) {
        isUpdatingBackground.current = true;
        verifyCurrentStatus(false).finally(() => {
          isUpdatingBackground.current = false;
        });
      }
    }, 4000);

    return () => { 
      ws.current?.close(); 
      if (reconnectTimeout.current) clearTimeout(reconnectTimeout.current);
      if (statusInterval.current) clearInterval(statusInterval.current);
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
        
        <View style={styles.buttonWrapper}>
          <SystemToggleButton isArmed={isArmed} onPress={toggleSystemControl} />
          {isToggling && (
            <Pressable 
              style={[StyleSheet.absoluteFillObject, styles.shield]} 
              onPress={() => {}} 
            />
          )}
        </View>
        
        <View style={styles.grid}>
          {/* CORRIGIDO: Removido o 'isArmed &&' para isolar o estado dos sensores do polling do botão */}
          <SensorCard 
            name="Garagem (Ultrassônico)" 
            icon="arrow-expand-horizontal" 
            isTriggered={sensorAlerts.ultrassonico} 
            isConnected={isServerOnline} 
          />
          <SensorCard 
            name="Presença Sala (PIR)" 
            icon="motion-sensor" 
            isTriggered={sensorAlerts.pir} 
            isConnected={isServerOnline} 
          />
          <SensorCard 
            name="Corredor (Obstáculos)" 
            icon="sensor" 
            isTriggered={sensorAlerts.obstaculos} 
            isConnected={isServerOnline} 
          />
          <SensorCard 
            name="Porta Principal (Reed 1)" 
            icon="door" 
            isTriggered={sensorAlerts.porta_principal} 
            isConnected={isServerOnline} 
          />
          <SensorCard 
            name="Janela (Reed 2)" 
            icon="window-maximize" 
            isTriggered={sensorAlerts.janela} 
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
  scrollContent: { padding: 20, gap: 20 },
  buttonWrapper: { position: 'relative' },
  shield: { backgroundColor: 'transparent', zIndex: 9999 },
  grid: { gap: 16 }
});
