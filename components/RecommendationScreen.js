import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function RecommendationScreen({
  defectLabel,
  cause,
  mistake,
  onAccept,
}) {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="construct-outline" size={48} color="#4A90D9" />
        <Text style={styles.diagnosisTitle}>{defectLabel}</Text>
        <Text style={styles.causeSubtitle}>{cause.name}</Text>
      </View>

      <View style={styles.recommendationCard}>
        <View style={styles.recommendationHeader}>
          <Ionicons name="bulb-outline" size={24} color="#4A90D9" />
          <Text style={styles.recommendationTitle}>Try This</Text>
        </View>

        <Text style={styles.recommendationText}>{mistake.fix}</Text>

        <View style={styles.detailsBox}>
          <Text style={styles.detailsTitle}>Cause</Text>
          <Text style={styles.detailsText}>{cause.description}</Text>
        </View>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.actionButton, styles.acceptButton]}
          onPress={onAccept}
        >
          <Ionicons name="checkmark-circle" size={24} color="#FFF" />
          <Text style={styles.acceptButtonText}>Done - Update My Settings</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  diagnosisTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginTop: 12,
  },
  causeSubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 8,
  },
  recommendationCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  recommendationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 10,
  },
  recommendationTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  recommendationText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#4A90D9',
    marginBottom: 16,
    lineHeight: 26,
  },
  detailsBox: {
    backgroundColor: '#F9F9F9',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  detailsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 6,
  },
  detailsText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  parameterBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#F0F0F0',
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  parameterText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  actions: {
    gap: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 8,
    gap: 8,
  },
  acceptButton: {
    backgroundColor: '#4CAF50',
  },
  acceptButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  nextButton: {
    backgroundColor: '#FFF',
    borderWidth: 2,
    borderColor: '#4A90D9',
  },
  nextButtonText: {
    color: '#4A90D9',
    fontSize: 16,
    fontWeight: '600',
  },
  retryButton: {
    backgroundColor: '#F0F0F0',
  },
  retryButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
  },
});
