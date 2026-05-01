require('dotenv').config({ path: __dirname + '/../../.env' });
const mongoose = require('mongoose');
const Animal = require('../models/Animal.model');
const connectDB = require('../config/db');

const mockAnimals = [
  {
    name: 'African Elephant',
    species: 'Loxodonta africana',
    category: 'Mammal',
    images: ['https://images.unsplash.com/photo-1557050543-4d5f4e07ef46?q=80&w=1000&auto=format&fit=crop'],
    description: 'The African elephant is the largest living terrestrial animal. Their large ears allow them to radiate excess heat.',
    habitat: 'Savanna, forests, and deserts of Africa.',
    diet: 'Herbivore - eating leaves, branches, bark, and roots.',
    funFacts: ['An elephant trunk has over 40,000 muscles.', 'They use mud as sunscreen.'],
    conservationStatus: 'Endangered',
    educationContent: [
      {
        type: 'article',
        title: 'Elephant Social Structures',
        url: 'https://en.wikipedia.org/wiki/Elephant',
      },
      {
        type: 'video',
        title: 'Why Elephants Never Forget',
        url: 'https://www.youtube.com/watch?v=lFXyNj3QxOU',
      },
      {
        type: 'quiz',
        title: 'Test Your Elephant Knowledge!',
        url: 'https://games.nationalgeographic.com/trivia/elephants',
      }
    ]
  },
  {
    name: 'Bengal Tiger',
    species: 'Panthera tigris tigris',
    category: 'Mammal',
    images: ['https://images.unsplash.com/photo-1549480017-d77466a410b5?q=80&w=1000&auto=format&fit=crop'],
    description: 'Bengal tigers are one of the biggest and most majestic cats in the world.',
    habitat: 'Tropical moist broadleaf forests, tropical dry forests.',
    diet: 'Carnivore - eating ungulates like deer and wild boar.',
    funFacts: ['No two tigers have the same stripes.', 'They are excellent swimmers.'],
    conservationStatus: 'Endangered',
    educationContent: [
      {
        type: 'video',
        title: 'Tiger Hunt in the Wild',
        url: 'https://www.youtube.com/watch?v=1zBspPEOVyY',
      },
      {
        type: 'game',
        title: 'Jungle Predator Game',
        url: 'https://pbskids.org/wildkratts/games/predator-power',
      }
    ]
  },
  {
    name: 'Green Iguana',
    species: 'Iguana iguana',
    category: 'Reptile',
    images: ['https://images.unsplash.com/photo-1502458428863-718fa671ab11?q=80&w=1000&auto=format&fit=crop'],
    description: 'A large, arboreal, mostly herbivorous species of lizard of the genus Iguana.',
    habitat: 'Rainforests of Northern Mexico, Central America, and South America.',
    diet: 'Herbivore - eating leaves, flowers, and fruit.',
    funFacts: ['They have a third eye on top of their heads called a parietal eye.'],
    conservationStatus: 'Least Concern',
    educationContent: [
      {
        type: 'activity',
        title: 'Print & Color: Green Iguana',
        url: 'https://www.supercoloring.com/coloring-pages/green-iguana-1',
      }
    ]
  },
  {
    name: 'Macaw',
    species: 'Ara macao',
    category: 'Bird',
    images: ['https://images.unsplash.com/photo-1552560201-903dfc8230b7?q=80&w=1000&auto=format&fit=crop'],
    description: 'Macaws are long-tailed, often colorful, New World parrots.',
    habitat: 'Tropical rainforests.',
    diet: 'Omnivore - seeds, nuts, fruits, insects.',
    funFacts: ['Some macaws can live up to 80 years.', 'They have bone in their tongues.'],
    conservationStatus: 'Least Concern',
    educationContent: [
      {
        type: 'activity',
        title: 'Origami Macaw Craft',
        url: 'https://www.origami-make.org/origami-macaw.php',
      },
      {
        type: 'quiz',
        title: 'Rainforest Birds Quiz',
        url: 'https://study.com/academy/practice/quiz-worksheet-rainforest-birds.html',
      }
    ]
  },
  {
    name: 'Giant Panda',
    species: 'Ailuropoda melanoleuca',
    category: 'Mammal',
    images: ['https://images.unsplash.com/photo-1564349683136-77e08dba1ef7?q=80&w=1000&auto=format&fit=crop'],
    description: 'The giant panda is a bear species endemic to China, known for its distinctive black-and-white coat.',
    habitat: 'Mountainous regions of central China.',
    diet: 'Herbivore - 99% bamboo.',
    funFacts: ['Pandas spend up to 14 hours a day eating bamboo.', 'Newborn pandas are the size of a stick of butter.'],
    conservationStatus: 'Vulnerable',
    educationContent: [
      {
        type: 'video',
        title: 'Panda Cub Playing',
        url: 'https://www.youtube.com/watch?v=sGF6bOi1NfA',
      }
    ]
  },
  {
    name: 'Emperor Penguin',
    species: 'Aptenodytes forsteri',
    category: 'Bird',
    images: ['https://images.unsplash.com/photo-1598439210625-5067c578f3f6?q=80&w=1000&auto=format&fit=crop'],
    description: 'The tallest and heaviest of all living penguin species and is endemic to Antarctica.',
    habitat: 'Ice and frigid waters of Antarctica.',
    diet: 'Carnivore - mainly fish, krill, and squid.',
    funFacts: ['They can dive up to 500 meters deep.', 'Males incubate the egg for two months without eating.'],
    conservationStatus: 'Near Threatened',
    educationContent: [
      {
        type: 'article',
        title: 'How Emperor Penguins Survive the Cold',
        url: 'https://en.wikipedia.org/wiki/Emperor_penguin',
      }
    ]
  },
  {
    name: 'Poison Dart Frog',
    species: 'Dendrobatidae',
    category: 'Amphibian',
    images: ['https://images.unsplash.com/photo-1628169229045-812066fa4ce9?q=80&w=1000&auto=format&fit=crop'],
    description: 'Small, brightly colored frogs whose vivid colors serve as a warning of their toxicity.',
    habitat: 'Humid, tropical environments of Central and South America.',
    diet: 'Carnivore - spiders, ants, and termites.',
    funFacts: ['Their poison comes from their diet of ants and mites.', 'One frog contains enough poison to kill 10 adults.'],
    conservationStatus: 'Vulnerable',
    educationContent: [
      {
        type: 'quiz',
        title: 'Amphibian Facts Quiz',
        url: 'https://games.nationalgeographic.com/trivia/amphibians',
      }
    ]
  },
  {
    name: 'Great White Shark',
    species: 'Carcharodon carcharias',
    category: 'Fish',
    images: ['https://images.unsplash.com/photo-1560275619-4662e36fa65c?q=80&w=1000&auto=format&fit=crop'],
    description: 'A large mackerel shark found in the coastal surface waters of all the major oceans.',
    habitat: 'Coastal and offshore waters with temperatures between 12 and 24 °C.',
    diet: 'Carnivore - marine mammals, fish, and seabirds.',
    funFacts: ['They can detect one drop of blood in 100 liters of water.', 'They have up to 300 serrated, triangular teeth.'],
    conservationStatus: 'Vulnerable',
    educationContent: [
      {
        type: 'video',
        title: 'Great White Shark Breaching',
        url: 'https://www.youtube.com/watch?v=yjd-wZ9s_2E',
      }
    ]
  },
  {
    name: 'Monarch Butterfly',
    species: 'Danaus plexippus',
    category: 'Insect',
    images: ['https://images.unsplash.com/photo-1560064161-12c8b7f86eb8?q=80&w=1000&auto=format&fit=crop'],
    description: 'A milkweed butterfly known for its iconic orange and black wings and remarkable migration.',
    habitat: 'Meadows, prairies, and anywhere milkweed grows.',
    diet: 'Herbivore - nectar from flowers.',
    funFacts: ['They undertake a massive multi-generational migration.', 'Caterpillars only eat milkweed.'],
    conservationStatus: 'Endangered',
    educationContent: [
      {
        type: 'activity',
        title: 'Draw a Butterfly Activity',
        url: 'https://www.artforkidshub.com/how-to-draw-a-monarch-butterfly/',
      }
    ]
  }
];

const seedData = async () => {
  try {
    await connectDB();
    
    // Clear existing animals
    await Animal.deleteMany();
    console.log('Existing animals removed');

    // Insert new data
    await Animal.insertMany(mockAnimals);
    console.log('Mock animals seeded successfully!');

    process.exit();
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

seedData();
