// Mock data for categories
export const mockCategories = [
  {
    id: 'c1',
    name: 'Seeds',
    icon: 'https://images.pexels.com/photos/8100784/pexels-photo-8100784.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
  },
  {
    id: 'c2',
    name: 'Fertilizers',
    icon: 'https://images.pexels.com/photos/5187232/pexels-photo-5187232.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
  },
  {
    id: 'c3',
    name: 'Pesticides',
    icon: 'https://images.pexels.com/photos/6200343/pexels-photo-6200343.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
  },
  {
    id: 'c4',
    name: 'Farm Equipment',
    icon: 'https://images.pexels.com/photos/2933243/pexels-photo-2933243.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
  },
  {
    id: 'c5',
    name: 'Irrigation',
    icon: 'https://images.pexels.com/photos/4505165/pexels-photo-4505165.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
  },
  {
    id: 'c6',
    name: 'Animal Feed',
    icon: 'https://images.pexels.com/photos/6152391/pexels-photo-6152391.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
  },
];

// Mock data for featured products - Updated with TZS prices
export const mockFeaturedProducts = [
  {
    id: 'p1',
    name: 'Premium Corn Seeds (5kg)',
    description: 'High-yield, disease-resistant corn seeds suitable for various soil types. Includes a balanced mix of hybrid corn varieties optimized for both commercial farming and small-scale agriculture.',
    imageUrl: 'https://images.pexels.com/photos/547263/pexels-photo-547263.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    price: 57500, // Converted to TZS (was 2500 INR)
    originalPrice: 69000, // Converted to TZS (was 3000 INR)
    rating: 4.8,
    reviews: 124,
    supplier: 'AgroTech Solutions',
    categoryId: 'c1',
    createdAt: '2023-09-15',
    inStock: true,
    stockQuantity: 150,
    variants: [
      { id: 'v1', name: 'size', value: '5kg', priceAdjustment: 0 },
      { id: 'v2', name: 'size', value: '10kg', priceAdjustment: 50000 },
    ],
  },
  {
    id: 'p2',
    name: 'Organic NPK Fertilizer (25kg)',
    description: 'Balanced organic fertilizer with optimal nitrogen, phosphorus, and potassium ratio for healthy plant growth. Made from natural ingredients, this fertilizer improves soil health while providing essential nutrients.',
    imageUrl: 'https://images.pexels.com/photos/2423528/pexels-photo-2423528.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    price: 80500, // Converted to TZS (was 3500 INR)
    originalPrice: 92000, // Converted to TZS (was 4000 INR)
    rating: 4.7,
    reviews: 98,
    supplier: 'EcoFarm Supplies',
    categoryId: 'c2',
    createdAt: '2023-10-20',
    inStock: true,
    stockQuantity: 75,
  },
  {
    id: 'p3',
    name: 'Multi-purpose Pesticide (1L)',
    description: 'Effective against a wide range of pests while being safe for crops. This environmentally-friendly formula protects your plants without harmful residues that could affect soil health or crop quality.',
    imageUrl: 'https://images.pexels.com/photos/7728030/pexels-photo-7728030.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    price: 41400, // Converted to TZS (was 1800 INR)
    originalPrice: null,
    rating: 4.5,
    reviews: 75,
    supplier: 'AgroDefend',
    categoryId: 'c3',
    createdAt: '2023-11-05',
    inStock: true,
    stockQuantity: 200,
  },
  {
    id: 'p4',
    name: 'Drip Irrigation Kit (500m²)',
    description: 'Complete water-efficient irrigation system for medium-sized farms. This kit includes everything needed for precision watering, reducing water usage while maximizing crop hydration.',
    imageUrl: 'https://images.pexels.com/photos/5187240/pexels-photo-5187240.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    price: 276000, // Converted to TZS (was 12000 INR)
    originalPrice: 345000, // Converted to TZS (was 15000 INR)
    rating: 4.9,
    reviews: 64,
    supplier: 'WaterWise Systems',
    categoryId: 'c5',
    createdAt: '2023-08-25',
    inStock: true,
    stockQuantity: 25,
  },
  {
    id: 'p5',
    name: 'Premium Poultry Feed (50kg)',
    description: 'Nutritionally balanced feed for healthy poultry growth and egg production. Formulated with essential vitamins and minerals to support optimal bird health and productivity throughout all growth stages.',
    imageUrl: 'https://images.pexels.com/photos/2255459/pexels-photo-2255459.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    price: 103500, // Converted to TZS (was 4500 INR)
    originalPrice: null,
    rating: 4.6,
    reviews: 82,
    supplier: 'FarmFeed Pro',
    categoryId: 'c6',
    createdAt: '2023-12-01',
    inStock: true,
    stockQuantity: 100,
  },
  {
    id: 'p6',
    name: 'Manual Seed Planter',
    description: 'Efficient handheld tool for precise seed planting with adjustable depth control. This ergonomic tool reduces back strain while allowing for consistent seed spacing and improved germination rates.',
    imageUrl: 'https://images.pexels.com/photos/7728236/pexels-photo-7728236.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    price: 73600, // Converted to TZS (was 3200 INR)
    originalPrice: 92000, // Converted to TZS (was 4000 INR)
    rating: 4.4,
    reviews: 56,
    supplier: 'FarmTools Plus',
    categoryId: 'c4',
    createdAt: '2024-01-10',
    inStock: true,
    stockQuantity: 50,
  },
];

// Mock data for new products - Updated with TZS prices
export const mockNewProducts = [
  {
    id: 'p7',
    name: 'Smart Soil Moisture Sensor',
    description: 'Wireless sensor that monitors soil moisture levels and sends alerts to your smartphone. This IoT device helps optimize irrigation scheduling based on real-time soil conditions.',
    imageUrl: 'https://images.pexels.com/photos/356056/pexels-photo-356056.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    price: 126500, // Converted to TZS (was 5500 INR)
    originalPrice: null,
    rating: 4.3,
    reviews: 28,
    supplier: 'AgriTech Innovations',
    categoryId: 'c5',
    createdAt: '2024-04-25',
    inStock: true,
    stockQuantity: 30,
  },
  {
    id: 'p8',
    name: 'Biodegradable Mulch Film (500m)',
    description: 'Eco-friendly mulch film that suppresses weeds and conserves soil moisture. This innovative film breaks down naturally after the growing season, eliminating waste and soil contamination.',
    imageUrl: 'https://images.pexels.com/photos/1459331/pexels-photo-1459331.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    price: 156400, // Converted to TZS (was 6800 INR)
    originalPrice: 172500, // Converted to TZS (was 7500 INR)
    rating: 4.7,
    reviews: 35,
    supplier: 'EcoFarm Supplies',
    categoryId: 'c2',
    createdAt: '2024-04-15',
    inStock: true,
    stockQuantity: 40,
  },
  {
    id: 'p9',
    name: 'Hybrid Tomato Seeds (100g)',
    description: 'Disease-resistant tomato variety with high yield potential and excellent flavor. These seeds are specially bred for African climate conditions and deliver consistent results across diverse growing environments.',
    imageUrl: 'https://images.pexels.com/photos/533280/pexels-photo-533280.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    price: 27600, // Converted to TZS (was 1200 INR)
    originalPrice: null,
    rating: 4.8,
    reviews: 42,
    supplier: 'AgroTech Solutions',
    categoryId: 'c1',
    createdAt: '2024-04-10',
    inStock: true,
    stockQuantity: 120,
  },
  {
    id: 'p10',
    name: 'Solar-Powered Water Pump',
    description: 'Energy-efficient water pump that runs on solar power, ideal for remote farming areas. This sustainable solution provides reliable water access without dependence on grid electricity or expensive fuel.',
    imageUrl: 'https://images.pexels.com/photos/4355620/pexels-photo-4355620.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    price: 575000, // Converted to TZS (was 25000 INR)
    originalPrice: 644000, // Converted to TZS (was 28000 INR)
    rating: 4.9,
    reviews: 19,
    supplier: 'WaterWise Systems',
    categoryId: 'c5',
    createdAt: '2024-04-05',
    inStock: true,
    stockQuantity: 10,
  },
  {
    id: 'p11',
    name: 'Organic Cattle Feed Supplement (20kg)',
    description: 'Mineral-rich supplement to improve cattle health and milk production. This organic formula supports immune function, reproductive health, and overall performance in dairy and beef cattle.',
    imageUrl: 'https://images.pexels.com/photos/422218/pexels-photo-422218.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    price: 110400, // Converted to TZS (was 4800 INR)
    originalPrice: 119600, // Converted to TZS (was 5200 INR)
    rating: 4.6,
    reviews: 24,
    supplier: 'FarmFeed Pro',
    categoryId: 'c6',
    createdAt: '2024-03-30',
    inStock: true,
    stockQuantity: 60,
  },
  {
    id: 'p12',
    name: 'Bio-Fungicide Powder (500g)',
    description: 'Natural fungal disease treatment safe for organic farming practices. This plant-based formula effectively controls common fungal pathogens without harmful chemical residues or environmental damage.',
    imageUrl: 'https://images.pexels.com/photos/3934239/pexels-photo-3934239.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    price: 36800, // Converted to TZS (was 1600 INR)
    originalPrice: 41400, // Converted to TZS (was 1800 INR)
    rating: 4.5,
    reviews: 31,
    supplier: 'AgroDefend',
    categoryId: 'c3',
    createdAt: '2024-03-25',
    inStock: true,
    stockQuantity: 80,
  },
];

// Combine for all products
export const mockAllProducts = [...mockFeaturedProducts, ...mockNewProducts];

// Mock data for cart items - Updated with TZS prices
export const mockCartItems = [
  {
    id: 'c1',
    name: 'Premium Corn Seeds (5kg)',
    imageUrl: 'https://images.pexels.com/photos/547263/pexels-photo-547263.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    price: 57500,
    quantity: 2,
    supplier: 'AgroTech Solutions',
  },
  {
    id: 'c2',
    name: 'Organic NPK Fertilizer (25kg)',
    imageUrl: 'https://images.pexels.com/photos/2423528/pexels-photo-2423528.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    price: 80500,
    quantity: 1,
    supplier: 'EcoFarm Supplies',
  },
  {
    id: 'c3',
    name: 'Drip Irrigation Kit (500m²)',
    imageUrl: 'https://images.pexels.com/photos/5187240/pexels-photo-5187240.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    price: 276000,
    quantity: 1,
    supplier: 'WaterWise Systems',
  },
];

// Mock data for orders - Updated with TZS prices
export const mockOrders = [
  {
    id: 'o1',
    orderNumber: 'AG80320',
    date: 'May 15, 2025',
    status: 'delivered',
    total: 195500,
    items: [
      {
        id: 'p1',
        name: 'Premium Corn Seeds (5kg)',
        imageUrl: 'https://images.pexels.com/photos/547263/pexels-photo-547263.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
        price: 57500,
        quantity: 2,
      },
      {
        id: 'p2',
        name: 'Organic NPK Fertilizer (25kg)',
        imageUrl: 'https://images.pexels.com/photos/2423528/pexels-photo-2423528.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
        price: 80500,
        quantity: 1,
      },
    ],
  },
  {
    id: 'o2',
    orderNumber: 'AG80310',
    date: 'May 10, 2025',
    status: 'shipped',
    total: 363400,
    items: [
      {
        id: 'p4',
        name: 'Drip Irrigation Kit (500m²)',
        imageUrl: 'https://images.pexels.com/photos/5187240/pexels-photo-5187240.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
        price: 276000,
        quantity: 1,
      },
      {
        id: 'p3',
        name: 'Multi-purpose Pesticide (1L)',
        imageUrl: 'https://images.pexels.com/photos/7728030/pexels-photo-7728030.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
        price: 41400,
        quantity: 1,
      },
      {
        id: 'p6',
        name: 'Manual Seed Planter',
        imageUrl: 'https://images.pexels.com/photos/7728236/pexels-photo-7728236.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
        price: 46000,
        quantity: 1,
      },
    ],
  },
  {
    id: 'o3',
    orderNumber: 'AG80290',
    date: 'May 05, 2025',
    status: 'processing',
    total: 177100,
    items: [
      {
        id: 'p7',
        name: 'Smart Soil Moisture Sensor',
        imageUrl: 'https://images.pexels.com/photos/356056/pexels-photo-356056.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
        price: 126500,
        quantity: 1,
      },
      {
        id: 'p9',
        name: 'Hybrid Tomato Seeds (100g)',
        imageUrl: 'https://images.pexels.com/photos/533280/pexels-photo-533280.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
        price: 25300,
        quantity: 2,
      },
    ],
  },
];