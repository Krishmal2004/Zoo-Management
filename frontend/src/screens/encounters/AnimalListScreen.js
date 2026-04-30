import React from 'react';
import { View, FlatList, StyleSheet, Text, SafeAreaView, StatusBar } from 'react-native';
import AnimalCard from '../../components/AnimalCard';

const animals = [
  {
    id: '1',
    name: 'Parrots',
    description: 'Get up close and personal with our colorful and intelligent parrots. Experience the joy of feeding them directly from your hands.',
    image: 'https://images.unsplash.com/photo-1522814041793-1df25026210f?auto=format&fit=crop&q=80&w=600',
  },
  {
    id: '2',
    name: 'Deer',
    description: 'Enjoy a peaceful encounter with our gentle deer herd. A perfect opportunity for families to connect with nature.',
    image: 'https://images.unsplash.com/photo-1484406561678-5a49c63b4fec?auto=format&fit=crop&q=80&w=600',
  },
  {
    id: '3',
    name: 'Giraffe',
    description: 'Stand eye-to-eye with these gentle giants! Book an exclusive feeding session and capture the perfect towering selfie.',
    image: 'https://images.unsplash.com/photo-1547474261-24874da80b0c?auto=format&fit=crop&q=80&w=600',
  },
  {
    id: '4',
    name: 'Zebra',
    description: 'Witness the striking patterns of our zebras in a guided photography session. Capture stunning wildlife moments.',
    image: 'https://images.unsplash.com/photo-1526437340632-47525287f3bd?auto=format&fit=crop&q=80&w=600',
  },
];

export default function AnimalListScreen({ navigation }) {
  const handleBookFeeding = (animal) => {
    navigation.navigate('Booking', { animal, type: 'Feeding' });
  };

  const handleBookPhotography = (animal) => {
    navigation.navigate('Booking', { animal, type: 'Photography' });
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <Text style={styles.title}>Animal Encounters</Text>
        <Text style={styles.subtitle}>Book feeding and photography sessions</Text>
      </View>
      <FlatList
        data={animals}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <AnimalCard
            animal={item}
            onBookFeeding={handleBookFeeding}
            onBookPhotography={handleBookPhotography}
          />
        )}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  listContainer: {
    padding: 20,
    paddingBottom: 40,
  },
});
