import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  TextInput,
  Modal,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { THINGS_TRIED } from '../data/things-tried';

export default function ParameterPanel({ parameters, onUpdateParameter, onToggleTried }) {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleOpen = () => {
    setIsExpanded(true);
  };

  const handleClose = () => {
    setIsExpanded(false);
  };

  const handleInstantUpdate = (paramKey, value) => {
    onUpdateParameter(paramKey, parseFloat(value));
  };

  // Helper to get tried things as readable list
  const getTriedThingsList = () => {
    if (!parameters.thingsTried) return 'None yet';

    const triedThings = Object.keys(parameters.thingsTried)
      .filter(thingId => parameters.thingsTried[thingId])
      .map(thingId => THINGS_TRIED[thingId]?.name)
      .filter(name => name); // Remove any undefined names

    if (triedThings.length === 0) return 'None yet';
    if (triedThings.length > 3) return `${triedThings.length} things`;
    return triedThings.join(', ');
  };

  // Compact summary bar
  const CompactBar = () => (
    <TouchableOpacity
      style={styles.compactBar}
      onPress={handleOpen}
      activeOpacity={0.7}
    >
      <View style={styles.compactContent}>
        <View style={styles.compactRow}>
          <Text style={styles.compactText}>
            {parameters.metalThickness}" · {parameters.voltage}V · {parameters.wireSpeed} IPM
          </Text>
          <Ionicons name="create-outline" size={20} color="#4A90D9" />
        </View>
        <Text style={styles.compactTriedText}>
          Things tried: {getTriedThingsList()}
        </Text>
      </View>
    </TouchableOpacity>
  );

  // Parameter row with inline editing
  const ParameterRow = ({ label, paramKey, value, unit, hasCheckbox = false, editable = true }) => {
    const [localValue, setLocalValue] = useState(value?.toString() || '');
    const tried = parameters.triedParameters?.[paramKey] || false;

    useEffect(() => {
      setLocalValue(value?.toString() || '');
    }, [value]);

    const handleBlur = () => {
      if (localValue && parseFloat(localValue) !== value) {
        handleInstantUpdate(paramKey, localValue);
      }
    };

    return (
      <View style={styles.paramRow}>
        <Text style={styles.paramLabel}>{label}</Text>
        <View style={styles.paramValueContainer}>
          {editable ? (
            <TextInput
              style={styles.paramInput}
              value={localValue}
              onChangeText={setLocalValue}
              onBlur={handleBlur}
              keyboardType="numeric"
              placeholder="--"
            />
          ) : (
            <Text style={styles.paramValue}>{value}</Text>
          )}
          <Text style={styles.paramUnit}>{unit}</Text>
          {hasCheckbox && (
            <TouchableOpacity
              style={styles.checkbox}
              onPress={() => onToggleTried(paramKey)}
            >
              <Ionicons
                name={tried ? "checkmark-circle" : "ellipse-outline"}
                size={24}
                color={tried ? "#4CAF50" : "#999"}
              />
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  // Thing tried row - just checkbox and label
  const ThingTriedRow = ({ label, paramKey, tried, onToggle }) => {
    return (
      <View style={styles.thingTriedRow}>
        <TouchableOpacity
          style={styles.thingTriedTouchable}
          onPress={() => onToggle(paramKey)}
        >
          <Ionicons
            name={tried ? "checkmark-circle" : "ellipse-outline"}
            size={24}
            color={tried ? "#4CAF50" : "#999"}
          />
          <Text style={[styles.thingTriedLabel, tried && styles.thingTriedLabelChecked]}>
            {label}
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <>
      {/* Compact Bar - Always visible */}
      <CompactBar />

      {/* Slide-up Modal */}
      <Modal
        visible={isExpanded}
        transparent
        animationType="slide"
        onRequestClose={handleClose}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={handleClose}
        >
          <TouchableOpacity
            style={styles.modalContent}
            activeOpacity={1}
            onPress={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Current Settings</Text>
              <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
                <Ionicons name="close" size={28} color="#333" />
              </TouchableOpacity>
            </View>

            {/* Settings Section */}
            <ScrollView style={styles.paramsScroll}>
              <Text style={styles.sectionHeader}>Settings</Text>
              <ParameterRow
                label="Metal Thickness"
                paramKey="metalThickness"
                value={parameters.metalThickness}
                unit='"'
                editable={false}
              />
              <ParameterRow
                label="Voltage"
                paramKey="voltage"
                value={parameters.voltage}
                unit="V"
              />
              <ParameterRow
                label="Wire Speed"
                paramKey="wireSpeed"
                value={parameters.wireSpeed}
                unit=" IPM"
              />

              {/* Things Tried Section */}
              <Text style={styles.sectionHeader}>Things Tried</Text>
              <Text style={styles.sectionSubtext}>
                Mark actions you've already attempted
              </Text>

              {parameters.thingsTried && Object.keys(parameters.thingsTried)
                .filter(thingId => parameters.thingsTried[thingId])
                .map(thingId => {
                  const thing = THINGS_TRIED[thingId];
                  if (!thing) return null;
                  return (
                    <ThingTriedRow
                      key={thingId}
                      label={thing.name}
                      paramKey={thingId}
                      tried={parameters.thingsTried[thingId]}
                      onToggle={onToggleTried}
                    />
                  );
                })
              }

              {(!parameters.thingsTried || Object.keys(parameters.thingsTried).filter(id => parameters.thingsTried[id]).length === 0) && (
                <Text style={styles.noThingsTriedText}>
                  No actions tried yet. Complete a recommendation to add items here.
                </Text>
              )}

            </ScrollView>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  // Compact bar at bottom
  compactBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFF',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    elevation: 8,
    zIndex: 1000,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  compactContent: {
    flex: 1,
  },
  compactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  compactText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  compactTriedText: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
  },

  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
    paddingBottom: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    padding: 4,
  },
  paramsScroll: {
    paddingHorizontal: 20,
  },

  // Parameter rows
  paramRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  paramLabel: {
    fontSize: 16,
    color: '#666',
    flex: 1,
  },
  paramValueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  paramInput: {
    backgroundColor: '#f5f0e6',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    minWidth: 60,
    textAlign: 'center',
  },
  paramValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  paramUnit: {
    fontSize: 14,
    color: '#666',
  },
  checkbox: {
    padding: 4,
    marginLeft: 8,
  },

  // Section headers
  sectionHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 20,
    marginBottom: 10,
  },
  sectionSubtext: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
    fontStyle: 'italic',
  },

  // Things tried row
  thingTriedRow: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  thingTriedTouchable: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  thingTriedLabel: {
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
  thingTriedLabelChecked: {
    color: '#4CAF50',
    fontWeight: '500',
  },

  // No things tried message
  noThingsTriedText: {
    fontSize: 14,
    color: '#999',
    fontStyle: 'italic',
    textAlign: 'center',
    paddingVertical: 20,
  },
});
