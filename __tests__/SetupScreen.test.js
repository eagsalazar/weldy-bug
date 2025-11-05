import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import SetupScreen from '../components/SetupScreen';

// Mock the Ionicons
jest.mock('@expo/vector-icons', () => {
  const { Text } = require('react-native');
  return {
    Ionicons: ({ name, ...props }) => <Text {...props}>{name}</Text>,
  };
});

describe('SetupScreen Component', () => {
  let onCompleteMock;

  beforeEach(() => {
    onCompleteMock = jest.fn();
  });

  describe('Initial Render', () => {
    it('should render without crashing', () => {
      const { getByText } = render(<SetupScreen onComplete={onCompleteMock} />);
      expect(getByText('Setup Your Weld Parameters')).toBeTruthy();
    });

    it('should display all metal thickness options', () => {
      const { getByText } = render(<SetupScreen onComplete={onCompleteMock} />);
      expect(getByText('1/32"')).toBeTruthy();
      expect(getByText('1/16"')).toBeTruthy();
      expect(getByText('3/32"')).toBeTruthy();
      expect(getByText('1/8"')).toBeTruthy();
      expect(getByText('3/16"')).toBeTruthy();
      expect(getByText('1/4"')).toBeTruthy();
    });

    it('should display voltage input field', () => {
      const { getByText } = render(<SetupScreen onComplete={onCompleteMock} />);
      expect(getByText('Current Voltage (V)')).toBeTruthy();
    });

    it('should display wire speed input field', () => {
      const { getByText } = render(<SetupScreen onComplete={onCompleteMock} />);
      expect(getByText('Wire Feed Speed (IPM)')).toBeTruthy();
    });

    it('should display start button', () => {
      const { getByText } = render(<SetupScreen onComplete={onCompleteMock} />);
      expect(getByText('Start Troubleshooting')).toBeTruthy();
    });

    it('should default to 1/8" thickness', () => {
      const { getByText } = render(<SetupScreen onComplete={onCompleteMock} />);

      // Press start without changing anything
      fireEvent.press(getByText('Start Troubleshooting'));

      expect(onCompleteMock).toHaveBeenCalledWith(
        expect.objectContaining({
          metalThickness: '1/8',
          voltage: 18,
          wireSpeed: 200,
        })
      );
    });
  });

  describe('Thickness Selection', () => {
    it('should update voltage and wire speed when 1/32" is selected', () => {
      const { getByText } = render(<SetupScreen onComplete={onCompleteMock} />);

      fireEvent.press(getByText('1/32"'));
      fireEvent.press(getByText('Start Troubleshooting'));

      expect(onCompleteMock).toHaveBeenCalledWith(
        expect.objectContaining({
          metalThickness: '1/32',
          voltage: 14,
          wireSpeed: 120,
        })
      );
    });

    it('should update voltage and wire speed when 1/16" is selected', () => {
      const { getByText } = render(<SetupScreen onComplete={onCompleteMock} />);

      fireEvent.press(getByText('1/16"'));
      fireEvent.press(getByText('Start Troubleshooting'));

      expect(onCompleteMock).toHaveBeenCalledWith(
        expect.objectContaining({
          metalThickness: '1/16',
          voltage: 16,
          wireSpeed: 150,
        })
      );
    });

    it('should update voltage and wire speed when 3/32" is selected', () => {
      const { getByText } = render(<SetupScreen onComplete={onCompleteMock} />);

      fireEvent.press(getByText('3/32"'));
      fireEvent.press(getByText('Start Troubleshooting'));

      expect(onCompleteMock).toHaveBeenCalledWith(
        expect.objectContaining({
          metalThickness: '3/32',
          voltage: 17,
          wireSpeed: 175,
        })
      );
    });

    it('should update voltage and wire speed when 3/16" is selected', () => {
      const { getByText } = render(<SetupScreen onComplete={onCompleteMock} />);

      fireEvent.press(getByText('3/16"'));
      fireEvent.press(getByText('Start Troubleshooting'));

      expect(onCompleteMock).toHaveBeenCalledWith(
        expect.objectContaining({
          metalThickness: '3/16',
          voltage: 20,
          wireSpeed: 250,
        })
      );
    });

    it('should update voltage and wire speed when 1/4" is selected', () => {
      const { getByText } = render(<SetupScreen onComplete={onCompleteMock} />);

      fireEvent.press(getByText('1/4"'));
      fireEvent.press(getByText('Start Troubleshooting'));

      expect(onCompleteMock).toHaveBeenCalledWith(
        expect.objectContaining({
          metalThickness: '1/4',
          voltage: 22,
          wireSpeed: 300,
        })
      );
    });
  });

  describe('Manual Input', () => {
    it('should allow manual voltage entry', () => {
      const { getByText, getByDisplayValue } = render(<SetupScreen onComplete={onCompleteMock} />);

      const voltageInput = getByDisplayValue('18');
      fireEvent.changeText(voltageInput, '25');
      fireEvent.press(getByText('Start Troubleshooting'));

      expect(onCompleteMock).toHaveBeenCalledWith(
        expect.objectContaining({
          voltage: 25,
        })
      );
    });

    it('should allow manual wire speed entry', () => {
      const { getByText, getByDisplayValue } = render(<SetupScreen onComplete={onCompleteMock} />);

      const wireSpeedInput = getByDisplayValue('200');
      fireEvent.changeText(wireSpeedInput, '350');
      fireEvent.press(getByText('Start Troubleshooting'));

      expect(onCompleteMock).toHaveBeenCalledWith(
        expect.objectContaining({
          wireSpeed: 350,
        })
      );
    });

    it('should allow changing thickness after manual entry', () => {
      const { getByText, getByDisplayValue } = render(<SetupScreen onComplete={onCompleteMock} />);

      // Manual entry
      const voltageInput = getByDisplayValue('18');
      fireEvent.changeText(voltageInput, '25');

      // Change thickness - should override manual entry
      fireEvent.press(getByText('1/4"'));
      fireEvent.press(getByText('Start Troubleshooting'));

      expect(onCompleteMock).toHaveBeenCalledWith(
        expect.objectContaining({
          metalThickness: '1/4',
          voltage: 22, // Should be preset value, not 25
          wireSpeed: 300,
        })
      );
    });
  });

  describe('Parameter Object', () => {
    it('should not include stick out as a parameter (it is a thing to try)', () => {
      const { getByText } = render(<SetupScreen onComplete={onCompleteMock} />);

      fireEvent.press(getByText('Start Troubleshooting'));

      const call = onCompleteMock.mock.calls[0][0];
      expect(call.stickOut).toBeUndefined();
      expect(call.triedParameters.stickOut).toBe(false);
    });

    it('should initialize triedParameters tracking object', () => {
      const { getByText } = render(<SetupScreen onComplete={onCompleteMock} />);

      fireEvent.press(getByText('Start Troubleshooting'));

      expect(onCompleteMock).toHaveBeenCalledWith(
        expect.objectContaining({
          triedParameters: {
            voltage: false,
            wireSpeed: false,
            stickOut: false,
            surfacePrep: false,
            gasFlow: false,
            travelSpeed: false,
            environment: false,
            equipment: false,
            technique: false,
            practice: false,
          },
        })
      );
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty voltage input', () => {
      const { getByText, getByDisplayValue } = render(<SetupScreen onComplete={onCompleteMock} />);

      const voltageInput = getByDisplayValue('18');
      fireEvent.changeText(voltageInput, '');
      fireEvent.press(getByText('Start Troubleshooting'));

      // Should default to 18 when empty
      expect(onCompleteMock).toHaveBeenCalledWith(
        expect.objectContaining({
          voltage: 18,
        })
      );
    });

    it('should handle empty wire speed input', () => {
      const { getByText, getByDisplayValue } = render(<SetupScreen onComplete={onCompleteMock} />);

      const wireSpeedInput = getByDisplayValue('200');
      fireEvent.changeText(wireSpeedInput, '');
      fireEvent.press(getByText('Start Troubleshooting'));

      // Should default to 200 when empty
      expect(onCompleteMock).toHaveBeenCalledWith(
        expect.objectContaining({
          wireSpeed: 200,
        })
      );
    });

    it('should handle non-numeric voltage input', () => {
      const { getByText, getByDisplayValue } = render(<SetupScreen onComplete={onCompleteMock} />);

      const voltageInput = getByDisplayValue('18');
      fireEvent.changeText(voltageInput, 'abc');
      fireEvent.press(getByText('Start Troubleshooting'));

      // Should default to 18 when NaN
      expect(onCompleteMock).toHaveBeenCalledWith(
        expect.objectContaining({
          voltage: 18,
        })
      );
    });
  });
});
