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
import decisionTree from './data/decision-tree.json';
import SetupScreen from './components/SetupScreen';
import ParameterPanel from './components/ParameterPanel';
import RecommendationScreen from './components/RecommendationScreen';
import { getImageSource } from './assets/weld-images';

const { width } = Dimensions.get('window');

export default function App() {
  // Setup state
  const [isSetupComplete, setIsSetupComplete] = useState(false);
  const [parameters, setParameters] = useState(null);

  // Navigation state
  const [currentNodeId, setCurrentNodeId] = useState(decisionTree.startNode);
  const [history, setHistory] = useState([]);

  // Recommendation state
  const [currentDiagnosis, setCurrentDiagnosis] = useState(null);
  const [currentRecommendationIndex, setCurrentRecommendationIndex] = useState(0);

  const currentNode = decisionTree.nodes[currentNodeId];

  const handleSetupComplete = (params) => {
    setParameters(params);
    setIsSetupComplete(true);
  };

  const handleChoice = (nextNode) => {
    setHistory([...history, currentNodeId]);
    setCurrentNodeId(nextNode);

    // Check if we've reached a diagnosis
    const nextNodeData = decisionTree.nodes[nextNode];
    if (nextNodeData?.type === 'diagnosis') {
      setCurrentDiagnosis(nextNodeData);
      setCurrentRecommendationIndex(0);
    }
  };

  const handleRestart = () => {
    setCurrentNodeId(decisionTree.startNode);
    setHistory([]);
    setCurrentDiagnosis(null);
    setCurrentRecommendationIndex(0);
  };

  const handleBack = () => {
    if (history.length > 0) {
      const previousNode = history[history.length - 1];
      setCurrentNodeId(previousNode);
      setHistory(history.slice(0, -1));

      // Clear diagnosis if going back
      setCurrentDiagnosis(null);
      setCurrentRecommendationIndex(0);
    }
  };

  const handleUpdateParameter = (paramKey, value) => {
    setParameters({
      ...parameters,
      [paramKey]: value,
    });
  };

  const handleToggleTried = (paramKey) => {
    setParameters({
      ...parameters,
      triedParameters: {
        ...parameters.triedParameters,
        [paramKey]: !parameters.triedParameters[paramKey],
      },
    });
  };

  const handleAcceptRecommendation = () => {
    const recommendation = currentDiagnosis.recommendations[currentRecommendationIndex];

    // Update parameters based on recommendation
    const updatedParams = { ...parameters };

    // Apply specific changes
    if (recommendation.parameter === 'voltage') {
      const adjustment = recommendation.adjustment.toLowerCase();
      if (adjustment.includes('increase')) {
        updatedParams.voltage = parameters.voltage + 2;
      } else if (adjustment.includes('decrease')) {
        updatedParams.voltage = Math.max(parameters.voltage - 2, 12);
      }
    } else if (recommendation.parameter === 'wire_feed_speed') {
      const adjustment = recommendation.adjustment.toLowerCase();
      if (adjustment.includes('increase')) {
        updatedParams.wireSpeed = parameters.wireSpeed + 20;
      } else if (adjustment.includes('decrease')) {
        updatedParams.wireSpeed = Math.max(parameters.wireSpeed - 20, 100);
      }
    }

    // Mark parameter as tried
    updatedParams.triedParameters = {
      ...parameters.triedParameters,
      [recommendation.parameter]: true,
    };

    setParameters(updatedParams);

    // Loop back to initial image selection
    setCurrentNodeId(decisionTree.startNode);
    setHistory([]);
    setCurrentDiagnosis(null);
    setCurrentRecommendationIndex(0);
  };

  const handleTryNextRecommendation = () => {
    if (currentRecommendationIndex < currentDiagnosis.recommendations.length - 1) {
      setCurrentRecommendationIndex(currentRecommendationIndex + 1);
    }
  };

  const handleRetryFromStart = () => {
    handleRestart();
  };

  // Show setup screen if not complete
  if (!isSetupComplete) {
    return (
      <SafeAreaProvider>
        <SafeAreaView style={styles.container}>
          <StatusBar barStyle="dark-content" />
          <SetupScreen onComplete={handleSetupComplete} />
        </SafeAreaView>
      </SafeAreaProvider>
    );
  }

  // Error state
  if (!currentNode) {
    return (
      <SafeAreaProvider>
        <SafeAreaView style={styles.container}>
          <Text style={styles.errorText}>Error: Node not found</Text>
          <TouchableOpacity style={styles.restartButton} onPress={handleRestart}>
            <Text style={styles.restartButtonText}>Restart</Text>
          </TouchableOpacity>
        </SafeAreaView>
      </SafeAreaProvider>
    );
  }

  // Show recommendation screen if we have a diagnosis
  if (currentDiagnosis) {
    return (
      <SafeAreaProvider>
        <SafeAreaView style={styles.container}>
          <StatusBar barStyle="dark-content" />

          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={handleBack} style={styles.backButton}>
              <Ionicons name="arrow-back" size={24} color="#333" />
            </TouchableOpacity>
            <Text style={styles.title}>Weldy</Text>
            <TouchableOpacity onPress={handleRestart} style={styles.restartIcon}>
              <Ionicons name="reload" size={24} color="#4A90D9" />
            </TouchableOpacity>
          </View>

          {/* Parameter Panel */}
          <ParameterPanel
            parameters={parameters}
            onUpdateParameter={handleUpdateParameter}
            onToggleTried={handleToggleTried}
          />

          {/* Recommendation Screen */}
          <RecommendationScreen
            diagnosis={currentDiagnosis.diagnosis}
            recommendation={currentDiagnosis.recommendations[currentRecommendationIndex]}
            recommendationIndex={currentRecommendationIndex}
            totalRecommendations={currentDiagnosis.recommendations.length}
            parameters={parameters}
            onAccept={handleAcceptRecommendation}
            onTryNext={handleTryNextRecommendation}
            onRetry={handleRetryFromStart}
          />
        </SafeAreaView>
      </SafeAreaProvider>
    );
  }

  // Regular question flow
  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" />

        {/* Header with title and restart button */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            {history.length > 0 && (
              <TouchableOpacity onPress={handleBack} style={styles.backButton}>
                <Ionicons name="arrow-back" size={24} color="#333" />
              </TouchableOpacity>
            )}
          </View>
          <Text style={styles.title}>Weldy</Text>
          <TouchableOpacity onPress={handleRestart} style={styles.restartIcon}>
            <Ionicons name="reload" size={24} color="#4A90D9" />
          </TouchableOpacity>
        </View>

        {/* Parameter Panel */}
        <ParameterPanel
          parameters={parameters}
          onUpdateParameter={handleUpdateParameter}
          onToggleTried={handleToggleTried}
        />

        <ScrollView
          style={styles.content}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
        >
          {currentNode.type === 'image-question' && (
            <ImageQuestion node={currentNode} onChoice={handleChoice} />
          )}

          {currentNode.type === 'text-question' && (
            <TextQuestion node={currentNode} onChoice={handleChoice} />
          )}
        </ScrollView>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

function ImageQuestion({ node, onChoice }) {
  return (
    <View style={styles.questionContainer}>
      <Text style={styles.question}>{node.question}</Text>
      <ScrollView
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        style={styles.carousel}
      >
        {node.choices.map((choice) => (
          <TouchableOpacity
            key={choice.id}
            style={styles.imageChoiceCard}
            onPress={() => onChoice(choice.nextNode)}
          >
            <ImageWithPlaceholder
              source={choice.image}
              style={styles.choiceImage}
            />
            <View style={styles.imageChoiceTextContainer}>
              <Text style={styles.imageChoiceText}>{choice.text}</Text>
              <Text style={styles.imageChoiceDescription}>{choice.description}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
      <Text style={styles.swipeHint}>← Swipe to see more options →</Text>
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

function TextQuestion({ node, onChoice }) {
  return (
    <View style={styles.questionContainer}>
      <Text style={styles.question}>{node.question}</Text>
      <View style={styles.textChoicesContainer}>
        {node.choices.map((choice) => (
          <TouchableOpacity
            key={choice.id}
            style={styles.textChoiceButton}
            onPress={() => onChoice(choice.nextNode)}
          >
            <Text style={styles.textChoiceText}>{choice.text}</Text>
            <Ionicons name="chevron-forward" size={20} color="#666" />
          </TouchableOpacity>
        ))}
      </View>
    </View>
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
  imageChoiceDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
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
    flex: 1,
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
});
