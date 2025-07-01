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
import { mockCategories } from '@/data/mockData';

export default function CategoriesScreen() {
  const router = useRouter();

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.categoryCard}
      onPress={() => router.push(`/search?category=${item.id}`)}
    >
      <Image source={{ uri: item.icon }} style={styles.categoryImage} />
      <View style={styles.categoryContent}>
        <Text style={styles.categoryName}>{item.name}</Text>
        <Text style={styles.categoryCount}>150+ Products</Text>
      </View>
    </TouchableOpacity>
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
          <Text style={styles.title}>Categories</Text>
          <View style={{ width: 24 }} />
        </View>

        <View style={styles.content}>
          <Text style={styles.subtitle}>
            Browse through our curated collection of agricultural products
          </Text>

          <FlatList
            data={mockCategories}
            renderItem={renderItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.list}
            showsVerticalScrollIndicator={false}
          />
        </View>
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
  content: {
    flex: 1,
    padding: 16,
  },
  subtitle: {
    ...Typography.body,
    color: Colors.neutral[600],
    textAlign: 'center',
    marginBottom: 24,
    paddingHorizontal: 24,
  },
  list: {
    paddingBottom: 24,
  },
  categoryCard: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  categoryImage: {
    width: 100,
    height: 100,
  },
  categoryContent: {
    flex: 1,
    padding: 16,
    justifyContent: 'center',
  },
  categoryName: {
    ...Typography.h5,
    marginBottom: 4,
  },
  categoryCount: {
    ...Typography.body,
    color: Colors.primary[700],
  },
});