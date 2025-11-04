// Mock import.meta to avoid Expo runtime issues
global.import = {
  meta: {
    url: 'file:///mock',
    resolve: (path) => path,
  },
};

// Mock __ExpoImportMetaRegistry
global.__ExpoImportMetaRegistry = {
  register: () => {},
};

// Mock structuredClone if it doesn't exist
if (typeof global.structuredClone === 'undefined') {
  global.structuredClone = (obj) => JSON.parse(JSON.stringify(obj));
}
