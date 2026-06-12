// app/historico.tsx
import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, FlatList, SafeAreaView, useColorScheme, ActivityIndicator, Alert } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const API_BASE_URL = 'http://192.168.15.117:8000';

interface LogItem {
  id: string;
  sensor: string;
  data_hora: string;
}

// Mapa para traduzir o ID do sensor para o mesmo nome e ícone usados no Dashboard
const sensorMap: Record<string, { name: string; icon: keyof typeof MaterialCommunityIcons.glyphMap }> = {
  ultrassonico: { name: 'Garagem (Ultrassônico)', icon: 'arrow-expand-horizontal' },
  pir: { name: 'Presença Sala (PIR)', icon: 'motion-sensor' },
  obstaculos: { name: 'Corredor (Obstáculos)', icon: 'sensor' },
  porta_principal: { name: 'Porta Principal (Reed 1)', icon: 'door' },
  janela: { name: 'Janela (Reed 2)', icon: 'window-maximize' },
};

export default function HistoricoScreen() {
  const [logs, setLogs] = useState<LogItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const fetchHistorico = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`${API_BASE_URL}/historico`);
      if (!response.ok) throw new Error();
      const data = await response.json();
      setLogs(data);
    } catch (error) {
      Alert.alert("Erro", "Não foi possível carregar o histórico de disparos.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchHistorico();
  }, []);

  const renderLogItem = ({ item }: { item: LogItem }) => {
    const sensorInfo = sensorMap[item.sensor] || { name: 'Sensor Desconhecido', icon: 'help-circle' };
    
    return (
      <View style={[
        styles.logCard, 
        { 
          backgroundColor: isDark ? '#1F2937' : '#FFFFFF', 
          borderColor: isDark ? '#374151' : '#E2E8F0' 
        }
      ]}>
        <View style={[styles.iconContainer, { backgroundColor: isDark ? 'rgba(239, 68, 68, 0.2)' : 'rgba(239, 68, 68, 0.1)' }]}>
          <MaterialCommunityIcons name={sensorInfo.icon} size={24} color="#EF4444" />
        </View>
        
        <View style={styles.infoContainer}>
          <Text style={[styles.sensorName, { color: isDark ? '#FFFFFF' : '#0F172A' }]}>
            {sensorInfo.name}
          </Text>
          <Text style={styles.dateText}>
            {item.data_hora}
          </Text>
        </View>
        
        <View style={[styles.badge, { backgroundColor: isDark ? 'rgba(239, 68, 68, 0.2)' : 'rgba(239, 68, 68, 0.1)' }]}>
          <Text style={styles.badgeText}>DISPARO</Text>
        </View>
      </View>
    );
  };

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={isDark ? '#60A5FA' : '#2563EB'} />
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: isDark ? '#111827' : '#F8FAFC' }]}>
      <FlatList
        data={logs}
        keyExtractor={(item) => item.id}
        renderItem={renderLogItem}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <MaterialCommunityIcons name="shield-check" size={48} color="#94A3B8" />
            <Text style={styles.emptyText}>Nenhum disparo registrado no histórico.</Text>
          </View>
        }
        refreshing={isLoading}
        onRefresh={fetchHistorico} // Recarrega puxando a lista para baixo
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  listContent: { padding: 20, gap: 12 },
  logCard: { flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 16, borderWidth: 1 },
  iconContainer: { width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  infoContainer: { flex: 1, marginLeft: 14 },
  sensorName: { fontSize: 15, fontWeight: 'bold' },
  dateText: { fontSize: 12, color: '#94A3B8', marginTop: 2 },
  badge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  badgeText: { color: '#EF4444', fontSize: 10, fontWeight: 'bold' },
  emptyContainer: { alignItems: 'center', justifyContent: 'center', marginTop: 60, gap: 12 },
  emptyText: { textAlign: 'center', color: '#94A3B8', fontSize: 16 }
});
