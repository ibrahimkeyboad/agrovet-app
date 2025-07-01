import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
} from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';

import Colors from '@/constants/Colors';
import Typography from '@/constants/Typography';
import ProductCard from '@/components/common/ProductCard';
import { mockFeaturedProducts } from '@/data/mockData';

export default function FeaturedProductsScreen() {
  const router = useRouter();

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />
      
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={() => router.back()}
          >
            <ArrowLeft size={24} color={Colors.neutral[800]} />
          </TouchableOpacity>
          <Text style={styles.title}>Featured Products</Text>
          <View style={{ width: 24 }} />
        </View>

        <FlatList
          data={mockFeaturedProducts}
          keyExtractor={(item) => item.id}
          numColumns={2}
          contentContainerStyle={styles.productGrid}
          ListHeaderComponent={() => (
            <View style={styles.banner}>
              <Image
                source={{ uri: 'https://images.pexels.com/photos/7728071/pexels-photo-7728071.jpeg' }}
                style={styles.bannerImage}
              />
              <View style={styles.bannerOverlay}>
                <Text style={styles.bannerTitle}>20% OFF ON FERTILIZERS</Text>
                <Text style={styles.bannerSubtitle}>Special offer this week only</Text>
              </View>
            </View>
          )}
          renderItem={({ item }) => (
            <View style={styles.productCardContainer}>
              <ProductCard
                id={item.id}
                name={item.name}
                imageUrl={item.imageUrl}
                price={item.price}
                originalPrice={item.originalPrice}
                supplier={item.supplier}
                onAddToCart={() => {}}
              />
            </View>
          )}
        />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.neutral[50],
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 16,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral[200],
  },
  backButton: {
    padding: 4,
  },
  title: {
    ...Typography.h4,
  },
  banner: {
    height: 180,
    margin: 16,
    borderRadius: 12,
    overflow: 'hidden',
  },
  bannerImage: {
    width: '100%',
    height: '100%',
  },
  bannerOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  bannerTitle: {
    ...Typography.h3,
    color: Colors.white,
    marginBottom: 8,
  },
  bannerSubtitle: {
    ...Typography.body,
    color: Colors.white,
  },
  productGrid: {
    paddingHorizontal: 8,
    paddingBottom: 24,
  },
  productCardContainer: {
    flex: 1,
    padding: 8,
  },
});