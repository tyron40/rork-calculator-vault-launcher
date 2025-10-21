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
  const [shouldResetDisplay, setShouldResetDisplay] = useState<boolean>(false);
  const [lastOperation, setLastOperation] = useState<string | null>(null);
  const [lastOperand, setLastOperand] = useState<number | null>(null);

  const hapticFeedback = useCallback(() => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  }, []);

  const formatDisplay = (value: number): string => {
    if (isNaN(value) || !isFinite(value)) return 'Error';
    
    const str = value.toString();
    if (str.length > 12) {
      if (value > 999999999999) {
        return value.toExponential(6);
      }
      return parseFloat(value.toFixed(9)).toString();
    }
    return str;
  };

  const handleNumber = useCallback((num: string) => {
    hapticFeedback();
    
    setPinBuffer((prev) => prev + num);
    
    setDisplay((prev) => {
      if (shouldResetDisplay || prev === '0') {
        setShouldResetDisplay(false);
        return num;
      }
      
      if (prev.includes('.') && num === '.') {
        return prev;
      }
      
      if (prev.length >= 12 && num !== '.') {
        return prev;
      }
      
      return prev + num;
    });
  }, [shouldResetDisplay, hapticFeedback]);

  const handleDecimal = useCallback(() => {
    hapticFeedback();
    
    if (shouldResetDisplay) {
      setDisplay('0.');
      setShouldResetDisplay(false);
      return;
    }
    
    if (!display.includes('.')) {
      setDisplay(display + '.');
    }
  }, [display, shouldResetDisplay, hapticFeedback]);

  const performCalculation = useCallback((prev: number, current: number, op: string): number => {
    switch (op) {
      case '+':
        return prev + current;
      case '-':
        return prev - current;
      case '×':
        return prev * current;
      case '÷':
        return current !== 0 ? prev / current : NaN;
      default:
        return current;
    }
  }, []);

  const handleOperation = useCallback((op: string) => {
    hapticFeedback();
    
    const current = parseFloat(display);
    
    if (previousValue !== null && operation !== null && !shouldResetDisplay) {
      const result = performCalculation(previousValue, current, operation);
      setDisplay(formatDisplay(result));
      setPreviousValue(result);
    } else {
      setPreviousValue(current);
    }
    
    setOperation(op);
    setShouldResetDisplay(true);
    setLastOperation(null);
    setLastOperand(null);
  }, [display, previousValue, operation, shouldResetDisplay, hapticFeedback, performCalculation]);

  const handleEquals = useCallback(() => {
    hapticFeedback();
    
    if (pinBuffer.length >= 4) {
      console.log('[Calculator] PIN entered, checking...');
      onPinEntered(pinBuffer);
      setPinBuffer('');
      return;
    }
    
    if (previousValue !== null && operation !== null) {
      const current = parseFloat(display);
      const result = performCalculation(previousValue, current, operation);
      
      setDisplay(formatDisplay(result));
      setLastOperation(operation);
      setLastOperand(current);
      setPreviousValue(null);
      setOperation(null);
      setShouldResetDisplay(true);
    } else if (lastOperation !== null && lastOperand !== null) {
      const current = parseFloat(display);
      const result = performCalculation(current, lastOperand, lastOperation);
      setDisplay(formatDisplay(result));
      setShouldResetDisplay(true);
    }
  }, [display, previousValue, operation, pinBuffer, lastOperation, lastOperand, onPinEntered, hapticFeedback, performCalculation]);

  const handleClear = useCallback(() => {
    hapticFeedback();
    setDisplay('0');
    setPreviousValue(null);
    setOperation(null);
    setPinBuffer('');
    setShouldResetDisplay(false);
    setLastOperation(null);
    setLastOperand(null);
  }, [hapticFeedback]);

  const handlePercent = useCallback(() => {
    hapticFeedback();
    const current = parseFloat(display);
    const result = current / 100;
    setDisplay(formatDisplay(result));
    setShouldResetDisplay(false);
  }, [display, hapticFeedback]);

  const handlePlusMinus = useCallback(() => {
    hapticFeedback();
    const current = parseFloat(display);
    const result = -current;
    setDisplay(formatDisplay(result));
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
          <Button value="." onPress={handleDecimal} />
          <Button value="=" onPress={handleEquals} type="equals" />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
    paddingHorizontal: 16,
    paddingBottom: Platform.OS === 'ios' ? 40 : 20,
  },
  displayContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
    paddingHorizontal: 24,
    paddingBottom: 30,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
  },
  display: {
    fontSize: 80,
    fontWeight: '200' as const,
    color: '#ffffff',
    letterSpacing: -2,
  },
  buttonGrid: {
    gap: 14,
  },
  row: {
    flexDirection: 'row',
    gap: 14,
  },
  button: {
    flex: 1,
    aspectRatio: 1,
    backgroundColor: '#333333',
    borderRadius: 100,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 0,
  },
  zeroButton: {
    flex: 2,
    marginRight: 14,
  },
  operationButton: {
    backgroundColor: '#ff9500',
  },
  specialButton: {
    backgroundColor: '#a5a5a5',
  },
  equalsButton: {
    backgroundColor: '#ff9500',
  },
  buttonText: {
    fontSize: 38,
    fontWeight: '400' as const,
    color: '#ffffff',
  },
  operationText: {
    fontSize: 42,
    fontWeight: '300' as const,
  },
  specialText: {
    fontSize: 36,
    fontWeight: '400' as const,
    color: '#000000',
  },
  equalsText: {
    fontSize: 42,
    fontWeight: '300' as const,
  },
});
