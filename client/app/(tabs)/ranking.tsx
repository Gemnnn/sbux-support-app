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
  previousRank?: number | null;
  rankChange?: number | null;
  trend?: 'up' | 'same' | 'down' | 'new' | string | null;
};

const BASE_URL = Constants.expoConfig?.extra?.BASE_URL;

const normalizeTrend = (trend?: RankingItem['trend']) => {
  if (trend === 'up' || trend === 'same' || trend === 'down' || trend === 'new') {
    return trend;
  }

  return 'new';
};

const renderTrendIndicator = (trendValue?: RankingItem['trend']) => {
  const trend = normalizeTrend(trendValue);

  if (trend === 'new') {
    return (
      <View style={styles.newBadge}>
        <Text style={styles.newBadgeText}>NEW</Text>
      </View>
    );
  }

  if (trend === 'up') {
    return <Text style={[styles.trendSymbol, styles.trendUp]}>▲</Text>;
  }

  if (trend === 'down') {
    return <Text style={[styles.trendSymbol, styles.trendDown]}>▼</Text>;
  }

  return <Text style={[styles.trendSymbol, styles.trendSame]}>—</Text>;
};

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
              <View style={styles.trendIndicator}>{renderTrendIndicator(item.trend)}</View>
              <View style={styles.rankBadge}>
                <Text style={styles.rankText}>{item.rank}</Text>
              </View>
              <View style={styles.productInfo}>
                <Text style={styles.productName} numberOfLines={2}>
                  {item.productName}
                </Text>
              </View>
              <View style={styles.countColumn}>
                <Text style={styles.countText} numberOfLines={1}>
                  {item.count.toLocaleString()}
                </Text>
                <Text style={styles.countLabel} numberOfLines={1}>
                  searches
                </Text>
              </View>
              <View style={styles.actionIndicator}>
                {isOpening ? (
                  <ActivityIndicator color="#00704A" size="small" />
                ) : (
                  <Ionicons name="chevron-forward" size={18} color="#687076" />
                )}
              </View>
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
  trendIndicator: {
    width: 34,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 6,
  },
  trendSymbol: {
    fontSize: 16,
    fontWeight: '800',
    lineHeight: 18,
    textAlign: 'center',
  },
  trendUp: {
    color: '#00704A',
  },
  trendSame: {
    color: '#687076',
  },
  trendDown: {
    color: '#C62828',
  },
  newBadge: {
    width: 32,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EAF4F0',
    borderWidth: 1,
    borderColor: '#B7D7C8',
  },
  newBadgeText: {
    color: '#00704A',
    fontSize: 9,
    fontWeight: '800',
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
    color: '#1E3932',
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'right',
  },
  countLabel: {
    color: '#687076',
    fontSize: 11,
    marginTop: 2,
    textAlign: 'right',
  },
  countColumn: {
    width: 70,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  actionIndicator: {
    width: 20,
    alignItems: 'flex-end',
    justifyContent: 'center',
    marginLeft: 4,
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
