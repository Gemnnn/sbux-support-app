import {
  StyleSheet,
  View,
  TextInput,
  FlatList,
  Text,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
} from "react-native";

import { HelloWave } from '@/components/HelloWave';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import { Product } from '@/services/productService';


import { NavigationContainer } from '@react-navigation/native';
import { fetchProductShelfLife } from '@/services/productService';
import Constants from "expo-constants";


// Helper function to format the date as "Mon, October 28"
const formatDate = (date: Date) => {
  return date.toLocaleDateString('en-US', {
    weekday: 'short',   // Mon, Tue, etc.
    month: 'long',      // October, November, etc.
    day: 'numeric'      // 28, 29, etc.
  });
};

// Helper function to get future dates
const getExpireDate = (days: number) => {
  const today = new Date();
  const futureDate = new Date(today);
  futureDate.setDate(today.getDate() + days);
  return formatDate(futureDate);
};

// API call to fetch products matching the query
const fetchProductData = async (query: string): Promise<Product[]> => {
  try {
    const response = await fetch(
      `${Constants.expoConfig?.extra?.BASE_URL}/api/Product/search?query=${query}`
    );
    if (!response.ok) {
      throw new Error("Failed to fetch products");
    }
    return await response.json();
  } catch (error) {
    console.error(error);
    return [];
  }
};


export default function HomeScreen() {

  const router = useRouter();
  //imported Product interface
  const [searchQuery, setSearchQuery] = useState<string>(""); // Type explicitly as string
  const [searchResults, setSearchResults] = useState<Product[]>([]); // Type explicitly as Product[]
  const [loading, setLoading] = useState<boolean>(false);

  const handleSearch = async (productName?: string) => {
    try {
      const nameToSearch = productName || searchQuery; // Use the provided productName or fall back to searchQuery
      const product = await fetchProductShelfLife(nameToSearch);
  
      // Navigate with the full product object
      router.push({
        pathname: '/(tabs)/SearchResult',
        params: { data: JSON.stringify(product) },
      });
    } catch (error: any) {
      console.error('Search Error:', error.message || error);
      alert(error.message || 'Failed to fetch product data. Please try again.');
    }
  };
  


  // Fetch search results in real-time as the user types
  useEffect(() => {
    const fetchResults = async () => {
      if (searchQuery.trim() === "") {
        setSearchResults([]);
        return;
      }
      setLoading(true);
      const results = await fetchProductData(searchQuery);
      setSearchResults(results);
      setLoading(false);
    };
    fetchResults();
  }, [searchQuery]);

  
  

  // Get today's date formatted
  const today = formatDate(new Date());

  // State for search input

  // Calculate dates for 2nd, 3rd, 5th, 7th, and 14th day
  const dates = [
    { label: '2 Days', date: getExpireDate(2) },
    { label: '3 Days', date: getExpireDate(3) },
    { label: '5 Days', date: getExpireDate(5) },
    { label: '7 Days', date: getExpireDate(7) },
    { label: '14 Days', date: getExpireDate(14) },
  ];

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}>

      {/* Display today's date at the top */}
      <ThemedText style={styles.title}>Today: {today}</ThemedText>

      <ThemedText style={styles.subtitle}>Upcoming Dates:</ThemedText>

      {/* Loop through the dates array and display each future date */}
      {dates.map((item, index) => (
        <View key={index} style={styles.dateContainer}>
          <ThemedText style={styles.label}>{item.label}:</ThemedText>
          <ThemedText style={styles.date}>{item.date}</ThemedText>
        </View>
      ))}

      <View style={styles.searchRow}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search for a product (e.g., 'Strawberry')"
          placeholderTextColor="gray"
          value={searchQuery}
          onChangeText={(text) => setSearchQuery(text)}
        />
        <TouchableOpacity style={styles.searchButton} onPress={() => handleSearch()}>
          <Text style={styles.searchButtonText}>Search</Text>
        </TouchableOpacity>
      </View>

      {/* Display search results */}
      {loading ? (
        <Text style={styles.loadingText}>Loading...</Text>
      ) : searchResults.length > 0 ? (
        <FlatList
          data={searchResults}
          keyExtractor={(item) => item.productName}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => handleSearch(item.productName)} // Pass productName to handleSearch
            >
              <Text style={styles.resultItem}>{item.productName}</Text>
            </TouchableOpacity>
          )}
        />
      ) : (
        searchQuery.trim() !== "" && (
          <Text style={styles.noResultsText}>No results found</Text>
        )
      )}

    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'gray'
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 20,
    marginBottom: 10,
  },
  dateContainer: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  label: {
    fontSize: 18,
    marginRight: 10,
  },
  date: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  searchInput: {
    flex: 1,
    padding: 10,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 8,
    fontSize: 16,
    color: "white",
    backgroundColor: "#222",
    marginRight: 10,
  },
  searchButton: {
    paddingVertical: 10,
    paddingHorizontal: 5,
    backgroundColor: "#555",
    borderRadius: 8,
  },
  searchButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
searchRow: {
  flexDirection: "row",
  alignItems: "center",
  marginTop: 20,
  width: "100%",
  },
  loadingText: {
    textAlign: "center",
    color: "#666",
    marginTop: 10,
  },
  noResultsText: {
    textAlign: "center",
    color: "#999",
    marginTop: 10,
  },
  resultItem: {
    padding: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    color: "white",
  },
});