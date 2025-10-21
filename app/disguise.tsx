import React, { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function DisguiseCalculator() {
  const router = useRouter();
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

  const checkPinAndRedirect = useCallback(async (pin: string) => {
    try {
      console.log('[Disguise] Checking PIN for redirect...');
      
      const parentPin = await AsyncStorage.getItem('parent_pin');
      const childPin = await AsyncStorage.getItem('child_pin');
      const hasConsent = await AsyncStorage.getItem('parental_consent');
      
      if (!hasConsent) {
        console.log('[Disguise] No consent, redirecting to consent screen');
        await AsyncStorage.removeItem('calculator_disguise_mode');
        router.replace('/consent');
        return;
      }

      if (pin === parentPin || pin === childPin) {
        console.log('[Disguise] Valid PIN detected, exiting disguise mode');
        await AsyncStorage.removeItem('calculator_disguise_mode');
        router.replace('/');
        return;
      }
    } catch (error) {
      console.error('[Disguise] Error checking PIN:', error);
    }
  }, [router]);

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
    
    setPinBuffer((prev) => {
      const newBuffer = prev + num;
      if (newBuffer.length >= 4) {
        checkPinAndRedirect(newBuffer);
        return newBuffer;
      }
      return newBuffer;
    });

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
  }, [shouldResetDisplay, hapticFeedback, checkPinAndRedirect]);

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

  const handleOperation = useCallback((nextOp: string) => {
    hapticFeedback();
    setPinBuffer('');
    
    const current = parseFloat(display);
    
    if (previousValue !== null && operation !== null && !shouldResetDisplay) {
      const result = performCalculation(previousValue, current, operation);
      setDisplay(formatDisplay(result));
      setPreviousValue(result);
    } else {
      setPreviousValue(current);
    }
    
    setOperation(nextOp);
    setShouldResetDisplay(true);
    setLastOperation(null);
    setLastOperand(null);
  }, [display, previousValue, operation, shouldResetDisplay, hapticFeedback, performCalculation]);

  const handleEquals = useCallback(() => {
    hapticFeedback();
    
    if (pinBuffer.length >= 4) {
      checkPinAndRedirect(pinBuffer);
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
  }, [display, previousValue, operation, pinBuffer, lastOperation, lastOperand, hapticFeedback, checkPinAndRedirect, performCalculation]);

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

  const handleClearEntry = useCallback(() => {
    hapticFeedback();
    setDisplay('0');
    setShouldResetDisplay(false);
  }, [hapticFeedback]);

  const handlePercent = useCallback(() => {
    hapticFeedback();
    setPinBuffer('');
    const current = parseFloat(display);
    const result = current / 100;
    setDisplay(formatDisplay(result));
    setShouldResetDisplay(false);
  }, [display, hapticFeedback]);

  const handlePlusMinus = useCallback(() => {
    hapticFeedback();
    setPinBuffer('');
    const current = parseFloat(display);
    const result = -current;
    setDisplay(formatDisplay(result));
  }, [display, hapticFeedback]);

  const handleBackspace = useCallback(() => {
    hapticFeedback();
    
    if (display.length > 1) {
      setDisplay((prev) => prev.slice(0, -1));
    } else {
      setDisplay('0');
    }
  }, [display, hapticFeedback]);

  const Button = ({ 
    value, 
    onPress, 
    type = 'number' as 'number' | 'operation' | 'special' | 'equals',
    wide = false,
  }: { 
    value: string; 
    onPress: () => void; 
    type?: 'number' | 'operation' | 'special' | 'equals';
    wide?: boolean;
  }) => (
    <TouchableOpacity
      style={[
        styles.button,
        wide && styles.wideButton,
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
        {operation && previousValue !== null && (
          <Text style={styles.operationDisplay}>
            {previousValue} {operation}
          </Text>
        )}
        <Text style={styles.display} numberOfLines={1} adjustsFontSizeToFit>
          {display}
        </Text>
      </View>
      
      <View style={styles.buttonGrid}>
        <View style={styles.row}>
          <Button value="C" onPress={handleClear} type="special" />
          <Button value="CE" onPress={handleClearEntry} type="special" />
          <Button value="⌫" onPress={handleBackspace} type="special" />
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
          <Button value="±" onPress={handlePlusMinus} type="special" />
          <Button value="0" onPress={() => handleNumber('0')} />
          <Button value="." onPress={handleDecimal} />
          <Button value="=" onPress={handleEquals} type="equals" />
        </View>

        <View style={styles.row}>
          <Button value="%" onPress={handlePercent} wide type="special" />
        </View>
      </View>

      <TouchableOpacity
        style={styles.exitHint}
        onPress={() => {
          Alert.alert(
            'Calculator',
            'This is a fully functional calculator. Enter your PIN and press = to access the app.',
            [{ text: 'OK' }]
          );
        }}
      >
        <Text style={styles.exitHintText}>ⓘ</Text>
      </TouchableOpacity>
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
  operationDisplay: {
    fontSize: 28,
    fontWeight: '300' as const,
    color: '#a0a0a0',
    marginBottom: 8,
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
  wideButton: {
    flex: 2,
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
    fontSize: 32,
    fontWeight: '400' as const,
    color: '#000000',
  },
  equalsText: {
    fontSize: 42,
    fontWeight: '300' as const,
  },
  exitHint: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 40,
    left: 20,
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    opacity: 0.3,
  },
  exitHintText: {
    fontSize: 24,
    color: '#ffffff',
  },
});
