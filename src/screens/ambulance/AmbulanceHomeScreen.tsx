import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Colors } from '../../constants/colors';
import { Labels } from '../../constants/labels';
import { Typography } from '../../constants/typography';
import { ambulanceService, AmbulanceWebSocketService, locationService } from '../../services/ambulanceService';
import type { DriverStatus, Assignment, DriverStats } from '../../services/ambulanceService';


export function AmbulanceHomeScreen() {
  const [driverStatus, setDriverStatus] = useState<DriverStatus | null>(null);
  const [currentAssignment, setCurrentAssignment] = useState<Assignment | null>(null);
  const [stats, setStats] = useState<DriverStats | null>(null);
  const [isToggling, setIsToggling] = useState(false);
  const [loading, setLoading] = useState(true);
  const [wsService, setWsService] = useState<AmbulanceWebSocketService | null>(null);

  // Initialize data and WebSocket connection
  useEffect(() => {
    initializeApp();
    return () => {
      wsService?.disconnect();
      locationService.stopLocationTracking();
    };
  }, []);

  const initializeApp = async () => {
    try {
      setLoading(true);
      
      // Set up authentication (you'll get this from your auth context)
      // For now, using mock values - replace with real auth
      const mockToken = 'mock-jwt-token';
      const mockDriverId = 'driver-123';
      
      ambulanceService.setAuthToken(mockToken);
      ambulanceService.setDriverId(mockDriverId);

      // Fetch initial data
      const [status, assignment, driverStats] = await Promise.all([
        ambulanceService.getDriverStatus(),
        ambulanceService.getCurrentAssignment(),
        ambulanceService.getDriverStats(),
      ]);

      setDriverStatus(status);
      setCurrentAssignment(assignment);
      setStats(driverStats);

      // Set up WebSocket for real-time updates
      const webSocketService = new AmbulanceWebSocketService(
        handleStatusUpdate,
        handleAssignmentReceived,
        handleAssignmentUpdated
      );
      
      webSocketService.connect(mockDriverId, mockToken);
      setWsService(webSocketService);

      // Start location tracking
      locationService.startLocationTracking(async (lat, lng) => {
        try {
          await ambulanceService.updateDriverLocation(lat, lng);
        } catch (error) {
          console.error('Error updating location:', error);
        }
      });

    } catch (error) {
      console.error('Error initializing app:', error);
      Alert.alert('Error', 'Failed to load driver data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = useCallback((status: DriverStatus) => {
    setDriverStatus(status);
  }, []);

  const handleAssignmentReceived = useCallback((assignment: Assignment) => {
    setCurrentAssignment(assignment);
    Alert.alert(
      'New Assignment',
      `Emergency call: ${assignment.patientName} to ${assignment.hospital}`,
      [
        { text: 'Decline', style: 'cancel', onPress: () => declineAssignment(assignment.id) },
        { text: 'Accept', onPress: () => acceptAssignment(assignment.id) },
      ]
    );
  }, []);

  const handleAssignmentUpdated = useCallback((assignment: Assignment) => {
    setCurrentAssignment(assignment);
  }, []);

  const toggleAvailability = async () => {
    if (driverStatus?.isInService) {
      Alert.alert(
        'Currently In Service',
        'You cannot change availability while on active duty. Complete current assignment first.',
        [{ text: 'OK' }]
      );
      return;
    }

    if (!driverStatus) return;

    setIsToggling(true);
    
    try {
      const newAvailability = !driverStatus.isAvailable;
      const updatedStatus = await ambulanceService.updateDriverAvailability(newAvailability);
      setDriverStatus(updatedStatus);
      
      Alert.alert(
        'Status Updated',
        newAvailability 
          ? 'You are now available for assignments' 
          : 'You are now unavailable for assignments'
      );
    } catch (error) {
      console.error('Error updating availability:', error);
      Alert.alert('Error', 'Failed to update availability. Please try again.');
    } finally {
      setIsToggling(false);
    }
  };

  const acceptAssignment = async (assignmentId: string) => {
    try {
      const assignment = await ambulanceService.acceptAssignment(assignmentId);
      setCurrentAssignment(assignment);
      
      // Update driver status to in service
      if (driverStatus) {
        const updatedStatus = await ambulanceService.updateDriverAvailability(false);
        setDriverStatus({ ...updatedStatus, isInService: true });
      }
    } catch (error) {
      console.error('Error accepting assignment:', error);
      Alert.alert('Error', 'Failed to accept assignment. Please try again.');
    }
  };

  const declineAssignment = async (assignmentId: string) => {
    try {
      await ambulanceService.declineAssignment(assignmentId);
      setCurrentAssignment(null);
    } catch (error) {
      console.error('Error declining assignment:', error);
      Alert.alert('Error', 'Failed to decline assignment. Please try again.');
    }
  };

  const simulateAssignment = () => {
    if (!driverStatus?.isAvailable || driverStatus?.isInService) {
      Alert.alert(
        'Not Available',
        'You must be available and not in service to receive assignments',
        [{ text: 'OK' }]
      );
      return;
    }

    // This would normally come from the server via WebSocket
    // For demo purposes, showing how it would work
    Alert.alert('Info', 'Waiting for real assignments from dispatcher...');
  };

  const completeAssignment = async () => {
    if (!currentAssignment) return;

    Alert.alert(
      'Complete Assignment',
      'Mark this assignment as completed?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Complete',
          onPress: async () => {
            try {
              await ambulanceService.completeAssignment(currentAssignment.id);
              setCurrentAssignment(null);
              
              // Update driver status to available
              if (driverStatus) {
                const updatedStatus = await ambulanceService.updateDriverAvailability(true);
                setDriverStatus({ ...updatedStatus, isInService: false });
              }

              // Refresh stats
              const updatedStats = await ambulanceService.getDriverStats();
              setStats(updatedStats);
              
              Alert.alert('Completed', 'Assignment marked as completed. You are now available.');
            } catch (error) {
              console.error('Error completing assignment:', error);
              Alert.alert('Error', 'Failed to complete assignment. Please try again.');
            }
          },
        },
      ]
    );
  };

  const getStatusColor = () => {
    if (driverStatus?.isInService) return Colors.danger;
    if (driverStatus?.isAvailable) return Colors.success;
    return Colors.warning;
  };

  const getStatusText = () => {
    if (driverStatus?.isInService) return 'In Service';
    if (driverStatus?.isAvailable) return 'Available';
    return 'Unavailable';
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.loader}>
          <ActivityIndicator size="large" color={Colors.danger} />
          <Text style={styles.loadingText}>Loading driver data...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return Colors.danger;
      case 'urgent': return Colors.warning;
      case 'normal': return Colors.info;
      default: return Colors.textSecondary;
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.screenTitle}>Ambulance Home</Text>

        {/* Status Card */}
        <View style={styles.statusCard}>
          <View style={styles.statusHeader}>
            <View style={styles.statusInfo}>
              <Text style={styles.statusLabel}>Driver Status</Text>
              <Text style={styles.statusText}>{getStatusText()}</Text>
            </View>
            <View style={[styles.statusIndicator, { backgroundColor: getStatusColor() }]}>
              <Text style={styles.statusIndicatorText}>{getStatusText()[0]}</Text>
            </View>
          </View>
          
          <View style={styles.statusDetails}>
            <Text style={styles.lastUpdated}>
              Last updated: {driverStatus ? new Date(driverStatus.lastUpdated).toLocaleTimeString() : 'N/A'}
            </Text>
          </View>

          <Pressable
            style={[styles.toggleButton, { backgroundColor: getStatusColor() }]}
            onPress={toggleAvailability}
            disabled={isToggling || driverStatus?.isInService}
          >
            {isToggling ? (
              <ActivityIndicator size="small" color={Colors.white} />
            ) : (
              <Text style={styles.toggleButtonText}>
                {driverStatus?.isAvailable ? 'Go Unavailable' : 'Go Available'}
              </Text>
            )}
          </Pressable>
        </View>

        {/* Current Assignment */}
        {currentAssignment && (
          <View style={styles.assignmentCard}>
            <Text style={styles.assignmentTitle}>Current Assignment</Text>
            <View style={styles.assignmentDetails}>
              <View style={styles.assignmentRow}>
                <Icon name="account" size={20} color={Colors.textSecondary} />
                <Text style={styles.assignmentText}>{currentAssignment.patientName}</Text>
              </View>
              <View style={styles.assignmentRow}>
                <Icon name="hospital" size={20} color={Colors.textSecondary} />
                <Text style={styles.assignmentText}>{currentAssignment.hospital}</Text>
              </View>
              <View style={styles.assignmentRow}>
                <Icon name="clock" size={20} color={Colors.textSecondary} />
                <Text style={styles.assignmentText}>ETA: {currentAssignment.eta}</Text>
              </View>
              <View style={styles.assignmentRow}>
                <Icon name="alert" size={20} color={getPriorityColor(currentAssignment.priority)} />
                <Text style={[styles.assignmentText, { color: getPriorityColor(currentAssignment.priority), textTransform: 'capitalize' }]}>
                  {currentAssignment.priority} Priority
                </Text>
              </View>
            </View>
            <Pressable style={styles.completeButton} onPress={completeAssignment}>
              <Text style={styles.completeButtonText}>Complete Assignment</Text>
            </Pressable>
          </View>
        )}

        {/* Quick Actions */}
        <View style={styles.quickActionsCard}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionButtons}>
            <Pressable style={styles.actionButton} onPress={simulateAssignment}>
              <Icon name="phone-ring" size={24} color={Colors.info} />
              <Text style={styles.actionButtonText}>Simulate Call</Text>
            </Pressable>
            <Pressable style={styles.actionButton}>
              <Icon name="map-marker-radius" size={24} color={Colors.success} />
              <Text style={styles.actionButtonText}>View Map</Text>
            </Pressable>
            <Pressable style={styles.actionButton}>
              <Icon name="history" size={24} color={Colors.warning} />
              <Text style={styles.actionButtonText}>Trip History</Text>
            </Pressable>
          </View>
        </View>

        {/* Stats */}
        <View style={styles.statsCard}>
          <Text style={styles.sectionTitle}>Today's Stats</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{stats?.completedToday || 0}</Text>
              <Text style={styles.statLabel}>Completed</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{stats?.totalTrips || 0}</Text>
              <Text style={styles.statLabel}>Total Trips</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{stats?.avgResponseTime || 'N/A'}</Text>
              <Text style={styles.statLabel}>Avg Response</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  scroll: { padding: 16, paddingBottom: 32 },
  screenTitle: { ...Typography.h1, color: Colors.textPrimary, marginBottom: 20 },
  loader: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center',
    gap: 16,
  },
  loadingText: {
    ...Typography.body,
    color: Colors.textSecondary,
  },
  
  // Status Card
  statusCard: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    borderWidth: 0.5,
    borderColor: Colors.border,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
  },
  statusHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  statusInfo: {
    flex: 1,
  },
  statusLabel: { ...Typography.small, color: Colors.textSecondary },
  statusText: { ...Typography.h2, color: Colors.textPrimary, marginTop: 2 },
  statusIndicator: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusIndicatorText: { ...Typography.h3, color: Colors.white, fontWeight: 'bold' },
  statusDetails: {
    marginBottom: 16,
  },
  lastUpdated: { ...Typography.tiny, color: Colors.textTertiary },
  toggleButton: {
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  toggleButtonText: { ...Typography.body, color: Colors.white, fontWeight: '600' },

  // Assignment Card
  assignmentCard: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    borderWidth: 0.5,
    borderColor: Colors.border,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
  },
  assignmentTitle: { ...Typography.h3, color: Colors.textPrimary, marginBottom: 12 },
  assignmentDetails: {
    marginBottom: 16,
  },
  assignmentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  assignmentText: { ...Typography.body, color: Colors.textPrimary, marginLeft: 8 },
  completeButton: {
    backgroundColor: Colors.success,
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  completeButtonText: { ...Typography.body, color: Colors.white, fontWeight: '600' },

  // Quick Actions
  quickActionsCard: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    borderWidth: 0.5,
    borderColor: Colors.border,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
  },
  sectionTitle: { ...Typography.h3, color: Colors.textPrimary, marginBottom: 12 },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    alignItems: 'center',
    flex: 1,
  },
  actionButtonText: { ...Typography.small, color: Colors.textSecondary, marginTop: 4 },

  // Stats
  statsCard: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    borderWidth: 0.5,
    borderColor: Colors.border,
    padding: 16,
    elevation: 2,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: { ...Typography.h2, color: Colors.textPrimary },
  statLabel: { ...Typography.small, color: Colors.textSecondary, marginTop: 2 },
});
