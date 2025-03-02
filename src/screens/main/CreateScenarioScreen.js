import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Button, Input } from '../../components';
import { COLORS, TEXT } from '../../styles';
import { validation } from '../../utils';
import { scenarioActions } from '../../store';

const CreateScenarioScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { isLoading, error } = useSelector((state) => state.scenarios);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    choice: '',
    context: '',
  });

  const [touched, setTouched] = useState({
    title: false,
    description: false,
    choice: false,
    context: false,
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    // Show error alert if creation fails
    if (error) {
      Alert.alert('Error', error);
      dispatch(scenarioActions.clearError());
    }
  }, [error, dispatch]);

  // Validate form when inputs change or are touched
  useEffect(() => {
    const validationErrors = validation.validateScenarioForm(formData);
    setErrors(validationErrors);
  }, [formData]);

  const handleChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleBlur = (field) => {
    setTouched((prev) => ({
      ...prev,
      [field]: true,
    }));
  };

  const handleSubmit = () => {
    // Mark all fields as touched
    setTouched({
      title: true,
      description: true,
      choice: true,
      context: true,
    });

    // Check if form is valid
    const validationErrors = validation.validateScenarioForm(formData);
    setErrors(validationErrors);

    // If no errors, proceed with creating scenario
    if (Object.keys(validationErrors).length === 0) {
      dispatch(scenarioActions.createScenario(formData))
        .unwrap()
        .then((scenario) => {
          // Reset form
          setFormData({
            title: '',
            description: '',
            choice: '',
            context: '',
          });
          setTouched({
            title: false,
            description: false,
            choice: false,
            context: false,
          });
          
          // Navigate to the scenario detail screen
          navigation.navigate('ScenarioDetail', { scenarioId: scenario.id });
        })
        .catch((err) => {
          // Error is handled by the middleware
          console.error('Failed to create scenario:', err);
        });
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Create Scenario</Text>
            <Text style={styles.headerSubtitle}>
              Set up a scenario to explore an alternative life path
            </Text>
          </View>

          <View style={styles.formContainer}>
            <Input
              label="Scenario Title"
              placeholder="Give your scenario a name"
              value={formData.title}
              onChangeText={(text) => handleChange('title', text)}
              onBlur={() => handleBlur('title')}
              error={touched.title ? errors.title : null}
              touched={touched.title}
              autoCapitalize="sentences"
              required
            />

            <Input
              label="Description"
              placeholder="Describe your current situation"
              value={formData.description}
              onChangeText={(text) => handleChange('description', text)}
              onBlur={() => handleBlur('description')}
              error={touched.description ? errors.description : null}
              touched={touched.description}
              multiline
              numberOfLines={4}
              autoCapitalize="sentences"
              required
            />

            <Input
              label="The Choice"
              placeholder="What decision or choice would you like to explore?"
              value={formData.choice}
              onChangeText={(text) => handleChange('choice', text)}
              onBlur={() => handleBlur('choice')}
              error={touched.choice ? errors.choice : null}
              touched={touched.choice}
              multiline
              numberOfLines={3}
              autoCapitalize="sentences"
              required
            />

            <Input
              label="Additional Context (optional)"
              placeholder="Add any additional context that might help generate a more meaningful alternative path"
              value={formData.context}
              onChangeText={(text) => handleChange('context', text)}
              onBlur={() => handleBlur('context')}
              error={touched.context ? errors.context : null}
              touched={touched.context}
              multiline
              numberOfLines={3}
              autoCapitalize="sentences"
            />

            <View style={styles.infoContainer}>
              <Ionicons name="information-circle-outline" size={20} color={COLORS.INFO} />
              <Text style={styles.infoText}>
                Once created, our AI will generate an alternative life path based on your scenario.
              </Text>
            </View>

            <Button
              title="Create Scenario"
              onPress={handleSubmit}
              disabled={isLoading}
              loading={isLoading}
              fullWidth
              style={styles.submitButton}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND,
  },
  keyboardAvoidView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 16,
  },
  header: {
    marginBottom: 24,
  },
  headerTitle: {
    ...TEXT.header,
    marginBottom: 8,
  },
  headerSubtitle: {
    ...TEXT.body,
    color: COLORS.TEXT_SECONDARY,
  },
  formContainer: {
    width: '100%',
  },
  infoContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.INFO + '10', // 10% opacity
    borderRadius: 8,
    padding: 12,
    marginVertical: 16,
    alignItems: 'center',
  },
  infoText: {
    ...TEXT.body,
    color: COLORS.TEXT,
    marginLeft: 8,
    flex: 1,
  },
  submitButton: {
    marginTop: 8,
    marginBottom: 24,
  },
});

export default CreateScenarioScreen;