# PIN Login Guide

## 🔐 Universal PIN System

### Master PIN for All Devices
**PIN: `0000`**

This PIN **always works on ALL devices** regardless of setup:
- Parent devices
- Child devices  
- All mobile platforms (iOS, Android, Web)

## How to Login

### From Calculator Screen
1. Type your PIN using the calculator number pad (e.g., `0000`)
2. Press the `=` button
3. You'll be logged into your dashboard

### Default Behavior
- **Parent Setup**: Typing `0000` + `=` → Opens Parent Dashboard
- **Child Setup**: Typing `0000` + `=` → Opens Child Dashboard

## PIN Setup Process

### Parent Device Setup
When setting up as a parent:
- **Parent PIN**: Set to `0000` (default) - Opens monitoring dashboard
- **Child PIN**: Set to `0000` (default) - Shows calculator only
- Both PINs can be changed during setup if desired

### Child Device Setup  
When setting up as a child:
- **Child PIN**: Set to `0000` (default) - Opens child dashboard
- PIN can be changed during setup if desired

## Troubleshooting

### "PIN not working"
1. **Try the master PIN**: Type `0000` then press `=`
2. **Check your role**: Tap the `ⓘ` button on calculator to see current setup
3. **Reset device**: Long-press the `ⓘ` button to access reset options

### Debug Information
- Tap the `ⓘ` icon in top-left of calculator to see:
  - Current role (parent/child)
  - Which PINs are configured
  - Instructions for your specific setup

### Complete Reset
If you're completely locked out:
1. Tap the `ⓘ` icon on calculator
2. Select "Reset Device"
3. Confirm the reset
4. Go through initial setup again

## Technical Details

### PIN Storage
- All PINs are normalized (whitespace removed, only digits)
- Stored in AsyncStorage with keys:
  - `parent_pin` - Parent access PIN
  - `child_pin` - Child access PIN
  - `user_role` - Current device role

### PIN Validation Logic
The calculator checks PINs in this order:
1. Master PIN `0000` (always works)
2. Stored parent PIN (if role is parent)
3. Stored child PIN (if role is child)
4. Falls back to role selection if no PINs match

## Security Notes

⚠️ **Important**: The default PIN `0000` is intentionally simple for demo/testing purposes. In a production environment:
- Users should be encouraged to set strong, unique PINs
- The master PIN should be removed or made more secure
- Consider implementing PIN attempt limits
- Add biometric authentication options

## For Developers

### PIN Normalization
All PINs are normalized using:
```typescript
const normalizePin = (pin: string): string => {
  return String(pin || '').trim().replace(/[^0-9]/g, '');
};
```

### Checking PIN in Calculator
The calculator (app/index.tsx) handles PIN entry:
- Number inputs accumulate in `pinBuffer`
- Pressing `=` or any operation triggers PIN check
- Master PIN `0000` checked first
- Then role-specific PINs
- Redirects to appropriate dashboard on success

### Console Logging
Extensive console logs help debug PIN issues:
- PIN validation steps
- Storage operations
- Byte-level comparisons
- Role checks

Check browser/Metro console for detailed PIN debugging information.
