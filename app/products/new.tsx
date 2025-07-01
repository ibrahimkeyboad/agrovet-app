import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';

import Colors from '@/constants/Colors';
import Typography from '@/constants/Typography';
import ProductCard from '@/components/common/ProductCard';
import { mockNewProducts } from '@/data/mockData';

export default function NewProductsScreen() {
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
          <Text style={styles.title}>New Arrivals</Text>
          <View style={{ width: 24 }} />
        </View>

        <FlatList
          data={mockNewProducts}
          keyExtractor={(item) => item.id}
          numColumns={2}
          contentContainerStyle={styles.productGrid}
          ListHeaderComponent={() => (
            <View style={styles.header}>
              <Text style={styles.subtitle}>
                Discover our latest products and innovations in agricultural supplies
              </Text>
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
  subtitle: {
    ...Typography.body,
    color: Colors.neutral[600],
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 16,
    paddingHorizontal: 24,
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