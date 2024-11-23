import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

// Color mapping by day of the week
const dayColors: Record<string, string> = {
  Monday: '#3498db',    // Blue
  Tuesday: '#f1c40f',   // Yellow
  Wednesday: '#e74c3c', // Red
  Thursday: '#8e7e73',  // Brown
  Friday: '#2ecc71',    // Green
  Saturday: '#e67e22',  // Orange
  Sunday: '#000000',    // Black
};

const DateSticker = ({ product }: { product: any }) => {
  const { productName, expirationDate } = product;
  const { dayOfWeek, month, date, time } = expirationDate;
  const backgroundColor = dayColors[dayOfWeek] || '#ccc';

  // Time parsing
  const timeParts = time.split(':');
  const hour = parseInt(timeParts[0], 10);
  const minute = parseInt(timeParts[1], 10);
  const isPM = hour >= 12;
  const displayHour = hour % 12 === 0 ? 12 : hour % 12; // 12 hour format conversion

  return (
    <View style={styles.stickerContainer}>
      {/* Left content area */}
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
        {/* Discard Date */}
        <Text style={styles.label}>DISCARD DATE:</Text>
        <Text style={styles.value}>
          {productName} - {month} {date}
        </Text>

        {/* Divider Line */}
        <View style={styles.separator} />

        {/* Discard Time */}
        <Text style={styles.label}>DISCARD TIME:</Text>
        <View style={styles.timeRow}>
          <Text style={styles.value}>
            {`${displayHour}:${minute < 10 ? '0' : ''}${minute} ${isPM ? 'PM' : 'AM'}`}
          </Text>
          <View style={styles.checkboxes}>
            <View style={[styles.checkbox, isPM ? null : styles.checked]} />
            <Text style={styles.checkboxLabel}>AM</Text>
            <View style={[styles.checkbox, isPM ? styles.checked : null]} />
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
      {/* Back Button */}
      <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
        <Ionicons name="arrow-back" size={24} color="black" />
        <Text style={styles.backButtonText}>BACK</Text>
      </TouchableOpacity>

      {/* Sticker */}
      <DateSticker product={productData} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center', 
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
    alignSelf: 'center',
    marginTop: 80,
    overflow: 'hidden',
  },
  leftColorSection: {
    width: '30%',
    padding: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dayText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
  },
  translations: {
    fontSize: 10,
    color: 'white',
    textAlign: 'center',
    marginTop: 5,
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
    marginTop: 5,
  },
  separator: {
    height: 1,
    backgroundColor: '#000',
    marginVertical: 10,
  },
  timeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
    marginRight: 10,
    fontSize: 14,
  },
});

export default SearchResult;
