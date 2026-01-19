// NOTE: These used to be local image assets (require('../assets/...')).
// If you delete assets, Metro bundling fails even if you guard at runtime.
// We now use Ionicons icon *names* so the app can bundle with zero local images.
export const taskIcons = {
  '1': 'sunny',
  '2': 'barbell',
  '3': 'restaurant',
  '4': 'bed',
  '5': 'flask',
  'd1': 'hand-left',
  'd2': 'alert-circle',
  'd3': 'wine',
};

export const taskIconsGrayscale = {
  '1': 'sunny-outline',
  '2': 'barbell-outline',
  '3': 'restaurant-outline',
  '4': 'bed-outline',
  '5': 'flask-outline',
  'd1': 'hand-left-outline',
  'd2': 'alert-circle-outline',
  'd3': 'wine-outline',
};
