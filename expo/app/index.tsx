import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function CalculatorHome() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [display, setDisplay] = useState<string>('0');
  const [previousValue, setPreviousValue] = useState<number | null>(null);
  const [operation, setOperation] = useState<string | null>(null);
  const [waitingForOperand, setWaitingForOperand] = useState<boolean>(false);

  const handleResetSetup = useCallback(async () => {
    const confirmed = Platform.OS === 'web'
      ? window.confirm('Reset this device and create a new PIN? This clears the current setup.')
      : await new Promise<boolean>((resolve) => {
          Alert.alert('Reset setup?', 'This clears the current PIN and consent settings.', [
            { text: 'Cancel', style: 'cancel', onPress: () => resolve(false) },
            { text: 'Reset', style: 'destructive', onPress: () => resolve(true) },
          ]);
        });

    if (!confirmed) return;

    await AsyncStorage.multiRemove([
      'parent_pin', 'child_pin', 'user_role', 'access_pin', 'parental_consent',
      'device_id', 'parent_device_id', 'child_device_id', 'connection_config',
      'pairing_code', 'child_monitoring_parent_id', 'parent_device_name', 'child_monitoring_active',
    ]);
    router.replace('/consent');
  }, [router]);

  const checkInitialization = useCallback(async () => {
    try {
      console.log('[Calculator] Checking initial setup');
      console.log('[Calculator] Platform:', Platform.OS);
      
      const consent = await AsyncStorage.getItem('parental_consent');
      console.log('[Calculator] Consent found:', !!consent);
      
      if (!consent) {
        console.log('[Calculator] No parental consent, redirecting to consent screen');
        setTimeout(() => {
          setIsLoading(false);
          router.replace('/consent');
        }, 100);
        return;
      }

      const parentPin = await AsyncStorage.getItem('parent_pin');
      const childPin = await AsyncStorage.getItem('child_pin');
      const userRole = await AsyncStorage.getItem('user_role');
      
      console.log('[Calculator] Setup check - Role:', userRole, 'Parent PIN exists:', !!parentPin, 'Child PIN exists:', !!childPin);
      
      if (!parentPin && !childPin) {
        console.log('[Calculator] No PIN setup found, redirecting to role selection');
        setTimeout(() => {
          setIsLoading(false);
          router.replace('/role-selection');
        }, 100);
        return;
      }
      
      console.log('[Calculator] Calculator view ready; dashboard access is visible.');
      setIsLoading(false);
    } catch (error) {
      console.error('[Calculator] Error checking initialization:', error);
      setTimeout(() => {
        setIsLoading(false);
        router.replace('/consent');
      }, 100);
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

  const handleNumber = useCallback((num: string) => {
    hapticFeedback();

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

  const handleOperation = useCallback((nextOp: string) => {
    hapticFeedback();
    
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
  }, [display, previousValue, operation, hapticFeedback]);

  const handleClear = useCallback(() => {
    hapticFeedback();
    setDisplay('0');
    setPreviousValue(null);
    setOperation(null);
    setWaitingForOperand(false);
  }, [hapticFeedback]);

  const handleClearEntry = useCallback(() => {
    hapticFeedback();
    setDisplay('0');
    setWaitingForOperand(false);
  }, [hapticFeedback]);

  const handlePercent = useCallback(() => {
    hapticFeedback();
    const currentValue = parseFloat(display);
    setDisplay(String(currentValue / 100));
    setWaitingForOperand(true);
  }, [display, hapticFeedback]);

  const handlePlusMinus = useCallback(() => {
    hapticFeedback();
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
      <View style={styles.topBar}>
        <Text style={styles.appMark}>Calculator</Text>
        <TouchableOpacity
          accessibilityRole="button"
          style={styles.dashboardButton}
          onPress={() => router.push('/role-selection')}
        >
          <Text style={styles.dashboardButtonText}>Account dashboard</Text>
        </TouchableOpacity>
      </View>
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

      <TouchableOpacity style={styles.resetSetupButton} onPress={handleResetSetup}>
        <Text style={styles.resetSetupText}>Forgot PIN? Reset setup</Text>
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
  topBar: {
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
  },
  appMark: {
    color: '#9ca3af',
    fontSize: 14,
    fontWeight: '600' as const,
  },
  dashboardButton: {
    minHeight: 38,
    justifyContent: 'center',
    paddingHorizontal: 12,
    borderRadius: 10,
    backgroundColor: '#273244',
  },
  dashboardButtonText: {
    color: '#bfdbfe',
    fontSize: 13,
    fontWeight: '600' as const,
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
  resetSetupButton: {
    alignSelf: 'center',
    paddingHorizontal: 16,
    paddingVertical: 9,
  },
  resetSetupText: {
    fontSize: 12,
    color: '#888888',
    textDecorationLine: 'underline',
  },
});
