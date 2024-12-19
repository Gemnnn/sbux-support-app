
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

import React, { useState, useEffect } from "react";
import { useRouter } from "expo-router";
import { Product, fetchProductShelfLife } from "../../services/productService";
import Constants from "expo-constants";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons"; // Icon library for UI elements

// Helper function to format the date as "Mon, October 28"
const formatDate = (date: Date) => {
  return date.toLocaleDateString("en-US", {
    weekday: "short", // Mon, Tue, etc.
    month: "long", // October, November, etc.
    day: "numeric", // 28, 29, etc.
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
  const [searchQuery, setSearchQuery] = useState<string>(""); // Search input state
  const [searchResults, setSearchResults] = useState<Product[]>([]); // Real-time search results
  const [loading, setLoading] = useState<boolean>(false); // Loading state for search results

  const handleSearch = async (productName?: string) => {
    try {
      const nameToSearch = productName || searchQuery; // Use the provided productName or fallback to searchQuery
      const product = await fetchProductShelfLife(nameToSearch);

      // Navigate to SearchResult with the selected product data
      router.push({
        pathname: "/(tabs)/SearchResult",
        params: { data: JSON.stringify(product) },
      });
    } catch (error: any) {
      console.error("Search Error:", error.message || error);
      alert(error.message || "Failed to fetch product data. Please try again.");
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

  // Predefined expiration dates
  const dates = [
    { label: "2 Days", date: getExpireDate(2) },
    { label: "3 Days", date: getExpireDate(3) },
    { label: "5 Days", date: getExpireDate(5) },
    { label: "7 Days", date: getExpireDate(7) },
    { label: "14 Days", date: getExpireDate(14) },
  ];

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <View style={styles.main}>
        {/* Header Section */}
        <View style={styles.header}>
          <MaterialCommunityIcons name="coffee" size={48} color="#00704A" />
          <Text style={styles.title}>DATE TRACKER</Text>
          <Text style={styles.subtitle}>☕ Today: {today}</Text>
        </View>

        {/* Expiry Dates Section */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>📅 Expiry Dates</Text>
          {dates.map((item, index) => (
            <View key={index} style={styles.dateRow}>
              <Text style={styles.label}>{item.label}</Text>
              <Text style={styles.date}>{item.date}</Text>
            </View>
          ))}
        </View>

        {/* Search Bar Section */}
        <View style={styles.card}>
          <View style={styles.searchBar}>
            <Ionicons name="search" size={20} color="#888" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search for products..."
              placeholderTextColor="#888"
              value={searchQuery}
              onChangeText={(text) => setSearchQuery(text)}
            />
          </View>
        </View>

        {/* Search Results Section */}
        <View style={styles.card}>
          {loading ? (
            <Text style={styles.loadingText}>Loading...</Text>
          ) : searchResults.length > 0 ? (
            <FlatList
              data={searchResults}
              keyExtractor={(item) => item.productName}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.resultItem}
                  onPress={() => handleSearch(item.productName)} // Handle user selection
                >
                  <Text style={styles.resultText}>{item.productName}</Text>
                </TouchableOpacity>
              )}
            />
          ) : (
            searchQuery.trim() !== "" && (
              <Text style={styles.noResultsText}>No results found</Text>
            )
          )}
        </View>
      </View>
      
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: "#1E3932", // Starbucks signature dark green background
    padding: 12,
  },
  main: {
    backgroundColor: "#E8F5E9", 
    borderRadius: 20,
    padding: 24,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 15,
    shadowOffset: { width: 0, height: 5 },
    elevation: 6,
  },
  header: {
    alignItems: "center",
    marginBottom: 16,
  },
  title: {
    fontSize: 32, 
    fontWeight: "bold",
    color: "#1E3932", 
    marginTop: 8,
  },
  subtitle: {
    fontSize: 20,
    color: "#4B3621", // Coffee brown for warmth
    marginTop: 4,
  },
  card: {
    backgroundColor: "#FFFFFF", 
    borderRadius: 20,
    padding: 12,
    marginBottom: 8,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
    borderWidth: 1,
    borderColor: "#E5E5E5",
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1E3932",
    marginBottom: 20,
  },
  dateRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  label: {
    fontSize: 20,
    color: "#4B3621",
  },
  date: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#00704A",
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F1F8F5", // Softer background for input
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 18,
    color: "#1E3932",
  },
  resultItem: {
    padding: 8,
    margin: 2,
    borderRadius: 16,
    backgroundColor: "#D4E9E2", // Subtle green for highlighting
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  resultText: {
    fontSize: 18,
    color: "#1E3932",
  },
  loadingText: {
    textAlign: "center",
    fontSize: 18,
    color: "#999",
  },
  noResultsText: {
    textAlign: "center",
    fontSize: 18,
    color: "#888",
  },
});

