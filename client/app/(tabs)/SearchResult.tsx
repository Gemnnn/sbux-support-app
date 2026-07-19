import React, { useEffect, useState } from 'react';
import {
  LayoutChangeEvent,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import AdBanner from '../../components/AdBanner';
import { ExpirationDate, Product, ShelfLifeOption } from '../../services/productService';

const dayColors: Record<string, string> = {
  Monday: '#3498db',
  Tuesday: '#f1c40f',
  Wednesday: '#e74c3c',
  Thursday: '#8e7e73',
  Friday: '#2ecc71',
  Saturday: '#e67e22',
  Sunday: '#000000',
};

const dayTranslations: Record<string, string[]> = {
  Monday: ['LUNES', 'LUNDI', '月'],
  Tuesday: ['MARTES', 'MARDI', '火'],
  Wednesday: ['MIERCOLES', 'MERCREDI', '水'],
  Thursday: ['JUEVES', 'JEUDI', '木'],
  Friday: ['VIERNES', 'VENDREDI', '金'],
  Saturday: ['SABADO', 'SAMEDI', '土'],
  Sunday: ['DOMINGO', 'DIMANCHE', '日'],
};

type StickerProduct = {
  productName: string;
  shelfLifeDays: number;
  expirationDate: ExpirationDate;
};

const parseTimeTo12HourFormat = (time: string) => {
  const isPM = time.toUpperCase().includes('PM');
  const timeParts = time.replace(/AM|PM/i, '').trim().split(':');
  const hour = parseInt(timeParts[0], 10);
  const minute = parseInt(timeParts[1], 10);
  const displayHour = hour % 12 || 12;

  return {
    displayHour,
    formattedMinute: minute < 10 ? `0${minute}` : minute,
    isPM,
  };
};

const formatExpirationDate = (expirationDate: ExpirationDate) => {
  const year = new Date().getFullYear();
  const month = parseInt(expirationDate.month, 10) - 1;
  const date = parseInt(expirationDate.date, 10);
  const jsDate = new Date(year, month, date);

  return jsDate.toLocaleDateString('en-US', { month: 'short', day: '2-digit' });
};

const formatPreparationType = (preparationType: string) => {
  if (preparationType === 'DilutedPrepared') {
    return 'Diluted/Prepared';
  }

  if (preparationType === 'Concentrate') {
    return 'Concentrate';
  }

  return preparationType.replace(/([a-z])([A-Z])/g, '$1 $2');
};

const DateSticker = ({
  product,
  width,
  height,
  compact,
}: {
  product: StickerProduct;
  width: number;
  height: number;
  compact: boolean;
}) => {
  const { productName, expirationDate } = product;

  if (!expirationDate?.time) {
    return <Text style={styles.invalidText}>Invalid expiration date</Text>;
  }

  const { dayOfWeek, time } = expirationDate;
  const backgroundColor = dayColors[dayOfWeek] || '#777777';
  const { displayHour, formattedMinute, isPM } = parseTimeTo12HourFormat(time);
  const formattedDate = formatExpirationDate(expirationDate);

  return (
    <View
      style={[
        styles.stickerContainer,
        { width, height },
      ]}
    >
      <View
        style={[
          styles.leftColorSection,
          {
            backgroundColor,
            flexBasis: compact ? '34%' : '30%',
            paddingHorizontal: compact ? 7 : 10,
          },
        ]}
      >
        <Text
          style={[
            styles.dayText,
            compact && styles.dayTextCompact,
            dayOfWeek === 'Wednesday' && styles.wednesdayText,
          ]}
          numberOfLines={1}
          adjustsFontSizeToFit
          minimumFontScale={0.65}
        >
          {dayOfWeek}
        </Text>

        <View style={styles.translationsContainer}>
          {(dayTranslations[dayOfWeek] || []).map((translation, index) => (
            <Text key={index} style={styles.translations} numberOfLines={1}>
              {translation}
            </Text>
          ))}
        </View>
      </View>

      <View style={[styles.rightContentSection, compact && styles.rightContentCompact]}>
        <Text style={[styles.label, compact && styles.labelCompact]}>DISCARD DATE:</Text>
        <Text
          style={[styles.value, compact && styles.valueCompact]}
          numberOfLines={2}
          adjustsFontSizeToFit
          minimumFontScale={0.72}
        >
          {productName} - {formattedDate}
        </Text>

        <View style={[styles.separator, compact && styles.separatorCompact]} />

        <Text style={[styles.label, compact && styles.labelCompact]}>DISCARD TIME:</Text>
        <View style={styles.timeRow}>
          <Text
            style={[styles.timeValue, compact && styles.timeValueCompact]}
            numberOfLines={1}
            adjustsFontSizeToFit
            minimumFontScale={0.75}
          >
            {`${displayHour}:${formattedMinute} ${isPM ? 'PM' : 'AM'}`}
          </Text>
          <View style={styles.checkboxes}>
            <View style={[styles.checkbox, compact && styles.checkboxCompact, !isPM && styles.checked]} />
            <Text style={[styles.checkboxLabel, compact && styles.checkboxLabelCompact]}>AM</Text>
            <View style={[styles.checkbox, compact && styles.checkboxCompact, isPM && styles.checked]} />
            <Text style={[styles.checkboxLabel, compact && styles.checkboxLabelCompact]}>PM</Text>
          </View>
        </View>
      </View>
    </View>
  );
};

const SearchResult = () => {
  const router = useRouter();
  const { data } = useLocalSearchParams();
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();
  const [productData, setProductData] = useState<Product | null>(null);
  const [invalidData, setInvalidData] = useState(false);
  const [resultsAreaSize, setResultsAreaSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    if (!data) {
      return;
    }

    try {
      const serializedData = Array.isArray(data) ? data[0] : data;
      setProductData(JSON.parse(serializedData));
      setInvalidData(false);
    } catch (error) {
      console.error('Invalid SearchResult data:', error);
      setInvalidData(true);
    }
  }, [data]);

  const options = Array.isArray(productData?.shelfLifeOptions)
    ? productData.shelfLifeOptions
    : [];
  const hasMultipleOptions = options.length > 0;
  const results: Array<Product | ShelfLifeOption> = hasMultipleOptions
    ? options
    : productData
      ? [productData]
      : [];
  const availableWidth = resultsAreaSize.width || Math.max(windowWidth - 28, 1);
  const availableHeight = resultsAreaSize.height || Math.max(windowHeight - 210, 1);
  const stickerWidth = Math.min(Math.max(availableWidth - 4, 1), 480);
  const compact = stickerWidth < 375;
  const stickerHeight = compact ? 122 : 132;
  const optionTitleHeight = hasMultipleOptions ? 28 : 0;
  const resultBlockHeight = stickerHeight + optionTitleHeight;
  const resultGap = 18;
  const naturalGroupHeight = Math.max(
    resultBlockHeight * Math.max(results.length, 1) + resultGap * Math.max(results.length - 1, 0),
    1
  );
  const resultsScale = Math.min(1, Math.max((availableHeight - 8) / naturalGroupHeight, 0));

  const handleResultsAreaLayout = (event: LayoutChangeEvent) => {
    const { width, height } = event.nativeEvent.layout;

    setResultsAreaSize(currentSize => {
      if (currentSize.width === width && currentSize.height === height) {
        return currentSize;
      }

      return { width, height };
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.contentContainer}>
        <View style={styles.navigationRow}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
            accessibilityRole="button"
            accessibilityLabel="Back"
          >
            <Ionicons name="arrow-back" size={24} color="#1E1E1E" />
            <Text style={styles.backButtonText}>BACK</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.resultsArea} onLayout={handleResultsAreaLayout}>
          {invalidData ? (
            <Text style={styles.stateText}>Unable to display this result.</Text>
          ) : results.length === 0 ? (
            <Text style={styles.stateText}>Loading...</Text>
          ) : (
            <View
              style={[
                styles.resultsGroup,
                {
                  width: stickerWidth,
                  height: naturalGroupHeight,
                  transform: [{ scale: resultsScale }],
                },
              ]}
            >
              {results.map((result, index) => {
                const option = hasMultipleOptions ? (result as ShelfLifeOption) : null;

                return (
                  <View
                    key={option?.preparationType || `${result.productName}-${index}`}
                    style={[
                      styles.resultBlock,
                      { width: stickerWidth, height: resultBlockHeight },
                      index > 0 && styles.resultBlockSpacing,
                    ]}
                  >
                    {option && (
                      <Text
                        style={[styles.optionTitle, { width: stickerWidth }]}
                        numberOfLines={1}
                        adjustsFontSizeToFit
                        minimumFontScale={0.8}
                      >
                        {formatPreparationType(option.preparationType)}
                      </Text>
                    )}
                    <DateSticker
                      product={result}
                      width={stickerWidth}
                      height={stickerHeight}
                      compact={compact}
                    />
                  </View>
                );
              })}
            </View>
          )}
        </View>

        <View style={styles.adContainer}>
          <AdBanner />
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 14,
    paddingBottom: 8,
  },
  navigationRow: {
    height: 42,
    justifyContent: 'center',
  },
  backButton: {
    minHeight: 38,
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: 12,
  },
  backButtonText: {
    marginLeft: 5,
    fontSize: 16,
    color: '#1E1E1E',
    fontWeight: 'bold',
  },
  resultsArea: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  resultsGroup: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  resultBlock: {
    alignItems: 'center',
  },
  resultBlockSpacing: {
    marginTop: 18,
  },
  optionTitle: {
    marginBottom: 7,
    paddingHorizontal: 2,
    color: '#1E3932',
    fontSize: 17,
    lineHeight: 21,
    fontWeight: '700',
  },
  stickerContainer: {
    flexDirection: 'row',
    borderWidth: 2,
    borderColor: '#000000',
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
  },
  leftColorSection: {
    flexShrink: 0,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 10,
  },
  dayText: {
    width: '100%',
    fontSize: 18,
    color: '#FFFFFF',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  dayTextCompact: {
    fontSize: 16,
  },
  wednesdayText: {
    fontSize: 14,
  },
  translationsContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 5,
  },
  translations: {
    fontSize: 10,
    color: '#FFFFFF',
    lineHeight: 12,
    textAlign: 'center',
  },
  rightContentSection: {
    flex: 1,
    minWidth: 0,
    justifyContent: 'center',
    padding: 10,
  },
  rightContentCompact: {
    paddingHorizontal: 8,
    paddingVertical: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#111111',
  },
  labelCompact: {
    fontSize: 12,
  },
  value: {
    flexShrink: 1,
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111111',
  },
  valueCompact: {
    fontSize: 17,
  },
  separator: {
    height: 1,
    backgroundColor: '#000000',
    marginVertical: 10,
  },
  separatorCompact: {
    marginVertical: 7,
  },
  timeRow: {
    minWidth: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  timeValue: {
    flex: 1,
    minWidth: 0,
    marginRight: 6,
    fontSize: 19,
    fontWeight: 'bold',
    color: '#111111',
  },
  timeValueCompact: {
    fontSize: 16,
  },
  checkboxes: {
    flexShrink: 0,
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 1,
    borderColor: '#000000',
    marginRight: 4,
  },
  checkboxCompact: {
    width: 17,
    height: 17,
  },
  checked: {
    backgroundColor: '#000000',
  },
  checkboxLabel: {
    marginRight: 4,
    fontSize: 13,
    color: '#111111',
  },
  checkboxLabelCompact: {
    fontSize: 11,
  },
  invalidText: {
    color: '#B3261E',
  },
  stateText: {
    color: '#5A5A5A',
    fontSize: 15,
    textAlign: 'center',
  },
  adContainer: {
    minHeight: 54,
    marginTop: 6,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
});

export default SearchResult;
