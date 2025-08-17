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
  Dimensions,
  PixelRatio
} from "react-native";
import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "expo-router";
import { Product, fetchProductShelfLife } from "../../services/productService";
import Constants from "expo-constants";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import AdBanner from "../../components/AdBanner";
import AsyncStorage from "@react-native-async-storage/async-storage";


const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

const guidelineBaseWidth = 375;
const guidelineBaseHeight = 812;

export function wp(percent: number) {
  return (SCREEN_WIDTH * percent) / 100;
}

export function hp(percent: number) {
  return (SCREEN_HEIGHT * percent) / 100;
}

export function normalize(size: number) {
  const scale = SCREEN_WIDTH / guidelineBaseWidth;
  const newSize = size * scale;
  return Math.round(PixelRatio.roundToNearestPixel(newSize));
}

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
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  const handleSearch = async (productName?: string) => {
    try {
      const nameToSearch = productName || searchQuery;
      if (!nameToSearch.trim()) return;

      // Save
      await saveRecentSearch(nameToSearch);

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
      toValue: isSearching ? -hp(30) : 0, // Move the section further up when searching
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

  // load recent search
  useEffect(() => {
    const loadRecentSearches = async () => {
      try {
        const stored = await AsyncStorage.getItem("recentSearches");
        if (stored) {
          setRecentSearches(JSON.parse(stored));
        }
      } catch (e) {
        console.error("Failed to load recent searches:", e);
      }
    };
    loadRecentSearches();
  }, []);

  // save recent search
  const saveRecentSearch = async (term: string) => {
    try {
      const newList = [term, ...recentSearches.filter(t => t !== term)].slice(0, 3);
      setRecentSearches(newList);
      await AsyncStorage.setItem("recentSearches", JSON.stringify(newList));
    } catch (e) {
      console.error("Failed to save recent search:", e);
    }
  };

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
              <View style={{ flex: 1, width: '100%' }} >
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

            <Text style={styles.recentSearchTitle}>Recent Search</Text>
            {recentSearches.length > 0 && (
              <View style={styles.recentSearchContainer}>
                {recentSearches.map((item, idx) => (
                  <TouchableOpacity
                    key={idx}
                    style={styles.recentSearchButton}
                    onPress={() => handleSearch(item)}
                  >
                    <Text style={styles.recentSearchText}>{item}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

          </View>

          {/* Ad Banner */}
          <AdBanner />
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
    paddingHorizontal: wp(3),
  },
  main: {
    backgroundColor: "#FFFFFF",
    borderRadius: normalize(18),
    padding: wp(5),
    marginBottom: hp(1.2),
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: normalize(8),
    shadowOffset: { width: 0, height: normalize(2) },
    elevation: 4,
    width: "100%",
    maxWidth: wp(90),
  },
  warning: {
    textAlign: "center",
    color: "white",
    marginBottom: hp(0.3),
    fontSize: normalize(10),
  },
  header: {
    alignItems: "center",
    marginBottom: hp(1.2),
  },
  title: {
    fontSize: normalize(30),
    fontWeight: "bold",
    color: "#1E3932",
    marginTop: hp(0.4),
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: normalize(16),
    color: "#5A5A5A",
    marginTop: hp(0.3),
  },
  searchBarWrapper: {
    backgroundColor: "#FFFFFF",
    borderRadius: normalize(38),
    marginBottom: hp(1),
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: normalize(5),
    shadowOffset: { width: 0, height: normalize(1.5) },
    elevation: 2,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8FAF9",
    borderRadius: normalize(38),
    paddingHorizontal: wp(3),
    paddingVertical: hp(1),
    borderWidth: 1,
    borderColor: "#E3E6E4",
  },
  searchInput: {
    flex: 1,
    fontSize: normalize(15),
    marginLeft: wp(2),
    color: "#1E3932",
  },
  card: {
    backgroundColor: "#FAFAFA",
    borderRadius: normalize(15),
    padding: wp(3),
    marginBottom: hp(1),
    borderWidth: 1,
    borderColor: "#EEE",
  },
  cardTitle: {
    fontSize: normalize(16),
    fontWeight: "600",
    color: "#333",
    marginBottom: hp(1),
  },
  dateRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: hp(0.8),
  },
  label: {
    fontSize: normalize(18),
    color: "#555",
  },
  date: {
    fontSize: normalize(18),
    fontWeight: "500",
    color: "#00704A",
  },
  resultContainer: {
    width: "100%",
    minHeight: hp(30),
    paddingHorizontal: wp(3.2),
    borderRadius: normalize(20),
    backgroundColor: "#F8FAF9",
    borderWidth: 1,
    borderColor: "#EEE",
  },
  resultListContent: {
    paddingVertical: hp(0.5),
    width: "85%",
  },
  resultItem: {
    width: "100%",
    padding: hp(1),
    marginVertical: hp(0.3),
    borderRadius: normalize(10),
    backgroundColor: "#EFF7F3",
  },
  resultText: {
    fontSize: normalize(15),
    color: "#1E3932",
  },
  loadingText: {
    textAlign: "center",
    fontSize: normalize(15),
    color: "#999",
  },
  noResultsText: {
    textAlign: "center",
    fontSize: normalize(15),
    color: "#888",
  },
  recentSearchTitle: {
    fontSize: normalize(13),
    color: "#666",
    marginTop: hp(1),
    marginBottom: hp(0.6),
    fontWeight: "500",
  },
  recentSearchContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: wp(2),
  },
  recentSearchButton: {
    backgroundColor: "#EAF4F0",
    paddingVertical: hp(0.7),
    paddingHorizontal: wp(2.5),
    borderRadius: normalize(18),
    marginBottom: hp(0.3),
  },
  recentSearchText: {
    fontSize: normalize(12),
    color: "#1E3932",
  },
});