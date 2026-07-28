/**
 * OpenStreetMap Nominatim Reverse Geocoding & HTML5 Geolocation Utility
 */

export interface LocationData {
  latitude: number;
  longitude: number;
  accuracy?: number;
  province: string;
  district: string;
  municipality: string;
  wardNumber: string;
  city: string;
  area: string;
  street: string;
  postalCode: string;
  fullAddress: string;
}

// Default Tikapur, Kailali, Nepal coordinates
export const DEFAULT_NEPAL_COORDS = {
  lat: 28.5008,
  lng: 81.1306,
};

/**
 * Get current GPS coordinates using HTML5 Geolocation API
 */
export function getCurrentGpsPosition(): Promise<GeolocationPosition> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by your browser.'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => resolve(position),
      (error) => reject(error),
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  });
}

/**
 * Reverse geocode latitude and longitude using OpenStreetMap Nominatim API
 */
export async function reverseGeocodeOsm(lat: number, lon: number, accuracy?: number): Promise<LocationData> {
  try {
    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&addressdetails=1&zoom=18`;
    const response = await fetch(url, {
      headers: {
        'Accept-Language': 'en-US,en;q=0.9',
      },
    });

    if (!response.ok) {
      throw new Error(`Reverse geocoding HTTP status ${response.status}`);
    }

    const data = await response.json();
    const addr = data.address || {};

    // Extract Nepalese administrative divisions
    const province =
      addr.state || addr.province || addr.region || 'Sudurpashchim Province';

    const district =
      addr.county || addr.district || addr.state_district || 'Kailali';

    const municipality =
      addr.municipality ||
      addr.city ||
      addr.town ||
      addr.village ||
      addr.suburb ||
      'Tikapur Municipality';

    let wardNumber = addr.ward || '';
    if (!wardNumber && addr.suburb && addr.suburb.toLowerCase().includes('ward')) {
      const match = addr.suburb.match(/\d+/);
      if (match) wardNumber = match[0];
    }
    if (!wardNumber) wardNumber = '1';

    const city = addr.city || addr.town || addr.village || 'Tikapur';
    const area = addr.suburb || addr.neighbourhood || addr.residential || addr.hamlet || 'Bazar Area';
    const street = addr.road || addr.pedestrian || addr.footway || 'Main Road';
    const postalCode = addr.postcode || '10908';

    // Construct human-readable full delivery address
    const addressParts = [
      wardNumber ? `Ward #${wardNumber}` : '',
      street,
      area,
      municipality,
      district,
      province,
    ].filter(Boolean);

    const fullAddress =
      data.display_name && data.display_name.length < 180
        ? data.display_name
        : addressParts.join(', ');

    return {
      latitude: lat,
      longitude: lon,
      accuracy,
      province,
      district,
      municipality,
      wardNumber,
      city,
      area,
      street,
      postalCode,
      fullAddress,
    };
  } catch (error) {
    console.warn('OpenStreetMap reverse geocode error fallback used:', error);

    return {
      latitude: lat,
      longitude: lon,
      accuracy,
      province: 'Sudurpashchim Province',
      district: 'Kailali',
      municipality: 'Tikapur Municipality',
      wardNumber: '1',
      city: 'Tikapur',
      area: 'Bazar Area',
      street: 'Main Road',
      postalCode: '10908',
      fullAddress: `Ward #1, Main Road, Tikapur Municipality, Kailali, Sudurpashchim Province`,
    };
  }
}
