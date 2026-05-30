import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Constants from 'expo-constants';
import { useFocusEffect, useRouter } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

import AdBanner from '../../components/AdBanner';
import { fetchProductShelfLife } from '../../services/productService';

type RankingItem = {
  rank: number;
  productName: string;
  count: number;
};

const BASE_URL = Constants.expoConfig?.extra?.BASE_URL;

const fetchWeeklyRanking = async (): Promise<RankingItem[]> => {
  if (!BASE_URL) {
    throw new Error('BASE_URL is not configured.');
  }

  const response = await fetch(`${BASE_URL}/api/SearchRanking/weekly?take=5`);

  if (!response.ok) {
    throw new Error(`Ranking is temporarily unavailable. (${response.status})`);
  }

  const data = await response.json();
  return Array.isArray(data) ? data.slice(0, 5) : [];
};

export default function RankingScreen() {
  const router = useRouter();
  const [ranking, setRanking] = useState<RankingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null);

  const loadRanking = useCallback(async () => {
    setLoading(true);
    setErrorMessage(null);

    try {
      const weeklyRanking = await fetchWeeklyRanking();
      setRanking(weeklyRanking);
    } catch (error: any) {
      console.error('Ranking Error:', error?.message || error);
      setRanking([]);
      setErrorMessage('Weekly ranking is not available right now.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadRanking();
  }, [loadRanking]);

  useFocusEffect(
    useCallback(() => {
      loadRanking();
    }, [loadRanking])
  );

  const handleRankingPress = async (productName: string) => {
    if (selectedProduct) return;

    setSelectedProduct(productName);

    try {
      const product = await fetchProductShelfLife(productName);
      router.push({
        pathname: '/SearchResult',
        params: { data: JSON.stringify(product) },
      });
    } catch (error: any) {
      console.error('Ranking Search Error:', error?.message || error);
      setErrorMessage('Unable to open this product right now.');
    } finally {
      setSelectedProduct(null);
    }
  };

  const renderContent = () => {
    if (loading) {
      return (
        <View style={styles.stateContainer}>
          <ActivityIndicator color="#00704A" />
          <Text style={styles.stateText}>Loading weekly ranking...</Text>
        </View>
      );
    }

    if (errorMessage) {
      return (
        <View style={styles.stateContainer}>
          <Ionicons name="cloud-offline-outline" size={30} color="#8A6F52" />
          <Text style={styles.stateTitle}>Ranking unavailable</Text>
          <Text style={styles.stateText}>{errorMessage}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={loadRanking}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      );
    }

    if (ranking.length === 0) {
      return (
        <View style={styles.stateContainer}>
          <Ionicons name="podium-outline" size={32} color="#8A6F52" />
          <Text style={styles.stateTitle}>No searches yet</Text>
          <Text style={styles.stateText}>Weekly ranking will appear after successful product searches.</Text>
        </View>
      );
    }

    return (
      <FlatList
        data={ranking}
        keyExtractor={(item) => `${item.rank}-${item.productName}`}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => {
          const isOpening = selectedProduct === item.productName;

          return (
            <TouchableOpacity
              style={styles.rankingRow}
              onPress={() => handleRankingPress(item.productName)}
              activeOpacity={0.8}
              disabled={Boolean(selectedProduct)}
            >
              <View style={styles.rankBadge}>
                <Text style={styles.rankText}>{item.rank}</Text>
              </View>
              <View style={styles.productInfo}>
                <Text style={styles.productName} numberOfLines={2}>
                  {item.productName}
                </Text>
                <Text style={styles.countText}>{item.count.toLocaleString()} searches</Text>
              </View>
              {isOpening ? (
                <ActivityIndicator color="#00704A" />
              ) : (
                <Ionicons name="chevron-forward" size={20} color="#687076" />
              )}
            </TouchableOpacity>
          );
        }}
      />
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.contentContainer}>
        <View style={styles.header}>
          <MaterialCommunityIcons name="trophy" size={42} color="#CBA258" />
          <Text style={styles.title}>WEEKLY RANKING</Text>
          <Text style={styles.subtitle}>Top searched products from the last 7 days</Text>
        </View>

        <View style={styles.card}>{renderContent()}</View>

        <View style={styles.adContainer}>
          <AdBanner />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1E3932',
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 14,
    paddingTop: Platform.OS === 'android' ? 18 : 8,
    paddingBottom: 8,
  },
  header: {
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 26,
    fontWeight: 'bold',
    marginTop: 6,
  },
  subtitle: {
    color: '#DCE7E2',
    fontSize: 14,
    marginTop: 4,
    textAlign: 'center',
  },
  card: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 14,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
  },
  listContent: {
    paddingVertical: 2,
  },
  rankingRow: {
    minHeight: 72,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAF9',
    borderWidth: 1,
    borderColor: '#E3E6E4',
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 10,
  },
  rankBadge: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#00704A',
    marginRight: 12,
  },
  rankText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: 'bold',
  },
  productInfo: {
    flex: 1,
    minWidth: 0,
    marginRight: 8,
  },
  productName: {
    color: '#1E3932',
    fontSize: 17,
    fontWeight: '700',
    flexShrink: 1,
  },
  countText: {
    color: '#687076',
    fontSize: 13,
    marginTop: 4,
  },
  stateContainer: {
    flex: 1,
    minHeight: 220,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 18,
  },
  stateTitle: {
    color: '#1E3932',
    fontSize: 18,
    fontWeight: '700',
    marginTop: 10,
    textAlign: 'center',
  },
  stateText: {
    color: '#687076',
    fontSize: 14,
    lineHeight: 20,
    marginTop: 8,
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 16,
    backgroundColor: '#00704A',
    borderRadius: 20,
    paddingHorizontal: 18,
    paddingVertical: 9,
  },
  retryText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  adContainer: {
    alignItems: 'center',
    marginTop: 8,
    minHeight: 54,
  },
});
