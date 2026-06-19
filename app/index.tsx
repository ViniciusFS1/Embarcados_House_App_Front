// app/index.tsx
import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, ScrollView, SafeAreaView, useColorScheme, ActivityIndicator, Alert, Pressable } from 'react-native';
import { SystemToggleButton } from '../components/SystemToggleButton';
import { SensorCard } from '../components/SensorCard';

const API_BASE_URL = 'https://embarcados.glitchdev.cloud';
const WS_BASE_URL = 'wss://embarcados.glitchdev.cloud';

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
  // 0 = Armado, 1 = Desarmado, 2 = Ativado
  const [systemStatus, setSystemStatus] = useState<number>(1); 
  const [sensorAlerts, setSensorAlerts] = useState<SensorStates>(initialSensorState);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isServerOnline, setIsServerOnline] = useState<boolean>(false);
  const [isToggling, setIsToggling] = useState<boolean>(false); 
  
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  
  const wsAlerts = useRef<WebSocket | null>(null);
  const wsStatus = useRef<WebSocket | null>(null);
  
  const alertsReconnectTimeout = useRef<NodeJS.Timeout | null>(null);
  const statusReconnectTimeout = useRef<NodeJS.Timeout | null>(null);

  // Executado apenas uma vez no início para garantir o estado inicial correto caso o WS demore a conectar
  const verifyCurrentStatus = async (showErrorAlert = false) => {
    try {
      const response = await fetch(`${API_BASE_URL}/status`);
      if (!response.ok) throw new Error();
      const data = await response.json();
      
      const serverStatus = data.status !== undefined ? data.status : (data.armed === 1 ? 0 : 1);
      
      setSystemStatus(prev => (prev !== serverStatus ? serverStatus : prev));
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

  const connectAlertsWebSocket = () => {
    wsAlerts.current = new WebSocket(`${WS_BASE_URL}/ws/alerts`);
    wsAlerts.current.onopen = () => setIsServerOnline(true);
    
    wsAlerts.current.onmessage = (e) => {
      try {
        const data = JSON.parse(e.data);
        if (data.sensor && data.alert !== undefined) {
          setSensorAlerts(prev => ({
            ...prev,
            [data.sensor]: data.alert
          }));
        }
      } catch (err) {
        console.error("Erro ao processar mensagem do WS de Alertas:", err);
      }
    };
    
    wsAlerts.current.onerror = () => setIsServerOnline(false);
    wsAlerts.current.onclose = () => {
      setIsServerOnline(false);
      if (alertsReconnectTimeout.current) clearTimeout(alertsReconnectTimeout.current);
      alertsReconnectTimeout.current = setTimeout(connectAlertsWebSocket, 5000);
    };
  };

  const connectStatusWebSocket = () => {
    wsStatus.current = new WebSocket(`${WS_BASE_URL}/ws/status`);
    wsStatus.current.onopen = () => setIsServerOnline(true);
    
    wsStatus.current.onmessage = (e) => {
      try {
        const data = JSON.parse(e.data);
        if (data.status !== undefined) {
          setSystemStatus(data.status);
          
          if (data.status === 1) {
            setSensorAlerts(initialSensorState);
          }
        }
      } catch (err) {
        console.error("Erro ao processar mensagem do WS de Status:", err);
      }
    };
    
    wsStatus.current.onerror = () => setIsServerOnline(false);
    wsStatus.current.onclose = () => {
      setIsServerOnline(false);
      if (statusReconnectTimeout.current) clearTimeout(statusReconnectTimeout.current);
      statusReconnectTimeout.current = setTimeout(connectStatusWebSocket, 5000);
    };
  };

  const toggleSystemControl = async () => {
    if (isToggling) return; 
    setIsToggling(true); 

    const nextState = (systemStatus === 0 || systemStatus === 2) ? 0 : 1;
    const targetUrl = `${API_BASE_URL}/control?ativo=${nextState}`;

    try {
      const response = await fetch(targetUrl, { method: 'POST' });
      
      if (response.ok) {
        setSystemStatus(nextState);
        if (nextState === 1) setSensorAlerts(initialSensorState);
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
    connectAlertsWebSocket();
    connectStatusWebSocket();
    
    return () => { 
      wsAlerts.current?.close(); 
      wsStatus.current?.close();
      if (alertsReconnectTimeout.current) clearTimeout(alertsReconnectTimeout.current);
      if (statusReconnectTimeout.current) clearTimeout(statusReconnectTimeout.current);
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
          {/* Modificado: Enviando a prop 'status' com o valor numérico (0, 1, 2) */}
          <SystemToggleButton status={systemStatus} onPress={toggleSystemControl} />
          {isToggling && (
            <Pressable 
              style={[StyleSheet.absoluteFillObject, styles.shield]} 
              onPress={() => {}} 
            />
          )}
        </View>
        
        <View style={styles.grid}>
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
