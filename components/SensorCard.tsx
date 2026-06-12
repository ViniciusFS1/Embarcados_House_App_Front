// components/SensorCard.tsx
import React from 'react';
import { StyleSheet, Text, View, useColorScheme } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface SensorCardProps {
  name: string;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  isTriggered: boolean;
  isConnected: boolean;
}

export const SensorCard: React.FC<SensorCardProps> = ({ name, icon, isTriggered, isConnected }) => {
  const isDark = useColorScheme() === 'dark';
  const statusColor = !isConnected ? "#94a3b8" : (isTriggered ? "#ef4444" : "#22c55e");
  const bgColor = !isConnected ? (isDark ? '#1F2937' : '#e2e8f0') : (isTriggered ? '#ef4444' : (isDark ? '#1F2937' : '#fff'));

  return (
    <View style={[styles.card, { backgroundColor: bgColor, borderColor: isDark ? '#374151' : '#e2e8f0', opacity: isConnected ? 1 : 0.6 }]}>
      <View style={[styles.iconContainer, { backgroundColor: isTriggered && isConnected ? 'rgba(255,255,255,0.2)' : 'rgba(148,163,184,0.1)' }]}>
        <MaterialCommunityIcons name={icon} size={32} color={isTriggered && isConnected ? "#fff" : (isDark ? "#94a3b8" : "#64748b")} />
      </View>
      <View style={styles.infoContainer}>
        <Text style={[styles.sensorName, { color: isTriggered && isConnected ? "#fff" : (isDark ? "#f1f5f9" : "#1e293b") }]}>{name}</Text>
        <Text style={[styles.statusText, { color: isTriggered && isConnected ? "#fee2e2" : "#94a3b8" }]}>
          {!isConnected ? "Indisponível" : (isTriggered ? "ALERTA" : "Seguro")}
        </Text>
      </View>
      <View style={[styles.badge, { backgroundColor: statusColor }]}>
        <Text style={styles.badgeText}>{!isConnected ? "OFF" : (isTriggered ? "!" : "OK")}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: { flexDirection: 'row', alignItems: 'center', padding: 20, borderRadius: 20, borderWidth: 1 },
  iconContainer: { width: 52, height: 52, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  infoContainer: { flex: 1, marginLeft: 16 },
  sensorName: { fontSize: 16, fontWeight: 'bold' },
  statusText: { fontSize: 13, marginTop: 2 },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },
  badgeText: { color: '#fff', fontSize: 11, fontWeight: 'bold' }
});
