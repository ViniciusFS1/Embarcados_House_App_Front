import React from 'react';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface SystemToggleButtonProps {
  isArmed: boolean;
  onPress: () => void;
}

export const SystemToggleButton: React.FC<SystemToggleButtonProps> = ({ isArmed, onPress }) => {
  return (
    <TouchableOpacity 
      activeOpacity={0.8}
      onPress={onPress}
      style={[styles.mainButton, isArmed ? styles.buttonArmed : styles.buttonDisarmed]}
    >
      <MaterialCommunityIcons 
        name={isArmed ? "shield-check" : "shield-off"} 
        size={40} 
        color="#fff" 
      />
      <Text style={styles.mainButtonText}>
        {isArmed ? "SISTEMA ARMADO" : "SISTEMA DESARMADO"}
      </Text>
      <Text style={styles.mainButtonSub}>
        {isArmed ? "Toque para Desarmar" : "Toque para Armar"}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  mainButton: {
    padding: 24,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    marginBottom: 10
  },
  buttonArmed: { backgroundColor: '#16a34a' }, 
  buttonDisarmed: { backgroundColor: '#dc2626' }, 
  mainButtonText: { color: '#fff', fontSize: 20, fontWeight: 'bold', marginTop: 10 },
  mainButtonSub: { color: 'rgba(255,255,255,0.8)', fontSize: 13, marginTop: 4 }
});