import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// Common things welders should try when troubleshooting
const COMMON_THINGS_TO_TRY = [
  { id: 'cleaned_surface', label: 'Cleaned surface (rust, oil, paint)' },
  { id: 'checked_gas_flow', label: 'Checked gas flow (15-20 CFH)' },
  { id: 'checked_stick_out', label: 'Checked wire stick-out (3/8")' },
  { id: 'adjusted_gun_angle', label: 'Adjusted gun angle (10-15°)' },
  { id: 'checked_work_clamp', label: 'Checked work clamp connection' },
  { id: 'slowed_travel_speed', label: 'Slowed down travel speed' },
  { id: 'sped_up_travel_speed', label: 'Sped up travel speed' },
  { id: 'tried_weaving', label: 'Tried weaving technique' },
  { id: 'checked_for_wind', label: 'Checked for wind/drafts' },
  { id: 'verified_gas_type', label: 'Verified correct gas (C25)' },
];

export default function ParameterPanel({ parameters, onUpdateParameter, thingsTried, onToggleTried }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isEditing, setIsEditing] = useState(null);
  const [editValue, setEditValue] = useState('');

  const handleEdit = (paramKey) => {
    setIsEditing(paramKey);
    setEditValue(parameters[paramKey]?.toString() || '');
  };

  const handleSave = (paramKey) => {
    const numValue = parseFloat(editValue);
    if (!isNaN(numValue)) {
      onUpdateParameter(paramKey, numValue);
    }
    setIsEditing(null);
  };

  return (
    <View style={styles.container}>
      {/* Compact header bar */}
      <TouchableOpacity
        style={styles.headerBar}
        onPress={() => setIsExpanded(!isExpanded)}
      >
        <View style={styles.headerContent}>
          <Ionicons name="settings-outline" size={20} color="#666" />
          <Text style={styles.headerTitle}>Current Settings</Text>
          <View style={styles.compactParams}>
            <Text style={styles.compactText}>
              {parameters.metalThickness}" • {parameters.voltage}V • {parameters.wireSpeed} IPM
            </Text>
          </View>
        </View>
        <Ionicons
          name={isExpanded ? 'chevron-down' : 'chevron-up'}
          size={24}
          color="#666"
        />
      </TouchableOpacity>

      {/* Expanded panel */}
      {isExpanded && (
        <ScrollView style={styles.expandedPanel} showsVerticalScrollIndicator={false}>
          {/* Current Settings */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Machine Settings</Text>

            <View style={styles.paramRow}>
              <Text style={styles.paramLabel}>Metal Thickness</Text>
              <Text style={styles.paramValue}>{parameters.metalThickness}"</Text>
            </View>

            <View style={styles.paramRow}>
              <Text style={styles.paramLabel}>Voltage</Text>
              {isEditing === 'voltage' ? (
                <View style={styles.editContainer}>
                  <TextInput
                    style={styles.editInput}
                    value={editValue}
                    onChangeText={setEditValue}
                    keyboardType="numeric"
                    autoFocus
                  />
                  <TouchableOpacity onPress={() => handleSave('voltage')}>
                    <Ionicons name="checkmark" size={24} color="#4CAF50" />
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity onPress={() => handleEdit('voltage')}>
                  <Text style={styles.paramValueEditable}>{parameters.voltage}V</Text>
                </TouchableOpacity>
              )}
            </View>

            <View style={styles.paramRow}>
              <Text style={styles.paramLabel}>Wire Speed</Text>
              {isEditing === 'wireSpeed' ? (
                <View style={styles.editContainer}>
                  <TextInput
                    style={styles.editInput}
                    value={editValue}
                    onChangeText={setEditValue}
                    keyboardType="numeric"
                    autoFocus
                  />
                  <TouchableOpacity onPress={() => handleSave('wireSpeed')}>
                    <Ionicons name="checkmark" size={24} color="#4CAF50" />
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity onPress={() => handleEdit('wireSpeed')}>
                  <Text style={styles.paramValueEditable}>{parameters.wireSpeed} IPM</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Things Tried Checklist */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Things I've Tried</Text>
            <Text style={styles.sectionSubtitle}>Check off items as you try them</Text>
            {COMMON_THINGS_TO_TRY.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={styles.checklistItem}
                onPress={() => onToggleTried(item.id)}
              >
                <Ionicons
                  name={thingsTried[item.id] ? 'checkbox' : 'square-outline'}
                  size={24}
                  color={thingsTried[item.id] ? '#4CAF50' : '#999'}
                />
                <Text
                  style={[
                    styles.checklistLabel,
                    thingsTried[item.id] && styles.checklistLabelChecked,
                  ]}
                >
                  {item.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFF',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  headerBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginLeft: 8,
  },
  compactParams: {
    flex: 1,
    marginLeft: 12,
  },
  compactText: {
    fontSize: 14,
    color: '#666',
  },
  expandedPanel: {
    maxHeight: 400,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  section: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 13,
    color: '#999',
    marginBottom: 12,
  },
  paramRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  paramLabel: {
    fontSize: 14,
    color: '#666',
  },
  paramValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  paramValueEditable: {
    fontSize: 14,
    color: '#4A90D9',
    fontWeight: '500',
    textDecorationLine: 'underline',
  },
  editContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  editInput: {
    borderWidth: 1,
    borderColor: '#4A90D9',
    borderRadius: 4,
    padding: 4,
    width: 80,
    fontSize: 14,
    textAlign: 'right',
  },
  checklistItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    gap: 12,
  },
  checklistLabel: {
    fontSize: 14,
    color: '#333',
    flex: 1,
  },
  checklistLabelChecked: {
    color: '#999',
    textDecorationLine: 'line-through',
  },
});
