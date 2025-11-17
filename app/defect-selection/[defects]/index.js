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

export default function CauseSelection() {
  const params = useLocalSearchParams();
  const router = useRouter();
  const { defects } = params;

  // Parse parameters from URL
  const parameters = {
    metalThickness: params.thickness || '1/8',
    voltage: parseFloat(params.voltage) || 18,
    wireSpeed: parseFloat(params.wireSpeed) || 200,
  };

  // Parse thingsTried from URL
  const thingsTried = params.tried ? params.tried.split(',').filter(Boolean).reduce((acc, id) => {
    acc[id] = true;
    return acc;
  }, {}) : {};

  // Parse the defects string into an array
  const selectedDefect = defects.split('+');

  // Find causes that match this exact combination of defect IDs
  const selectedKey = [...selectedDefect].sort().join('+');
  const causesForCombination = data.causes.filter(c => {
    const causeKey = [...c.defect_ids].sort().join('+');
    return causeKey === selectedKey;
  });

  // Get human-readable label for the combination
  const defectNames = selectedDefect
    .map(id => data.defects.find(d => d.id === id)?.name)
    .filter(Boolean)
    .join(' + ');

  const handleCauseSelected = (causeId) => {
    const cause = data.causes.find(c => c.id === causeId);
    // Pick the first mistake for this cause
    const mistakeId = cause.mistake_ids[0];

    // Navigate to recommendation with mistake ID
    // Note: cause can be derived from defects + mistake, so not needed in params
    router.push({
      pathname: `/defect-selection/${defects}/${mistakeId}`,
      params: {
        ...params,
      }
    });
  };

  const handleBackFromCauseSelection = () => {
    router.push({
      pathname: '/defect-selection',
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

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <TouchableOpacity onPress={handleBackFromCauseSelection} style={styles.backButton}>
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
          <View style={styles.questionContainer}>
            <Text style={styles.question}>
              You selected: {defectNames}. Which of these applies?
            </Text>
            <View style={styles.textChoicesContainer}>
              {causesForCombination.map((cause) => {
                // Get the first mistake for this cause to show the diagnostic question
                const firstMistake = data.mistakes.find(m => m.id === cause.mistake_ids[0]);

                return (
                  <TouchableOpacity
                    key={cause.id}
                    style={styles.textChoiceButton}
                    onPress={() => handleCauseSelected(cause.id)}
                  >
                    <View style={{ flex: 1 }}>
                      <Text style={styles.textChoiceText}>{cause.name}</Text>
                      {firstMistake && (
                        <Text style={styles.textChoiceSubtext}>
                          {firstMistake.question_to_ask}
                        </Text>
                      )}
                    </View>
                    <Ionicons name="chevron-forward" size={20} color="#666" />
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
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
  questionContainer: {
    marginBottom: 20,
  },
  question: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  textChoicesContainer: {
    marginTop: 10,
  },
  textChoiceButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFF',
    padding: 20,
    marginBottom: 12,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  textChoiceText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '600',
    marginBottom: 4,
  },
  textChoiceSubtext: {
    fontSize: 14,
    color: '#666',
    lineHeight: 18,
  },
});
