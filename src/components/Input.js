import React, { useState } from 'react';
import { 
  View, 
  TextInput, 
  Text, 
  StyleSheet, 
  TouchableOpacity 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, BORDER_RADIUS, TEXT } from '../styles';

const Input = ({
  label,
  placeholder,
  value,
  onChangeText,
  secureTextEntry,
  autoCapitalize = 'none',
  keyboardType = 'default',
  error,
  touched,
  multiline = false,
  numberOfLines = 1,
  style,
  inputStyle,
  labelStyle,
  required = false,
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [isSecureTextVisible, setIsSecureTextVisible] = useState(false);

  const handleFocus = () => setIsFocused(true);
  const handleBlur = () => setIsFocused(false);

  const toggleSecureTextVisibility = () => {
    setIsSecureTextVisible(!isSecureTextVisible);
  };

  return (
    <View style={[styles.container, style]}>
      {label && (
        <Text style={[styles.label, labelStyle]}>
          {label} {required && <Text style={styles.required}>*</Text>}
        </Text>
      )}
      
      <View style={[
        styles.inputContainer,
        isFocused && styles.focused,
        touched && error && styles.error,
      ]}>
        <TextInput
          style={[
            styles.input,
            multiline && styles.multilineInput,
            inputStyle,
          ]}
          placeholder={placeholder}
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={secureTextEntry && !isSecureTextVisible}
          autoCapitalize={autoCapitalize}
          keyboardType={keyboardType}
          onFocus={handleFocus}
          onBlur={handleBlur}
          multiline={multiline}
          numberOfLines={multiline ? numberOfLines : 1}
          placeholderTextColor={COLORS.TEXT_SECONDARY}
          {...props}
        />
        
        {secureTextEntry && (
          <TouchableOpacity 
            style={styles.icon} 
            onPress={toggleSecureTextVisibility}
          >
            <Ionicons 
              name={isSecureTextVisible ? 'eye-off-outline' : 'eye-outline'} 
              size={24} 
              color={COLORS.TEXT_SECONDARY} 
            />
          </TouchableOpacity>
        )}
      </View>
      
      {touched && error && (
        <Text style={styles.errorText}>{error}</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
    width: '100%',
  },
  label: {
    ...TEXT.body,
    marginBottom: 8,
  },
  required: {
    color: COLORS.ERROR,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.BORDER,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: COLORS.BACKGROUND,
  },
  input: {
    flex: 1,
    height: 50,
    paddingHorizontal: 16,
    color: COLORS.TEXT,
    fontSize: 16,
  },
  multilineInput: {
    height: 100,
    textAlignVertical: 'top',
    paddingTop: 12,
  },
  icon: {
    padding: 10,
  },
  focused: {
    borderColor: COLORS.PRIMARY,
    borderWidth: 2,
  },
  error: {
    borderColor: COLORS.ERROR,
  },
  errorText: {
    color: COLORS.ERROR,
    fontSize: 12,
    marginTop: 4,
  },
});

export default Input;