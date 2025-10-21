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
  const [waitingForOperand, setWaitingForOperand] = useState<boolean>(false);
  const [pinBuffer, setPinBuffer] = useState<string>('');

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

    if (waitingForOperand) {
      setDisplay(num);
      setWaitingForOperand(false);
    } else {
      setDisplay((prev) => (prev === '0' ? num : prev + num));
    }
  }, [waitingForOperand, hapticFeedback, checkPinAndRedirect]);

  const handleDecimal = useCallback(() => {
    hapticFeedback();
    
    if (waitingForOperand) {
      setDisplay('0.');
      setWaitingForOperand(false);
    } else if (display.indexOf('.') === -1) {
      setDisplay((prev) => prev + '.');
    }
  }, [display, waitingForOperand, hapticFeedback]);

  const handleOperation = useCallback((nextOp: string) => {
    hapticFeedback();
    setPinBuffer('');
    
    const inputValue = parseFloat(display);

    if (previousValue === null) {
      setPreviousValue(inputValue);
    } else if (operation) {
      const currentValue = previousValue;
      let newValue = currentValue;

      switch (operation) {
        case '+':
          newValue = currentValue + inputValue;
          break;
        case '-':
          newValue = currentValue - inputValue;
          break;
        case '×':
          newValue = currentValue * inputValue;
          break;
        case '÷':
          newValue = inputValue !== 0 ? currentValue / inputValue : 0;
          break;
        case '%':
          newValue = (currentValue / 100) * inputValue;
          break;
      }

      setPreviousValue(newValue);
      setDisplay(String(newValue));
    }

    setWaitingForOperand(true);
    setOperation(nextOp);
  }, [display, previousValue, operation, hapticFeedback]);

  const handleEquals = useCallback(() => {
    hapticFeedback();
    
    if (pinBuffer.length >= 4) {
      checkPinAndRedirect(pinBuffer);
    }

    const inputValue = parseFloat(display);

    if (previousValue !== null && operation) {
      const currentValue = previousValue;
      let newValue = currentValue;

      switch (operation) {
        case '+':
          newValue = currentValue + inputValue;
          break;
        case '-':
          newValue = currentValue - inputValue;
          break;
        case '×':
          newValue = currentValue * inputValue;
          break;
        case '÷':
          newValue = inputValue !== 0 ? currentValue / inputValue : 0;
          break;
        case '%':
          newValue = (currentValue / 100) * inputValue;
          break;
      }

      setDisplay(String(newValue));
      setPreviousValue(null);
      setOperation(null);
      setWaitingForOperand(true);
    }
  }, [display, previousValue, operation, pinBuffer, hapticFeedback, checkPinAndRedirect]);

  const handleClear = useCallback(() => {
    hapticFeedback();
    setDisplay('0');
    setPreviousValue(null);
    setOperation(null);
    setWaitingForOperand(false);
    setPinBuffer('');
  }, [hapticFeedback]);

  const handleClearEntry = useCallback(() => {
    hapticFeedback();
    setDisplay('0');
    setWaitingForOperand(false);
  }, [hapticFeedback]);

  const handlePercent = useCallback(() => {
    hapticFeedback();
    setPinBuffer('');
    const currentValue = parseFloat(display);
    setDisplay(String(currentValue / 100));
    setWaitingForOperand(true);
  }, [display, hapticFeedback]);

  const handlePlusMinus = useCallback(() => {
    hapticFeedback();
    setPinBuffer('');
    const currentValue = parseFloat(display);
    setDisplay(String(-currentValue));
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
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  displayContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
    paddingHorizontal: 20,
    paddingBottom: 20,
    paddingTop: 60,
  },
  operationDisplay: {
    fontSize: 24,
    fontWeight: '300' as const,
    color: '#a0a0a0',
    marginBottom: 8,
  },
  display: {
    fontSize: 72,
    fontWeight: '200' as const,
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
    backgroundColor: '#333333',
    borderRadius: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  wideButton: {
    flex: 2,
  },
  operationButton: {
    backgroundColor: '#ff9f0a',
  },
  specialButton: {
    backgroundColor: '#505050',
  },
  equalsButton: {
    backgroundColor: '#ff9f0a',
  },
  buttonText: {
    fontSize: 36,
    fontWeight: '400' as const,
    color: '#ffffff',
  },
  operationText: {
    fontSize: 40,
    fontWeight: '500' as const,
  },
  specialText: {
    fontSize: 28,
  },
  equalsText: {
    fontSize: 40,
    fontWeight: '600' as const,
  },
  exitHint: {
    position: 'absolute',
    top: 50,
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
