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
  diagnosis,
  recommendation,
  recommendationIndex,
  totalRecommendations,
  parameters,
  onAccept,
  onTryNext,
  onRetry,
}) {
  // Generate specific recommendation text based on current parameters
  const getSpecificRecommendation = () => {
    const param = recommendation.parameter;
    const adjustment = recommendation.adjustment;

    // For parameters with numeric values, show specific changes
    if (param === 'voltage' && parameters.voltage) {
      const currentVoltage = parameters.voltage;
      if (adjustment.toLowerCase().includes('increase')) {
        return `Increase voltage from ${currentVoltage}V to ${currentVoltage + 2}V`;
      } else if (adjustment.toLowerCase().includes('decrease')) {
        return `Decrease voltage from ${currentVoltage}V to ${Math.max(currentVoltage - 2, 12)}V`;
      }
    }

    if (param === 'wire_feed_speed' && parameters.wireSpeed) {
      const currentSpeed = parameters.wireSpeed;
      if (adjustment.toLowerCase().includes('increase')) {
        return `Increase wire speed from ${currentSpeed} IPM to ${currentSpeed + 20} IPM`;
      } else if (adjustment.toLowerCase().includes('decrease')) {
        return `Decrease wire speed from ${currentSpeed} IPM to ${Math.max(currentSpeed - 20, 100)} IPM`;
      }
    }

    // For technique adjustments, show as instructional
    if (param === 'stick_out') {
      return `Check stick-out distance: maintain 3/8"`;
    }

    if (param === 'travel_speed') {
      return adjustment;
    }

    // Default to the adjustment text
    return adjustment;
  };

  const specificRec = getSpecificRecommendation();
  const isNumericChange = specificRec.toLowerCase().includes('from') && specificRec.toLowerCase().includes('to');

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.header}>
        <Ionicons name="construct-outline" size={48} color="#FF6B35" />
        <Text style={styles.diagnosisTitle}>{diagnosis}</Text>
      </View>

      <View style={styles.recommendationCard}>
        <View style={styles.recommendationHeader}>
          <Ionicons name="bulb-outline" size={24} color="#FF6B35" />
          <Text style={styles.recommendationTitle}>
            Try This ({recommendationIndex + 1}/{totalRecommendations})
          </Text>
        </View>

        <Text style={styles.recommendationText}>{specificRec}</Text>

        <View style={styles.detailsBox}>
          <Text style={styles.detailsTitle}>Why?</Text>
          <Text style={styles.detailsText}>{recommendation.details}</Text>
        </View>

        <View style={styles.parameterBadge}>
          <Ionicons name="settings-outline" size={16} color="#666" />
          <Text style={styles.parameterText}>
            Parameter: {recommendation.parameter.replace(/_/g, ' ')}
          </Text>
        </View>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.actionButton, styles.acceptButton]}
          onPress={onAccept}
        >
          <Ionicons name="checkmark-circle" size={24} color="#FFF" />
          <Text style={styles.acceptButtonText}>
            {isNumericChange ? 'Done, I changed it' : 'Done, I tried this'}
          </Text>
        </TouchableOpacity>

        {recommendationIndex < totalRecommendations - 1 ? (
          <TouchableOpacity
            style={[styles.actionButton, styles.nextButton]}
            onPress={onTryNext}
          >
            <Text style={styles.nextButtonText}>Try Another Suggestion</Text>
            <Ionicons name="arrow-forward" size={20} color="#FF6B35" />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[styles.actionButton, styles.retryButton]}
            onPress={onRetry}
          >
            <Ionicons name="refresh" size={20} color="#666" />
            <Text style={styles.retryButtonText}>Start Over</Text>
          </TouchableOpacity>
        )}
      </View>
    </ScrollView>
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
    color: '#FF6B35',
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
    borderColor: '#FF6B35',
  },
  nextButtonText: {
    color: '#FF6B35',
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
