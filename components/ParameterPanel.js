import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  TextInput,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function ParameterPanel({ parameters, onUpdateParameter, onToggleTried }) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [editingParam, setEditingParam] = useState(null);
  const [editValue, setEditValue] = useState('');

  const handleEdit = (param, currentValue) => {
    setEditingParam(param);
    setEditValue(currentValue?.toString() || '');
  };

  const handleSaveEdit = () => {
    if (editingParam && editValue) {
      onUpdateParameter(editingParam, parseFloat(editValue));
    }
    setEditingParam(null);
  };

  const renderParameterRow = (label, paramKey, value, unit, hasCheckbox = false) => {
    const tried = parameters.triedParameters?.[paramKey] || false;
    const displayValue = value !== null && value !== undefined ? `${value}${unit}` : 'Not set';

    return (
      <View key={paramKey} style={styles.paramRow}>
        <Text style={styles.paramLabel}>{label}</Text>
        <View style={styles.paramValueContainer}>
          {value !== null && value !== undefined && (
            <TouchableOpacity
              style={styles.editButton}
              onPress={() => handleEdit(paramKey, value)}
            >
              <Text style={styles.paramValue}>{displayValue}</Text>
              <Ionicons name="pencil-outline" size={14} color="#666" />
            </TouchableOpacity>
          )}
          {hasCheckbox && (
            <TouchableOpacity
              style={styles.checkbox}
              onPress={() => onToggleTried(paramKey)}
            >
              <Ionicons
                name={tried ? "checkmark-circle" : "ellipse-outline"}
                size={20}
                color={tried ? "#4CAF50" : "#999"}
              />
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.header}
        onPress={() => setIsExpanded(!isExpanded)}
      >
        <Text style={styles.headerTitle}>Current Settings</Text>
        <Ionicons
          name={isExpanded ? "chevron-up" : "chevron-down"}
          size={20}
          color="#666"
        />
      </TouchableOpacity>

      {isExpanded && (
        <View style={styles.content}>
          {renderParameterRow('Metal Thickness', 'metalThickness', parameters.metalThickness, '"', false)}
          {renderParameterRow('Voltage', 'voltage', parameters.voltage, 'V', false)}
          {renderParameterRow('Wire Speed', 'wireSpeed', parameters.wireSpeed, ' IPM', false)}
          {renderParameterRow('Stick Out', 'stickOut', parameters.stickOut, '"', true)}
          {parameters.movementSpeed && renderParameterRow('Movement Speed', 'movementSpeed', parameters.movementSpeed, ' in/s', true)}

          <View style={styles.legend}>
            <View style={styles.legendItem}>
              <Ionicons name="checkmark-circle" size={16} color="#4CAF50" />
              <Text style={styles.legendText}>= Tried this</Text>
            </View>
            <View style={styles.legendItem}>
              <Ionicons name="pencil-outline" size={16} color="#666" />
              <Text style={styles.legendText}>= Tap to edit</Text>
            </View>
          </View>
        </View>
      )}

      {/* Edit Modal */}
      <Modal
        visible={editingParam !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setEditingParam(null)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setEditingParam(null)}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              Edit {editingParam?.replace(/([A-Z])/g, ' $1').trim()}
            </Text>
            <TextInput
              style={styles.modalInput}
              value={editValue}
              onChangeText={setEditValue}
              keyboardType="numeric"
              placeholder="Enter value"
              autoFocus
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonCancel]}
                onPress={() => setEditingParam(null)}
              >
                <Text style={styles.modalButtonTextCancel}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonSave]}
                onPress={handleSaveEdit}
              >
                <Text style={styles.modalButtonTextSave}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFF',
    borderRadius: 8,
    marginHorizontal: 20,
    marginBottom: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  content: {
    padding: 12,
  },
  paramRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  paramLabel: {
    fontSize: 14,
    color: '#666',
    flex: 1,
  },
  paramValueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  paramValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  checkbox: {
    padding: 4,
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  legendText: {
    fontSize: 12,
    color: '#666',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 20,
    width: '80%',
    maxWidth: 300,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 15,
    textTransform: 'capitalize',
  },
  modalInput: {
    backgroundColor: '#f5f0e6',
    padding: 12,
    borderRadius: 8,
    fontSize: 16,
    marginBottom: 15,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  modalButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  modalButtonCancel: {
    backgroundColor: '#F0F0F0',
  },
  modalButtonSave: {
    backgroundColor: '#4A90D9',
  },
  modalButtonTextCancel: {
    color: '#666',
    fontWeight: '600',
  },
  modalButtonTextSave: {
    color: '#FFF',
    fontWeight: '600',
  },
});
