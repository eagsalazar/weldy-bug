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
import data from '../data/data.json';

export default function ParameterPanel({ parameters, onUpdateParameter, thingsTried, onToggleTried }) {
  // Build checklist from mistakes in data.json
  // Get all mistakes that are referenced by causes
  const referencedMistakeIds = new Set();
  data.causes.forEach(cause => {
    cause.mistake_ids.forEach(id => referencedMistakeIds.add(id));
  });

  const checklistItems = data.mistakes
    .filter(mistake => referencedMistakeIds.has(mistake.id))
    .map(mistake => ({
      id: mistake.id,
      label: mistake.fix,
    }));
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
            <Text style={styles.sectionSubtitle}>Automatically tracked as you try fixes</Text>
            {checklistItems
              .filter(item => thingsTried[item.id] !== undefined)
              .map((item) => (
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
            {Object.keys(thingsTried).length === 0 && (
              <Text style={styles.emptyText}>No items yet - accept a recommendation to add one</Text>
            )}
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
  emptyText: {
    fontSize: 14,
    color: '#999',
    fontStyle: 'italic',
    textAlign: 'center',
    paddingVertical: 12,
  },
});
