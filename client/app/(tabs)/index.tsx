import {
  StyleSheet,
  View,
  TextInput,
  FlatList,
  Text,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  Keyboard,
  Animated,
  TouchableWithoutFeedback,
} from "react-native";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "expo-router";
import { Product } from "@/services/productService";
import { fetchProductShelfLife } from "@/services/productService";
import Constants from "expo-constants";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";

const formatDate = (date: Date) => {
  return date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "long",
    day: "numeric",
  });
};

const getExpireDate = (days: number) => {
  const today = new Date();
  const futureDate = new Date(today);
  futureDate.setDate(today.getDate() + days);
  return formatDate(futureDate);
};

const fetchProductData = async (query: string): Promise<Product[]> => {
  try {
    const response = await fetch(
      `${Constants.expoConfig?.extra?.BASE_URL}/api/Product/search?query=${query}`
    );
    return await response.json();
  } catch (error) {
    console.error(error);
    return [];
  }
};

export default function HomeScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState<string>(""); // Search input state
  const [searchResults, setSearchResults] = useState<Product[]>([]); // Search results
  const [loading, setLoading] = useState<boolean>(false); // Loading state
  const [isKeyboardVisible, setIsKeyboardVisible] = useState<boolean>(false); // Keyboard state
  const [isSearching, setIsSearching] = useState<boolean>(false); // Search bar state
  const animation = useRef(new Animated.Value(0)).current; // Animation for moving search bar

  const handleSearch = async (productName?: string) => {
    try {
      const nameToSearch = productName || searchQuery;
      const product = await fetchProductShelfLife(nameToSearch);

      router.push({
        pathname: "/(tabs)/SearchResult",
        params: { data: JSON.stringify(product) },
      });
    } catch (error: any) {
      console.error("Search Error:", error.message || error);
      alert(error.message || "Failed to fetch product data. Please try again.");
    }
  };

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

  useEffect(() => {
    Animated.timing(animation, {
      toValue: isSearching ? -250 : 0, // Move the section further up when searching
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [isSearching]);

  useEffect(() => {
    const showKeyboard = () => setIsKeyboardVisible(true);
    const hideKeyboard = () => setIsKeyboardVisible(false);

    const showSubscription = Keyboard.addListener("keyboardDidShow", showKeyboard);
    const hideSubscription = Keyboard.addListener("keyboardDidHide", hideKeyboard);

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  const handleBackButton = () => {
    Keyboard.dismiss(); // Close the keyboard
    setSearchQuery(""); // Reset the search query
    setIsSearching(false); // Reset search bar state
  };

  const handleSearchResultPress = (productName: string) => {
    setIsSearching(false); // Ensure the search state is reset
    Keyboard.dismiss(); // Dismiss the keyboard
    handleSearch(productName); // Proceed with navigation
  };

  const today = formatDate(new Date());

  const dates = [
    { label: "2 Days", date: getExpireDate(2) },
    { label: "3 Days", date: getExpireDate(3) },
    { label: "5 Days", date: getExpireDate(5) },
    { label: "7 Days", date: getExpireDate(7) },
    { label: "14 Days", date: getExpireDate(14) },
  ];

  return (
    <TouchableWithoutFeedback
      onPress={() => {
        Keyboard.dismiss(); // Close the keyboard
        if (isSearching) {
          setIsSearching(false); // Reset search state
          setSearchQuery(""); // Clear the search query
        }
      }}
      accessible={false} // Prevent accessibility issues
    >
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
          <Animated.View style={{ transform: [{ translateY: animation }] }}>
            <View style={styles.card}>
              <View style={styles.searchBar}>
                {isSearching ? (
                  <TouchableOpacity onPress={handleBackButton}>
                    <Ionicons name="arrow-back" size={20} color="#888" />
                  </TouchableOpacity>
                ) : (
                  <Ionicons name="search" size={20} color="#888" />
                )}
                <TextInput
                  style={styles.searchInput}
                  placeholder="Search for products..."
                  placeholderTextColor="#888"
                  value={searchQuery}
                  onChangeText={(text) => setSearchQuery(text)}
                  onFocus={() => {
                    setIsSearching(true); // Activate search mode
                    setIsKeyboardVisible(true);
                  }}
                />
                {searchQuery.trim() !== "" && (
                  <TouchableOpacity onPress={() => setSearchQuery("")}>
                    <Ionicons name="close-circle" size={20} color="#888" />
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </Animated.View>

          {/* Search Results Section */}
          {isSearching && (
            <View style={{ flex: 1 }} onStartShouldSetResponder={() => true}>
              <Animated.View
                style={[
                  styles.card,
                  styles.resultContainer,
                  { transform: [{ translateY: animation }] },
                ]}
              >
                {loading ? (
                  <Text style={styles.loadingText}>Loading...</Text>
                ) : searchResults.length > 0 ? (
                  <FlatList
                    data={searchResults}
                    keyboardShouldPersistTaps="handled" // Ensure taps on results work
                    keyExtractor={(item) => item.productName}
                    contentContainerStyle={styles.resultContainer}
                    renderItem={({ item }) => (
                      <TouchableOpacity
                        style={styles.resultItem}
                        onPress={() => handleSearchResultPress(item.productName)}
                      >
                        <Text style={styles.resultText}>{item.productName}</Text>
                      </TouchableOpacity>
                    )}
                  />
                ) : (
                  <Text style={styles.noResultsText}>No results found</Text>
                )}
              </Animated.View>
            </View>
          )}
        </View>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: "#1E3932",
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
    color: "#4B3621",
    marginTop: 4,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F1F8F5",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 18,
    marginLeft: 12,
    color: "#1E3932",
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 12,
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1E3932",
    marginBottom: 15,
  },
  dateRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
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
  resultContainer: {
    flex: 1,
    width: "100%",
    alignItems: "flex-start",
    justifyContent: "flex-start",
    paddingHorizontal: 12,
    minHeight: 250,
  },
  resultItem: {
    width: "100%",
    padding: 8,
    marginVertical: 4,
    borderRadius: 16,
    backgroundColor: "#D4E9E2",
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
