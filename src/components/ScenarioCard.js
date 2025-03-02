import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, TEXT, SHADOWS, BORDER_RADIUS } from '../styles';

const getStatusIcon = (status) => {
  switch (status) {
    case 'pending':
      return { name: 'time-outline', color: COLORS.WARNING };
    case 'generating':
      return { name: 'refresh-outline', color: COLORS.INFO };
    case 'completed':
      return { name: 'checkmark-circle-outline', color: COLORS.SUCCESS };
    case 'error':
      return { name: 'alert-circle-outline', color: COLORS.ERROR };
    default:
      return { name: 'help-outline', color: COLORS.TEXT_SECONDARY };
  }
};

const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

const ScenarioCard = ({
  scenario,
  onPress,
  style,
}) => {
  const { title, description, createdAt, status } = scenario;
  const statusIcon = getStatusIcon(status);
  
  return (
    <TouchableOpacity 
      style={[styles.container, style]} 
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.header}>
        <Text style={styles.title} numberOfLines={1} ellipsizeMode="tail">
          {title}
        </Text>
        <View style={styles.statusContainer}>
          <Ionicons 
            name={statusIcon.name} 
            size={16} 
            color={statusIcon.color} 
            style={styles.statusIcon} 
          />
          <Text style={[styles.statusText, { color: statusIcon.color }]}>
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </Text>
        </View>
      </View>
      
      <Text style={styles.description} numberOfLines={2} ellipsizeMode="tail">
        {description}
      </Text>
      
      <View style={styles.footer}>
        <Text style={styles.date}>
          Created: {formatDate(createdAt)}
        </Text>
        <Ionicons name="chevron-forward" size={16} color={COLORS.TEXT_SECONDARY} />
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.BACKGROUND,
    borderRadius: BORDER_RADIUS.md,
    padding: 16,
    marginBottom: 12,
    ...SHADOWS.small,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.PRIMARY,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    ...TEXT.subtitle,
    flex: 1,
    marginRight: 8,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusIcon: {
    marginRight: 4,
  },
  statusText: {
    ...TEXT.caption,
    fontWeight: '500',
  },
  description: {
    ...TEXT.body,
    color: COLORS.TEXT_SECONDARY,
    marginBottom: 12,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  date: {
    ...TEXT.caption,
    color: COLORS.TEXT_SECONDARY,
  },
});

export default ScenarioCard;