import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
} from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import data from '../../data/data.json';
import ParameterPanel from '../../components/ParameterPanel';
import { getImageSource } from '../../assets/weld-images';

const { width } = Dimensions.get('window');

export default function DefectSelection() {
  const params = useLocalSearchParams();
  const router = useRouter();

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

  // Build unique combinations from causes
  const combinationMap = new Map();

  data.causes.forEach(cause => {
    const sortedIds = [...cause.defect_ids].sort();
    const key = sortedIds.join('+');

    if (!combinationMap.has(key)) {
      const defects = sortedIds
        .map(id => data.defects.find(d => d.id === id))
        .filter(Boolean);

      const defectNames = defects.map(d => d.name);
      const descriptions = defects.map(d => `• ${d.name}: ${d.how_to_identify}`);

      combinationMap.set(key, {
        key,
        defectIds: sortedIds,
        label: defectNames.join(' + '),
        descriptions: descriptions,
      });
    }
  });

  const combinations = Array.from(combinationMap.values());

  // Add "good weld" option at the beginning
  combinations.unshift({
    key: 'good_weld',
    defectIds: [],
    label: 'Good Weld',
    descriptions: ['• Consistent bead width and height', '• Smooth, even ripples', '• Good fusion to base metal on both sides', '• Minimal spatter', '• No visible defects'],
  });

  const handleDefectSelected = (defectIds) => {
    // Handle "good weld" selection
    if (defectIds.length === 0) {
      router.push({
        pathname: '/good-weld',
        params: {
          ...params,
        }
      });
      return;
    }

    // Navigate to cause selection with defect combo key
    const key = [...defectIds].sort().join('+');
    router.push({
      pathname: `/defect-selection/${key}`,
      params: {
        ...params,
      }
    });
  };

  const handleBackFromDefectSelection = () => {
    router.push({
      pathname: '/setup',
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
            <TouchableOpacity onPress={handleBackFromDefectSelection} style={styles.backButton}>
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
            <Text style={styles.question}>What does your weld look like?</Text>
            <ScrollView
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              style={styles.carousel}
            >
              {combinations.map((combo) => (
                <TouchableOpacity
                  key={combo.key}
                  style={styles.imageChoiceCard}
                  onPress={() => handleDefectSelected(combo.defectIds)}
                >
                  <ImageWithPlaceholder
                    source={`assets/weld-images/${combo.key}.png`}
                    style={styles.choiceImage}
                  />
                  <View style={styles.imageChoiceTextContainer}>
                    <Text style={styles.imageChoiceText}>{combo.label}</Text>
                    <Text style={styles.defectsToNoteHeader}>Defects to note:</Text>
                    {combo.descriptions.map((desc, idx) => (
                      <Text key={idx} style={styles.imageChoiceDescription}>
                        {desc}
                      </Text>
                    ))}
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <Text style={styles.swipeHint}>← Swipe to see more options →</Text>
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

function ImageWithPlaceholder({ source, style }) {
  const [imageError, setImageError] = useState(false);
  const filename = source.split('/').pop();
  const imageSource = getImageSource(source);

  if (imageError || !imageSource) {
    return (
      <View style={[style, styles.imagePlaceholder]}>
        <Ionicons name="image-outline" size={48} color="#999" />
        <Text style={styles.placeholderText}>{filename}</Text>
      </View>
    );
  }

  return (
    <Image
      source={imageSource}
      style={style}
      onError={() => setImageError(true)}
    />
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
  carousel: {
    marginVertical: 10,
  },
  imageChoiceCard: {
    width: width - 60,
    marginHorizontal: 10,
    backgroundColor: '#FFF',
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  choiceImage: {
    width: '100%',
    height: 240,
    backgroundColor: '#E0E0E0',
  },
  imagePlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F0F0F0',
  },
  placeholderText: {
    marginTop: 8,
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
  },
  imageChoiceTextContainer: {
    padding: 16,
  },
  imageChoiceText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  defectsToNoteHeader: {
    fontSize: 13,
    fontWeight: '600',
    color: '#555',
    marginTop: 8,
    marginBottom: 4,
  },
  imageChoiceDescription: {
    fontSize: 13,
    color: '#666',
    lineHeight: 18,
    marginBottom: 4,
  },
  swipeHint: {
    textAlign: 'center',
    color: '#999',
    fontSize: 12,
    marginTop: 10,
  },
});
