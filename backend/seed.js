// Seed script to add initial pickle data
const mongoose = require('mongoose');
const Pickle = require('./models/Pickle');

const pickles = [
  // NON-VEG PICKLES
  {
    name: 'Boneless Chicken Pickle',
    description: 'Spicy & Juicy Boneless Chicken marinated in authentic Andhra spices. A bold, fiery pickle that is perfect with rice.',
    category: 'non-veg',
    price250g: 320, price500g: 600, price1kg: 1200,
    spiceLevel: 'hot',
    isBestseller: true,
    inStock: true,
    ingredients: 'Boneless Chicken, Red Chillies, Sesame Oil, Mustard Seeds, Garlic, Ginger',
    imageUrl: 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=400&q=80',
    tags: ['chicken', 'spicy', 'bestseller']
  },
  {
    name: 'Bone Chicken Pickle',
    description: 'Rich & Traditional Bone-In Flavor, slow cooked with Andhra spices for deep, authentic taste.',
    category: 'non-veg',
    price250g: 260, price500g: 500, price1kg: 1000,
    spiceLevel: 'hot',
    isBestseller: false,
    inStock: true,
    ingredients: 'Bone-in Chicken, Red Chillies, Sesame Oil, Traditional Spices',
    imageUrl: 'https://images.unsplash.com/photo-1610614819513-58e34989848b?w=400&q=80',
    tags: ['chicken', 'traditional']
  },
  {
    name: 'Gungura Boneless Chicken Pickle',
    description: 'Tangy Gongura with Tender Boneless Chicken — an iconic Andhra combination you will love.',
    category: 'non-veg',
    price250g: 350, price500g: 675, price1kg: 1350,
    spiceLevel: 'extra-hot',
    isBestseller: true,
    inStock: true,
    ingredients: 'Boneless Chicken, Gongura Leaves, Red Chillies, Sesame Oil, Spices',
    imageUrl: 'https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?w=400&q=80',
    tags: ['chicken', 'gongura', 'tangy']
  },
  {
    name: 'Regular Prawns Pickle',
    description: 'Classic Spicy Prawns slow cooked in Andhra style sesame oil blend.',
    category: 'non-veg',
    price250g: 430, price500g: 825, price1kg: 1650,
    spiceLevel: 'medium',
    isBestseller: false,
    inStock: true,
    ingredients: 'Fresh Prawns, Red Chillies, Sesame Oil, Mustard Seeds, Fenugreek',
    imageUrl: 'https://images.unsplash.com/photo-1599974579688-8dbdd335c77f?w=400&q=80',
    tags: ['prawns', 'seafood']
  },
  {
    name: 'Gungura Prawns Pickle',
    description: 'Tangy Gongura with Succulent Prawns — a surf-and-tang delight from Andhra kitchens.',
    category: 'non-veg',
    price250g: 470, price500g: 900, price1kg: 1800,
    spiceLevel: 'hot',
    isBestseller: true,
    inStock: true,
    ingredients: 'Prawns, Gongura, Red Chillies, Sesame Oil, Spices',
    imageUrl: 'https://images.unsplash.com/photo-1605493725784-938a3e7c82e6?w=400&q=80',
    tags: ['prawns', 'gongura', 'seafood']
  },
  {
    name: 'Koramenu Fish Pickle',
    description: 'Popular Andhra-Style Fish Pickle with fresh Koramenu fish in a spicy oil marinade.',
    category: 'non-veg',
    price250g: 400, price500g: 750, price1kg: 1500,
    spiceLevel: 'hot',
    isBestseller: false,
    inStock: true,
    ingredients: 'Koramenu Fish, Red Chillies, Sesame Oil, Turmeric, Spices',
    imageUrl: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=400&q=80',
    tags: ['fish', 'seafood', 'andhra']
  },
  {
    name: 'Rava Fish Pickle',
    description: 'Crispy, Spicy & Full of Flavor — rava-coated fish in zingy pickle masala.',
    category: 'non-veg',
    price250g: 280, price500g: 500, price1kg: 1000,
    spiceLevel: 'medium',
    isBestseller: false,
    inStock: true,
    ingredients: 'Fish, Rava, Red Chillies, Sesame Oil, Spices',
    imageUrl: 'https://images.unsplash.com/photo-1476124369491-e7addf5db371?w=400&q=80',
    tags: ['fish', 'crispy', 'rava']
  },

  // VEG PICKLES
  {
    name: 'Amla Pickle',
    description: 'Tangy, Healthy & Delicious gooseberry pickle with Vitamin C goodness and traditional spices.',
    category: 'veg',
    price250g: 210, price500g: 400, price1kg: 769,
    spiceLevel: 'medium',
    isBestseller: true,
    inStock: true,
    ingredients: 'Amla (Gooseberry), Mustard Seeds, Red Chillies, Sesame Oil, Salt',
    imageUrl: 'https://images.unsplash.com/photo-1601648764658-cf37e8c89b70?w=400&q=80',
    tags: ['healthy', 'amla', 'vitamin-c']
  },
  {
    name: 'Tomato Pickle',
    description: 'Spicy & Tangy Tomato Delight — Andhra style tomato pickle with mustard and chillies.',
    category: 'veg',
    price250g: 180, price500g: 260, price1kg: 479,
    spiceLevel: 'medium',
    isBestseller: true,
    inStock: true,
    ingredients: 'Tomatoes, Mustard Oil, Red Chillies, Garlic, Tamarind, Spices',
    imageUrl: 'https://images.unsplash.com/photo-1503764654157-72d979d9af2f?w=400&q=80',
    tags: ['tomato', 'tangy']
  },
  {
    name: 'Mango Pickle (Avakaya)',
    description: 'Traditional Raw Mango Goodness — the iconic Andhra Avakaya with mustard and sesame oil.',
    category: 'veg',
    price250g: 220, price500g: 420, price1kg: 799,
    spiceLevel: 'hot',
    isBestseller: true,
    inStock: true,
    ingredients: 'Raw Mango, Mustard Powder, Red Chilli Powder, Sesame Oil, Salt',
    imageUrl: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=400&q=80',
    tags: ['mango', 'avakaya', 'bestseller', 'andhra']
  },
  {
    name: 'Pandu Mirchi Pickle',
    description: 'Spicy Green Chillies with Authentic Taste — made from fresh pandu mirchi and special masalas.',
    category: 'veg',
    price250g: 170, price500g: 260, price1kg: 479,
    spiceLevel: 'extra-hot',
    isBestseller: false,
    inStock: true,
    ingredients: 'Green Chillies, Mustard Seeds, Sesame Oil, Tamarind, Salt',
    imageUrl: 'https://images.unsplash.com/photo-1529543544282-ea669407fca3?w=400&q=80',
    tags: ['chilli', 'hot', 'spicy']
  },
  {
    name: 'Ginger Pickle',
    description: 'Aromatic, Spicy & Refreshing — fresh ginger in a tangy pickle for digestion and taste.',
    category: 'veg',
    price250g: 200, price500g: 380, price1kg: 699,
    spiceLevel: 'medium',
    isBestseller: false,
    inStock: true,
    ingredients: 'Fresh Ginger, Mustard Seeds, Red Chillies, Sesame Oil, Lemon',
    imageUrl: 'https://images.unsplash.com/photo-1603360946369-dc9bb6258143?w=400&q=80',
    tags: ['ginger', 'aromatic', 'digestive']
  },
  {
    name: 'Gongura Pickle',
    description: 'Tangy Gongura Leaves with Perfect Spice — Andhra\'s most beloved sorrel leaf pickle.',
    category: 'veg',
    price250g: 170, price500g: 260, price1kg: 479,
    spiceLevel: 'medium',
    isBestseller: true,
    inStock: true,
    ingredients: 'Gongura Leaves, Mustard Seeds, Red Chillies, Sesame Oil, Garlic',
    imageUrl: 'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=400&q=80',
    tags: ['gongura', 'tangy', 'andhra']
  }
];

async function seed() {
  try {
    const MONGO_URI = "mongodb://manukamepalli8399_db_user:manu%4012345@ac-9m58rqe-shard-00-00.jutmhqc.mongodb.net:27017,ac-9m58rqe-shard-00-01.jutmhqc.mongodb.net:27017,ac-9m58rqe-shard-00-02.jutmhqc.mongodb.net:27017/?ssl=true&replicaSet=atlas-o0bv7h-shard-0&authSource=admin&appName=DakshithaPickles";
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');

    // Force wipe old collection to update prices from menu
    await Pickle.deleteMany({});
    console.log(`Database wiped. Proceeding with fresh seed...`);
    
    await Pickle.insertMany(pickles);
    console.log(`✅ Seeded ${pickles.length} pickles successfully!`);

    // Add Admin User
    const Admin = require('./models/Admin');
    await Admin.deleteMany({}); // Clear old admin
    await Admin.create({ secretKey: 'DAKSHITHA_ADMIN' });
    console.log('✅ Admin user created! (Key: DAKSHITHA_ADMIN)');

    mongoose.disconnect();
  } catch (err) {
    console.error('Seed error:', err.message);
    process.exit(1);
  }
}

seed();
