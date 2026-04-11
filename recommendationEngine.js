import { healthcareFacilities } from './masterData';

const getDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Earth Radius in KM
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) + Math.cos(lat1 * (Math.PI/180)) * Math.cos(lat2 * (Math.PI/180)) * Math.sin(dLon/2) * Math.sin(dLon/2);
  return (R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))).toFixed(2);
};

export const getSmartSuggestions = (userLat, userLng) => {
  const suggestions = healthcareFacilities.map(f => ({
    ...f,
    distance: getDistance(userLat, userLng, f.coords.lat, f.coords.lng)
  }));
  return suggestions
    .filter(f => f.status !== "Full")
    .sort((a, b) => a.distance - b.distance);
};