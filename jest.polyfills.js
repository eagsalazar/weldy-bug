// Polyfills that need to run BEFORE jest-expo preset loads

// Mock structuredClone
if (typeof global.structuredClone === 'undefined') {
  global.structuredClone = (obj) => JSON.parse(JSON.stringify(obj));
}

// Mock import.meta
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
