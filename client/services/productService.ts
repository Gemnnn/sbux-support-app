import Constants from 'expo-constants';

const { BASE_URL } = Constants.expoConfig?.extra || {};


export interface Product {
    productName: string;
    shelfLifeDays: number;
    expirationDate: {
      month: string;
      date: string;
      dayOfWeek: string;
      time: string;
    };
  }
  

/**
 * Fetch product shelf life by product name.
 * @param productName - Name of the product to fetch data for.
 * @returns {Promise<Product>} - Product data including expiration details.
 */
export const fetchProductShelfLife = async (productName: string): Promise<Product> => {
  if (!BASE_URL) {
    console.error('BASE_URL is not defined in your environment.');
    throw new Error('Environment variable BASE_URL is missing.');
  }


    // Get the user's GMT offset dynamically
    const timeZoneOffset = new Date().getTimezoneOffset(); // Offset in minutes
    const timeZone = `GMT${timeZoneOffset > 0 ? '-' : '+'}${Math.abs(timeZoneOffset / 60)}`; // Convert to GMT format (e.g., GMT-5)

    const url = `${BASE_URL}/api/Product/shelf-life?name=${encodeURIComponent(productName)}&timeZone=${encodeURIComponent(timeZone)}`;

    console.log(url); // Log the URL for debugging

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching product data:', error);
    throw error;
  }
};

