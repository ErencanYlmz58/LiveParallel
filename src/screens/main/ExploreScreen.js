import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ImageBackground,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, TEXT, SHADOWS, BORDER_RADIUS } from '../../styles';

const CATEGORIES = [
  {
    id: 'career',
    title: 'Career Paths',
    icon: 'briefcase-outline',
    count: 16,
  },
  {
    id: 'education',
    title: 'Education Choices',
    icon: 'school-outline',
    count: 12,
  },
  {
    id: 'relationships',
    title: 'Relationships',
    icon: 'heart-outline',
    count: 9,
  },
  {
    id: 'travel',
    title: 'Travel & Living Abroad',
    icon: 'airplane-outline',
    count: 14,
  },
  {
    id: 'finance',
    title: 'Financial Decisions',
    icon: 'cash-outline',
    count: 8,
  },
  {
    id: 'health',
    title: 'Health & Lifestyle',
    icon: 'fitness-outline',
    count: 11,
  },
];

const FEATURED_SCENARIOS = [
  {
    id: 'featured1',
    title: 'What if I took that job in Seattle?',
    description: 'Exploring how a career change would have altered my path, relationships, and outlook on life.',
    user: 'Amanda K.',
    likes: 324,
    category: 'Career Paths',
  },
  {
    id: 'featured2',
    title: 'What if I studied abroad in college?',
    description: 'How four years in Japan instead of staying local would have changed my worldview and opportunities.',
    user: 'Michael T.',
    likes: 256,
    category: 'Education Choices',
  },
  {
    id: 'featured3',
    title: 'What if I invested in crypto early?',
    description: 'The financial and lifestyle impact of investing $5,000 in Bitcoin back in 2011.',
    user: 'Robert L.',
    likes: 198,
    category: 'Financial Decisions',
  },
];

const ExploreScreen = ({ navigation }) => {
  const renderHeader = () => (
    <View style={styles.header}>
      <Text style={styles.headerTitle}>Explore</Text>
      <Text style={styles.headerSubtitle}>
        Discover alternative life paths
      </Text>
    </View>
  );

  const renderSearchBar = () => (
    <TouchableOpacity style={styles.searchBar}>
      <Ionicons name="search" size={20} color={COLORS.TEXT_SECONDARY} />
      <Text style={styles.searchPlaceholder}>Search scenarios</Text>
    </TouchableOpacity>
  );

  const renderFeaturedSection = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Featured Scenarios</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.featuredContainer}
      >
        {FEATURED_SCENARIOS.map((scenario) => (
          <TouchableOpacity
            key={scenario.id}
            style={styles.featuredCard}
            onPress={() => {
              // Navigate to a public scenario detail screen
              // (Not implemented in this version)
              alert('This feature will be available in the full version');
            }}
          >
            <ImageBackground
              source={require('../../../assets/images/onboarding-bg.png')}
              style={styles.featuredImage}
              imageStyle={styles.featuredImageStyle}
            >
              <View style={styles.featuredOverlay}>
                <View style={styles.featuredContent}>
                  <Text style={styles.featuredTitle}>{scenario.title}</Text>
                  <Text style={styles.featuredDescription} numberOfLines={2}>
                    {scenario.description}
                  </Text>
                </View>
                <View style={styles.featuredFooter}>
                  <Text style={styles.featuredUser}>{scenario.user}</Text>
                  <View style={styles.featuredStats}>
                    <Ionicons name="heart" size={14} color={COLORS.ACCENT} />
                    <Text style={styles.featuredLikes}>{scenario.likes}</Text>
                  </View>
                </View>
              </View>
            </ImageBackground>
            <View style={styles.featuredCategory}>
              <Text style={styles.featuredCategoryText}>{scenario.category}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  const renderCategoriesSection = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Categories</Text>
      <View style={styles.categoriesContainer}>
        {CATEGORIES.map((category) => (
          <TouchableOpacity
            key={category.id}
            style={styles.categoryCard}
            onPress={() => {
              // Navigate to a category detail screen
              // (Not implemented in this version)
              alert('This feature will be available in the full version');
            }}
          >
            <View style={styles.categoryIconContainer}>
              <Ionicons name={category.icon} size={24} color={COLORS.PRIMARY} />
            </View>
            <Text style={styles.categoryTitle}>{category.title}</Text>
            <Text style={styles.categoryCount}>{category.count} scenarios</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderComingSoonSection = () => (
    <View style={styles.comingSoonContainer}>
      <View style={styles.comingSoonContent}>
        <Ionicons name="rocket-outline" size={40} color={COLORS.PRIMARY} />
        <Text style={styles.comingSoonTitle}>More features coming soon!</Text>
        <Text style={styles.comingSoonText}>
          Share your scenarios with friends, follow other users, and discover more alternative lives.
        </Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {renderHeader()}
        {renderSearchBar()}
        {renderFeaturedSection()}
        {renderCategoriesSection()}
        {renderComingSoonSection()}
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
    paddingBottom: 24,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  headerTitle: {
    ...TEXT.header,
  },
  headerSubtitle: {
    ...TEXT.body,
    color: COLORS.TEXT_SECONDARY,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.SURFACE,
    borderRadius: BORDER_RADIUS.md,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginHorizontal: 16,
    marginVertical: 16,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
  },
  searchPlaceholder: {
    ...TEXT.body,
    color: COLORS.TEXT_SECONDARY,
    marginLeft: 8,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    ...TEXT.title,
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  featuredContainer: {
    paddingHorizontal: 12,
  },
  featuredCard: {
    width: 280,
    height: 180,
    borderRadius: BORDER_RADIUS.lg,
    overflow: 'hidden',
    marginHorizontal: 4,
    ...SHADOWS.medium,
  },
  featuredImage: {
    width: '100%',
    height: '100%',
  },
  featuredImageStyle: {
    borderRadius: BORDER_RADIUS.lg,
  },
  featuredOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    padding: 16,
    justifyContent: 'space-between',
  },
  featuredContent: {
    flex: 1,
    justifyContent: 'center',
  },
  featuredTitle: {
    ...TEXT.title,
    color: COLORS.BACKGROUND,
    marginBottom: 8,
  },
  featuredDescription: {
    ...TEXT.body,
    color: COLORS.BACKGROUND,
    opacity: 0.9,
  },
  featuredFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  featuredUser: {
    ...TEXT.caption,
    color: COLORS.BACKGROUND,
    fontWeight: '500',
  },
  featuredStats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  featuredLikes: {
    ...TEXT.caption,
    color: COLORS.BACKGROUND,
    marginLeft: 4,
  },
  featuredCategory: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.pill,
  },
  featuredCategoryText: {
    ...TEXT.caption,
    color: COLORS.PRIMARY,
    fontWeight: '500',
  },
  categoriesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 12,
  },
  categoryCard: {
    width: '46%',
    backgroundColor: COLORS.BACKGROUND,
    borderRadius: BORDER_RADIUS.md,
    padding: 16,
    margin: '2%',
    ...SHADOWS.small,
  },
  categoryIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.PRIMARY + '10', // 10% opacity
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  categoryTitle: {
    ...TEXT.subtitle,
    marginBottom: 4,
  },
  categoryCount: {
    ...TEXT.caption,
    color: COLORS.TEXT_SECONDARY,
  },
  comingSoonContainer: {
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 16,
    backgroundColor: COLORS.BACKGROUND,
    borderRadius: BORDER_RADIUS.lg,
    ...SHADOWS.small,
    overflow: 'hidden',
  },
  comingSoonContent: {
    padding: 24,
    alignItems: 'center',
    borderTopWidth: 4,
    borderTopColor: COLORS.PRIMARY,
  },
  comingSoonTitle: {
    ...TEXT.title,
    marginVertical: 12,
  },
  comingSoonText: {
    ...TEXT.body,
    color: COLORS.TEXT_SECONDARY,
    textAlign: 'center',
  },
});

export default ExploreScreen;