import React, { useState } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TouchableOpacity, 
  ScrollView, 
  SafeAreaView, 
  useColorScheme 
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function HomeScreen() {
  const [sensor1Active, setSensor1Active] = useState(false);
  const [sensor2Active, setSensor2Active] = useState(false);
  
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  // Componente de Cartão de Sensor reaproveitável
  const SensorCard = ({ name, icon, isActive, setIsActive }) => (
    <TouchableOpacity 
      activeOpacity={0.7}
      onPress={() => setIsActive(!isActive)}
      style={[
        styles.card, 
        isActive ? styles.cardActive : (isDark ? styles.cardDark : styles.cardLight)
      ]}
    >
      <View style={[
        styles.iconContainer, 
        { backgroundColor: isActive ? 'rgba(255,255,255,0.2)' : 'rgba(148,163,184,0.1)' }
      ]}>
        <MaterialCommunityIcons 
          name={icon} 
          size={32} 
          color={isActive ? "#fff" : (isDark ? "#94a3b8" : "#64748b")} 
        />
      </View>
      
      <View style={styles.infoContainer}>
        <Text style={[
          styles.sensorName, 
          { color: isActive ? "#fff" : (isDark ? "#f1f5f9" : "#1e293b") }
        ]}>
          {name}
        </Text>
        <Text style={[
          styles.statusText, 
          { color: isActive ? "#dbeafe" : "#94a3b8" }
        ]}>
          {isActive ? "Monitorando..." : "Desconectado"}
        </Text>
      </View>

      <View style={[
        styles.badge, 
        { backgroundColor: isActive ? "#22c55e" : "#ef4444" }
      ]}>
        <Text style={styles.badgeText}>{isActive ? "ON" : "OFF"}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[
      styles.container, 
      { backgroundColor: isDark ? '#111827' : '#F8FAFC' }
    ]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={[
            styles.welcomeText, 
            { color: isDark ? '#fff' : '#0f172a' }
          ]}>
            Meus Sensores
          </Text>
          <Text style={styles.subTitle}>Gerenciamento em tempo real</Text>
        </View>

        <View style={styles.grid}>
          <SensorCard 
            name="Sensor de Presença"
            icon="motion-sensor"
            isActive={sensor1Active}
            setIsActive={setSensor1Active}
          />
          
          <SensorCard 
            name="Sensor de Umidade"
            icon="water-percent"
            isActive={sensor2Active}
            setIsActive={setSensor2Active}
          />
        </View>

        {/* Resumo visual rápido */}
        <View style={[
          styles.summary, 
          { backgroundColor: isDark ? '#1F2937' : '#fff' }
        ]}>
          <Text style={[styles.summaryTitle, { color: isDark ? '#94a3b8' : '#64748b' }]}>
            Dispositivos Ativos: { [sensor1Active, sensor2Active].filter(Boolean).length } / 2
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { padding: 20 },
  header: { marginBottom: 25 },
  welcomeText: { fontSize: 28, fontWeight: 'bold' },
  subTitle: { fontSize: 16, color: '#64748b', marginTop: 4 },
  grid: { gap: 16 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 22,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'transparent',
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  cardActive: { backgroundColor: '#2563EB' },
  cardLight: { backgroundColor: '#fff', borderColor: '#e2e8f0' },
  cardDark: { backgroundColor: '#1F2937', borderColor: '#374151' },
  iconContainer: { 
    width: 56, 
    height: 56, 
    borderRadius: 16, 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  infoContainer: { flex: 1, marginLeft: 16 },
  sensorName: { fontSize: 18, fontWeight: 'bold' },
  statusText: { fontSize: 14, marginTop: 2 },
  badge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
  badgeText: { color: '#fff', fontSize: 12, fontWeight: 'bold' },
  summary: {
    marginTop: 30,
    padding: 15,
    borderRadius: 15,
    alignItems: 'center',
    borderStyle: 'dashed',
    borderWidth: 1,
    borderColor: '#94a3b8'
  },
  summaryTitle: { fontSize: 14, fontWeight: '500' }
});
