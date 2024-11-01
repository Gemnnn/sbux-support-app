import { Image, StyleSheet, Platform, View, TextInput } from 'react-native';

import { HelloWave } from '@/components/HelloWave';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

import React, { useState } from 'react';

// Helper function to format the date as "Mon, October 28"
const formatDate = (date: Date) => {
  return date.toLocaleDateString('en-US', {
    weekday: 'short',   // Mon, Tue, etc.
    month: 'long',      // October, November, etc.
    day: 'numeric'      // 28, 29, etc.
  });
};

// Helper function to get future dates
const getExpireDate = (days: number) => {
  const today = new Date();
  const futureDate = new Date(today);
  futureDate.setDate(today.getDate() + days);
  return formatDate(futureDate);
};


export default function HomeScreen() {
  // Get today's date formatted
  const today = formatDate(new Date());

  // State for search input
  const [searchQuery, setSearchQuery] = useState('');

  // Calculate dates for 2nd, 3rd, 5th, 7th, and 14th day
  const dates = [
    { label: '2 Days', date: getExpireDate(2) },
    { label: '3 Days', date: getExpireDate(3) },
    { label: '5 Days', date: getExpireDate(5) },
    { label: '7 Days', date: getExpireDate(7) },
    { label: '14 Days', date: getExpireDate(14) },
  ];

  return (
    <ThemedView style={styles.container}>
      {/* Display today's date at the top */}
      <ThemedText style={styles.title}>Today: {today}</ThemedText>

      <ThemedText style={styles.subtitle}>Upcoming Dates:</ThemedText>

      {/* Loop through the dates array and display each future date */}
      {dates.map((item, index) => (
        <View key={index} style={styles.dateContainer}>
          <ThemedText style={styles.label}>{item.label}:</ThemedText>
          <ThemedText style={styles.date}>{item.date}</ThemedText>
        </View>
      ))}

    <TextInput
        style={styles.searchInput}
        placeholder="Search for a product (e.g., 'Strawberry')"
        value={searchQuery}
        onChangeText={(text) => setSearchQuery(text)}
      />
      
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 20,
    marginBottom: 10,
  },
  dateContainer: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  label: {
    fontSize: 18,
    marginRight: 10,
  },
  date: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  searchInput: {
    marginTop: 20,
    width: '100%',
    padding: 10,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    fontSize: 16,
  }
});