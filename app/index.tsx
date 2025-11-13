import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function CalculatorDisguise() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [display, setDisplay] = useState<string>('0');
  const [previousValue, setPreviousValue] = useState<number | null>(null);
  const [operation, setOperation] = useState<string | null>(null);
  const [waitingForOperand, setWaitingForOperand] = useState<boolean>(false);
  const [pinBuffer, setPinBuffer] = useState<string>('');

  const checkInitialization = useCallback(async () => {
    try {
      console.log('[Calculator] Checking initial setup');
      
      const consent = await AsyncStorage.getItem('parental_consent');
      
      if (!consent) {
        console.log('[Calculator] No parental consent, redirecting to consent screen');
        setIsLoading(false);
        setTimeout(() => router.replace('/consent'), 100);
        return;
      }
      
      console.log('[Calculator] Calculator disguise ready');
      console.log('[Calculator] To access: Type your PIN and press =');
    } catch (error) {
      console.error('[Calculator] Error checking initialization:', error);
      setIsLoading(false);
      setTimeout(() => router.replace('/consent'), 100);
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  useEffect(() => {
    checkInitialization();
  }, [checkInitialization]);

  const hapticFeedback = useCallback(() => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  }, []);

  const checkPinAndRedirect = useCallback(async (pin: string) => {
    try {
      const enteredPin = String(pin).replace(/\s+/g, '');
      console.log('[Calculator] Checking PIN - Length:', enteredPin.length, 'Value:', enteredPin);
      
      const storedRole = await AsyncStorage.getItem('user_role');
      const parentPin = await AsyncStorage.getItem('parent_pin');
      const childPin = await AsyncStorage.getItem('child_pin');
      
      console.log('[Calculator] Stored data - Role:', storedRole);
      console.log('[Calculator] Parent PIN exists:', !!parentPin, 'Length:', parentPin?.length, 'Value:', parentPin);
      console.log('[Calculator] Child PIN exists:', !!childPin, 'Length:', childPin?.length, 'Value:', childPin);
      
      const hasNoSetup = !parentPin && !childPin && !storedRole;
      
      if (hasNoSetup) {
        console.log('[Calculator] No setup found, redirecting to role selection');
        hapticFeedback();
        setPinBuffer('');
        setDisplay('0');
        setPreviousValue(null);
        setOperation(null);
        setWaitingForOperand(false);
        router.replace('/role-selection');
        return true;
      }
      
      let isCorrectPin = false;
      let redirectTo = '/role-selection';
      
      const normalizedParentPin = parentPin ? String(parentPin).replace(/\s+/g, '') : null;
      const normalizedChildPin = childPin ? String(childPin).replace(/\s+/g, '') : null;
      
      console.log('[Calculator] Normalized - Parent:', normalizedParentPin, 'Child:', normalizedChildPin, 'Entered:', enteredPin);
      
      if (storedRole === 'parent' && normalizedParentPin && normalizedParentPin === enteredPin) {
        console.log('[Calculator] Parent PIN matched');
        isCorrectPin = true;
        redirectTo = '/parent';
      } else if (storedRole === 'child' && normalizedChildPin && normalizedChildPin === enteredPin) {
        console.log('[Calculator] Child PIN matched');
        isCorrectPin = true;
        redirectTo = '/child';
      } else if (normalizedParentPin && normalizedParentPin === enteredPin) {
        console.log('[Calculator] Parent PIN matched (no active role)');
        isCorrectPin = true;
        await AsyncStorage.setItem('user_role', 'parent');
        redirectTo = '/parent';
      } else if (normalizedChildPin && normalizedChildPin === enteredPin) {
        console.log('[Calculator] Child PIN matched (no active role)');
        isCorrectPin = true;
        await AsyncStorage.setItem('user_role', 'child');
        redirectTo = '/child';
      }
      
      if (isCorrectPin) {
        console.log('[Calculator] PIN accepted! Redirecting to:', redirectTo);
        hapticFeedback();
        setPinBuffer('');
        setDisplay('0');
        setPreviousValue(null);
        setOperation(null);
        setWaitingForOperand(false);
        router.replace(redirectTo);
        return true;
      }
      
      console.log('[Calculator] PIN verification FAILED');
      console.log('[Calculator] - Entered PIN:', enteredPin);
      console.log('[Calculator] - Expected Parent:', normalizedParentPin);
      console.log('[Calculator] - Expected Child:', normalizedChildPin);
      console.log('[Calculator] - Parent match:', normalizedParentPin === enteredPin);
      console.log('[Calculator] - Child match:', normalizedChildPin === enteredPin);
      
      setPinBuffer('');
      setDisplay('0');
      Alert.alert('Incorrect PIN', 'The PIN you entered is incorrect. Please try again.');
      return false;
    } catch (error) {
      console.error('[Calculator] Error checking PIN:', error);
      setPinBuffer('');
      setDisplay('0');
      return false;
    }
  }, [router, hapticFeedback]);

  const handleNumber = useCallback((num: string) => {
    hapticFeedback();
    
    setPinBuffer((prev) => prev + num);

    if (waitingForOperand) {
      setDisplay(num);
      setWaitingForOperand(false);
    } else {
      setDisplay((prev) => (prev === '0' ? num : prev + num));
    }
  }, [waitingForOperand, hapticFeedback]);

  const handleDecimal = useCallback(() => {
    hapticFeedback();
    
    if (waitingForOperand) {
      setDisplay('0.');
      setWaitingForOperand(false);
    } else if (display.indexOf('.') === -1) {
      setDisplay((prev) => prev + '.');
    }
  }, [display, waitingForOperand, hapticFeedback]);

  const handleOperation = useCallback(async (nextOp: string) => {
    hapticFeedback();
    
    const currentPinBuffer = pinBuffer;
    
    if (currentPinBuffer.length >= 4) {
      const success = await checkPinAndRedirect(currentPinBuffer);
      if (success) {
        return;
      }
    }
    
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
  }, [display, previousValue, operation, pinBuffer, hapticFeedback, checkPinAndRedirect]);

  const handleEquals = useCallback(async () => {
    hapticFeedback();
    
    const currentPinBuffer = pinBuffer;
    
    if (currentPinBuffer.length >= 4) {
      const success = await checkPinAndRedirect(currentPinBuffer);
      if (success) {
        return;
      }
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

  const handlePercent = useCallback(async () => {
    hapticFeedback();
    
    const currentPinBuffer = pinBuffer;
    
    if (currentPinBuffer.length >= 4) {
      const success = await checkPinAndRedirect(currentPinBuffer);
      if (success) {
        return;
      }
    }
    
    setPinBuffer('');
    const currentValue = parseFloat(display);
    setDisplay(String(currentValue / 100));
    setWaitingForOperand(true);
  }, [display, pinBuffer, hapticFeedback, checkPinAndRedirect]);

  const handlePlusMinus = useCallback(async () => {
    hapticFeedback();
    
    const currentPinBuffer = pinBuffer;
    
    if (currentPinBuffer.length >= 4) {
      const success = await checkPinAndRedirect(currentPinBuffer);
      if (success) {
        return;
      }
    }
    
    setPinBuffer('');
    const currentValue = parseFloat(display);
    setDisplay(String(-currentValue));
  }, [display, pinBuffer, hapticFeedback, checkPinAndRedirect]);

  const handleBackspace = useCallback(() => {
    hapticFeedback();
    
    if (pinBuffer.length > 0) {
      setPinBuffer((prev) => prev.slice(0, -1));
    }
    
    if (display.length > 1) {
      setDisplay((prev) => prev.slice(0, -1));
    } else {
      setDisplay('0');
    }
  }, [display, pinBuffer, hapticFeedback]);

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

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#ff9f0a" />
        <Text style={styles.loadingText}>Starting...</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
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
        onPress={async () => {
          const role = await AsyncStorage.getItem('user_role');
          Alert.alert(
            'Calculator Info',
            role === 'parent'
              ? `This is a fully functional calculator.\n\nTo access parent dashboard:\n1. Type your parent PIN\n2. Press = button\n\nYour role: Parent`
              : role === 'child'
              ? `This is a fully functional calculator.\n\nTo access child dashboard:\n1. Type your child PIN\n2. Press = button\n\nYour role: Child`
              : 'Enter your PIN and press = to access the app',
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
  loadingContainer: {
    flex: 1,
    backgroundColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#ffffff',
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
    minHeight: 60,
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
