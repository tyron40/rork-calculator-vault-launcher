import React, { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import * as Haptics from 'expo-haptics';

interface CalculatorPadProps {
  onPinEntered: (pin: string) => void;
}

export default function CalculatorPad({ onPinEntered }: CalculatorPadProps) {
  const [display, setDisplay] = useState<string>('0');
  const [previousValue, setPreviousValue] = useState<number | null>(null);
  const [operation, setOperation] = useState<string | null>(null);
  const [pinBuffer, setPinBuffer] = useState<string>('');

  const hapticFeedback = useCallback(() => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  }, []);

  const handleNumber = useCallback((num: string) => {
    hapticFeedback();
    
    setPinBuffer((prev) => prev + num);
    
    setDisplay((prev) => {
      if (prev === '0' || operation !== null && previousValue !== null && display === previousValue.toString()) {
        return num;
      }
      return prev + num;
    });
  }, [operation, previousValue, display, hapticFeedback]);

  const handleOperation = useCallback((op: string) => {
    hapticFeedback();
    
    const current = parseFloat(display);
    
    if (previousValue !== null && operation !== null) {
      let result = previousValue;
      
      switch (operation) {
        case '+':
          result = previousValue + current;
          break;
        case '-':
          result = previousValue - current;
          break;
        case '×':
          result = previousValue * current;
          break;
        case '÷':
          result = current !== 0 ? previousValue / current : 0;
          break;
      }
      
      setDisplay(result.toString());
      setPreviousValue(result);
    } else {
      setPreviousValue(current);
    }
    
    setOperation(op);
  }, [display, previousValue, operation, hapticFeedback]);

  const handleEquals = useCallback(() => {
    hapticFeedback();
    
    if (pinBuffer.length >= 4) {
      console.log('[Calculator] PIN entered, checking...');
      onPinEntered(pinBuffer);
      setPinBuffer('');
    }
    
    if (previousValue !== null && operation !== null) {
      const current = parseFloat(display);
      let result = previousValue;
      
      switch (operation) {
        case '+':
          result = previousValue + current;
          break;
        case '-':
          result = previousValue - current;
          break;
        case '×':
          result = previousValue * current;
          break;
        case '÷':
          result = current !== 0 ? previousValue / current : 0;
          break;
      }
      
      setDisplay(result.toString());
      setPreviousValue(null);
      setOperation(null);
    }
  }, [display, previousValue, operation, pinBuffer, onPinEntered, hapticFeedback]);

  const handleClear = useCallback(() => {
    hapticFeedback();
    setDisplay('0');
    setPreviousValue(null);
    setOperation(null);
    setPinBuffer('');
  }, [hapticFeedback]);

  const handlePercent = useCallback(() => {
    hapticFeedback();
    const current = parseFloat(display);
    setDisplay((current / 100).toString());
  }, [display, hapticFeedback]);

  const handlePlusMinus = useCallback(() => {
    hapticFeedback();
    const current = parseFloat(display);
    setDisplay((-current).toString());
  }, [display, hapticFeedback]);

  const Button = ({ 
    value, 
    onPress, 
    type = 'number' as 'number' | 'operation' | 'special' | 'equals'
  }: { 
    value: string; 
    onPress: () => void; 
    type?: 'number' | 'operation' | 'special' | 'equals';
  }) => (
    <TouchableOpacity
      style={[
        styles.button,
        type === 'operation' && styles.operationButton,
        type === 'special' && styles.specialButton,
        type === 'equals' && styles.equalsButton,
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Text
        style={[
          styles.buttonText,
          type === 'operation' && styles.operationText,
          type === 'special' && styles.specialText,
          type === 'equals' && styles.equalsText,
        ]}
      >
        {value}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.displayContainer}>
        <Text style={styles.display} numberOfLines={1} adjustsFontSizeToFit>
          {display}
        </Text>
      </View>
      
      <View style={styles.buttonGrid}>
        <View style={styles.row}>
          <Button value="C" onPress={handleClear} type="special" />
          <Button value="±" onPress={handlePlusMinus} type="special" />
          <Button value="%" onPress={handlePercent} type="special" />
          <Button value="÷" onPress={() => handleOperation('÷')} type="operation" />
        </View>
        
        <View style={styles.row}>
          <Button value="7" onPress={() => handleNumber('7')} />
          <Button value="8" onPress={() => handleNumber('8')} />
          <Button value="9" onPress={() => handleNumber('9')} />
          <Button value="×" onPress={() => handleOperation('×')} type="operation" />
        </View>
        
        <View style={styles.row}>
          <Button value="4" onPress={() => handleNumber('4')} />
          <Button value="5" onPress={() => handleNumber('5')} />
          <Button value="6" onPress={() => handleNumber('6')} />
          <Button value="-" onPress={() => handleOperation('-')} type="operation" />
        </View>
        
        <View style={styles.row}>
          <Button value="1" onPress={() => handleNumber('1')} />
          <Button value="2" onPress={() => handleNumber('2')} />
          <Button value="3" onPress={() => handleNumber('3')} />
          <Button value="+" onPress={() => handleOperation('+')} type="operation" />
        </View>
        
        <View style={styles.row}>
          <View style={styles.zeroButton}>
            <Button value="0" onPress={() => handleNumber('0')} />
          </View>
          <Button value="." onPress={() => handleNumber('.')} />
          <Button value="=" onPress={handleEquals} type="equals" />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1d29',
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  displayContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  display: {
    fontSize: 64,
    fontWeight: '300' as const,
    color: '#ffffff',
  },
  buttonGrid: {
    gap: 12,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  button: {
    flex: 1,
    aspectRatio: 1,
    backgroundColor: '#2d3142',
    borderRadius: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  zeroButton: {
    flex: 2,
    marginRight: 12,
  },
  operationButton: {
    backgroundColor: '#6366f1',
  },
  specialButton: {
    backgroundColor: '#4a4e69',
  },
  equalsButton: {
    backgroundColor: '#8b5cf6',
  },
  buttonText: {
    fontSize: 32,
    fontWeight: '400' as const,
    color: '#ffffff',
  },
  operationText: {
    fontSize: 36,
    fontWeight: '500' as const,
  },
  specialText: {
    fontSize: 28,
  },
  equalsText: {
    fontSize: 36,
    fontWeight: '600' as const,
  },
});
