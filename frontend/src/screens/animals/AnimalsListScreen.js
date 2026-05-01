import React, { useState, useEffect, useMemo } from 'react';
import { View, StyleSheet, FlatList, TextInput, ActivityIndicator, Text, TouchableOpacity, Linking, ImageBackground, Dimensions, RefreshControl } from 'react-native';

const { width } = Dimensions.get('window');
const cardWidth = width / 2 - 24;
import { fetchAnimals } from '../../api/animalsApi';
import AnimalCard from '../../components/animals/AnimalCard';
import CategoryFilter from '../../components/animals/CategoryFilter';
import { Ionicons } from '@expo/vector-icons';

import { useFocusEffect } from '@react-navigation/native';

const AnimalsListScreen = ({ navigation }) => {
  const [activeTab, setActiveTab] = useState('information'); // 'information' or 'education'
  
  const [animals, setAnimals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');

  const loadAnimals = async (isRefreshing = false) => {
    if (!isRefreshing) setLoading(true);
    try {
      const response = await fetchAnimals(search, category);
      setAnimals(response.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Sync Data: Refresh every time the screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      loadAnimals();
    }, [search, category])
  );

  const onRefresh = () => {
    setRefreshing(true);
    loadAnimals(true);
  };

  const educationItems = useMemo(() => {
    const items = [];
    animals.forEach(animal => {
      if (animal.educationContent) {
        animal.educationContent.forEach(content => {
          if (content.type === 'quiz' || content.type === 'game') {
            items.push({ ...content, animalName: animal.name });
          }
        });
      }
    });
    return items;
  }, [animals]);

  const openUrl = (url) => {
    Linking.openURL(url).catch((err) => console.error('An error occurred', err));
  };

  const renderAnimalItem = ({ item }) => (
    <AnimalCard 
      animal={item} 
      onPress={() => navigation.navigate('AnimalDetailScreen', { id: item._id })} 
    />
  );

  const getIconForType = (type) => {
    switch(type) {
      case 'video': return 'play-circle';
      case 'game': return 'game-controller';
      case 'quiz': return 'help-circle';
      case 'activity': return 'color-palette';
      case 'article':
      default: return 'document-text';
    }
  };

  const renderEducationItem = ({ item }) => {
    const fallbackImage = 'https://via.placeholder.com/300';
    const cardImage = item.imageUrl || fallbackImage;
    return (
      <TouchableOpacity style={styles.squareCard} onPress={() => openUrl(item.url)} activeOpacity={0.8}>
        <ImageBackground source={{ uri: cardImage }} style={styles.cardImageBackground} resizeMode="cover">
          <View style={styles.cardOverlay}>
            <View style={styles.educationTypeRow}>
              <Ionicons name={getIconForType(item.type)} size={16} color="#fff" style={{ marginRight: 4 }} />
              <Text style={styles.educationTypeBadge}>{item.type.toUpperCase()}</Text>
            </View>
            <Text style={styles.educationCardTitle} numberOfLines={2}>{item.title}</Text>
            <Text style={styles.educationCardSubtitle} numberOfLines={1}>{item.animalName}</Text>
          </View>
        </ImageBackground>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* Top Tab Switcher */}
      <View style={styles.tabContainer}>
        <TouchableOpacity 
          style={[styles.tabButton, activeTab === 'information' && styles.activeTabButton]} 
          onPress={() => setActiveTab('information')}
        >
          <Text style={[styles.tabText, activeTab === 'information' && styles.activeTabText]}>Information</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tabButton, activeTab === 'education' && styles.activeTabButton]} 
          onPress={() => setActiveTab('education')}
        >
          <Text style={[styles.tabText, activeTab === 'education' && styles.activeTabText]}>Education</Text>
        </TouchableOpacity>
      </View>

      {activeTab === 'information' ? (
        <>
          <View style={styles.searchContainer}>
            <TextInput
              style={styles.searchInput}
              placeholder="Search animals..."
              value={search}
              onChangeText={setSearch}
            />
          </View>
          <View style={{ height: 60 }}>
            <CategoryFilter selectedCategory={category} onSelectCategory={setCategory} />
          </View>

          {loading ? (
            <View style={styles.center}>
              <ActivityIndicator size="large" color="#2E7D32" />
            </View>
          ) : animals.length === 0 ? (
            <View style={styles.center}>
              <Text style={styles.emptyText}>No animals found.</Text>
            </View>
          ) : (
            <FlatList
              data={animals}
              keyExtractor={(item) => item._id}
              renderItem={renderAnimalItem}
              numColumns={2}
              columnWrapperStyle={styles.row}
              contentContainerStyle={styles.listContainer}
              showsVerticalScrollIndicator={false}
              refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#2E7D32']} />
              }
            />
          )}
        </>
      ) : (
        // Education Tab
        <View style={styles.educationContainer}>
          <TouchableOpacity 
            style={styles.quizMainCard} 
            activeOpacity={0.9}
            onPress={() => navigation.navigate('QuizScreen')}
          >
            <ImageBackground 
              source={{ uri: 'https://images.unsplash.com/photo-1534567153574-2b12153a87f0?q=80&w=1200&auto=format&fit=crop' }} 
              style={styles.quizCardImage}
              resizeMode="cover"
            >
              <View style={styles.quizCardOverlay}>
                <View style={styles.quizBadge}>
                  <Ionicons name="trophy" size={16} color="#FFD700" />
                  <Text style={styles.quizBadgeText}>DAILY CHALLENGE</Text>
                </View>
                <Text style={styles.quizCardTitle}>Zoo Master Quiz</Text>
                <Text style={styles.quizCardDescription}>
                  Test your animal knowledge and become a Zoo Master! 5 questions about our majestic residents.
                </Text>
                <View style={styles.startButton}>
                  <Text style={styles.startButtonText}>Start Quiz</Text>
                  <Ionicons name="arrow-forward" size={18} color="#fff" />
                </View>
              </View>
            </ImageBackground>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  tabContainer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    gap: 12,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
  },
  activeTabButton: {
    backgroundColor: '#2E7D32',
  },
  tabText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#666',
    fontFamily: 'Dosis_600SemiBold',
  },
  activeTabText: {
    color: '#fff',
  },
  searchContainer: {
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  searchInput: {
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    fontSize: 16,
    fontFamily: 'Dosis_400Regular',
  },
  listContainer: {
    padding: 16,
  },
  educationContainer: {
    flex: 1,
  },
  row: {
    justifyContent: 'space-between',
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    fontFamily: 'Dosis_500Medium',
  },
  educationContainer: {
    flex: 1,
    padding: 16,
  },
  quizMainCard: {
    width: '100%',
    height: 300,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 15,
    elevation: 10,
  },
  quizCardImage: {
    width: '100%',
    height: '100%',
    justifyContent: 'flex-end',
  },
  quizCardOverlay: {
    padding: 24,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  quizBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    alignSelf: 'flex-start',
    marginBottom: 12,
    gap: 6,
  },
  quizBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
    letterSpacing: 1.5,
  },
  quizCardTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    fontFamily: 'Dosis_700Bold',
    marginBottom: 8,
  },
  quizCardDescription: {
    fontSize: 14,
    color: '#eee',
    fontFamily: 'Dosis_500Medium',
    lineHeight: 20,
    marginBottom: 20,
  },
  startButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2E7D32',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    alignSelf: 'flex-start',
    gap: 10,
  },
  startButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: 'Dosis_700Bold',
  },
  squareCard: {
    width: cardWidth,
    height: cardWidth,
    backgroundColor: '#fff',
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
    overflow: 'hidden',
  },
  cardImageBackground: {
    width: '100%',
    height: '100%',
    justifyContent: 'flex-end',
  },
  cardOverlay: {
    padding: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
  },
  educationTypeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  educationTypeBadge: {
    fontSize: 10,
    color: '#fff',
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  educationCardTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#fff',
    fontFamily: 'Dosis_700Bold',
    marginBottom: 2,
  },
  educationCardSubtitle: {
    fontSize: 12,
    color: '#ddd',
    fontStyle: 'italic',
  },
});

export default AnimalsListScreen;
