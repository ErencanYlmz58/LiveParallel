import React from 'react';
import { View, ActivityIndicator, Text, StyleSheet } from 'react-native';
import { COLORS, TEXT } from '../styles';

const Loading = ({
  size = 'large',
  color = COLORS.PRIMARY,
  text = 'Loading...',
  fullScreen = true,
  style,
}) => {
  return (
    <View style={[
      styles.container,
      fullScreen && styles.fullScreen,
      style
    ]}>
      <ActivityIndicator size={size} color={color} />
      {text && <Text style={styles.text}>{text}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  fullScreen: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND,
  },
  text: {
    ...TEXT.body,
    marginTop: 10,
    color: COLORS.TEXT_SECONDARY,
  },
});

export default Loading;