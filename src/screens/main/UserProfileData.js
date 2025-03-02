import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, TEXT, SHADOWS, BORDER_RADIUS } from '../../styles';

const UserProfileData = ({ profileData, onEdit }) => {
  if (!profileData) return null;
  
  const { personalInfo, preferences } = profileData;
  
  const renderSection = (title, data, icon) => {
    if (!data) return null;
    
    return (
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Ionicons name={icon} size={20} color={COLORS.PRIMARY} style={styles.sectionIcon} />
          <Text style={styles.sectionTitle}>{title}</Text>
        </View>
        
        {Object.entries(data).map(([key, value]) => {
          // Skip empty values
          if (!value) return null;
          
          // Skip technical fields
          if (key === 'createdAt' || key === 'updatedAt') return null;
          
          let label = key;
          
          // Format labels for better display
          switch(key) {
            case 'name':
              label = 'Naam';
              break;
            case 'age':
              label = 'Leeftijd';
              break;
            case 'lifePhase':
              label = 'Levensfase';
              break;
            case 'decisionStyle':
              label = 'Beslissingsstijl';
              break;
            case 'futureVision':
              label = 'Toekomstvisie';
              break;
            case 'priorities':
              label = 'Prioriteiten';
              break;
          }
          
          return (
            <View key={key} style={styles.dataRow}>
              <Text style={styles.dataLabel}>{label}</Text>
              <Text style={styles.dataValue}>{value}</Text>
            </View>
          );
        })}
      </View>
    );
  };
  
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Over mij</Text>
        <TouchableOpacity onPress={onEdit} style={styles.editButton}>
          <Ionicons name="pencil" size={18} color={COLORS.PRIMARY} />
          <Text style={styles.editButtonText}>Bewerken</Text>
        </TouchableOpacity>
      </View>
      
      {renderSection('Persoonlijke gegevens', personalInfo, 'person-outline')}
      {renderSection('Voorkeuren', preferences, 'options-outline')}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.BACKGROUND,
    borderRadius: BORDER_RADIUS.lg,
    padding: 16,
    marginBottom: 16,
    ...SHADOWS.small,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    ...TEXT.title,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  editButtonText: {
    ...TEXT.body,
    color: COLORS.PRIMARY,
    marginLeft: 4,
    fontWeight: '500',
  },
  section: {
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  sectionIcon: {
    marginRight: 8,
  },
  sectionTitle: {
    ...TEXT.subtitle,
  },
  dataRow: {
    flexDirection: 'row',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.BORDER,
  },
  dataLabel: {
    ...TEXT.body,
    color: COLORS.TEXT_SECONDARY,
    flex: 1,
  },
  dataValue: {
    ...TEXT.body,
    flex: 2,
  },
});

export default UserProfileData;