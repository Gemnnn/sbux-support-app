import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

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

const DateSticker = ({ product }: { product: any }) => {
  const { productName, expirationDate } = product;

  if (!expirationDate || !expirationDate.time) {
    console.error('Invalid expirationDate:', expirationDate);
    return <Text style={{ color: 'red' }}>Invalid expiration date</Text>;
  }

  const { dayOfWeek, month, date, time } = expirationDate;
  const backgroundColor = dayColors[dayOfWeek] || '#ccc';
  
  // Parse time
  const timeParts = time.split(':'); // Expect "HH:mm" format
  const hour = parseInt(timeParts[0], 10); // Extract hour
  const minute = parseInt(timeParts[1], 10); // Extract minute

  // Correct AM/PM calculation
  let isPM = false;
  let displayHour = hour;

  if (hour === 0) {
    // 0:00 (midnight) -> 12:00 AM
    displayHour = 12;
    isPM = false;
  } else if (hour === 12) {
    // 12:00 -> Always PM
    displayHour = 12;
    isPM = time.includes("PM"); // Only set to PM if explicitly marked as PM
  } else if (hour > 12) {
    // Convert 24-hour to 12-hour format for PM times
    displayHour = hour % 12;
    isPM = true;
  } else {
    // AM times from 1:00 to 11:59
    isPM = false;
  }

  const formattedMinute = minute < 10 ? `0${minute}` : minute;

  // Debugging output
  console.log(`Original Time: ${time}, Parsed: ${hour}:${minute}, Display: ${displayHour}:${formattedMinute} ${isPM ? 'PM' : 'AM'}`);

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
});

export default SearchResult;
