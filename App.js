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

const { width } = Dimensions.get('window');

export default function App() {
  const [currentNodeId, setCurrentNodeId] = useState(decisionTree.startNode);
  const [history, setHistory] = useState([]);

  const currentNode = decisionTree.nodes[currentNodeId];

  const handleChoice = (nextNode) => {
    setHistory([...history, currentNodeId]);
    setCurrentNodeId(nextNode);
  };

  const handleRestart = () => {
    setCurrentNodeId(decisionTree.startNode);
    setHistory([]);
  };

  const handleBack = () => {
    if (history.length > 0) {
      const previousNode = history[history.length - 1];
      setCurrentNodeId(previousNode);
      setHistory(history.slice(0, -1));
    }
  };

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
          <Ionicons name="reload" size={24} color="#FF6B35" />
        </TouchableOpacity>
      </View>

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

        {currentNode.type === 'diagnosis' && (
          <Diagnosis node={currentNode} onRestart={handleRestart} />
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

  if (imageError) {
    return (
      <View style={[style, styles.imagePlaceholder]}>
        <Ionicons name="image-outline" size={48} color="#999" />
        <Text style={styles.placeholderText}>{filename}</Text>
      </View>
    );
  }

  return (
    <Image
      source={{ uri: source }}
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

function Diagnosis({ node, onRestart }) {
  return (
    <View style={styles.diagnosisContainer}>
      <View style={styles.diagnosisHeader}>
        <Ionicons
          name={node.diagnosis === "Good Weld!" ? "checkmark-circle" : "alert-circle"}
          size={48}
          color={node.diagnosis === "Good Weld!" ? "#4CAF50" : "#FF6B35"}
        />
        <Text style={styles.diagnosisTitle}>{node.diagnosis}</Text>
      </View>

      <Text style={styles.diagnosisDescription}>{node.description}</Text>

      <View style={styles.recommendationsContainer}>
        <Text style={styles.recommendationsTitle}>Recommendations:</Text>
        {node.recommendations.map((rec, index) => (
          <View key={index} style={styles.recommendationCard}>
            <View style={styles.recommendationHeader}>
              <Ionicons name="settings-outline" size={20} color="#FF6B35" />
              <Text style={styles.recommendationParameter}>{rec.parameter}</Text>
            </View>
            <Text style={styles.recommendationAdjustment}>{rec.adjustment}</Text>
            <Text style={styles.recommendationDetails}>{rec.details}</Text>
          </View>
        ))}
      </View>

      <TouchableOpacity style={styles.diagnosisRestartButton} onPress={onRestart}>
        <Ionicons name="reload" size={20} color="#FFF" />
        <Text style={styles.diagnosisRestartText}>Diagnose Another Weld</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
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
  diagnosisContainer: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  diagnosisHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  diagnosisTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 12,
    textAlign: 'center',
  },
  diagnosisDescription: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
    marginBottom: 24,
    textAlign: 'center',
  },
  recommendationsContainer: {
    marginBottom: 24,
  },
  recommendationsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  recommendationCard: {
    backgroundColor: '#F9F9F9',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#FF6B35',
  },
  recommendationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  recommendationParameter: {
    fontSize: 14,
    fontWeight: '600',
    color: '#999',
    textTransform: 'uppercase',
    marginLeft: 8,
  },
  recommendationAdjustment: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  recommendationDetails: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  diagnosisRestartButton: {
    flexDirection: 'row',
    backgroundColor: '#FF6B35',
    padding: 16,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  diagnosisRestartText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  errorText: {
    fontSize: 18,
    color: '#F44336',
    textAlign: 'center',
    marginTop: 40,
  },
  restartButton: {
    backgroundColor: '#FF6B35',
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
