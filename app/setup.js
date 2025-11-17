import React from 'react';
import { StyleSheet, View, TouchableOpacity, Text, ScrollView } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import SetupScreen from '../components/SetupScreen';
import ParameterPanel from '../components/ParameterPanel';

export default function Setup() {
  const params = useLocalSearchParams();
  const router = useRouter();

  // Determine if this is initial setup or update based on presence of query params
  const isInitialSetup = !params.voltage;

  // Parse parameters from URL
  const parameters = isInitialSetup ? null : {
    metalThickness: params.thickness || '1/8',
    voltage: parseFloat(params.voltage) || 18,
    wireSpeed: parseFloat(params.wireSpeed) || 200,
  };

  // Parse thingsTried from URL
  const thingsTried = params.tried ? params.tried.split(',').reduce((acc, id) => {
    acc[id] = true;
    return acc;
  }, {}) : {};

  const handleSetupComplete = (newParams) => {
    // Navigate to defect selection with parameters
    router.push({
      pathname: '/defect-selection',
      params: {
        voltage: newParams.voltage,
        wireSpeed: newParams.wireSpeed,
        thickness: newParams.metalThickness,
        tried: params.tried || '', // preserve tried list
      }
    });
  };

  const handleUpdateSettings = (newParams) => {
    // Navigate to defect selection with updated parameters
    router.push({
      pathname: '/defect-selection',
      params: {
        voltage: newParams.voltage,
        wireSpeed: newParams.wireSpeed,
        thickness: newParams.metalThickness,
        tried: params.tried || '', // preserve tried list
      }
    });
  };

  const handleRestart = () => {
    // Navigate to setup with no params (fresh start)
    router.push('/setup');
  };

  const handleUpdateParameter = (paramKey, value) => {
    // Update URL params
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
      // Remove it
      newTried = currentTried.filter(id => id !== thingId);
    } else {
      // Add it
      newTried = [...currentTried, thingId];
    }

    router.setParams({
      ...params,
      tried: newTried.join(','),
    });
  };

  if (isInitialSetup) {
    return (
      <SafeAreaProvider>
        <SafeAreaView style={styles.container}>
          <SetupScreen onComplete={handleSetupComplete} initialValues={null} />
        </SafeAreaView>
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft} />
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
          <SetupScreen
            onComplete={handleUpdateSettings}
            initialValues={parameters}
            isUpdate={true}
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
