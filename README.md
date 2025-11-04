# Weldy - MIG Welding Troubleshooting App

A simple React Native app built with Expo to help beginner welders diagnose and fix common MIG welding issues.

## Features

- **Guided Q&A Wizard**: Step-by-step troubleshooting based on visual symptoms
- **Image-based Questions**: Choose from carousel of weld bead images
- **Smart Recommendations**: Get specific parameter adjustments for your issue
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

1. **Start**: The app opens to an image carousel showing different weld defects
2. **Select**: Choose the image that most closely matches your weld
3. **Answer Questions**: Follow up questions help narrow down the cause
4. **Get Recommendations**: Receive specific adjustments to fix the issue
5. **Restart**: Tap the restart icon (top right) to diagnose another weld
6. **Go Back**: Use the back arrow (top left) to revisit previous questions

## Project Structure

```
weldy-bug/
├── App.js                      # Main app component with wizard logic
├── app.json                    # Expo configuration
├── package.json                # Dependencies and scripts
├── data/
│   └── decision-tree.json      # Welding troubleshooting decision tree
├── resources/
│   └── images/                 # Weld defect images (add your own)
└── README.md                   # This file
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

## Technologies Used

- **React Native**: Cross-platform mobile framework
- **Expo**: Development platform for React Native
- **@expo/vector-icons (Ionicons)**: Icon set for UI elements

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
