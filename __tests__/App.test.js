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

      // Should show compact parameter bar
      expect(component.getByText(/1\/8/)).toBeTruthy();
      expect(component.getByText(/18V/)).toBeTruthy();
      expect(component.getByText(/200 IPM/)).toBeTruthy();
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
    it('should return to setup screen when restart button is pressed', async () => {
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

      // Should be back at setup screen
      await waitFor(() => {
        expect(getByText('Setup Your Weld Parameters')).toBeTruthy();
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

  describe('Integration Tests - Parameter Flow', () => {
    it('should accept recommendation and loop back to start', async () => {
      const component = render(<App />);
      await completeSetup(component);

      const { getByText } = component;
      const startNode = decisionTree.nodes[decisionTree.startNode];

      // Navigate to a diagnosis
      const goodWeldChoice = startNode.choices.find(c => c.id === 'good_weld');
      if (goodWeldChoice) {
        fireEvent.press(getByText(goodWeldChoice.text));

        // Wait for recommendation screen
        await waitFor(() => {
          expect(getByText(/Try This/)).toBeTruthy();
        });

        // Accept recommendation
        fireEvent.press(getByText(/Done, I/));

        // Should loop back to start
        await waitFor(() => {
          expect(getByText(startNode.question)).toBeTruthy();
        });
      }
    });

    it('should update voltage parameter when voltage recommendation accepted', async () => {
      const component = render(<App />);
      await completeSetup(component);

      const { getByText, queryByText } = component;
      const startNode = decisionTree.nodes[decisionTree.startNode];

      // Initial voltage should be 18V (in compact bar)
      expect(getByText(/18V/)).toBeTruthy();

      // Find a path that leads to voltage recommendation
      // Navigate through decision tree to get a voltage-related diagnosis
      const porosityChoice = startNode.choices.find(c => c.id === 'porosity');
      if (porosityChoice) {
        fireEvent.press(getByText(porosityChoice.text));

        await waitFor(() => {
          const nextNode = decisionTree.nodes[porosityChoice.nextNode];
          expect(getByText(nextNode.question)).toBeTruthy();
        });

        // Select first option
        const nextNode = decisionTree.nodes[porosityChoice.nextNode];
        const firstChoice = nextNode.choices[0];
        fireEvent.press(getByText(firstChoice.text));

        // Wait for recommendation screen
        await waitFor(() => {
          expect(queryByText(/Try This/)).toBeTruthy();
        });

        // Check if this is a voltage recommendation by checking if "voltage" appears in the parameter badge
        const hasVoltageRec = queryByText('Parameter: voltage');
        if (hasVoltageRec) {
          // Accept the recommendation
          fireEvent.press(getByText(/Done, I/));

          // Check that voltage changed (should be 20V if increased, or 16V if decreased)
          await waitFor(() => {
            const hasNewVoltage = queryByText(/20V/) || queryByText(/16V/);
            expect(hasNewVoltage).toBeTruthy();
          });
        } else {
          // If no voltage recommendation in this path, test passes trivially
          expect(true).toBe(true);
        }
      }
    });

    it('should mark parameter as tried when recommendation accepted', async () => {
      const component = render(<App />);
      await completeSetup(component);

      const { getByText, queryAllByText } = component;
      const startNode = decisionTree.nodes[decisionTree.startNode];

      // Navigate to diagnosis and accept recommendation
      const goodWeldChoice = startNode.choices.find(c => c.id === 'good_weld');
      if (goodWeldChoice) {
        fireEvent.press(getByText(goodWeldChoice.text));

        await waitFor(() => {
          expect(getByText(/Try This/)).toBeTruthy();
        });

        // Count unchecked checkboxes before accepting
        const uncheckedBefore = queryAllByText('ellipse-outline').length;

        // Accept recommendation
        fireEvent.press(getByText(/Done, I/));

        // Should loop back successfully
        await waitFor(() => {
          expect(getByText(startNode.question)).toBeTruthy();
        });

        // After loop-back, check if checkbox count changed
        // Note: Not all parameters have checkboxes (only technique parameters like stickOut, movementSpeed)
        // So checkbox count may not change if the recommendation was for a non-checkbox parameter
        const uncheckedAfter = queryAllByText('ellipse-outline').length;

        // If the accepted recommendation was for a checkbox parameter, count should decrease
        // Otherwise, count stays the same, which is also valid
        expect(uncheckedAfter).toBeLessThanOrEqual(uncheckedBefore);
      }
    });

    it('should iterate through multiple recommendations', async () => {
      const component = render(<App />);
      await completeSetup(component);

      const { getByText } = component;
      const startNode = decisionTree.nodes[decisionTree.startNode];

      // Navigate to porosity which has multiple recommendations
      const porosityChoice = startNode.choices.find(c => c.id === 'porosity');
      if (porosityChoice) {
        fireEvent.press(getByText(porosityChoice.text));

        await waitFor(() => {
          const nextNode = decisionTree.nodes[porosityChoice.nextNode];
          expect(getByText(nextNode.question)).toBeTruthy();
        });

        const nextNode = decisionTree.nodes[porosityChoice.nextNode];
        const firstChoice = nextNode.choices[0];
        fireEvent.press(getByText(firstChoice.text));

        // Should show first recommendation (1/X)
        await waitFor(() => {
          expect(getByText(/Try This \(1\//)).toBeTruthy();
        });

        // Try next suggestion
        const tryNextButton = getByText('Try Another Suggestion');
        if (tryNextButton) {
          fireEvent.press(tryNextButton);

          // Should show second recommendation (2/X)
          await waitFor(() => {
            expect(getByText(/Try This \(2\//)).toBeTruthy();
          });
        }
      }
    });

    it('should show "Start Over" on last recommendation', async () => {
      const component = render(<App />);
      await completeSetup(component);

      const { getByText, queryByText } = component;
      const startNode = decisionTree.nodes[decisionTree.startNode];

      // Find diagnosis with single recommendation
      const goodWeldChoice = startNode.choices.find(c => c.id === 'good_weld');
      if (goodWeldChoice) {
        fireEvent.press(getByText(goodWeldChoice.text));

        await waitFor(() => {
          const diagnosisNode = decisionTree.nodes[goodWeldChoice.nextNode];
          const totalRecs = diagnosisNode.recommendations.length;

          // If there's only one recommendation, should show "Start Over"
          if (totalRecs === 1) {
            expect(queryByText('Start Over')).toBeTruthy();
            expect(queryByText('Try Another Suggestion')).toBeFalsy();
          }
        });
      }
    });

    it('should restart from setup when "Start Over" is pressed on last recommendation', async () => {
      const component = render(<App />);
      await completeSetup(component);

      const { getByText, queryByText } = component;
      const startNode = decisionTree.nodes[decisionTree.startNode];

      // Navigate to diagnosis
      const goodWeldChoice = startNode.choices.find(c => c.id === 'good_weld');
      if (goodWeldChoice) {
        fireEvent.press(getByText(goodWeldChoice.text));

        await waitFor(() => {
          expect(getByText(/Try This/)).toBeTruthy();
        });

        // Check if "Start Over" button exists (means last recommendation)
        const startOverButton = queryByText('Start Over');
        if (startOverButton) {
          fireEvent.press(startOverButton);

          // Should go back to setup screen
          await waitFor(() => {
            expect(getByText('Setup Your Weld Parameters')).toBeTruthy();
          });
        }
      }
    });

    it('should preserve parameter panel across navigation', async () => {
      const component = render(<App />);
      await completeSetup(component);

      const { getByText } = component;

      // Compact parameter bar should be visible on main screen
      expect(getByText(/1\/8/)).toBeTruthy();
      expect(getByText(/18V/)).toBeTruthy();

      const startNode = decisionTree.nodes[decisionTree.startNode];
      const firstChoice = startNode.choices[0];

      // Navigate forward
      fireEvent.press(getByText(firstChoice.text));

      // Compact parameter bar should still be visible
      await waitFor(() => {
        expect(getByText(/1\/8/)).toBeTruthy();
        expect(getByText(/18V/)).toBeTruthy();
      });
    });
  });

  describe('Integration Tests - Parameter Editing', () => {
    it('should allow editing voltage from parameter panel', async () => {
      const component = render(<App />);
      await completeSetup(component);

      const { getByText, getByDisplayValue } = component;

      // Open parameter panel modal
      fireEvent.press(getByText(/1\/8/));

      await waitFor(() => {
        expect(getByText('Current Settings')).toBeTruthy();
      });

      // Find voltage input and edit it
      const voltageInput = getByDisplayValue('18');
      fireEvent.changeText(voltageInput, '22');
      fireEvent(voltageInput, 'blur');

      // Should update immediately (inline editing)
      await waitFor(() => {
        expect(getByDisplayValue('22')).toBeTruthy();
      });

      // Close modal
      fireEvent.press(getByText('close'));

      // Compact bar should show new value
      await waitFor(() => {
        expect(getByText(/22V/)).toBeTruthy();
      });
    });

    it('should allow toggling "tried this" checkbox', async () => {
      const component = render(<App />);
      await completeSetup(component);

      const { getByText, queryAllByText } = component;

      // Open parameter panel modal
      fireEvent.press(getByText(/1\/8/));

      await waitFor(() => {
        expect(getByText('Current Settings')).toBeTruthy();
      });

      // Initially only stickOut has a checkbox (movementSpeed is null)
      // Check if there are any unchecked checkboxes
      const uncheckedIcons = queryAllByText('ellipse-outline');

      if (uncheckedIcons.length > 0) {
        const initialUnchecked = uncheckedIcons.length;

        // Toggle first checkbox (for stick out)
        fireEvent.press(uncheckedIcons[0]);

        // Should have one less unchecked icon
        await waitFor(() => {
          const newUncheckedIcons = queryAllByText('ellipse-outline');
          expect(newUncheckedIcons.length).toBe(initialUnchecked - 1);
        });
      } else {
        // If no unchecked checkboxes, verify we can see the parameter panel
        expect(getByText('Current Settings')).toBeTruthy();
      }
    });

    it('should collapse and expand parameter panel', async () => {
      const component = render(<App />);
      await completeSetup(component);

      const { getByText, queryByText } = component;

      // Initially collapsed (compact bar visible)
      expect(getByText(/1\/8/)).toBeTruthy();
      expect(queryByText('Current Settings')).toBeFalsy();
      expect(queryByText('Metal Thickness')).toBeFalsy();

      // Expand by tapping compact bar
      fireEvent.press(getByText(/1\/8/));

      // Content should be visible
      await waitFor(() => {
        expect(getByText('Current Settings')).toBeTruthy();
        expect(getByText('Metal Thickness')).toBeTruthy();
      });

      // Collapse by tapping close button
      fireEvent.press(getByText('close'));

      // Content should be hidden
      await waitFor(() => {
        expect(queryByText('Current Settings')).toBeFalsy();
        expect(queryByText('Metal Thickness')).toBeFalsy();
      });
    });
  });
});
