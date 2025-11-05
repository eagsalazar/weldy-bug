// Image mapping for weld defect images
// This allows us to use require() with dynamic keys
// Only include images that actually exist (non-placeholder)

export const weldImages = {
  'porosity.jpg': require('./porosity.jpg'),
  'undercut.jpg': require('./undercut.jpg'),
  'excessive_spatter.jpg': require('./excessive_spatter.jpg'),
  // Add more images as they become available:
  // 'cold_lap.jpg': require('./cold_lap.jpg'),
  // 'burn_through.jpg': require('./burn_through.jpg'),
  // 'convex_bead.jpg': require('./convex_bead.jpg'),
  // 'concave_bead.jpg': require('./concave_bead.jpg'),
  // 'inconsistent_width.jpg': require('./inconsistent_width.jpg'),
  // 'rough_surface.jpg': require('./rough_surface.jpg'),
  // 'cracks.jpg': require('./cracks.jpg'),
  // 'good_weld.jpg': require('./good_weld.jpg'),
};

// Helper to get image source from path
export const getImageSource = (imagePath) => {
  const filename = imagePath.split('/').pop();
  return weldImages[filename] || null;
};
