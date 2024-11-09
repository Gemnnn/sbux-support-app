import { BASE_URL } from '@env';

export interface Product {
    ProductName: string;
    ShelfLifeDays: number;
    ExpirationDate: {
        Month: string;
        Date: string;
        DayOfWeek: string;
        Time: string;
    };
}

/**
 * Fetch product shelf life by product name.
 * @param productName - Name of the product to fetch data for.
 * @returns {Promise<Product>} - Product data including expiration details.
 */
export const fetchProductShelfLife = async (productName: string): Promise<Product> => {
    try {
        const response = await fetch(`${BASE_URL}/api/Product/shelf-life?name=${encodeURIComponent(productName)}`);
        
        if (!response.ok) {
            if (response.status === 404) {
                throw new Error('Product not found.');
            } else {
                throw new Error('Failed to fetch product data. Please try again later.');
            }
        }

        return await response.json() as Product;

    } catch (error: any) {
        console.error('Error fetching product data:', error.message || error);
        throw new Error('Unable to retrieve product data. Please check your connection or try again later.');
    }
};
