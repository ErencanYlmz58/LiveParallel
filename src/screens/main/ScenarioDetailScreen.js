import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Share,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Button, Loading } from '../../components';
import { COLORS, TEXT, SHADOWS } from '../../styles';
import { helpers } from '../../utils';
import { scenarioActions } from '../../store';

const ScenarioDetailScreen = ({ route, navigation }) => {
  const { scenarioId } = route.params;
  const dispatch = useDispatch();
  const { currentScenario, isLoading, error } = useSelector((state) => state.scenarios);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    loadScenario();
  }, [scenarioId]);

  useEffect(() => {
    // Show error alert if any
    if (error) {
      Alert.alert('Error', error);
      dispatch(scenarioActions.clearError());
    }
  }, [error, dispatch]);

  const loadScenario = () => {
    dispatch(scenarioActions.fetchScenario(scenarioId));
  };

  const handleGenerateAlternative = () => {
    Alert.alert(
      'Generate Alternative Path',
      'This will create a simulated alternative life path based on your scenario. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Generate', 
          onPress: () => {
            dispatch(scenarioActions.generateAlternativePath(scenarioId));
          } 
        },
      ]
    );
  };

  const handleDeleteScenario = () => {
    Alert.alert(
      'Delete Scenario',
      'Are you sure you want to delete this scenario? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: () => {
            setIsDeleting(true);
            dispatch(scenarioActions.deleteScenario(scenarioId))
              .unwrap()
              .then(() => {
                navigation.goBack();
              })
              .catch((err) => {
                console.error('Failed to delete scenario:', err);
                setIsDeleting(false);
              });
          } 
        },
      ]
    );
  };

  const handleShare = async () => {
    if (!currentScenario) return;

    try {
      const result = await Share.share({
        message: `Check out my alternative life scenario: ${currentScenario.title}\n\n${
          currentScenario.alternativePath 
            ? `What if: ${currentScenario.choice}\n\n${currentScenario.alternativePath.summary}` 
            : `I'm exploring what would happen if: ${currentScenario.choice}`
        }\n\nExplore your own alternative lives with LiveParallel!`,
      });
    } catch (error) {
      Alert.alert('Error', 'Could not share scenario');
    }
  };

  const navigateBack = () => {
    navigation.goBack();
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={navigateBack}
      >
        <Ionicons name="arrow-back" size={24} color={COLORS.TEXT} />
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.moreButton}
        onPress={() => {
          Alert.alert(
            'Options',
            'Choose an action',
            [
              { text: 'Share', onPress: handleShare },
              { text: 'Delete', onPress: handleDeleteScenario, style: 'destructive' },
              { text: 'Cancel', style: 'cancel' },
            ]
          );
        }}
      >
        <Ionicons name="ellipsis-vertical" size={24} color={COLORS.TEXT} />
      </TouchableOpacity>
    </View>
  );

  const renderScenarioDetails = () => (
    <View style={styles.scenarioContainer}>
      <Text style={styles.title}>{currentScenario.title}</Text>
      <View style={styles.metaContainer}>
        <View style={styles.statusContainer}>
          <View style={[
            styles.statusBadge,
            { 
              backgroundColor: 
                currentScenario.status === 'completed' ? COLORS.SUCCESS + '20' :
                currentScenario.status === 'generating' ? COLORS.INFO + '20' :
                currentScenario.status === 'error' ? COLORS.ERROR + '20' :
                COLORS.WARNING + '20'
            }
          ]}>
            <Text style={[
              styles.statusText,
              {
                color: 
                  currentScenario.status === 'completed' ? COLORS.SUCCESS :
                  currentScenario.status === 'generating' ? COLORS.INFO :
                  currentScenario.status === 'error' ? COLORS.ERROR :
                  COLORS.WARNING
              }
            ]}>
              {currentScenario.status.charAt(0).toUpperCase() + currentScenario.status.slice(1)}
            </Text>
          </View>
        </View>
        <Text style={styles.date}>
          Created: {helpers.formatDate(currentScenario.createdAt)}
        </Text>
      </View>

      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>Description</Text>
        <Text style={styles.sectionText}>{currentScenario.description}</Text>
      </View>

      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>What if...</Text>
        <Text style={styles.choiceText}>{currentScenario.choice}</Text>
      </View>

      {currentScenario.context && (
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Additional Context</Text>
          <Text style={styles.sectionText}>{currentScenario.context}</Text>
        </View>
      )}
    </View>
  );

  const renderAlternativePath = () => {
    if (currentScenario.status === 'generating') {
      return (
        <View style={styles.generatingContainer}>
          <Loading size="small" fullScreen={false} text="Generating alternative path..." />
        </View>
      );
    }

    if (currentScenario.status === 'pending' || !currentScenario.alternativePath) {
      return (
        <View style={styles.noPathContainer}>
          <Text style={styles.noPathTitle}>No alternative path yet</Text>
          <Text style={styles.noPathText}>
            Generate an alternative life path based on your scenario
          </Text>
          <Button
            title="Generate Now"
            onPress={handleGenerateAlternative}
            disabled={isLoading}
            style={styles.generateButton}
          />
        </View>
      );
    }

    if (currentScenario.status === 'error') {
      return (
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={40} color={COLORS.ERROR} />
          <Text style={styles.errorTitle}>Generation failed</Text>
          <Text style={styles.errorText}>
            There was a problem generating your alternative path.
          </Text>
          <Button
            title="Try Again"
            onPress={handleGenerateAlternative}
            disabled={isLoading}
            style={styles.tryAgainButton}
          />
        </View>
      );
    }

    // Status is completed and we have an alternative path
    const { alternativePath } = currentScenario;
    return (
      <View style={styles.alternativeContainer}>
        <View style={styles.alternativeHeader}>
          <Text style={styles.alternativeTitle}>Alternative Life Path</Text>
          <TouchableOpacity
            style={styles.shareButton}
            onPress={handleShare}
          >
            <Ionicons name="share-outline" size={20} color={COLORS.PRIMARY} />
          </TouchableOpacity>
        </View>

        <View style={styles.summaryContainer}>
          <Text style={styles.summaryText}>{alternativePath.summary}</Text>
        </View>

        <Text style={styles.eventsTitle}>Key Events</Text>
        {alternativePath.events.map((event, index) => (
          <View key={index} style={styles.eventContainer}>
            <View style={styles.eventDot} />
            <View style={styles.eventContent}>
              <Text style={styles.eventTitle}>{event.title}</Text>
              <Text style={styles.eventDescription}>{event.description}</Text>
              <Text style={styles.eventOutcome}>{event.outcome}</Text>
            </View>
          </View>
        ))}
      </View>
    );
  };

  if (isLoading && !currentScenario) {
    return <Loading />;
  }

  if (!currentScenario) {
    return (
      <SafeAreaView style={styles.container}>
        {renderHeader()}
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={40} color={COLORS.ERROR} />
          <Text style={styles.errorTitle}>Scenario not found</Text>
          <Button
            title="Go Back"
            onPress={navigateBack}
            style={styles.backButtonLarge}
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {renderHeader()}
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {renderScenarioDetails()}
        {renderAlternativePath()}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  backButton: {
    padding: 8,
  },
  moreButton: {
    padding: 8,
  },
  scenarioContainer: {
    backgroundColor: COLORS.BACKGROUND,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    ...SHADOWS.small,
  },
  title: {
    ...TEXT.header,
    marginBottom: 12,
  },
  metaContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  date: {
    ...TEXT.caption,
    color: COLORS.TEXT_SECONDARY,
  },
  sectionContainer: {
    marginBottom: 16,
  },
  sectionTitle: {
    ...TEXT.subtitle,
    marginBottom: 8,
  },
  sectionText: {
    ...TEXT.body,
    color: COLORS.TEXT,
    lineHeight: 22,
  },
  choiceText: {
    ...TEXT.body,
    fontWeight: '500',
    color: COLORS.PRIMARY,
    lineHeight: 22,
  },
  generatingContainer: {
    backgroundColor: COLORS.BACKGROUND,
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    ...SHADOWS.small,
  },
  noPathContainer: {
    backgroundColor: COLORS.BACKGROUND,
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    ...SHADOWS.small,
  },
  noPathTitle: {
    ...TEXT.title,
    marginBottom: 8,
  },
  noPathText: {
    ...TEXT.body,
    color: COLORS.TEXT_SECONDARY,
    textAlign: 'center',
    marginBottom: 16,
  },
  generateButton: {
    marginTop: 8,
  },
  errorContainer: {
    backgroundColor: COLORS.BACKGROUND,
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    ...SHADOWS.small,
  },
  errorTitle: {
    ...TEXT.title,
    marginVertical: 8,
  },
  errorText: {
    ...TEXT.body,
    color: COLORS.TEXT_SECONDARY,
    textAlign: 'center',
    marginBottom: 16,
  },
  tryAgainButton: {
    marginTop: 8,
  },
  backButtonLarge: {
    marginTop: 16,
  },
  alternativeContainer: {
    backgroundColor: COLORS.BACKGROUND,
    borderRadius: 12,
    padding: 16,
    ...SHADOWS.small,
  },
  alternativeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  alternativeTitle: {
    ...TEXT.title,
  },
  shareButton: {
    padding: 8,
  },
  summaryContainer: {
    backgroundColor: COLORS.PRIMARY + '10', // 10% opacity
    borderRadius: 8,
    padding: 16,
    marginBottom: 24,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.PRIMARY,
  },
  summaryText: {
    ...TEXT.body,
    fontStyle: 'italic',
    lineHeight: 22,
  },
  eventsTitle: {
    ...TEXT.subtitle,
    marginBottom: 16,
  },
  eventContainer: {
    flexDirection: 'row',
    marginBottom: 24,
  },
  eventDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: COLORS.SECONDARY,
    marginTop: 6,
    marginRight: 12,
  },
  eventContent: {
    flex: 1,
  },
  eventTitle: {
    ...TEXT.subtitle,
    fontSize: 16,
    marginBottom: 4,
  },
  eventDescription: {
    ...TEXT.body,
    marginBottom: 8,
  },
  eventOutcome: {
    ...TEXT.body,
    fontWeight: '500',
    color: COLORS.SECONDARY,
  },
});

export default ScenarioDetailScreen;