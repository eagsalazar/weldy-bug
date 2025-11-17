// Image mapping for weld defect combination images
// React Native requires static paths, so we map filenames to require() statements
// Only include images that have actual content (non-empty files)
// Empty placeholder files will return null and show placeholder UI

export const weldImages = {
  'burn_through.png': require('./burn_through.png'),
  'cracking.png': require('./cracking.png'),
  'good_weld.png': require('./good_weld.png'),
  'inconsistent_width+rough_surface.png': require('./inconsistent_width+rough_surface.png'),
  'porosity.png': require('./porosity.png'),
  'rough_surface.png': require('./rough_surface.png'),
  // Add more images here as they are created:
  // 'burn_through+convex_bead+excessive_spatter+overlap.png': require('./burn_through+convex_bead+excessive_spatter+overlap.png'),
  // 'burn_through+convex_bead+overlap.png': require('./burn_through+convex_bead+overlap.png'),
  // 'burn_through+excessive_spatter+undercut.png': require('./burn_through+excessive_spatter+undercut.png'),
  // 'cold_lap+convex_bead+excessive_spatter+overlap+rough_surface.png': require('./cold_lap+convex_bead+excessive_spatter+overlap+rough_surface.png'),
  // 'cold_lap+cracking+excessive_spatter+porosity.png': require('./cold_lap+cracking+excessive_spatter+porosity.png'),
  // 'cold_lap+overlap+undercut.png': require('./cold_lap+overlap+undercut.png'),
  // 'cold_lap+undercut.png': require('./cold_lap+undercut.png'),
  // 'excessive_spatter+porosity.png': require('./excessive_spatter+porosity.png'),
  // 'excessive_spatter+porosity+rough_surface.png': require('./excessive_spatter+porosity+rough_surface.png'),
  // 'no_bead_formation.png': require('./no_bead_formation.png'),
  // 'one_sided_fusion.png': require('./one_sided_fusion.png'),
};

// Helper to get image source from path
export const getImageSource = (imagePath) => {
  const filename = imagePath.split('/').pop();
  return weldImages[filename] || null;
};
