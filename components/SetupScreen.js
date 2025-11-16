import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  TextInput,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import data from '../data/data.json';

// Build thickness presets from data.json
const THICKNESS_PRESETS = data.thickness_presets.reduce((acc, preset) => {
  acc[preset.thickness] = { voltage: preset.voltage, wireSpeed: preset.wire_speed };
  return acc;
}, {});

const THICKNESS_OPTIONS = data.thickness_presets.map(p => p.thickness);

// Convert fraction string to decimal inches for visual representation
const thicknessToDecimal = (fraction) => {
  const parts = fraction.split('/');
  if (parts.length === 2) {
    return parseFloat(parts[0]) / parseFloat(parts[1]);
  }
  return parseFloat(fraction);
};

export default function SetupScreen({ onComplete, initialValues, isUpdate = false }) {
  const [selectedThickness, setSelectedThickness] = useState(
    initialValues?.metalThickness || '1/8'
  );
  const [voltage, setVoltage] = useState(
    initialValues?.voltage?.toString() || '18'
  );
  const [wireSpeed, setWireSpeed] = useState(
    initialValues?.wireSpeed?.toString() || '200'
  );

  const handleThicknessSelect = (thickness) => {
    setSelectedThickness(thickness);
    const preset = THICKNESS_PRESETS[thickness];
    setVoltage(preset.voltage.toString());
    setWireSpeed(preset.wireSpeed.toString());
  };

  const handleStart = () => {
    onComplete({
      metalThickness: selectedThickness,
      voltage: parseFloat(voltage) || 18,
      wireSpeed: parseFloat(wireSpeed) || 200,
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {!isUpdate && (
          <>
            <Image
              source={require('../assets/weldy_full_logo.png')}
              style={styles.logo}
              resizeMode="contain"
            />
            <Text style={styles.title}>Setup Your Weld Parameters</Text>
            <Text style={styles.subtitle}>
              Tell us about your current setup so we can give you specific recommendations
            </Text>
          </>
        )}

        {isUpdate && (
          <>
            <Text style={styles.updateTitle}>Update Your Settings</Text>
            <Text style={styles.updateSubtitle}>
              Change any values that have been adjusted since your last weld
            </Text>
          </>
        )}

        {/* Metal Thickness Selection */}
        <View style={styles.section}>
          <Text style={styles.label}>Metal Thickness (inches)</Text>
          <View style={styles.thicknessGrid}>
            {THICKNESS_OPTIONS.map((thickness) => {
              const decimalInches = thicknessToDecimal(thickness);
              const lineHeight = decimalInches * 200; // Scale factor for visibility

              return (
                <TouchableOpacity
                  key={thickness}
                  style={[
                    styles.thicknessButton,
                    selectedThickness === thickness && styles.thicknessButtonActive,
                  ]}
                  onPress={() => handleThicknessSelect(thickness)}
                >
                  <View style={styles.thicknessIndicatorContainer}>
                    <View
                      style={[
                        styles.thicknessLine,
                        {
                          width: lineHeight,
                          backgroundColor: selectedThickness === thickness ? '#4A90D9' : '#999'
                        }
                      ]}
                    />
                    <Text
                      style={[
                        styles.thicknessButtonText,
                        selectedThickness === thickness && styles.thicknessButtonTextActive,
                      ]}
                    >
                      {thickness}"
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Voltage Input */}
        <View style={styles.section}>
          <Text style={styles.label}>Current Voltage (V)</Text>
          <TextInput
            style={styles.input}
            value={voltage}
            onChangeText={setVoltage}
            keyboardType="numeric"
            placeholder="18"
          />
        </View>

        {/* Wire Speed Input */}
        <View style={styles.section}>
          <Text style={styles.label}>Wire Feed Speed (IPM)</Text>
          <TextInput
            style={styles.input}
            value={wireSpeed}
            onChangeText={setWireSpeed}
            keyboardType="numeric"
            placeholder="200"
          />
        </View>

        {!isUpdate && (
          <Text style={styles.note}>
            💡 Values are pre-filled based on your metal thickness. Adjust if needed.
          </Text>
        )}

        <TouchableOpacity style={styles.startButton} onPress={handleStart}>
          <Text style={styles.startButtonText}>
            {isUpdate ? 'Continue' : 'Start Troubleshooting'}
          </Text>
          <Ionicons name="arrow-forward" size={20} color="#FFF" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#eee5d2',
  },
  content: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: 200,
    height: 120,
    marginBottom: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 20,
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
    paddingHorizontal: 20,
  },
  updateTitle: {
    fontSize: 22,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
    textAlign: 'center',
  },
  updateSubtitle: {
    fontSize: 15,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
    paddingHorizontal: 20,
  },
  section: {
    width: '100%',
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
  },
  thicknessGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  thicknessButton: {
    flex: 1,
    minWidth: '30%',
    backgroundColor: '#FFF',
    padding: 15,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  thicknessButtonActive: {
    borderColor: '#4A90D9',
    backgroundColor: '#f5f0e6',
  },
  thicknessButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
  },
  thicknessButtonTextActive: {
    color: '#4A90D9',
  },
  thicknessIndicatorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  thicknessLine: {
    height: 40,
    borderRadius: 20,
  },
  input: {
    backgroundColor: '#FFF',
    padding: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    fontSize: 16,
  },
  note: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginVertical: 20,
    paddingHorizontal: 20,
  },
  startButton: {
    flexDirection: 'row',
    backgroundColor: '#4A90D9',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 8,
    alignItems: 'center',
    gap: 10,
  },
  startButtonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '600',
  },
});
