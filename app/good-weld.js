import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function GoodWeld() {
  const params = useLocalSearchParams();
  const router = useRouter();

  const handleBack = () => {
    // Navigate back to defect selection with params
    router.push({
      pathname: '/defect-selection',
      params: {
        ...params,
      }
    });
  };

  const handleRestart = () => {
    // Navigate to setup with no params (fresh start)
    router.push('/setup');
  };

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <TouchableOpacity onPress={handleBack} style={styles.backButton}>
              <Ionicons name="arrow-back" size={24} color="#333" />
            </TouchableOpacity>
          </View>
          <Text style={styles.title}>Weldy</Text>
          <TouchableOpacity onPress={handleRestart} style={styles.restartIcon}>
            <Ionicons name="reload" size={24} color="#4A90D9" />
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          <View style={styles.goodWeldContainer}>
            <Ionicons name="checkmark-circle" size={120} color="#4CAF50" />
            <Text style={styles.goodWeldTitle}>Great Job!</Text>
            <Text style={styles.goodWeldText}>
              Your weld looks good. Keep practicing to maintain consistency!
            </Text>
            <TouchableOpacity
              style={styles.goodWeldButton}
              onPress={handleRestart}
            >
              <Text style={styles.goodWeldButtonText}>Start Another Session</Text>
            </TouchableOpacity>
          </View>
        </View>
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
  goodWeldContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  goodWeldTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginTop: 20,
    marginBottom: 16,
  },
  goodWeldText: {
    fontSize: 18,
    color: '#666',
    textAlign: 'center',
    lineHeight: 26,
    marginBottom: 32,
  },
  goodWeldButton: {
    backgroundColor: '#4A90D9',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 8,
  },
  goodWeldButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
