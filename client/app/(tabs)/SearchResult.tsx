import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';

const SearchResult = () => {
  const router = useRouter();
  const { data } = useLocalSearchParams(); // Retrieve the passed params
  const productData = JSON.parse(data as string); // Parse the string back into an object

  return (
    <View style={styles.container}>
      <Button title="Back" onPress={() => router.back()} />
      <Text style={styles.item}>Product Name: {productData.name}</Text>
      <Text style={styles.item}>Expiration Month: {productData.expirationMonth}</Text>
      <Text style={styles.item}>Expiration Date: {productData.expirationDate}</Text>
      <Text style={styles.item}>Expiration Day: {productData.expirationDay}</Text>
      <Text style={styles.item}>Expiration Time: {productData.expirationTime}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  item: {
    fontSize: 16,
    marginBottom: 8,
    color: 'white',
  },
});

export default SearchResult;
