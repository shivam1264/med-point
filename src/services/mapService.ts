import axios from 'axios';

// Google Maps API Key provided by user
const GOOGLE_MAPS_API_KEY = 'AIzaSyBY0L4wYgMpcOUytmCYXb6ylxpLzIUZlOg';

export interface RoutePoint {
  latitude: number;
  longitude: number;
}

/**
 * Decodes the Google Encoded Polyline algorithm
 * @param encoded {string}
 * @returns {RoutePoint[]}
 */
const decodePolyline = (encoded: string): RoutePoint[] => {
  const points: RoutePoint[] = [];
  let index = 0, len = encoded.length;
  let lat = 0, lng = 0;

  while (index < len) {
    let b, shift = 0, result = 0;
    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
    const dlat = ((result & 1) ? ~(result >> 1) : (result >> 1));
    lat += dlat;

    shift = 0;
    result = 0;
    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
    const dlng = ((result & 1) ? ~(result >> 1) : (result >> 1));
    lng += dlng;

    points.push({ latitude: (lat / 1e5), longitude: (lng / 1e5) });
  }
  return points;
};

export interface RouteResponse {
  points: RoutePoint[];
  status: string;
  error?: string;
}

const mapService = {
  /**
   * Fetches road-based routing coordinates using Google Maps Directions API
   * @param start { lat, lng }
   * @param end { lat, lng }
   * @returns RouteResponse with points and diagnostic info
   */
  getRoute: async (
    start: { lat: number; lng: number }, 
    end: { lat: number; lng: number }
  ): Promise<RouteResponse> => {
    try {
      if (isNaN(start.lat) || isNaN(start.lng) || isNaN(end.lat) || isNaN(end.lng)) {
        throw new Error('Invalid coordinates');
      }

      const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${start.lat},${start.lng}&destination=${end.lat},${end.lng}&key=${GOOGLE_MAPS_API_KEY}`;
      console.log('fetching Google Route:', url);
      const response = await axios.get(url);
      
      const status = response.data?.status || 'UNKNOWN';
      const errorMsg = response.data?.error_message;

      if (status === 'OK' && response.data.routes?.length > 0) {
        const encodedPolyline = response.data.routes[0].overview_polyline.points;
        const decoded = decodePolyline(encodedPolyline);
        return { points: decoded, status: 'OK' };
      } else {
        console.warn('Google Routing Failed, trying OSRM...', status, errorMsg);
        // Fallback to OSRM (Free, no key needed)
        try {
          const osrmUrl = `https://router.project-osrm.org/route/v1/driving/${start.lng},${start.lat};${end.lng},${end.lat}?overview=full&geometries=polyline`;
          const osrmRes = await axios.get(osrmUrl);
          if (osrmRes.data?.routes?.length > 0) {
            const encoded = osrmRes.data.routes[0].geometry;
            const decoded = decodePolyline(encoded);
            return { points: decoded, status: 'OK (OSRM)' };
          }
        } catch (osrmErr) {
          console.error('OSRM Fallback failed:', osrmErr);
        }

        return {
          points: [
            { latitude: start.lat, longitude: start.lng },
            { latitude: end.lat, longitude: end.lng }
          ],
          status,
          error: errorMsg || 'Google Failed & OSRM Error'
        };
      }
    } catch (error: any) {
      console.error('Routing API Error:', error);
      // Try OSRM even on network error with Google
      try {
        const osrmUrl = `https://router.project-osrm.org/route/v1/driving/${start.lng},${start.lat};${end.lng},${end.lat}?overview=full&geometries=polyline`;
        const osrmRes = await axios.get(osrmUrl);
        if (osrmRes.data?.routes?.length > 0) {
          return { points: decodePolyline(osrmRes.data.routes[0].geometry), status: 'OK (OSRM)' };
        }
      } catch {}

      return {
        points: [
          { latitude: start.lat, longitude: start.lng },
          { latitude: end.lat, longitude: end.lng }
        ],
        status: 'NETWORK_ERROR',
        error: error.message
      };
    }
  }
};

export default mapService;
