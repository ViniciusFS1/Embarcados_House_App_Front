// components/SystemToggleButton.tsx
import React from 'react';
import { StyleSheet, Text, Pressable, View } from 'react-native';

interface ToggleButtonProps {
  status: number; // 0 = Armado, 1 = Desarmado, 2 = Ativado
  onPress: () => void;
}

export function SystemToggleButton({ status, onPress }: ToggleButtonProps) {
  
  // Define os estilos dinamicamente baseado no status
  const getButtonStyle = () => {
    switch (status) {
      case 0: // Armado
        return styles.btnArmed;
      case 2: // Ativado (Disparado)
        return styles.btnTriggered;
      case 1: // Desarmado
      default:
        return styles.btnDisarmed;
    }
  };

  const getButtonText = () => {
    switch (status) {
      case 0: return 'SISTEMA ARMADO';
      case 2: return 'ALERTA: DISPARADO!';
      case 1: return 'SISTEMA DESARMADO';
      default: return 'DESCONHECIDO';
    }
  };

  return (
    <Pressable style={[styles.button, getButtonStyle()]} onPress={onPress}>
      <Text style={styles.text}>{getButtonText()}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    padding: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  btnDisarmed: {
    backgroundColor: '#6B7280', // Cinza
  },
  btnArmed: {
    backgroundColor: '#10B981', // Verde
  },
  btnTriggered: {
    backgroundColor: '#EF4444', // Vermelho para o Estado Ativado/Disparado
  },
  text: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});
