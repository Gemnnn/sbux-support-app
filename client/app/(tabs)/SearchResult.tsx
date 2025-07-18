import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import AdBanner from "../../components/AdBanner";

// Day colors
const dayColors: Record<string, string> = {
  Monday: '#3498db',
  Tuesday: '#f1c40f',
  Wednesday: '#e74c3c',
  Thursday: '#8e7e73',
  Friday: '#2ecc71',
  Saturday: '#e67e22',
  Sunday: '#000000',
};

// Function to parse time into 12-hour format and determine AM/PM
const parseTimeTo12HourFormat = (time: string) => {
  const isPM = time.toUpperCase().includes('PM'); // Determine if time includes PM
  const timeParts = time.replace(/AM|PM/i, '').trim().split(':'); // Remove AM/PM and split time
  const hour = parseInt(timeParts[0], 10);
  const minute = parseInt(timeParts[1], 10);

  let displayHour = hour % 12 || 12; // Convert to 12-hour format

  return {
    displayHour,
    formattedMinute: minute < 10 ? `0${minute}` : minute,
    isPM,
  };
};

const DateSticker = ({ product }: { product: any }) => {
  const { productName, expirationDate } = product;

  if (!expirationDate || !expirationDate.time) {
    console.error('Invalid expirationDate:', expirationDate);
    return <Text style={{ color: 'red' }}>Invalid expiration date</Text>;
  }

  const { dayOfWeek, month, date, time } = expirationDate;
  const backgroundColor = dayColors[dayOfWeek] || '#ccc';

  // Parse time and calculate AM/PM
  const { displayHour, formattedMinute, isPM } = parseTimeTo12HourFormat(time);

  console.log(`Parsed Time: ${time}, Display: ${displayHour}:${formattedMinute}, isPM: ${isPM}`);

  return (
    <View style={styles.stickerContainer}>
      {/* Left color area */}
      <View style={[styles.leftColorSection, { backgroundColor }]}>
        <Text style={styles.dayText}>{dayOfWeek.toUpperCase()}</Text>
        <Text style={styles.translations}>
          {dayOfWeek === 'Monday'
            ? 'LUNES LUNDI 月'
            : dayOfWeek === 'Tuesday'
            ? 'MARTES MARDI 火'
            : dayOfWeek === 'Wednesday'
            ? 'MIERCOLES MERCREDI 水'
            : dayOfWeek === 'Thursday'
            ? 'JUEVES JEUDI 木'
            : dayOfWeek === 'Friday'
            ? 'VIERNES VENDREDI 金'
            : dayOfWeek === 'Saturday'
            ? 'SABADO SAMEDI 土'
            : 'DOMINGO DIMANCHE 日'}
        </Text>
      </View>

      {/* Right content area */}
      <View style={styles.rightContentSection}>
        <Text style={styles.label}>DISCARD DATE:</Text>
        <Text style={styles.value}>
          {productName} - {month} {date}
        </Text>

        <View style={styles.separator} />

        <Text style={styles.label}>DISCARD TIME:</Text>
        <View style={styles.timeRow}>
          <Text style={styles.value}>
            {`${displayHour}:${formattedMinute} ${isPM ? 'PM' : 'AM'}`}
          </Text>
          <View style={styles.checkboxes}>
            <View style={[styles.checkbox, !isPM && styles.checked]} />
            <Text style={styles.checkboxLabel}>AM</Text>
            <View style={[styles.checkbox, isPM && styles.checked]} />
            <Text style={styles.checkboxLabel}>PM</Text>
          </View>
        </View>
      </View>
    </View>
  );
};

const SearchResult = () => {
  const router = useRouter();
  const { data } = useLocalSearchParams();
  const [productData, setProductData] = useState(null);

  useEffect(() => {
    if (data) {
      const parsedData = Array.isArray(data) ? data[0] : data;
      setProductData(JSON.parse(parsedData));
    }
  }, [data]);

  if (!productData) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
        <Ionicons name="arrow-back" size={24} color="black" />
        <Text style={styles.backButtonText}>BACK</Text>
      </TouchableOpacity>

      <DateSticker product={productData} />
      
      {/* AdBanner Component */}
      <AdBanner />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButtonText: {
    marginLeft: 5,
    fontSize: 16,
    color: 'black',
    fontWeight: 'bold',
  },
  stickerContainer: {
    flexDirection: 'row',
    borderWidth: 2,
    borderColor: '#000',
    borderRadius: 10,
    width: '90%',
    marginTop: 80,
    overflow: 'hidden',
  },
  leftColorSection: {
    width: '30%',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
  },
  dayText: {
    fontSize: 18,
    color: 'white',
    fontWeight: 'bold',
  },
  translations: {
    fontSize: 10,
    color: 'white',
  },
  rightContentSection: {
    width: '70%',
    padding: 10,
  },
  label: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  value: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  separator: {
    height: 1,
    backgroundColor: '#000',
    marginVertical: 10,
  },
  timeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  checkboxes: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 1,
    borderColor: '#000',
    marginRight: 5,
  },
  checked: {
    backgroundColor: '#000',
  },
  checkboxLabel: {
    fontSize: 14,
  },
  adBannerContainer: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
  },
});

export default SearchResult;