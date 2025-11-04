# Weldy - MIG Welding Troubleshooting App

A simple React Native app built with Expo to help beginner welders diagnose and fix common MIG welding issues.

## Features

- **Parameter Setup**: Start by entering your metal thickness, voltage, and wire speed
- **Smart Presets**: Auto-fill recommended voltage and wire speed based on metal thickness
- **Guided Q&A Wizard**: Step-by-step troubleshooting based on visual symptoms
- **Image-based Questions**: Choose from carousel of weld bead images
- **Iterative Recommendations**: Get one specific recommendation at a time, not an overwhelming list
- **Parameter Tracking**: See your current settings in a compact, collapsible panel
- **Editable Values**: Update any parameter on-the-fly and track what you've tried
- **Loop-back Flow**: After trying a recommendation, return to image selection to check if issue is fixed
- **Simple Navigation**: Back button and restart functionality
- **Works Offline**: All decision tree logic is local (images need to be added)

## Prerequisites

- Node.js (v20.15.1 or higher recommended, though v20.15.1 should work)
- npm (comes with Node.js)
- iOS Simulator (for Mac) or Android Emulator, or Expo Go app on your phone

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Add Weld Images

The app references images in `resources/images/`. Placeholder files have been created. Replace them with actual weld photos:

- `resources/images/porosity.jpg`
- `resources/images/excessive_spatter.jpg`
- `resources/images/undercut.jpg`
- `resources/images/cold_lap.jpg`
- `resources/images/burn_through.jpg`
- `resources/images/convex_bead.jpg`
- `resources/images/concave_bead.jpg`
- `resources/images/inconsistent_width.jpg`
- `resources/images/rough_surface.jpg`
- `resources/images/cracks.jpg`
- `resources/images/good_weld.jpg`

**Note**: The app will show placeholder boxes with image filenames for missing images, so it will still run without real images.

### 3. Run the App

Start the Expo development server:

```bash
npm start
```

This will open Expo DevTools in your browser. From there you can:

#### Run on iOS Simulator (Mac only):
```bash
npm run ios
```

#### Run on Android Emulator:
```bash
npm run android
```

#### Run in Web Browser:
```bash
npm run web
```

#### Run on Your Phone:
1. Install the "Expo Go" app from App Store (iOS) or Play Store (Android)
2. Scan the QR code shown in the terminal or browser
3. The app will load on your phone

## Usage

1. **Setup**: Enter your metal thickness, current voltage, and wire feed speed
   - Values are auto-filled with recommended settings based on thickness
   - Adjust if your actual settings differ
2. **Identify**: Choose the image that most closely matches your weld bead appearance
3. **Diagnose**: Answer follow-up questions to narrow down the cause
4. **Review Recommendation**: Get ONE specific adjustment to try (e.g., "Increase voltage from 18V to 20V")
   - See the "Why?" explanation for each recommendation
   - View which parameter is being adjusted
5. **Try It**:
   - Tap "Done, I changed it" if you made the adjustment
   - Tap "Try Another Suggestion" to see the next recommendation
   - Tap "Start Over" if you've tried all suggestions for this diagnosis
6. **Loop Back**: After accepting a recommendation, you return to step 2 to check if the issue is fixed
7. **Track Progress**:
   - View current settings in the collapsible "Current Settings" panel
   - Tap parameter values to edit them
   - Check off technique parameters you've tried (stick out, movement speed)
8. **Navigate**:
   - Use the back arrow (top left) to revisit previous questions
   - Tap the restart icon (top right) to start over completely

## Project Structure

```
weldy-bug/
├── App.js                          # Main app with state management and flow logic
├── app.json                        # Expo configuration
├── package.json                    # Dependencies and scripts
├── components/
│   ├── SetupScreen.js              # Initial parameter collection screen
│   ├── ParameterPanel.js           # Collapsible panel showing current settings
│   └── RecommendationScreen.js     # Iterative recommendation display
├── data/
│   └── decision-tree.json          # Welding troubleshooting decision tree
├── resources/
│   └── images/                     # Weld defect images (add your own)
├── assets/
│   ├── weldy_full_logo.png         # App logo
│   └── weldy_icon.png              # App icon
├── __tests__/
│   ├── App.test.js                 # Component tests
│   └── decisionTree.test.js        # Decision tree validation tests
└── README.md                       # This file
```

## Customizing the Decision Tree

Edit `data/decision-tree.json` to modify:
- Questions and choices
- Diagnoses and recommendations
- Navigation flow

### Decision Tree Structure

- **image-question**: Shows carousel of images with descriptions
- **text-question**: Shows list of text choices
- **diagnosis**: Final result with recommendations

Each node has a `nextNode` property that determines where to go next.

## Testing

Run the test suite to verify everything works:

```bash
npm test
```

Run tests in watch mode for development:

```bash
npm run test:watch
```

The test suite includes:
- Component rendering and interaction tests
- Decision tree structure validation
- Navigation flow testing
- Parameter setup and editing tests

## Technologies Used

- **React Native**: Cross-platform mobile framework
- **Expo**: Development platform for React Native
- **@expo/vector-icons (Ionicons)**: Icon set for UI elements
- **react-native-safe-area-context**: Safe area handling for modern devices
- **Jest**: Testing framework
- **React Testing Library**: Component testing utilities

## Troubleshooting

### App won't start
- Make sure all dependencies are installed: `npm install`
- Clear Expo cache: `npx expo start -c`

### Images not showing
- Check that image files exist in `resources/images/`
- Verify image paths in `data/decision-tree.json` match actual files
- The app will show placeholders if images are missing - this is normal during development

### "Unsupported engine" warnings
- These are warnings about Node.js version but shouldn't prevent the app from running
- The app should work fine with Node.js v20.15.1

## Future Enhancements

- Add support for TIG and Stick welding processes
- Include video demonstrations for techniques
- Allow users to save their machine settings
- Add photo upload for AI-powered diagnosis

## License

ISC

## Contributing

This is a simple educational app. Feel free to fork and modify for your needs.
