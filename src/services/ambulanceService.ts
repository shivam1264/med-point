import axios from 'axios';
import Geolocation from '@react-native-community/geolocation';

// API Configuration
const API_BASE_URL = 'https://api.medflow.com/v1'; // Replace with your actual API URL

// Types
export interface DriverStatus {
  id: string;
  driverId: string;
  isAvailable: boolean;
  isInService: boolean;
  currentAssignment?: Assignment;
  location?: {
    latitude: number;
    longitude: number;
    timestamp: string;
  };
  lastUpdated: string;
}

export interface Assignment {
  id: string;
  patientName: string;
  hospital: string;
  pickupLocation: {
    latitude: number;
    longitude: number;
    address: string;
  };
  destinationLocation: {
    latitude: number;
    longitude: number;
    address: string;
  };
  eta: string;
  priority: 'critical' | 'urgent' | 'normal';
  patientInfo?: {
    age: number;
    gender: string;
    condition: string;
  };
  createdAt: string;
  status: 'pending' | 'accepted' | 'in_progress' | 'completed';
}

export interface DriverStats {
  totalTrips: number;
  avgResponseTime: string;
  completedToday: number;
  rating: number;
  hoursWorked: number;
}

// API Service Class
export class AmbulanceService {
  private static instance: AmbulanceService;
  private authToken: string | null = null;
  private driverId: string | null = null;

  static getInstance(): AmbulanceService {
    if (!AmbulanceService.instance) {
      AmbulanceService.instance = new AmbulanceService();
    }
    return AmbulanceService.instance;
  }

  // Authentication
  setAuthToken(token: string) {
    this.authToken = token;
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }

  setDriverId(driverId: string) {
    this.driverId = driverId;
  }

  // Driver Status Management
  async getDriverStatus(): Promise<DriverStatus> {
    try {
      if (!this.driverId) {
        throw new Error('Driver ID not set');
      }

      const response = await axios.get(`${API_BASE_URL}/drivers/${this.driverId}/status`);
      return response.data;
    } catch (error) {
      console.error('Error fetching driver status:', error);
      throw error;
    }
  }

  async updateDriverAvailability(isAvailable: boolean): Promise<DriverStatus> {
    try {
      if (!this.driverId) {
        throw new Error('Driver ID not set');
      }

      const response = await axios.put(`${API_BASE_URL}/drivers/${this.driverId}/availability`, {
        isAvailable,
        timestamp: new Date().toISOString(),
      });

      return response.data;
    } catch (error) {
      console.error('Error updating driver availability:', error);
      throw error;
    }
  }

  async updateDriverLocation(latitude: number, longitude: number): Promise<void> {
    try {
      if (!this.driverId) {
        throw new Error('Driver ID not set');
      }

      await axios.post(`${API_BASE_URL}/drivers/${this.driverId}/location`, {
        latitude,
        longitude,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Error updating driver location:', error);
      throw error;
    }
  }

  // Assignment Management
  async getCurrentAssignment(): Promise<Assignment | null> {
    try {
      if (!this.driverId) {
        throw new Error('Driver ID not set');
      }

      const response = await axios.get(`${API_BASE_URL}/drivers/${this.driverId}/current-assignment`);
      return response.data || null;
    } catch (error) {
      console.error('Error fetching current assignment:', error);
      return null;
    }
  }

  async acceptAssignment(assignmentId: string): Promise<Assignment> {
    try {
      const response = await axios.post(`${API_BASE_URL}/assignments/${assignmentId}/accept`, {
        driverId: this.driverId,
        acceptedAt: new Date().toISOString(),
      });

      return response.data;
    } catch (error) {
      console.error('Error accepting assignment:', error);
      throw error;
    }
  }

  async declineAssignment(assignmentId: string, reason?: string): Promise<void> {
    try {
      await axios.post(`${API_BASE_URL}/assignments/${assignmentId}/decline`, {
        driverId: this.driverId,
        reason,
        declinedAt: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Error declining assignment:', error);
      throw error;
    }
  }

  async completeAssignment(assignmentId: string, completionNotes?: string): Promise<Assignment> {
    try {
      const response = await axios.post(`${API_BASE_URL}/assignments/${assignmentId}/complete`, {
        driverId: this.driverId,
        completedAt: new Date().toISOString(),
        completionNotes,
      });

      return response.data;
    } catch (error) {
      console.error('Error completing assignment:', error);
      throw error;
    }
  }

  // Driver Stats
  async getDriverStats(): Promise<DriverStats> {
    try {
      if (!this.driverId) {
        throw new Error('Driver ID not set');
      }

      const response = await axios.get(`${API_BASE_URL}/drivers/${this.driverId}/stats`);
      return response.data;
    } catch (error) {
      console.error('Error fetching driver stats:', error);
      throw error;
    }
  }

  // Assignment History
  async getAssignmentHistory(limit: number = 50, offset: number = 0): Promise<Assignment[]> {
    try {
      if (!this.driverId) {
        throw new Error('Driver ID not set');
      }

      const response = await axios.get(`${API_BASE_URL}/drivers/${this.driverId}/assignments`, {
        params: { limit, offset },
      });

      return response.data;
    } catch (error) {
      console.error('Error fetching assignment history:', error);
      throw error;
    }
  }
}

// WebSocket Service for Real-time Updates
export class AmbulanceWebSocketService {
  private ws: WebSocket | null = null;
  private driverId: string | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private isConnecting = false;

  constructor(private onStatusUpdate?: (status: DriverStatus) => void,
              private onAssignmentReceived?: (assignment: Assignment) => void,
              private onAssignmentUpdated?: (assignment: Assignment) => void) {}

  connect(driverId: string, authToken: string) {
    if (this.isConnecting || (this.ws && this.ws.readyState === WebSocket.OPEN)) {
      return;
    }

    this.driverId = driverId;
    this.isConnecting = true;

    const wsUrl = `wss://api.medflow.com/v1/ws/drivers/${driverId}?token=${authToken}`;
    
    try {
      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        console.log('WebSocket connected');
        this.isConnecting = false;
        this.reconnectAttempts = 0;
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          
          switch (data.type) {
            case 'STATUS_UPDATE':
              this.onStatusUpdate?.(data.payload);
              break;
            case 'ASSIGNMENT_RECEIVED':
              this.onAssignmentReceived?.(data.payload);
              break;
            case 'ASSIGNMENT_UPDATED':
              this.onAssignmentUpdated?.(data.payload);
              break;
            default:
              console.log('Unknown message type:', data.type);
          }
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      this.ws.onclose = () => {
        console.log('WebSocket disconnected');
        this.isConnecting = false;
        this.attemptReconnect();
      };

      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        this.isConnecting = false;
      };

    } catch (error) {
      console.error('Error creating WebSocket connection:', error);
      this.isConnecting = false;
      this.attemptReconnect();
    }
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.reconnectAttempts = 0;
    this.isConnecting = false;
  }

  private attemptReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts && this.driverId) {
      this.reconnectAttempts++;
      console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
      
      setTimeout(() => {
        this.connect(this.driverId!, '');
      }, this.reconnectDelay * this.reconnectAttempts);
    } else {
      console.error('Max reconnection attempts reached');
    }
  }

  sendMessage(type: string, payload: any) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ type, payload }));
    } else {
      console.error('WebSocket not connected');
    }
  }
}

// Location Service
export class LocationService {
  private watchId: number | null = null;

  startLocationTracking(onLocationUpdate: (latitude: number, longitude: number) => void) {
    this.watchId = Geolocation.watchPosition(
      (position: any) => {
        const { latitude, longitude } = position.coords;
        onLocationUpdate(latitude, longitude);
      },
      (error: any) => {
        console.error('Location tracking error:', error);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 5000,
      }
    );
  }

  stopLocationTracking() {
    if (this.watchId !== null) {
      Geolocation.clearWatch(this.watchId);
      this.watchId = null;
    }
  }

  async getCurrentLocation(): Promise<{ latitude: number; longitude: number }> {
    return new Promise((resolve, reject) => {
      Geolocation.getCurrentPosition(
        (position: any) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        (error: any) => {
          reject(error);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 5000,
        }
      );
    });
  }
}

// Export singleton instances
export const ambulanceService = AmbulanceService.getInstance();
export const locationService = new LocationService();
