import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ScrollView,
  Modal,
} from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { Filter, X, ChevronDown } from 'lucide-react-native';

import Colors from '@/constants/Colors';
import Typography from '@/constants/Typography';
import SearchBar from '@/components/common/SearchBar';
import ProductCard from '@/components/common/ProductCard';
import Button from '@/components/common/Button';
import { mockAllProducts, mockCategories } from '@/data/mockData';

export default function SearchScreen() {
  const params = useLocalSearchParams<{ query?: string; category?: string }>();
  const [searchQuery, setSearchQuery] = useState(params.query || '');
  const [filteredProducts, setFilteredProducts] = useState(mockAllProducts);
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<{ min: number; max: number }>({
    min: 0,
    max: 10000,
  });
  const [sortOption, setSortOption] = useState<string>('popularity');

  useEffect(() => {
    if (params.query) {
      setSearchQuery(params.query);
    }
    if (params.category) {
      setSelectedCategories([params.category]);
    }
  }, [params.query, params.category]);

  useEffect(() => {
    filterProducts();
  }, [searchQuery, selectedCategories, priceRange, sortOption]);

  const filterProducts = () => {
    let results = [...mockAllProducts];

    // Filter by search query
    if (searchQuery) {
      results = results.filter(
        (product) =>
          product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          product.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by selected categories
    if (selectedCategories.length > 0) {
      results = results.filter((product) =>
        selectedCategories.includes(product.categoryId)
      );
    }

    // Filter by price range
    results = results.filter(
      (product) => product.price >= priceRange.min && product.price <= priceRange.max
    );

    // Sort
    switch (sortOption) {
      case 'price-low':
        results.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        results.sort((a, b) => b.price - a.price);
        break;
      case 'newest':
        results.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      case 'popularity':
      default:
        results.sort((a, b) => b.rating - a.rating);
        break;
    }

    setFilteredProducts(results);
  };

  const toggleCategory = (categoryId: string) => {
    setSelectedCategories((prev) =>
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const clearFilters = () => {
    setSelectedCategories([]);
    setPriceRange({ min: 0, max: 10000 });
    setSortOption('popularity');
  };

  const renderSortOption = (option: string, label: string) => (
    <TouchableOpacity
      style={[
        styles.sortOption,
        sortOption === option && styles.selectedSortOption,
      ]}
      onPress={() => setSortOption(option)}
    >
      <Text
        style={[
          styles.sortOptionText,
          sortOption === option && styles.selectedSortOptionText,
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );

  const renderFilterModal = () => (
    <Modal
      visible={filterModalVisible}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setFilterModalVisible(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Filters</Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setFilterModalVisible(false)}
            >
              <X size={24} color={Colors.neutral[800]} />
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={styles.modalBody}>
            <Text style={styles.filterSectionTitle}>Categories</Text>
            <View style={styles.categoriesContainer}>
              {mockCategories.map((category) => (
                <TouchableOpacity
                  key={category.id}
                  style={[
                    styles.categoryChip,
                    selectedCategories.includes(category.id) &&
                      styles.selectedCategoryChip,
                  ]}
                  onPress={() => toggleCategory(category.id)}
                >
                  <Text
                    style={[
                      styles.categoryChipText,
                      selectedCategories.includes(category.id) &&
                        styles.selectedCategoryChipText,
                    ]}
                  >
                    {category.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.filterSectionTitle}>Price Range</Text>
            <View style={styles.priceRangeContainer}>
              <View style={styles.priceInputContainer}>
                <Text style={styles.priceInputLabel}>Min</Text>
                <View style={styles.priceInput}>
                  <Text style={styles.priceInputText}>₹{priceRange.min}</Text>
                </View>
              </View>
              <View style={styles.priceRangeSeparator} />
              <View style={styles.priceInputContainer}>
                <Text style={styles.priceInputLabel}>Max</Text>
                <View style={styles.priceInput}>
                  <Text style={styles.priceInputText}>₹{priceRange.max}</Text>
                </View>
              </View>
            </View>

            <View style={styles.priceSlider}>
              {/* Slider would go here - simplified for this example */}
              <View style={styles.sliderTrack}>
                <View style={styles.sliderFill} />
                <View style={[styles.sliderThumb, { left: '0%' }]} />
                <View style={[styles.sliderThumb, { left: '80%' }]} />
              </View>
            </View>

            <View style={styles.filterActions}>
              <Button
                title="Clear All"
                onPress={clearFilters}
                variant="outline"
                style={styles.clearFilterButton}
              />
              <Button
                title="Apply Filters"
                onPress={() => setFilterModalVisible(false)}
                style={styles.applyFilterButton}
              />
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          onFilterPress={() => setFilterModalVisible(true)}
        />
      </View>

      <View style={styles.filtersBar}>
        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => setFilterModalVisible(true)}
        >
          <Filter size={16} color={Colors.neutral[800]} />
          <Text style={styles.filterButtonText}>Filters</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.sortButton}>
          <Text style={styles.sortButtonText}>Sort By</Text>
          <ChevronDown size={16} color={Colors.neutral[800]} />
        </TouchableOpacity>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.sortOptions}
      >
        {renderSortOption('popularity', 'Popularity')}
        {renderSortOption('price-low', 'Price: Low to High')}
        {renderSortOption('price-high', 'Price: High to Low')}
        {renderSortOption('newest', 'Newest First')}
      </ScrollView>

      <View style={styles.resultsContainer}>
        <Text style={styles.resultsCount}>{filteredProducts.length} Results</Text>
      </View>

      <FlatList
        data={filteredProducts}
        keyExtractor={(item) => item.id}
        numColumns={2}
        contentContainerStyle={styles.productGrid}
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

      {renderFilterModal()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.neutral[50],
  },
  header: {
    backgroundColor: Colors.white,
    paddingTop: 60,
    paddingBottom: 8,
  },
  filtersBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral[200],
    backgroundColor: Colors.white,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.neutral[300],
  },
  filterButtonText: {
    ...Typography.bodySmall,
    marginLeft: 4,
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.neutral[300],
  },
  sortButtonText: {
    ...Typography.bodySmall,
    marginRight: 4,
  },
  sortOptions: {
    backgroundColor: Colors.white,
    paddingLeft: 8,
    paddingBottom: 12,
  },
  sortOption: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginHorizontal: 4,
    borderRadius: 16,
    backgroundColor: Colors.neutral[100],
  },
  selectedSortOption: {
    backgroundColor: Colors.primary[100],
  },
  sortOptionText: {
    ...Typography.bodySmall,
    color: Colors.neutral[700],
  },
  selectedSortOptionText: {
    color: Colors.primary[700],
    fontFamily: 'Inter-Medium',
  },
  resultsContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  resultsCount: {
    ...Typography.bodySmall,
    color: Colors.neutral[600],
  },
  productGrid: {
    paddingHorizontal: 8,
    paddingBottom: 24,
  },
  productCardContainer: {
    margin: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral[200],
    position: 'relative',
  },
  modalTitle: {
    ...Typography.h4,
  },
  closeButton: {
    position: 'absolute',
    right: 16,
    top: 16,
  },
  modalBody: {
    padding: 24,
  },
  filterSectionTitle: {
    ...Typography.h5,
    marginBottom: 16,
  },
  categoriesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 24,
  },
  categoryChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.neutral[100],
    marginRight: 8,
    marginBottom: 8,
  },
  selectedCategoryChip: {
    backgroundColor: Colors.primary[100],
  },
  categoryChipText: {
    ...Typography.bodySmall,
    color: Colors.neutral[700],
  },
  selectedCategoryChipText: {
    color: Colors.primary[700],
    fontFamily: 'Inter-Medium',
  },
  priceRangeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  priceInputContainer: {
    flex: 1,
  },
  priceInputLabel: {
    ...Typography.caption,
    marginBottom: 4,
  },
  priceInput: {
    borderWidth: 1,
    borderColor: Colors.neutral[300],
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  priceInputText: {
    ...Typography.body,
  },
  priceRangeSeparator: {
    width: 12,
    height: 1,
    backgroundColor: Colors.neutral[400],
    marginHorizontal: 16,
    marginTop: 20,
  },
  priceSlider: {
    marginBottom: 24,
  },
  sliderTrack: {
    height: 4,
    backgroundColor: Colors.neutral[300],
    borderRadius: 2,
    marginVertical: 16,
    position: 'relative',
  },
  sliderFill: {
    position: 'absolute',
    left: '0%',
    right: '20%',
    height: 4,
    backgroundColor: Colors.primary[500],
    borderRadius: 2,
  },
  sliderThumb: {
    position: 'absolute',
    top: -8,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: Colors.white,
    borderWidth: 2,
    borderColor: Colors.primary[500],
  },
  filterActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  clearFilterButton: {
    flex: 1,
    marginRight: 8,
  },
  applyFilterButton: {
    flex: 1,
    marginLeft: 8,
  },
});