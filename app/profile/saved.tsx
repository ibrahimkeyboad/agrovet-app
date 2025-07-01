import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
} from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { ArrowLeft, Heart, ShoppingCart, Search, Filter } from 'lucide-react-native';

import Colors from '@/constants/Colors';
import Typography from '@/constants/Typography';
import Card from '@/components/common/Card';
import SearchBar from '@/components/common/SearchBar';
import Button from '@/components/common/Button';
import { mockFeaturedProducts } from '@/data/mockData';

export default function SavedProductsScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [savedProducts, setSavedProducts] = useState(
    // Mock some saved products
    mockFeaturedProducts.slice(0, 4).map(product => ({
      ...product,
      savedAt: new Date().toISOString(),
    }))
  );

  const filteredProducts = savedProducts.filter(product =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.supplier.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const removeFavorite = (productId: string) => {
    setSavedProducts(savedProducts.filter(product => product.id !== productId));
  };

  const addToCart = (productId: string) => {
    // Mock add to cart functionality
    console.log('Added to cart:', productId);
  };

  const renderProduct = ({ item }) => (
    <TouchableOpacity
      style={styles.productCard}
      onPress={() => router.push(`/products/${item.id}`)}
      activeOpacity={0.9}
    >
      <Card style={styles.card}>
        <View style={styles.imageContainer}>
          <Image source={{ uri: item.imageUrl }} style={styles.productImage} />
          <TouchableOpacity
            style={styles.favoriteButton}
            onPress={() => removeFavorite(item.id)}
          >
            <Heart size={20} color={Colors.error[500]} fill={Colors.error[500]} />
          </TouchableOpacity>
          {item.originalPrice && item.originalPrice > item.price && (
            <View style={styles.discountBadge}>
              <Text style={styles.discountText}>
                -{Math.round(((item.originalPrice - item.price) / item.originalPrice) * 100)}%
              </Text>
            </View>
          )}
        </View>

        <View style={styles.productInfo}>
          <Text style={styles.supplier}>{item.supplier}</Text>
          <Text style={styles.productName} numberOfLines={2}>
            {item.name}
          </Text>
          
          <View style={styles.priceContainer}>
            <Text style={styles.price}>₹{item.price.toFixed(2)}</Text>
            {item.originalPrice && item.originalPrice > item.price && (
              <Text style={styles.originalPrice}>₹{item.originalPrice.toFixed(2)}</Text>
            )}
          </View>

          <View style={styles.ratingContainer}>
            <View style={styles.ratingStars}>
              {[1, 2, 3, 4, 5].map((star) => (
                <Text
                  key={star}
                  style={[
                    styles.star,
                    star <= Math.floor(item.rating) && styles.filledStar,
                  ]}
                >
                  ★
                </Text>
              ))}
            </View>
            <Text style={styles.ratingText}>({item.reviews})</Text>
          </View>

          <TouchableOpacity
            style={styles.addToCartButton}
            onPress={() => addToCart(item.id)}
          >
            <ShoppingCart size={16} color={Colors.white} />
            <Text style={styles.addToCartText}>Add to Cart</Text>
          </TouchableOpacity>
        </View>
      </Card>
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Heart size={64} color={Colors.neutral[400]} />
      <Text style={styles.emptyStateTitle}>No Saved Products</Text>
      <Text style={styles.emptyStateText}>
        {searchQuery 
          ? 'No saved products match your search'
          : 'Start saving products you love by tapping the heart icon'
        }
      </Text>
      {!searchQuery && (
        <Button
          title="Browse Products"
          onPress={() => router.push('/(tabs)')}
          style={styles.browseButton}
        />
      )}
    </View>
  );

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
          <Text style={styles.title}>Saved Products</Text>
          <View style={{ width: 24 }} />
        </View>

        <View style={styles.searchContainer}>
          <SearchBar
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search saved products..."
            onClear={() => setSearchQuery('')}
          />
        </View>

        <View style={styles.resultsHeader}>
          <Text style={styles.resultsCount}>
            {filteredProducts.length} saved {filteredProducts.length === 1 ? 'product' : 'products'}
          </Text>
        </View>

        <FlatList
          data={filteredProducts}
          keyExtractor={(item) => item.id}
          renderItem={renderProduct}
          numColumns={2}
          contentContainerStyle={[
            styles.productsList,
            filteredProducts.length === 0 && styles.emptyList,
          ]}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={renderEmptyState}
          columnWrapperStyle={filteredProducts.length > 0 ? styles.row : undefined}
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
  searchContainer: {
    backgroundColor: Colors.white,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral[200],
  },
  resultsHeader: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: Colors.white,
  },
  resultsCount: {
    ...Typography.bodySmall,
    color: Colors.neutral[600],
  },
  productsList: {
    padding: 8,
    paddingBottom: 40,
  },
  emptyList: {
    flex: 1,
    justifyContent: 'center',
  },
  row: {
    justifyContent: 'space-between',
    paddingHorizontal: 8,
  },
  productCard: {
    width: '48%',
    marginBottom: 16,
  },
  card: {
    padding: 0,
    overflow: 'hidden',
  },
  imageContainer: {
    position: 'relative',
    height: 140,
  },
  productImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  favoriteButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  discountBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: Colors.error[500],
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  discountText: {
    ...Typography.caption,
    color: Colors.white,
    fontFamily: 'Inter-SemiBold',
    fontSize: 10,
  },
  productInfo: {
    padding: 12,
  },
  supplier: {
    ...Typography.caption,
    color: Colors.primary[700],
    marginBottom: 2,
  },
  productName: {
    ...Typography.body,
    fontFamily: 'Inter-SemiBold',
    marginBottom: 6,
    lineHeight: 18,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  price: {
    ...Typography.price,
    fontSize: 16,
    marginRight: 6,
  },
  originalPrice: {
    ...Typography.discount,
    fontSize: 12,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  ratingStars: {
    flexDirection: 'row',
    marginRight: 4,
  },
  star: {
    fontSize: 12,
    color: Colors.neutral[300],
  },
  filledStar: {
    color: Colors.warning[500],
  },
  ratingText: {
    ...Typography.caption,
    color: Colors.neutral[600],
    fontSize: 10,
  },
  addToCartButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary[700],
    borderRadius: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  addToCartText: {
    ...Typography.button,
    fontSize: 12,
    marginLeft: 4,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 32,
  },
  emptyStateTitle: {
    ...Typography.h4,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateText: {
    ...Typography.body,
    color: Colors.neutral[600],
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  browseButton: {
    paddingHorizontal: 32,
  },
});