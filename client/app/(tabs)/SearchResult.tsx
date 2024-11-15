import React, { useEffect, useState } from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Product } from '@/services/productService';

const SearchResult = () => {
  const router = useRouter();
  const { data } = useLocalSearchParams(); // Retrieve the serialized data passed via route
  const [productData, setProductData] = useState<Product | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      if (!data) {
        throw new Error('No product data provided.');
      }

      const parsedData = JSON.parse(data as string);
      setProductData(parsedData);
    } catch (err: any) {
      console.error('Error parsing product data:', err.message || err);
      setError('Invalid product data received.');
    }
  }, [data]);

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>{error}</Text>
        <Button title="Back" onPress={() => router.back()} />
      </View>
    );
  }

  if (!productData) {
    return (
      <View style={styles.container}>
        <Text>Loading product data...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Button title="Back" onPress={() => router.back()} />
      <Text style={styles.title}>Product: {productData.productName}</Text>
      <Text>Shelf Life: {productData.shelfLifeDays} days</Text>
      <Text>
        Expiration Date: {productData.expirationDate?.month}/{productData.expirationDate?.date} ({productData.expirationDate?.dayOfWeek}) at {productData.expirationDate?.time}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  errorText: {
    color: 'red',
    fontSize: 16,
    marginBottom: 10,
  },
});

export default SearchResult;
