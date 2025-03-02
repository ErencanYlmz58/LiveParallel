import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { ScenarioCard, Loading } from '../../components';
import { COLORS, TEXT } from '../../styles';
import { scenarioActions } from '../../store';

const HomeScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { scenarios, isLoading } = useSelector((state) => state.scenarios);

  useEffect(() => {
    loadScenarios();
  }, []);

  const loadScenarios = () => {
    dispatch(scenarioActions.fetchUserScenarios());
  };

  const handleScenarioPress = (scenario) => {
    navigation.navigate('ScenarioDetail', { scenarioId: scenario.id });
  };

  const navigateToCreateScenario = () => {
    navigation.navigate('Create');
  };

  const renderEmptyList = () => {
    if (isLoading) return null;
    
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="layers-outline" size={64} color={COLORS.PRIMARY_LIGHT} />
        <Text style={styles.emptyTitle}>No scenarios yet</Text>
        <Text style={styles.emptyText}>
          Create your first scenario to explore an alternative life path
        </Text>
        <TouchableOpacity
          style={styles.createButton}
          onPress={navigateToCreateScenario}
        >
          <Text style={styles.createButtonText}>Create Scenario</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const renderItem = ({ item }) => (
    <ScenarioCard
      scenario={item}
      onPress={() => handleScenarioPress(item)}
    />
  );

  const renderHeader = () => (
    <View style={styles.header}>
      <View>
        <Text style={styles.headerTitle}>My Scenarios</Text>
        <Text style={styles.headerSubtitle}>
          Explore your alternative life paths
        </Text>
      </View>
      <TouchableOpacity
        style={styles.headerButton}
        onPress={navigateToCreateScenario}
      >
        <Ionicons name="add" size={24} color={COLORS.BACKGROUND} />
      </TouchableOpacity>
    </View>
  );

  if (isLoading && scenarios.length === 0) {
    return <Loading />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={scenarios}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmptyList}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={loadScenarios}
            colors={[COLORS.PRIMARY]}
            tintColor={COLORS.PRIMARY}
          />
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND,
  },
  listContent: {
    padding: 16,
    flexGrow: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerTitle: {
    ...TEXT.header,
  },
  headerSubtitle: {
    ...TEXT.body,
    color: COLORS.TEXT_SECONDARY,
  },
  headerButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.PRIMARY,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    marginTop: 80,
  },
  emptyTitle: {
    ...TEXT.title,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    ...TEXT.body,
    color: COLORS.TEXT_SECONDARY,
    textAlign: 'center',
    marginBottom: 24,
  },
  createButton: {
    backgroundColor: COLORS.PRIMARY,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  createButtonText: {
    ...TEXT.button,
    color: COLORS.BACKGROUND,
  },
});

export default HomeScreen;