import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
  StatusBar,
} from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import data from './data/data.json';
import SetupScreen from './components/SetupScreen';
import ParameterPanel from './components/ParameterPanel';
import RecommendationScreen from './components/RecommendationScreen';
import { getImageSource } from './assets/weld-images';

const { width } = Dimensions.get('window');

export default function App() {
  // Screen flow: 'setup' -> 'defect-selection' -> 'cause-selection' -> 'recommendation' -> 'setup'
  const [screen, setScreen] = useState('setup');
  const [parameters, setParameters] = useState(null);
  const [thingsTried, setThingsTried] = useState({});
  const [selectedDefect, setSelectedDefect] = useState(null);
  const [selectedCause, setSelectedCause] = useState(null);
  const [selectedMistake, setSelectedMistake] = useState(null);

  const handleSetupComplete = (params) => {
    setParameters(params);
    setScreen('defect-selection');
  };

  const handleDefectSelected = (defectIds) => {
    // Handle "good weld" selection
    if (defectIds.length === 0) {
      setScreen('good-weld');
      return;
    }

    // Store the array of defect IDs that make up this combination
    setSelectedDefect(defectIds);
    setScreen('cause-selection');
  };

  const handleCauseSelected = (causeId) => {
    const cause = data.causes.find(c => c.id === causeId);
    setSelectedCause(cause);
    // For now, just pick the first mistake
    const mistake = data.mistakes.find(m => m.id === cause.mistake_ids[0]);
    setSelectedMistake(mistake);
    setScreen('recommendation');
  };

  const handleAcceptRecommendation = () => {
    // Loop back to setup screen
    setScreen('setup');
    setSelectedDefect(null);
    setSelectedCause(null);
    setSelectedMistake(null);
  };

  const handleRestart = () => {
    setScreen('setup');
    setParameters(null);
    setThingsTried({});
    setSelectedDefect(null);
    setSelectedCause(null);
    setSelectedMistake(null);
  };

  const handleUpdateParameter = (paramKey, value) => {
    setParameters({
      ...parameters,
      [paramKey]: value,
    });
  };

  const handleToggleTried = (thingId) => {
    setThingsTried({
      ...thingsTried,
      [thingId]: !thingsTried[thingId],
    });
  };

  // Show setup screen
  if (screen === 'setup') {
    return (
      <SafeAreaProvider>
        <SafeAreaView style={styles.container}>
          <StatusBar barStyle="dark-content" />
          <SetupScreen onComplete={handleSetupComplete} initialValues={parameters} />
        </SafeAreaView>
      </SafeAreaProvider>
    );
  }

  // Show defect selection screen
  if (screen === 'defect-selection') {
    // Build unique combinations from causes
    const combinationMap = new Map();

    data.causes.forEach(cause => {
      const sortedIds = [...cause.defect_ids].sort();
      const key = sortedIds.join('+');

      if (!combinationMap.has(key)) {
        // Get defect objects for this combination
        const defects = sortedIds
          .map(id => data.defects.find(d => d.id === id))
          .filter(Boolean);

        // Build description showing all defects
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

    return (
      <SafeAreaProvider>
        <SafeAreaView style={styles.container}>
          <StatusBar barStyle="dark-content" />

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
            <DefectSelection combinations={combinations} onSelect={handleDefectSelected} />
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

  // Show good weld success screen
  if (screen === 'good-weld') {
    return (
      <SafeAreaProvider>
        <SafeAreaView style={styles.container}>
          <StatusBar barStyle="dark-content" />

          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft} />
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
                onPress={() => setScreen('setup')}
              >
                <Text style={styles.goodWeldButtonText}>Start Another Session</Text>
              </TouchableOpacity>
            </View>
          </View>
        </SafeAreaView>
      </SafeAreaProvider>
    );
  }

  // Show cause selection screen
  if (screen === 'cause-selection' && selectedDefect) {
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

    return (
      <SafeAreaProvider>
        <SafeAreaView style={styles.container}>
          <StatusBar barStyle="dark-content" />

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
            <CauseSelection
              defectLabel={defectNames}
              causes={causesForCombination}
              mistakes={data.mistakes}
              onSelect={handleCauseSelected}
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

  // Show recommendation screen
  if (screen === 'recommendation' && selectedMistake) {
    // Get human-readable label for the combination
    const defectNames = selectedDefect
      .map(id => data.defects.find(d => d.id === id)?.name)
      .filter(Boolean)
      .join(' + ');

    return (
      <SafeAreaProvider>
        <SafeAreaView style={styles.container}>
          <StatusBar barStyle="dark-content" />

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

  // Fallback
  return null;
}

function DefectSelection({ combinations, onSelect }) {
  return (
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
            onPress={() => onSelect(combo.defectIds)}
          >
            <ImageWithPlaceholder
              source={`resources/images/${combo.key}.jpg`}
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
  );
}

function CauseSelection({ defectLabel, causes, mistakes, onSelect }) {
  return (
    <View style={styles.questionContainer}>
      <Text style={styles.question}>
        You selected: {defectLabel}. Which of these applies?
      </Text>
      <View style={styles.textChoicesContainer}>
        {causes.map((cause) => {
          // Get the first mistake for this cause to show the diagnostic question
          const firstMistake = mistakes.find(m => m.id === cause.mistake_ids[0]);

          return (
            <TouchableOpacity
              key={cause.id}
              style={styles.textChoiceButton}
              onPress={() => onSelect(cause.id)}
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
    paddingBottom: 110, // Space for compact parameter bar at bottom
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
  errorText: {
    fontSize: 18,
    color: '#F44336',
    textAlign: 'center',
    marginTop: 40,
  },
  restartButton: {
    backgroundColor: '#4A90D9',
    padding: 16,
    borderRadius: 8,
    marginHorizontal: 20,
    marginTop: 20,
  },
  restartButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
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
