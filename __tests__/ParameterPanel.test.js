import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import ParameterPanel from '../components/ParameterPanel';

// Mock the Ionicons
jest.mock('@expo/vector-icons', () => {
  const { Text } = require('react-native');
  return {
    Ionicons: ({ name, ...props }) => <Text {...props}>{name}</Text>,
  };
});

describe('ParameterPanel Component', () => {
  const mockParameters = {
    metalThickness: '1/8',
    voltage: 18,
    wireSpeed: 200,
    stickOut: 0.375,
    movementSpeed: 8,
    triedParameters: {
      voltage: false,
      wireSpeed: false,
      stickOut: false,
      movementSpeed: false,
    },
  };

  let onUpdateParameterMock;
  let onToggleTriedMock;

  beforeEach(() => {
    onUpdateParameterMock = jest.fn();
    onToggleTriedMock = jest.fn();
  });

  describe('Compact Bar', () => {
    it('should render compact bar without crashing', () => {
      const { getByText } = render(
        <ParameterPanel
          parameters={mockParameters}
          onUpdateParameter={onUpdateParameterMock}
          onToggleTried={onToggleTriedMock}
        />
      );

      // Compact bar shows summary
      expect(getByText(/1\/8/)).toBeTruthy();
      expect(getByText(/18V/)).toBeTruthy();
      expect(getByText(/200 IPM/)).toBeTruthy();
    });

    it('should display pencil icon in compact bar', () => {
      const { getByText } = render(
        <ParameterPanel
          parameters={mockParameters}
          onUpdateParameter={onUpdateParameterMock}
          onToggleTried={onToggleTriedMock}
        />
      );

      expect(getByText('create-outline')).toBeTruthy();
    });

    it('should not show expanded content initially', () => {
      const { queryByText } = render(
        <ParameterPanel
          parameters={mockParameters}
          onUpdateParameter={onUpdateParameterMock}
          onToggleTried={onToggleTriedMock}
        />
      );

      // Modal content should not be visible initially
      expect(queryByText('Current Settings')).toBeFalsy();
      expect(queryByText('Metal Thickness')).toBeFalsy();
    });
  });

  describe('Modal Expansion', () => {
    it('should show modal when compact bar is tapped', async () => {
      const { getByText } = render(
        <ParameterPanel
          parameters={mockParameters}
          onUpdateParameter={onUpdateParameterMock}
          onToggleTried={onToggleTriedMock}
        />
      );

      // Tap compact bar
      const compactBar = getByText(/1\/8/);
      fireEvent.press(compactBar);

      // Modal should appear
      await waitFor(() => {
        expect(getByText('Current Settings')).toBeTruthy();
        expect(getByText('Metal Thickness')).toBeTruthy();
      });
    });

    it('should show close button (X) when modal is open', async () => {
      const { getByText } = render(
        <ParameterPanel
          parameters={mockParameters}
          onUpdateParameter={onUpdateParameterMock}
          onToggleTried={onToggleTriedMock}
        />
      );

      // Open modal
      fireEvent.press(getByText(/1\/8/));

      await waitFor(() => {
        expect(getByText('close')).toBeTruthy();
      });
    });

    it('should hide modal when close button is pressed', async () => {
      const { getByText, queryByText } = render(
        <ParameterPanel
          parameters={mockParameters}
          onUpdateParameter={onUpdateParameterMock}
          onToggleTried={onToggleTriedMock}
        />
      );

      // Open modal
      fireEvent.press(getByText(/1\/8/));

      await waitFor(() => {
        expect(getByText('Current Settings')).toBeTruthy();
      });

      // Close modal
      fireEvent.press(getByText('close'));

      await waitFor(() => {
        expect(queryByText('Current Settings')).toBeFalsy();
      });
    });
  });

  describe('Parameter Display in Modal', () => {
    it('should display all parameters in modal', async () => {
      const { getByText } = render(
        <ParameterPanel
          parameters={mockParameters}
          onUpdateParameter={onUpdateParameterMock}
          onToggleTried={onToggleTriedMock}
        />
      );

      // Open modal
      fireEvent.press(getByText(/1\/8/));

      await waitFor(() => {
        expect(getByText('Metal Thickness')).toBeTruthy();
        expect(getByText('Voltage')).toBeTruthy();
        expect(getByText('Wire Speed')).toBeTruthy();
        expect(getByText('Stick Out')).toBeTruthy();
        expect(getByText('Movement Speed')).toBeTruthy();
      });
    });

    it('should display parameter values with units in modal', async () => {
      const { getByText, getByDisplayValue } = render(
        <ParameterPanel
          parameters={mockParameters}
          onUpdateParameter={onUpdateParameterMock}
          onToggleTried={onToggleTriedMock}
        />
      );

      // Open modal
      fireEvent.press(getByText(/1\/8/));

      await waitFor(() => {
        expect(getByText('1/8')).toBeTruthy(); // Metal thickness (read-only)
        expect(getByDisplayValue('18')).toBeTruthy(); // Voltage (editable)
        expect(getByDisplayValue('200')).toBeTruthy(); // Wire speed (editable)
        expect(getByDisplayValue('0.375')).toBeTruthy(); // Stick out (editable)
      });
    });

    it('should not display movement speed if null', async () => {
      const paramsWithoutMovementSpeed = {
        ...mockParameters,
        movementSpeed: null,
      };

      const { getByText, queryByText } = render(
        <ParameterPanel
          parameters={paramsWithoutMovementSpeed}
          onUpdateParameter={onUpdateParameterMock}
          onToggleTried={onToggleTriedMock}
        />
      );

      // Open modal
      fireEvent.press(getByText(/1\/8/));

      await waitFor(() => {
        expect(queryByText('Movement Speed')).toBeFalsy();
      });
    });
  });

  describe('Inline Editing with Instant Apply', () => {
    it('should allow editing voltage and apply on blur', async () => {
      const { getByText, getByDisplayValue } = render(
        <ParameterPanel
          parameters={mockParameters}
          onUpdateParameter={onUpdateParameterMock}
          onToggleTried={onToggleTriedMock}
        />
      );

      // Open modal
      fireEvent.press(getByText(/1\/8/));

      await waitFor(() => {
        expect(getByText('Voltage')).toBeTruthy();
      });

      // Edit voltage
      const voltageInput = getByDisplayValue('18');
      fireEvent.changeText(voltageInput, '20');
      fireEvent(voltageInput, 'blur');

      expect(onUpdateParameterMock).toHaveBeenCalledWith('voltage', 20);
    });

    it('should allow editing wire speed and apply on blur', async () => {
      const { getByText, getByDisplayValue } = render(
        <ParameterPanel
          parameters={mockParameters}
          onUpdateParameter={onUpdateParameterMock}
          onToggleTried={onToggleTriedMock}
        />
      );

      // Open modal
      fireEvent.press(getByText(/1\/8/));

      await waitFor(() => {
        expect(getByText('Wire Speed')).toBeTruthy();
      });

      // Edit wire speed
      const wireSpeedInput = getByDisplayValue('200');
      fireEvent.changeText(wireSpeedInput, '220');
      fireEvent(wireSpeedInput, 'blur');

      expect(onUpdateParameterMock).toHaveBeenCalledWith('wireSpeed', 220);
    });

    it('should not allow editing metal thickness', async () => {
      const { getByText, queryByDisplayValue } = render(
        <ParameterPanel
          parameters={mockParameters}
          onUpdateParameter={onUpdateParameterMock}
          onToggleTried={onToggleTriedMock}
        />
      );

      // Open modal
      fireEvent.press(getByText(/1\/8/));

      await waitFor(() => {
        expect(getByText('Metal Thickness')).toBeTruthy();
      });

      // Metal thickness should not be in an input (it's read-only text)
      expect(queryByDisplayValue('1/8')).toBeFalsy();
    });
  });

  describe('Tried This Checkbox', () => {
    it('should show checkbox for parameters with hasCheckbox flag', async () => {
      const { getByText, getAllByText } = render(
        <ParameterPanel
          parameters={mockParameters}
          onUpdateParameter={onUpdateParameterMock}
          onToggleTried={onToggleTriedMock}
        />
      );

      // Open modal
      fireEvent.press(getByText(/1\/8/));

      await waitFor(() => {
        // Should have ellipse-outline (unchecked) icons
        const checkboxIcons = getAllByText('ellipse-outline');
        expect(checkboxIcons.length).toBeGreaterThan(0);
      });
    });

    it('should show unchecked icon when parameter not tried', async () => {
      const { getByText, getAllByText } = render(
        <ParameterPanel
          parameters={mockParameters}
          onUpdateParameter={onUpdateParameterMock}
          onToggleTried={onToggleTriedMock}
        />
      );

      // Open modal
      fireEvent.press(getByText(/1\/8/));

      await waitFor(() => {
        expect(getAllByText('ellipse-outline').length).toBeGreaterThan(0);
      });
    });

    it('should show checked icon when parameter tried', async () => {
      const paramsWithTried = {
        ...mockParameters,
        triedParameters: {
          ...mockParameters.triedParameters,
          stickOut: true,
        },
      };

      const { getByText, getAllByText } = render(
        <ParameterPanel
          parameters={paramsWithTried}
          onUpdateParameter={onUpdateParameterMock}
          onToggleTried={onToggleTriedMock}
        />
      );

      // Open modal
      fireEvent.press(getByText(/1\/8/));

      await waitFor(() => {
        expect(getAllByText('checkmark-circle').length).toBeGreaterThan(0);
      });
    });

    it('should call onToggleTried when checkbox is pressed', async () => {
      const { getByText, getAllByText } = render(
        <ParameterPanel
          parameters={mockParameters}
          onUpdateParameter={onUpdateParameterMock}
          onToggleTried={onToggleTriedMock}
        />
      );

      // Open modal
      fireEvent.press(getByText(/1\/8/));

      await waitFor(() => {
        const checkboxes = getAllByText('ellipse-outline');
        expect(checkboxes.length).toBeGreaterThan(0);
      });

      // Find and press first checkbox
      const checkboxes = getAllByText('ellipse-outline');
      fireEvent.press(checkboxes[0]);

      expect(onToggleTriedMock).toHaveBeenCalled();
    });
  });

  describe('Legend', () => {
    it('should display legend explaining checkbox', async () => {
      const { getByText } = render(
        <ParameterPanel
          parameters={mockParameters}
          onUpdateParameter={onUpdateParameterMock}
          onToggleTried={onToggleTriedMock}
        />
      );

      // Open modal
      fireEvent.press(getByText(/1\/8/));

      await waitFor(() => {
        expect(getByText('= Tried this')).toBeTruthy();
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle undefined triedParameters gracefully', () => {
      const paramsWithoutTried = {
        ...mockParameters,
        triedParameters: undefined,
      };

      const { getByText } = render(
        <ParameterPanel
          parameters={paramsWithoutTried}
          onUpdateParameter={onUpdateParameterMock}
          onToggleTried={onToggleTriedMock}
        />
      );

      // Compact bar should still render
      expect(getByText(/1\/8/)).toBeTruthy();
    });

    it('should handle null parameter values', () => {
      const paramsWithNulls = {
        ...mockParameters,
        voltage: null,
      };

      const { getByText } = render(
        <ParameterPanel
          parameters={paramsWithNulls}
          onUpdateParameter={onUpdateParameterMock}
          onToggleTried={onToggleTriedMock}
        />
      );

      // Should not crash
      expect(getByText(/1\/8/)).toBeTruthy();
    });
  });
});
