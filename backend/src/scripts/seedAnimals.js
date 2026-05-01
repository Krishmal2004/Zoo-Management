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
    description: 'The African elephant is the largest living terrestrial animal on Earth. Recognizable by their massive ears that act as built-in air conditioners to radiate excess heat, these majestic creatures are known for their deep family bonds and high intelligence. Their versatile trunks are capable of uprooting whole trees but also delicate enough to pick up a single berry.',
    habitat: 'Savannas, dense forests, and arid deserts across Sub-Saharan Africa.',
    diet: 'Herbivore - consuming massive quantities of leaves, branches, bark, and roots daily.',
    lifespan: '60 - 70 years',
    weight: '4,000 - 6,000 kg',
    funFacts: [
      'An elephant trunk has over 40,000 individual muscles.', 
      'They use mud as a natural sunscreen and insect repellent.',
      'Elephants can communicate using low-frequency rumbles that travel for miles underground.'
    ],
    conservationStatus: 'Endangered',
    educationContent: [
      {
        type: 'article',
        title: 'Elephant Social Structures',
        url: 'https://en.wikipedia.org/wiki/Elephant',
        imageUrl: 'https://images.unsplash.com/photo-1585468274952-66591eb14165?q=80&w=800&auto=format&fit=crop'
      },
      {
        type: 'video',
        title: 'Why Elephants Never Forget',
        url: 'https://www.youtube.com/watch?v=lFXyNj3QxOU',
        imageUrl: 'https://images.unsplash.com/photo-1557050543-4d5f4e07ef46?q=80&w=800&auto=format&fit=crop'
      },
      {
        type: 'quiz',
        title: 'Test Your Elephant Knowledge!',
        url: 'https://games.nationalgeographic.com/trivia/elephants',
        imageUrl: 'https://images.unsplash.com/photo-1565084888279-aca607ecce0c?q=80&w=800&auto=format&fit=crop'
      }
    ]
  },
  {
    name: 'Bengal Tiger',
    species: 'Panthera tigris tigris',
    category: 'Mammal',
    images: ['https://images.unsplash.com/photo-1549480017-d77466a410b5?q=80&w=1000&auto=format&fit=crop'],
    description: 'Bengal tigers are one of the biggest and most majestic big cats in the world. As solitary apex predators, they play a crucial role in maintaining the balance of their ecosystems. Tragically, heavy poaching and rapid habitat loss have severely threatened their survival in the wild.',
    habitat: 'Tropical moist broadleaf forests, mangroves, and tropical dry forests in India.',
    diet: 'Carnivore - hunting large ungulates like deer, wild boar, and water buffalo.',
    lifespan: '10 - 15 years',
    weight: '180 - 260 kg',
    funFacts: [
      'No two tigers have the exact same stripe pattern; they are as unique as human fingerprints.', 
      'Unlike most domestic cats, tigers are excellent and powerful swimmers.',
      'A tiger\'s roar can be heard from as far as two miles away.'
    ],
    conservationStatus: 'Endangered',
    educationContent: [
      {
        type: 'video',
        title: 'Tiger Hunt in the Wild',
        url: 'https://www.youtube.com/watch?v=1zBspPEOVyY',
        imageUrl: 'https://images.unsplash.com/photo-1615097130663-e3500a4fb9db?q=80&w=800&auto=format&fit=crop'
      },
      {
        type: 'game',
        title: 'Jungle Predator Game',
        url: 'https://pbskids.org/wildkratts/games/predator-power',
        imageUrl: 'https://images.unsplash.com/photo-1502082553048-f009c37129b9?q=80&w=800&auto=format&fit=crop'
      }
    ]
  },
  {
    name: 'Green Iguana',
    species: 'Iguana iguana',
    category: 'Reptile',
    images: ['https://images.unsplash.com/photo-1502458428863-718fa671ab11?q=80&w=1000&auto=format&fit=crop'],
    description: 'The green iguana is a large, arboreal, mostly herbivorous lizard. Despite their name, they can actually come in different colors including brown, blue, or even bright orange. They are agile climbers and spend most of their lives high up in the canopy of trees.',
    habitat: 'Tropical rainforest canopies of Northern Mexico, Central America, and South America.',
    diet: 'Herbivore - foraging for nutrient-rich leaves, flowers, and sweet fruit.',
    lifespan: '12 - 15 years',
    weight: '4 - 8 kg',
    funFacts: [
      'They possess a primitive "third eye" on top of their heads called a parietal eye used to sense predators from above.',
      'An iguana can survive a drop of 40 feet by using its hind claws to catch leaves and branches on the way down.'
    ],
    conservationStatus: 'Least Concern',
    educationContent: [
      {
        type: 'activity',
        title: 'Print & Color: Green Iguana',
        url: 'https://www.supercoloring.com/coloring-pages/green-iguana-1',
        imageUrl: 'https://images.unsplash.com/photo-1518331647614-7a1f04cd34ca?q=80&w=800&auto=format&fit=crop'
      }
    ]
  },
  {
    name: 'Macaw',
    species: 'Ara macao',
    category: 'Bird',
    images: ['https://images.unsplash.com/photo-1552560201-903dfc8230b7?q=80&w=1000&auto=format&fit=crop'],
    description: 'Macaws are stunning, long-tailed, incredibly colorful New World parrots. Their vivid plumage is perfectly suited to blend in with the bright fruits and flowers of the rainforest. They are highly intelligent, social birds that often gather in flocks of 10 to 30 individuals.',
    habitat: 'Humid, tropical evergreen rainforests and woodlands.',
    diet: 'Omnivore - a varied diet of seeds, hard nuts, fruits, and occasionally insects.',
    lifespan: '40 - 50 years',
    weight: '1 - 1.5 kg',
    funFacts: [
      'Some well-cared-for macaws can live to be over 80 years old.', 
      'They have bone inside their tongues, which helps them tap and break open incredibly hard seeds.',
      'Macaws mate for life and are rarely seen without their partner.'
    ],
    conservationStatus: 'Least Concern',
    educationContent: [
      {
        type: 'activity',
        title: 'Origami Macaw Craft',
        url: 'https://www.origami-make.org/origami-macaw.php',
        imageUrl: 'https://images.unsplash.com/photo-1621252179027-94459d278660?q=80&w=800&auto=format&fit=crop'
      },
      {
        type: 'quiz',
        title: 'Rainforest Birds Quiz',
        url: 'https://study.com/academy/practice/quiz-worksheet-rainforest-birds.html',
        imageUrl: 'https://images.unsplash.com/photo-1522856339183-5a0ceefd07fa?q=80&w=800&auto=format&fit=crop'
      }
    ]
  },
  {
    name: 'Giant Panda',
    species: 'Ailuropoda melanoleuca',
    category: 'Mammal',
    images: ['https://images.unsplash.com/photo-1564349683136-77e08dba1ef7?q=80&w=1000&auto=format&fit=crop'],
    description: 'The giant panda is an iconic bear species endemic to central China, easily recognized by its distinctive black-and-white coat. While they belong to the order Carnivora, their diet is almost exclusively vegetarian. They have a special "pseudo-thumb" adapted specifically for gripping bamboo stalks.',
    habitat: 'High-altitude, damp mountainous regions of central China.',
    diet: 'Herbivore - consuming vast quantities of bamboo (up to 38 kg daily).',
    lifespan: '20 - 25 years',
    weight: '70 - 120 kg',
    funFacts: [
      'Pandas spend up to 14 hours a day eating just to extract enough nutrients from bamboo.', 
      'Newborn pandas are incredibly tiny, weighing about as much as a single stick of butter.'
    ],
    conservationStatus: 'Vulnerable',
    educationContent: [
      {
        type: 'video',
        title: 'Panda Cub Playing',
        url: 'https://www.youtube.com/watch?v=sGF6bOi1NfA',
        imageUrl: 'https://images.unsplash.com/photo-1527118732049-c88155f2107c?q=80&w=800&auto=format&fit=crop'
      }
    ]
  },
  {
    name: 'Emperor Penguin',
    species: 'Aptenodytes forsteri',
    category: 'Bird',
    images: ['https://images.unsplash.com/photo-1598439210625-5067c578f3f6?q=80&w=1000&auto=format&fit=crop'],
    description: 'The emperor penguin is the tallest and heaviest of all living penguin species. It is endemic to the harsh, freezing environment of Antarctica. They are the only penguin species that breeds during the Antarctic winter, trekking 50-120 km over the ice to breeding colonies.',
    habitat: 'Pack ice and freezing ocean waters of Antarctica.',
    diet: 'Carnivore - diving deep to hunt for fish, krill, and squid.',
    lifespan: '15 - 20 years',
    weight: '22 - 45 kg',
    funFacts: [
      'They are incredible divers, capable of reaching depths of 500 meters and holding their breath for over 20 minutes.', 
      'Male penguins incubate a single egg on their feet for two straight months without eating anything at all.'
    ],
    conservationStatus: 'Near Threatened',
    educationContent: [
      {
        type: 'article',
        title: 'How Emperor Penguins Survive the Cold',
        url: 'https://en.wikipedia.org/wiki/Emperor_penguin',
        imageUrl: 'https://images.unsplash.com/photo-1559986341-3832d206f0e4?q=80&w=800&auto=format&fit=crop'
      }
    ]
  },
  {
    name: 'Poison Dart Frog',
    species: 'Dendrobatidae',
    category: 'Amphibian',
    images: ['https://images.unsplash.com/photo-1628169229045-812066fa4ce9?q=80&w=1000&auto=format&fit=crop'],
    description: 'Poison dart frogs are small, astonishingly brightly colored frogs. Their neon colors—ranging from electric blue to fire-engine red—serve as a clear warning to potential predators of their extreme toxicity. Indigenous peoples historically used their toxic secretions to poison the tips of their blowdarts.',
    habitat: 'Humid, tropical and subtropical rainforest environments of Central and South America.',
    diet: 'Carnivore - a steady diet of spiders, ants, termites, and small insects.',
    lifespan: '3 - 15 years',
    weight: '2 - 5 grams',
    funFacts: [
      'Their deadly poison actually comes from their diet of specific toxic ants and mites.', 
      'A single golden poison frog contains enough lethal toxin to kill 10 grown human adults.'
    ],
    conservationStatus: 'Vulnerable',
    educationContent: [
      {
        type: 'quiz',
        title: 'Amphibian Facts Quiz',
        url: 'https://games.nationalgeographic.com/trivia/amphibians',
        imageUrl: 'https://images.unsplash.com/photo-1598462013898-726e64627448?q=80&w=800&auto=format&fit=crop'
      }
    ]
  },
  {
    name: 'Great White Shark',
    species: 'Carcharodon carcharias',
    category: 'Fish',
    images: ['https://images.unsplash.com/photo-1560275619-4662e36fa65c?q=80&w=1000&auto=format&fit=crop'],
    description: 'The Great White Shark is a highly adapted, massive apex predator found in coastal surface waters of all major oceans. It is the largest known predatory fish on the planet, equipped with an incredible sense of smell and a torpedo-shaped body built for rapid bursts of incredible speed.',
    habitat: 'Coastal and offshore marine waters with cool temperatures between 12 and 24 °C.',
    diet: 'Carnivore - hunting large prey such as seals, sea lions, small whales, and seabirds.',
    lifespan: '30 - 70 years',
    weight: '1,500 - 2,400 kg',
    funFacts: [
      'Their olfactory bulb is so massive that they can detect a single drop of blood in 100 liters of water.', 
      'A Great White has up to 300 serrated, triangular teeth arranged in multiple rows that are constantly replaced.'
    ],
    conservationStatus: 'Vulnerable',
    educationContent: [
      {
        type: 'video',
        title: 'Great White Shark Breaching',
        url: 'https://www.youtube.com/watch?v=yjd-wZ9s_2E',
        imageUrl: 'https://images.unsplash.com/photo-1582967788606-a171c1080cb0?q=80&w=800&auto=format&fit=crop'
      }
    ]
  },
  {
    name: 'Monarch Butterfly',
    species: 'Danaus plexippus',
    category: 'Insect',
    images: ['https://images.unsplash.com/photo-1560064161-12c8b7f86eb8?q=80&w=1000&auto=format&fit=crop'],
    description: 'The Monarch is a magnificent milkweed butterfly, instantly recognizable by its iconic orange and black stained-glass wings. They are incredibly famous for their phenomenal multi-generational late-summer/autumn migration spanning thousands of miles from North America to Central Mexico.',
    habitat: 'Open meadows, sprawling prairies, and anywhere native milkweed grows in abundance.',
    diet: 'Herbivore - sipping sweet nectar from a wide variety of flowers.',
    lifespan: '2 - 6 weeks (up to 8 months for migrating generation)',
    weight: '0.27 - 0.75 grams',
    funFacts: [
      'Their massive migration is one of the most spectacular natural phenomena in the world, covering up to 3,000 miles.', 
      'Monarch caterpillars feed exclusively on milkweed plants, making them toxic to most predators.'
    ],
    conservationStatus: 'Endangered',
    educationContent: [
      {
        type: 'activity',
        title: 'Draw a Butterfly Activity',
        url: 'https://www.artforkidshub.com/how-to-draw-a-monarch-butterfly/',
        imageUrl: 'https://images.unsplash.com/photo-1541818224535-3c0516147e45?q=80&w=800&auto=format&fit=crop'
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
