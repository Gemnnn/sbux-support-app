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
import { Product, fetchProductShelfLife } from "../../services/productService";
import Constants from "expo-constants";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
// import AdBanner from "../../components/AdBanner";

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
      useNativeDriver: true,
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
    setSearchQuery("");
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
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <TouchableWithoutFeedback
        onPress={() => {
          Keyboard.dismiss(); // Close the keyboard
          if (isSearching) {
            setIsSearching(false); // Reset search state
            setSearchQuery(""); // Clear the search query
          }
        }}
        accessible={false}
      >
        <View style={styles.contentContainer}>
          <Text style={styles.warning}>This is an unofficial resource and is not sponsored by any companies.</Text>
          <View style={styles.main}>
            {/* Header */}
            <View style={styles.header}>
              <MaterialCommunityIcons name="coffee" size={48} color="#00704A" />
              <Text style={styles.title}>DATE DOTTER</Text>
              <Text style={styles.subtitle}>☕ Today: {today}</Text>
            </View>

            {/* Expiry Dates */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>📅 Expiry Dates</Text>
              {dates.map((item, index) => (
                <View key={index} style={styles.dateRow}>
                  <Text style={styles.label}>{item.label}</Text>
                  <Text style={styles.date}>{item.date}</Text>
                </View>
              ))}
            </View>

            {/* 🔧 UPDATED: SearchBar no longer uses `card`, no duplicate border */}
            <Animated.View style={[styles.searchBarWrapper, { transform: [{ translateY: animation }] }]}>
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
                    setIsSearching(true); // 🔧 UPDATED: only toggle search state
                  }}
                />
                {searchQuery.trim() !== "" && (
                  <TouchableOpacity onPress={() => setSearchQuery("")}>
                    <Ionicons name="close-circle" size={20} color="#888" />
                  </TouchableOpacity>
                )}
              </View>
            </Animated.View>

            {/* Search Results */}
            {isSearching && (
              <View style={{ flex: 1, width: '100%' }} onStartShouldSetResponder={() => true}>
                <Animated.View
                  style={[
                    styles.resultContainer,
                    { transform: [{ translateY: animation }], maxHeight: 300 },
                  ]}
                >
                  {loading ? (
                    <Text style={styles.loadingText}>Loading...</Text>
                  ) : searchResults.length > 0 ? (
                    <FlatList
                      data={searchResults}
                      keyboardShouldPersistTaps="handled"
                      keyExtractor={(item) => item.productName}
                      contentContainerStyle={styles.resultListContent}
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

          {/* Ad Banner */}
          {/* <AdBanner /> */}
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1E3932",
  },
  contentContainer: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 12,
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
    width: "100%",
    maxWidth: 600,
  },
  warning: {
    alignItems: "center",
    textAlign: "center",
    color: "white",
    marginBottom: 5,
    fontSize: 10,
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
  // 🆕 NEW WRAPPER FOR ANIMATION (ONLY ONE BORDER, FIXED)
  searchBarWrapper: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    marginBottom: 8,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: "#E8F5E9",
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
    width: "100%",
    minHeight: 250,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: "#E8F5E9",
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
  },
  resultListContent: {
    paddingVertical: 4,
    width: "85%",
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
