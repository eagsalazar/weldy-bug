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

  describe('Initial Render', () => {
    it('should render without crashing', () => {
      const { getByText } = render(
        <ParameterPanel
          parameters={mockParameters}
          onUpdateParameter={onUpdateParameterMock}
          onToggleTried={onToggleTriedMock}
        />
      );
      expect(getByText('Current Settings')).toBeTruthy();
    });

    it('should be expanded by default', () => {
      const { getByText } = render(
        <ParameterPanel
          parameters={mockParameters}
          onUpdateParameter={onUpdateParameterMock}
          onToggleTried={onToggleTriedMock}
        />
      );

      expect(getByText('Metal Thickness')).toBeTruthy();
      expect(getByText('Voltage')).toBeTruthy();
      expect(getByText('Wire Speed')).toBeTruthy();
    });

    it('should display chevron-up icon when expanded', () => {
      const { getByText } = render(
        <ParameterPanel
          parameters={mockParameters}
          onUpdateParameter={onUpdateParameterMock}
          onToggleTried={onToggleTriedMock}
        />
      );

      expect(getByText('chevron-up')).toBeTruthy();
    });
  });

  describe('Collapse/Expand Functionality', () => {
    it('should collapse when header is tapped', () => {
      const { getByText, queryByText } = render(
        <ParameterPanel
          parameters={mockParameters}
          onUpdateParameter={onUpdateParameterMock}
          onToggleTried={onToggleTriedMock}
        />
      );

      fireEvent.press(getByText('Current Settings'));

      // Content should be hidden
      expect(queryByText('Metal Thickness')).toBeFalsy();
      expect(queryByText('Voltage')).toBeFalsy();
    });

    it('should show chevron-down icon when collapsed', () => {
      const { getByText } = render(
        <ParameterPanel
          parameters={mockParameters}
          onUpdateParameter={onUpdateParameterMock}
          onToggleTried={onToggleTriedMock}
        />
      );

      fireEvent.press(getByText('Current Settings'));

      expect(getByText('chevron-down')).toBeTruthy();
    });

    it('should expand again when tapped while collapsed', () => {
      const { getByText, queryByText } = render(
        <ParameterPanel
          parameters={mockParameters}
          onUpdateParameter={onUpdateParameterMock}
          onToggleTried={onToggleTriedMock}
        />
      );

      // Collapse
      fireEvent.press(getByText('Current Settings'));
      expect(queryByText('Voltage')).toBeFalsy();

      // Expand
      fireEvent.press(getByText('Current Settings'));
      expect(getByText('Voltage')).toBeTruthy();
    });
  });

  describe('Parameter Display', () => {
    it('should display metal thickness with correct unit', () => {
      const { getByText } = render(
        <ParameterPanel
          parameters={mockParameters}
          onUpdateParameter={onUpdateParameterMock}
          onToggleTried={onToggleTriedMock}
        />
      );

      expect(getByText('1/8"')).toBeTruthy();
    });

    it('should display voltage with correct unit', () => {
      const { getByText } = render(
        <ParameterPanel
          parameters={mockParameters}
          onUpdateParameter={onUpdateParameterMock}
          onToggleTried={onToggleTriedMock}
        />
      );

      expect(getByText('18V')).toBeTruthy();
    });

    it('should display wire speed with correct unit', () => {
      const { getByText } = render(
        <ParameterPanel
          parameters={mockParameters}
          onUpdateParameter={onUpdateParameterMock}
          onToggleTried={onToggleTriedMock}
        />
      );

      expect(getByText('200 IPM')).toBeTruthy();
    });

    it('should display stick out with correct unit', () => {
      const { getByText } = render(
        <ParameterPanel
          parameters={mockParameters}
          onUpdateParameter={onUpdateParameterMock}
          onToggleTried={onToggleTriedMock}
        />
      );

      expect(getByText('0.375"')).toBeTruthy();
    });

    it('should conditionally display movement speed if present', () => {
      const { getByText } = render(
        <ParameterPanel
          parameters={mockParameters}
          onUpdateParameter={onUpdateParameterMock}
          onToggleTried={onToggleTriedMock}
        />
      );

      expect(getByText('Movement Speed')).toBeTruthy();
      expect(getByText('8 in/s')).toBeTruthy();
    });

    it('should not display movement speed if null', () => {
      const paramsWithoutMovementSpeed = {
        ...mockParameters,
        movementSpeed: null,
      };

      const { queryByText } = render(
        <ParameterPanel
          parameters={paramsWithoutMovementSpeed}
          onUpdateParameter={onUpdateParameterMock}
          onToggleTried={onToggleTriedMock}
        />
      );

      expect(queryByText('Movement Speed')).toBeFalsy();
    });
  });

  describe('Edit Functionality', () => {
    it('should show edit icon for editable parameters', () => {
      const { getAllByText } = render(
        <ParameterPanel
          parameters={mockParameters}
          onUpdateParameter={onUpdateParameterMock}
          onToggleTried={onToggleTriedMock}
        />
      );

      const pencilIcons = getAllByText('pencil-outline');
      expect(pencilIcons.length).toBeGreaterThan(0);
    });

    it('should open modal when edit button is pressed', async () => {
      const { getByText } = render(
        <ParameterPanel
          parameters={mockParameters}
          onUpdateParameter={onUpdateParameterMock}
          onToggleTried={onToggleTriedMock}
        />
      );

      // Tap on voltage value
      fireEvent.press(getByText('18V'));

      await waitFor(() => {
        expect(getByText(/Edit/)).toBeTruthy();
      });
    });

    it('should call onUpdateParameter when save is pressed', async () => {
      const { getByText, getByPlaceholderText } = render(
        <ParameterPanel
          parameters={mockParameters}
          onUpdateParameter={onUpdateParameterMock}
          onToggleTried={onToggleTriedMock}
        />
      );

      // Open edit modal for voltage
      fireEvent.press(getByText('18V'));

      await waitFor(() => {
        expect(getByText(/Edit/)).toBeTruthy();
      });

      // Change value
      const input = getByPlaceholderText('Enter value');
      fireEvent.changeText(input, '20');

      // Save
      fireEvent.press(getByText('Save'));

      expect(onUpdateParameterMock).toHaveBeenCalledWith('voltage', 20);
    });

    it('should close modal when cancel is pressed', async () => {
      const { getByText, queryByText } = render(
        <ParameterPanel
          parameters={mockParameters}
          onUpdateParameter={onUpdateParameterMock}
          onToggleTried={onToggleTriedMock}
        />
      );

      // Open modal
      fireEvent.press(getByText('18V'));

      await waitFor(() => {
        expect(getByText('Cancel')).toBeTruthy();
      });

      // Cancel
      fireEvent.press(getByText('Cancel'));

      await waitFor(() => {
        expect(queryByText('Cancel')).toBeFalsy();
      });

      expect(onUpdateParameterMock).not.toHaveBeenCalled();
    });
  });

  describe('Tried This Checkbox', () => {
    it('should show checkbox for parameters with hasCheckbox flag', () => {
      const { getAllByText } = render(
        <ParameterPanel
          parameters={mockParameters}
          onUpdateParameter={onUpdateParameterMock}
          onToggleTried={onToggleTriedMock}
        />
      );

      // Should have ellipse-outline (unchecked) or checkmark-circle (checked) icons
      const checkboxIcons = getAllByText('ellipse-outline');
      expect(checkboxIcons.length).toBeGreaterThan(0);
    });

    it('should show unchecked icon when parameter not tried', () => {
      const { getAllByText } = render(
        <ParameterPanel
          parameters={mockParameters}
          onUpdateParameter={onUpdateParameterMock}
          onToggleTried={onToggleTriedMock}
        />
      );

      expect(getAllByText('ellipse-outline').length).toBeGreaterThan(0);
    });

    it('should show checked icon when parameter tried', () => {
      const paramsWithTried = {
        ...mockParameters,
        triedParameters: {
          ...mockParameters.triedParameters,
          stickOut: true,
        },
      };

      const { getAllByText } = render(
        <ParameterPanel
          parameters={paramsWithTried}
          onUpdateParameter={onUpdateParameterMock}
          onToggleTried={onToggleTriedMock}
        />
      );

      expect(getAllByText('checkmark-circle').length).toBeGreaterThan(0);
    });

    it('should call onToggleTried when checkbox is pressed', () => {
      const { getAllByText } = render(
        <ParameterPanel
          parameters={mockParameters}
          onUpdateParameter={onUpdateParameterMock}
          onToggleTried={onToggleTriedMock}
        />
      );

      // Find and press first checkbox (should be for stickOut)
      const checkboxes = getAllByText('ellipse-outline');
      fireEvent.press(checkboxes[0]);

      expect(onToggleTriedMock).toHaveBeenCalled();
    });
  });

  describe('Legend', () => {
    it('should display legend explaining checkbox', () => {
      const { getByText } = render(
        <ParameterPanel
          parameters={mockParameters}
          onUpdateParameter={onUpdateParameterMock}
          onToggleTried={onToggleTriedMock}
        />
      );

      expect(getByText('= Tried this')).toBeTruthy();
    });

    it('should display legend explaining edit icon', () => {
      const { getByText } = render(
        <ParameterPanel
          parameters={mockParameters}
          onUpdateParameter={onUpdateParameterMock}
          onToggleTried={onToggleTriedMock}
        />
      );

      expect(getByText('= Tap to edit')).toBeTruthy();
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

      expect(getByText('Current Settings')).toBeTruthy();
    });

    it('should handle null parameter values', () => {
      const paramsWithNulls = {
        ...mockParameters,
        voltage: null,
      };

      const { queryByText } = render(
        <ParameterPanel
          parameters={paramsWithNulls}
          onUpdateParameter={onUpdateParameterMock}
          onToggleTried={onToggleTriedMock}
        />
      );

      // Should not crash, but won't show edit button for null values
      expect(queryByText('Current Settings')).toBeTruthy();
    });
  });
});
