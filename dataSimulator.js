import { healthcareFacilities } from './masterData';

export const simulateRealTimeData = () => {
  healthcareFacilities.forEach((facility) => {
    const bedChange = Math.floor(Math.random() * 5) - 2; 
    let newBeds = facility.availableBeds + bedChange;
    if (newBeds < 0) newBeds = 0;
    if (newBeds > facility.totalBeds) newBeds = facility.totalBeds;
    facility.availableBeds = newBeds;

    if (facility.availableBeds === 0) facility.status = "Full";
    else if ((facility.availableBeds / facility.totalBeds) * 100 < 10) facility.status = "Busy";
    else facility.status = "Available";
  });
  return healthcareFacilities;
};