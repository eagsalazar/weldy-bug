import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import data from '../../../data/data.json';
import ParameterPanel from '../../../components/ParameterPanel';
import RecommendationScreen from '../../../components/RecommendationScreen';

export default function Recommendation() {
  const params = useLocalSearchParams();
  const router = useRouter();
  const { defects, mistake } = params;

  // Parse parameters from URL
  let parameters = {
    metalThickness: params.thickness || '1/8',
    voltage: parseFloat(params.voltage) || 18,
    wireSpeed: parseFloat(params.wireSpeed) || 200,
  };

  // Parse thingsTried from URL
  const thingsTried = params.tried ? params.tried.split(',').filter(Boolean).reduce((acc, id) => {
    acc[id] = true;
    return acc;
  }, {}) : {};

  // Parse the defects string
  const selectedDefect = defects.split('+');

  // Get the cause and mistake data
  // Derive cause from defects + mistake (no need for cause ID in query params)
  const selectedKey = [...selectedDefect].sort().join('+');
  const selectedCause = data.causes.find(c => {
    const causeKey = [...c.defect_ids].sort().join('+');
    return causeKey === selectedKey && c.mistake_ids.includes(mistake);
  });
  const selectedMistake = data.mistakes.find(m => m.id === mistake);

  // Get human-readable label for the combination
  const defectNames = selectedDefect
    .map(id => data.defects.find(d => d.id === id)?.name)
    .filter(Boolean)
    .join(' + ');

  const handleAcceptRecommendation = () => {
    // Add this mistake to things tried
    const currentTried = params.tried ? params.tried.split(',').filter(Boolean) : [];
    const newTried = [...currentTried, selectedMistake.id];

    // Apply parameter changes if this is a voltage or wire feed adjustment
    let updatedParams = { ...parameters };

    if (selectedMistake.id === 'voltage_set_too_high') {
      updatedParams.voltage = Math.max(parameters.voltage - 2, 12);
    } else if (selectedMistake.id === 'voltage_set_too_low') {
      updatedParams.voltage = parameters.voltage + 2;
    } else if (selectedMistake.id === 'wire_feed_set_too_high') {
      updatedParams.wireSpeed = Math.max(parameters.wireSpeed - 25, 100);
    } else if (selectedMistake.id === 'wire_feed_set_too_low') {
      updatedParams.wireSpeed = parameters.wireSpeed + 25;
    }

    // Navigate back to setup with updated parameters
    router.push({
      pathname: '/setup',
      params: {
        voltage: updatedParams.voltage,
        wireSpeed: updatedParams.wireSpeed,
        thickness: updatedParams.metalThickness,
        tried: newTried.join(','),
      }
    });
  };

  const handleBackFromRecommendation = () => {
    router.push({
      pathname: `/defect-selection/${defects}`,
      params: {
        ...params,
      }
    });
  };

  const handleRestart = () => {
    router.push('/setup');
  };

  const handleUpdateParameter = (paramKey, value) => {
    const newParams = {
      ...params,
      [paramKey === 'metalThickness' ? 'thickness' : paramKey]: value,
    };
    router.setParams(newParams);
  };

  const handleToggleTried = (thingId) => {
    const currentTried = params.tried ? params.tried.split(',').filter(Boolean) : [];
    let newTried;

    if (currentTried.includes(thingId)) {
      newTried = currentTried.filter(id => id !== thingId);
    } else {
      newTried = [...currentTried, thingId];
    }

    router.setParams({
      ...params,
      tried: newTried.join(','),
    });
  };

  if (!selectedCause || !selectedMistake) {
    return (
      <SafeAreaProvider>
        <SafeAreaView style={styles.container}>
          <Text>Error: Could not find cause or mistake data</Text>
        </SafeAreaView>
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <TouchableOpacity onPress={handleBackFromRecommendation} style={styles.backButton}>
              <Ionicons name="arrow-back" size={24} color="#333" />
            </TouchableOpacity>
          </View>
          <Text style={styles.title}>Weldy</Text>
          <TouchableOpacity onPress={handleRestart} style={styles.restartIcon}>
            <Ionicons name="reload" size={24} color="#4A90D9" />
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.content}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
        >
          <RecommendationScreen
            defectLabel={defectNames}
            cause={selectedCause}
            mistake={selectedMistake}
            onAccept={handleAcceptRecommendation}
          />
        </ScrollView>

        {/* Parameter Panel */}
        <ParameterPanel
          parameters={parameters}
          onUpdateParameter={handleUpdateParameter}
          thingsTried={thingsTried}
          onToggleTried={handleToggleTried}
        />
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#eee5d2',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  headerLeft: {
    width: 40,
  },
  backButton: {
    padding: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  restartIcon: {
    padding: 8,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 110,
  },
});
