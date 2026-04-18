/**
 * MedFlow Central Configuration
 * Update these values to match your development environment.
 */

// Use your PC's WiFi IP (e.g. 192.168.1.X) for physical devices
// Use 10.0.2.2 for Android Emulator
const DEV_IP = 'med-point.onrender.com';

export const BASE_URL = `https://${DEV_IP}/api`;
export const SOCKET_URL = `https://${DEV_IP}`;

export const CONFIG = {
  APP_NAME: 'MedFlow',
  VERSION: '1.2.0',
  DEFAULT_LOCATION: { lat: 23.2599, lng: 77.4126 }, // Bhopal
  LOCATION_TIMEOUT: 25000,
  MAP_DELTA: 0.05,
};
