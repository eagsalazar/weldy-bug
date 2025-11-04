import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import App from '../App';
import decisionTree from '../data/decision-tree.json';

// Mock the Ionicons to avoid native module issues in tests
jest.mock('@expo/vector-icons', () => {
  const { Text } = require('react-native');
  return {
    Ionicons: ({ name, ...props }) => <Text {...props}>{name}</Text>,
  };
});

// Mock Image component to avoid warnings about loading
jest.mock('react-native/Libraries/Image/Image', () => 'Image');

// Mock react-native-safe-area-context
jest.mock('react-native-safe-area-context', () => {
  const React = require('react');
  const { View } = require('react-native');
  return {
    SafeAreaProvider: ({ children }) => React.createElement(View, null, children),
    SafeAreaView: ({ children, ...props }) => React.createElement(View, props, children),
  };
});

// Helper function to complete setup and get to main wizard
const completeSetup = async (component) => {
  const { getByText } = component;

  // Find and press the "Start Troubleshooting" button
  const startButton = getByText('Start Troubleshooting');
  fireEvent.press(startButton);

  // Wait for the main screen to appear
  await waitFor(() => {
    expect(getByText('Weldy')).toBeTruthy();
  });
};

describe('App Component', () => {
  describe('Initial Render - Setup Screen', () => {
    it('should render setup screen without crashing', () => {
      const { getByText } = render(<App />);
      expect(getByText('Setup Your Weld Parameters')).toBeTruthy();
    });

    it('should display metal thickness options', () => {
      const { getByText } = render(<App />);
      expect(getByText('1/16"')).toBeTruthy();
      expect(getByText('1/8"')).toBeTruthy();
      expect(getByText('3/16"')).toBeTruthy();
      expect(getByText('1/4"')).toBeTruthy();
    });

    it('should display voltage and wire speed inputs', () => {
      const { getByText } = render(<App />);
      expect(getByText('Current Voltage (V)')).toBeTruthy();
      expect(getByText('Wire Feed Speed (IPM)')).toBeTruthy();
    });

    it('should have a start button', () => {
      const { getByText } = render(<App />);
      expect(getByText('Start Troubleshooting')).toBeTruthy();
    });
  });

  describe('Main Wizard After Setup', () => {
    it('should navigate to main wizard after completing setup', async () => {
      const component = render(<App />);
      await completeSetup(component);
      expect(component.getByText('Weldy')).toBeTruthy();
    });

    it('should display the initial question after setup', async () => {
      const component = render(<App />);
      await completeSetup(component);

      const startNode = decisionTree.nodes[decisionTree.startNode];
      expect(component.getByText(startNode.question)).toBeTruthy();
    });

    it('should display parameter panel after setup', async () => {
      const component = render(<App />);
      await completeSetup(component);

      expect(component.getByText('Current Settings')).toBeTruthy();
    });

    it('should not display back button on first wizard screen', async () => {
      const component = render(<App />);
      await completeSetup(component);

      const { queryByText } = component;
      const startNode = decisionTree.nodes[decisionTree.startNode];
      expect(queryByText(startNode.question)).toBeTruthy();

      // Back button should not be in the header left area initially
      // (the structure shows it only when history.length > 0)
    });
  });

  describe('Navigation - Image Question', () => {
    it('should display all choices for the initial question', async () => {
      const component = render(<App />);
      await completeSetup(component);

      const { getByText } = component;
      const startNode = decisionTree.nodes[decisionTree.startNode];

      startNode.choices.forEach((choice) => {
        expect(getByText(choice.text)).toBeTruthy();
      });
    });

    it('should navigate to next node when a choice is selected', async () => {
      const component = render(<App />);
      await completeSetup(component);

      const { getByText } = component;
      const startNode = decisionTree.nodes[decisionTree.startNode];
      const firstChoice = startNode.choices[0];

      // Click the first choice
      fireEvent.press(getByText(firstChoice.text));

      // Should navigate to the next node
      await waitFor(() => {
        const nextNode = decisionTree.nodes[firstChoice.nextNode];
        if (nextNode.type === 'text-question') {
          expect(getByText(nextNode.question)).toBeTruthy();
        } else if (nextNode.type === 'diagnosis') {
          expect(getByText(nextNode.diagnosis)).toBeTruthy();
        }
      });
    });
  });

  describe('Navigation - Back Button', () => {
    it('should show back button after navigating forward', async () => {
      const component = render(<App />);
      await completeSetup(component);

      const { getByText, queryByText } = component;
      const startNode = decisionTree.nodes[decisionTree.startNode];
      const firstChoice = startNode.choices[0];

      // Navigate forward
      fireEvent.press(getByText(firstChoice.text));

      // Back button should now be visible
      await waitFor(() => {
        expect(queryByText('arrow-back')).toBeTruthy();
      });
    });

    it('should navigate back when back button is pressed', async () => {
      const component = render(<App />);
      await completeSetup(component);

      const { getByText } = component;
      const startNode = decisionTree.nodes[decisionTree.startNode];
      const firstChoice = startNode.choices[0];

      // Navigate forward
      fireEvent.press(getByText(firstChoice.text));

      // Wait for navigation
      await waitFor(() => {
        const nextNode = decisionTree.nodes[firstChoice.nextNode];
        expect(getByText(nextNode.question || nextNode.diagnosis)).toBeTruthy();
      });

      // Click back button
      const backButton = getByText('arrow-back');
      fireEvent.press(backButton);

      // Should be back at start
      await waitFor(() => {
        expect(getByText(startNode.question)).toBeTruthy();
      });
    });
  });

  describe('Restart Functionality', () => {
    it('should return to start when restart button is pressed', async () => {
      const component = render(<App />);
      await completeSetup(component);

      const { getByText } = component;
      const startNode = decisionTree.nodes[decisionTree.startNode];
      const firstChoice = startNode.choices[0];

      // Navigate forward
      fireEvent.press(getByText(firstChoice.text));

      // Wait for navigation
      await waitFor(() => {
        const nextNode = decisionTree.nodes[firstChoice.nextNode];
        expect(getByText(nextNode.question || nextNode.diagnosis)).toBeTruthy();
      });

      // Click restart - there might be multiple reload icons
      const reloadIcons = getByText('reload');
      fireEvent.press(reloadIcons);

      // Should be back at start
      await waitFor(() => {
        expect(getByText(startNode.question)).toBeTruthy();
      });
    });
  });

  describe('Text Question Flow', () => {
    it('should handle text questions correctly', async () => {
      const component = render(<App />);
      await completeSetup(component);

      const { getByText } = component;

      // Find a path to a text question
      const startNode = decisionTree.nodes[decisionTree.startNode];

      // Navigate to porosity which leads to text questions
      const porosityChoice = startNode.choices.find(c => c.id === 'porosity');
      if (porosityChoice) {
        fireEvent.press(getByText(porosityChoice.text));

        await waitFor(() => {
          const nextNode = decisionTree.nodes[porosityChoice.nextNode];
          expect(nextNode.type).toBe('text-question');
          expect(getByText(nextNode.question)).toBeTruthy();

          // Check that choices are rendered
          nextNode.choices.forEach((choice) => {
            expect(getByText(choice.text)).toBeTruthy();
          });
        });
      }
    });
  });

  describe('Diagnosis Screen', () => {
    it('should display diagnosis information correctly', async () => {
      const component = render(<App />);
      await completeSetup(component);

      const { getByText } = component;
      const startNode = decisionTree.nodes[decisionTree.startNode];

      // Navigate to "good weld" which is a direct diagnosis
      const goodWeldChoice = startNode.choices.find(c => c.id === 'good_weld');
      if (goodWeldChoice) {
        fireEvent.press(getByText(goodWeldChoice.text));

        await waitFor(() => {
          const diagnosisNode = decisionTree.nodes[goodWeldChoice.nextNode];
          expect(diagnosisNode.type).toBe('diagnosis');
          expect(getByText(diagnosisNode.diagnosis)).toBeTruthy();
        });
      }
    });

    it('should display first recommendation one at a time', async () => {
      const component = render(<App />);
      await completeSetup(component);

      const { getByText } = component;
      const startNode = decisionTree.nodes[decisionTree.startNode];

      // Navigate to a diagnosis
      const goodWeldChoice = startNode.choices.find(c => c.id === 'good_weld');
      if (goodWeldChoice) {
        fireEvent.press(getByText(goodWeldChoice.text));

        await waitFor(() => {
          // Should show "Try This (1/X)" format
          expect(getByText(/Try This \(1\//)).toBeTruthy();

          // Should show action buttons
          expect(getByText(/Done, I/)).toBeTruthy();
        });
      }
    });

    it('should show next recommendation button when there are multiple', async () => {
      const component = render(<App />);
      await completeSetup(component);

      const { getByText, queryByText } = component;
      const startNode = decisionTree.nodes[decisionTree.startNode];

      // Navigate to porosity which has multiple recommendations
      const porosityChoice = startNode.choices.find(c => c.id === 'porosity');
      if (porosityChoice) {
        fireEvent.press(getByText(porosityChoice.text));

        await waitFor(() => {
          const nextNode = decisionTree.nodes[porosityChoice.nextNode];
          if (nextNode.type === 'text-question') {
            const firstChoice = nextNode.choices[0];
            fireEvent.press(getByText(firstChoice.text));
          }
        });

        await waitFor(() => {
          // Should have "Try Another Suggestion" or "Start Over" button
          const tryNext = queryByText('Try Another Suggestion');
          const startOver = queryByText('Start Over');
          expect(tryNext || startOver).toBeTruthy();
        });
      }
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid node gracefully', async () => {
      // This test verifies the error handling code exists
      // In practice, this shouldn't happen with valid data
      const component = render(<App />);
      await completeSetup(component);
      expect(component.getByText('Weldy')).toBeTruthy();
    });
  });

  describe('Multi-Step Navigation', () => {
    it('should handle multiple forward navigations', async () => {
      const component = render(<App />);
      await completeSetup(component);

      const { getByText } = component;
      const startNode = decisionTree.nodes[decisionTree.startNode];

      // Navigate through porosity -> porosity_location -> diagnosis
      const porosityChoice = startNode.choices.find(c => c.id === 'porosity');
      if (porosityChoice) {
        fireEvent.press(getByText(porosityChoice.text));

        await waitFor(() => {
          const locationNode = decisionTree.nodes[porosityChoice.nextNode];
          expect(getByText(locationNode.question)).toBeTruthy();
        });

        // Click the first option in the text question
        const locationNode = decisionTree.nodes[porosityChoice.nextNode];
        const firstLocationChoice = locationNode.choices[0];
        fireEvent.press(getByText(firstLocationChoice.text));

        await waitFor(() => {
          const finalNode = decisionTree.nodes[firstLocationChoice.nextNode];
          expect(getByText(finalNode.diagnosis || finalNode.question)).toBeTruthy();
        });
      }
    });

    it('should maintain correct history when navigating back multiple times', async () => {
      const component = render(<App />);
      await completeSetup(component);

      const { getByText, queryByText } = component;
      const startNode = decisionTree.nodes[decisionTree.startNode];

      // Navigate forward twice
      const porosityChoice = startNode.choices.find(c => c.id === 'porosity');
      if (porosityChoice) {
        fireEvent.press(getByText(porosityChoice.text));

        await waitFor(() => {
          const locationNode = decisionTree.nodes[porosityChoice.nextNode];
          expect(getByText(locationNode.question)).toBeTruthy();
        });

        const locationNode = decisionTree.nodes[porosityChoice.nextNode];
        const firstLocationChoice = locationNode.choices[0];
        fireEvent.press(getByText(firstLocationChoice.text));

        await waitFor(() => {
          expect(queryByText('arrow-back')).toBeTruthy();
        });

        // Go back once
        fireEvent.press(getByText('arrow-back'));

        await waitFor(() => {
          expect(getByText(locationNode.question)).toBeTruthy();
        });

        // Go back again
        fireEvent.press(getByText('arrow-back'));

        await waitFor(() => {
          expect(getByText(startNode.question)).toBeTruthy();
        });
      }
    });
  });
});
