import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import RecommendationScreen from '../components/RecommendationScreen';

// Mock the Ionicons
jest.mock('@expo/vector-icons', () => {
  const { Text } = require('react-native');
  return {
    Ionicons: ({ name, ...props }) => <Text {...props}>{name}</Text>,
  };
});

describe('RecommendationScreen Component', () => {
  const mockParameters = {
    metalThickness: '1/8',
    voltage: 18,
    wireSpeed: 200,
    stickOut: 0.375,
    movementSpeed: null,
  };

  const mockRecommendation = {
    parameter: 'voltage',
    adjustment: 'Increase voltage',
    details: 'Higher voltage increases penetration and weld pool fluidity.',
  };

  let onAcceptMock;
  let onTryNextMock;
  let onRetryMock;

  beforeEach(() => {
    onAcceptMock = jest.fn();
    onTryNextMock = jest.fn();
    onRetryMock = jest.fn();
  });

  describe('Initial Render', () => {
    it('should render without crashing', () => {
      const { getByText } = render(
        <RecommendationScreen
          diagnosis="Porosity"
          recommendation={mockRecommendation}
          recommendationIndex={0}
          totalRecommendations={3}
          parameters={mockParameters}
          onAccept={onAcceptMock}
          onTryNext={onTryNextMock}
          onRetry={onRetryMock}
        />
      );
      expect(getByText('Porosity')).toBeTruthy();
    });

    it('should display diagnosis title', () => {
      const { getByText } = render(
        <RecommendationScreen
          diagnosis="Excessive Spatter"
          recommendation={mockRecommendation}
          recommendationIndex={0}
          totalRecommendations={2}
          parameters={mockParameters}
          onAccept={onAcceptMock}
          onTryNext={onTryNextMock}
          onRetry={onRetryMock}
        />
      );
      expect(getByText('Excessive Spatter')).toBeTruthy();
    });

    it('should display recommendation counter', () => {
      const { getByText } = render(
        <RecommendationScreen
          diagnosis="Porosity"
          recommendation={mockRecommendation}
          recommendationIndex={0}
          totalRecommendations={3}
          parameters={mockParameters}
          onAccept={onAcceptMock}
          onTryNext={onTryNextMock}
          onRetry={onRetryMock}
        />
      );
      expect(getByText('Try This (1/3)')).toBeTruthy();
    });

    it('should display why section', () => {
      const { getByText } = render(
        <RecommendationScreen
          diagnosis="Porosity"
          recommendation={mockRecommendation}
          recommendationIndex={0}
          totalRecommendations={3}
          parameters={mockParameters}
          onAccept={onAcceptMock}
          onTryNext={onTryNextMock}
          onRetry={onRetryMock}
        />
      );
      expect(getByText('Why?')).toBeTruthy();
      expect(getByText(mockRecommendation.details)).toBeTruthy();
    });

    it('should display parameter badge', () => {
      const { getByText } = render(
        <RecommendationScreen
          diagnosis="Porosity"
          recommendation={mockRecommendation}
          recommendationIndex={0}
          totalRecommendations={3}
          parameters={mockParameters}
          onAccept={onAcceptMock}
          onTryNext={onTryNextMock}
          onRetry={onRetryMock}
        />
      );
      expect(getByText('Parameter: voltage')).toBeTruthy();
    });
  });

  describe('Specific Recommendations - Voltage', () => {
    it('should show specific voltage increase recommendation', () => {
      const { getByText } = render(
        <RecommendationScreen
          diagnosis="Porosity"
          recommendation={mockRecommendation}
          recommendationIndex={0}
          totalRecommendations={3}
          parameters={mockParameters}
          onAccept={onAcceptMock}
          onTryNext={onTryNextMock}
          onRetry={onRetryMock}
        />
      );
      expect(getByText('Increase voltage from 18V to 20V')).toBeTruthy();
    });

    it('should show specific voltage decrease recommendation', () => {
      const decreaseRec = {
        parameter: 'voltage',
        adjustment: 'Decrease voltage',
        details: 'Lower voltage reduces penetration.',
      };

      const { getByText } = render(
        <RecommendationScreen
          diagnosis="Burn Through"
          recommendation={decreaseRec}
          recommendationIndex={0}
          totalRecommendations={2}
          parameters={mockParameters}
          onAccept={onAcceptMock}
          onTryNext={onTryNextMock}
          onRetry={onRetryMock}
        />
      );
      expect(getByText('Decrease voltage from 18V to 16V')).toBeTruthy();
    });

    it('should respect minimum voltage of 12V', () => {
      const lowVoltageParams = { ...mockParameters, voltage: 13 };
      const decreaseRec = {
        parameter: 'voltage',
        adjustment: 'Decrease voltage',
        details: 'Lower voltage reduces penetration.',
      };

      const { getByText } = render(
        <RecommendationScreen
          diagnosis="Burn Through"
          recommendation={decreaseRec}
          recommendationIndex={0}
          totalRecommendations={2}
          parameters={lowVoltageParams}
          onAccept={onAcceptMock}
          onTryNext={onTryNextMock}
          onRetry={onRetryMock}
        />
      );
      expect(getByText('Decrease voltage from 13V to 12V')).toBeTruthy();
    });
  });

  describe('Specific Recommendations - Wire Speed', () => {
    it('should show specific wire speed increase recommendation', () => {
      const wireSpeedRec = {
        parameter: 'wire_feed_speed',
        adjustment: 'Increase wire feed speed',
        details: 'Higher wire speed adds more filler metal.',
      };

      const { getByText } = render(
        <RecommendationScreen
          diagnosis="Undercut"
          recommendation={wireSpeedRec}
          recommendationIndex={0}
          totalRecommendations={2}
          parameters={mockParameters}
          onAccept={onAcceptMock}
          onTryNext={onTryNextMock}
          onRetry={onRetryMock}
        />
      );
      expect(getByText('Increase wire speed from 200 IPM to 220 IPM')).toBeTruthy();
    });

    it('should show specific wire speed decrease recommendation', () => {
      const wireSpeedRec = {
        parameter: 'wire_feed_speed',
        adjustment: 'Decrease wire feed speed',
        details: 'Lower wire speed reduces filler metal.',
      };

      const { getByText } = render(
        <RecommendationScreen
          diagnosis="Excessive Build Up"
          recommendation={wireSpeedRec}
          recommendationIndex={0}
          totalRecommendations={2}
          parameters={mockParameters}
          onAccept={onAcceptMock}
          onTryNext={onTryNextMock}
          onRetry={onRetryMock}
        />
      );
      expect(getByText('Decrease wire speed from 200 IPM to 180 IPM')).toBeTruthy();
    });

    it('should respect minimum wire speed of 100 IPM', () => {
      const lowSpeedParams = { ...mockParameters, wireSpeed: 110 };
      const decreaseRec = {
        parameter: 'wire_feed_speed',
        adjustment: 'Decrease wire feed speed',
        details: 'Lower wire speed reduces filler metal.',
      };

      const { getByText } = render(
        <RecommendationScreen
          diagnosis="Test"
          recommendation={decreaseRec}
          recommendationIndex={0}
          totalRecommendations={1}
          parameters={lowSpeedParams}
          onAccept={onAcceptMock}
          onTryNext={onTryNextMock}
          onRetry={onRetryMock}
        />
      );
      expect(getByText('Decrease wire speed from 110 IPM to 100 IPM')).toBeTruthy();
    });
  });

  describe('Technique Recommendations', () => {
    it('should show stick-out recommendation as instructional', () => {
      const stickOutRec = {
        parameter: 'stick_out',
        adjustment: 'Maintain proper stick-out distance',
        details: 'Stick-out affects arc stability.',
      };

      const { getByText } = render(
        <RecommendationScreen
          diagnosis="Arc Issues"
          recommendation={stickOutRec}
          recommendationIndex={0}
          totalRecommendations={2}
          parameters={mockParameters}
          onAccept={onAcceptMock}
          onTryNext={onTryNextMock}
          onRetry={onRetryMock}
        />
      );
      expect(getByText('Check stick-out distance: maintain 3/8"')).toBeTruthy();
    });

    it('should show travel speed recommendation as provided', () => {
      const travelSpeedRec = {
        parameter: 'travel_speed',
        adjustment: 'Slow down travel speed',
        details: 'Slower travel allows more heat input.',
      };

      const { getByText } = render(
        <RecommendationScreen
          diagnosis="Cold Lap"
          recommendation={travelSpeedRec}
          recommendationIndex={0}
          totalRecommendations={2}
          parameters={mockParameters}
          onAccept={onAcceptMock}
          onTryNext={onTryNextMock}
          onRetry={onRetryMock}
        />
      );
      expect(getByText('Slow down travel speed')).toBeTruthy();
    });
  });

  describe('Action Buttons', () => {
    it('should show "Done, I changed it" for numeric changes', () => {
      const { getByText } = render(
        <RecommendationScreen
          diagnosis="Porosity"
          recommendation={mockRecommendation}
          recommendationIndex={0}
          totalRecommendations={3}
          parameters={mockParameters}
          onAccept={onAcceptMock}
          onTryNext={onTryNextMock}
          onRetry={onRetryMock}
        />
      );
      expect(getByText('Done, I changed it')).toBeTruthy();
    });

    it('should show "Done, I tried this" for technique changes', () => {
      const techniqueRec = {
        parameter: 'stick_out',
        adjustment: 'Check stick-out',
        details: 'Maintain proper distance.',
      };

      const { getByText } = render(
        <RecommendationScreen
          diagnosis="Arc Issues"
          recommendation={techniqueRec}
          recommendationIndex={0}
          totalRecommendations={2}
          parameters={mockParameters}
          onAccept={onAcceptMock}
          onTryNext={onTryNextMock}
          onRetry={onRetryMock}
        />
      );
      expect(getByText('Done, I tried this')).toBeTruthy();
    });

    it('should call onAccept when accept button is pressed', () => {
      const { getByText } = render(
        <RecommendationScreen
          diagnosis="Porosity"
          recommendation={mockRecommendation}
          recommendationIndex={0}
          totalRecommendations={3}
          parameters={mockParameters}
          onAccept={onAcceptMock}
          onTryNext={onTryNextMock}
          onRetry={onRetryMock}
        />
      );

      fireEvent.press(getByText('Done, I changed it'));
      expect(onAcceptMock).toHaveBeenCalled();
    });

    it('should show "Try Another Suggestion" when not on last recommendation', () => {
      const { getByText } = render(
        <RecommendationScreen
          diagnosis="Porosity"
          recommendation={mockRecommendation}
          recommendationIndex={0}
          totalRecommendations={3}
          parameters={mockParameters}
          onAccept={onAcceptMock}
          onTryNext={onTryNextMock}
          onRetry={onRetryMock}
        />
      );
      expect(getByText('Try Another Suggestion')).toBeTruthy();
    });

    it('should call onTryNext when next button is pressed', () => {
      const { getByText } = render(
        <RecommendationScreen
          diagnosis="Porosity"
          recommendation={mockRecommendation}
          recommendationIndex={0}
          totalRecommendations={3}
          parameters={mockParameters}
          onAccept={onAcceptMock}
          onTryNext={onTryNextMock}
          onRetry={onRetryMock}
        />
      );

      fireEvent.press(getByText('Try Another Suggestion'));
      expect(onTryNextMock).toHaveBeenCalled();
    });

    it('should show "Start Over" button on last recommendation', () => {
      const { getByText } = render(
        <RecommendationScreen
          diagnosis="Porosity"
          recommendation={mockRecommendation}
          recommendationIndex={2}
          totalRecommendations={3}
          parameters={mockParameters}
          onAccept={onAcceptMock}
          onTryNext={onTryNextMock}
          onRetry={onRetryMock}
        />
      );
      expect(getByText('Start Over')).toBeTruthy();
    });

    it('should call onRetry when start over button is pressed', () => {
      const { getByText } = render(
        <RecommendationScreen
          diagnosis="Porosity"
          recommendation={mockRecommendation}
          recommendationIndex={2}
          totalRecommendations={3}
          parameters={mockParameters}
          onAccept={onAcceptMock}
          onTryNext={onTryNextMock}
          onRetry={onRetryMock}
        />
      );

      fireEvent.press(getByText('Start Over'));
      expect(onRetryMock).toHaveBeenCalled();
    });
  });

  describe('Recommendation Counter', () => {
    it('should show correct counter for first recommendation', () => {
      const { getByText } = render(
        <RecommendationScreen
          diagnosis="Porosity"
          recommendation={mockRecommendation}
          recommendationIndex={0}
          totalRecommendations={5}
          parameters={mockParameters}
          onAccept={onAcceptMock}
          onTryNext={onTryNextMock}
          onRetry={onRetryMock}
        />
      );
      expect(getByText('Try This (1/5)')).toBeTruthy();
    });

    it('should show correct counter for middle recommendation', () => {
      const { getByText } = render(
        <RecommendationScreen
          diagnosis="Porosity"
          recommendation={mockRecommendation}
          recommendationIndex={2}
          totalRecommendations={5}
          parameters={mockParameters}
          onAccept={onAcceptMock}
          onTryNext={onTryNextMock}
          onRetry={onRetryMock}
        />
      );
      expect(getByText('Try This (3/5)')).toBeTruthy();
    });

    it('should show correct counter for last recommendation', () => {
      const { getByText } = render(
        <RecommendationScreen
          diagnosis="Porosity"
          recommendation={mockRecommendation}
          recommendationIndex={4}
          totalRecommendations={5}
          parameters={mockParameters}
          onAccept={onAcceptMock}
          onTryNext={onTryNextMock}
          onRetry={onRetryMock}
        />
      );
      expect(getByText('Try This (5/5)')).toBeTruthy();
    });
  });

  describe('Parameter Formatting', () => {
    it('should format parameter name with spaces', () => {
      const wireSpeedRec = {
        parameter: 'wire_feed_speed',
        adjustment: 'Increase wire feed speed',
        details: 'Higher wire speed adds more filler metal.',
      };

      const { getByText } = render(
        <RecommendationScreen
          diagnosis="Undercut"
          recommendation={wireSpeedRec}
          recommendationIndex={0}
          totalRecommendations={2}
          parameters={mockParameters}
          onAccept={onAcceptMock}
          onTryNext={onTryNextMock}
          onRetry={onRetryMock}
        />
      );
      expect(getByText('Parameter: wire feed speed')).toBeTruthy();
    });
  });
});
