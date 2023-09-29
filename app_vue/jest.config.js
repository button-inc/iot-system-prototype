const esModules = ['leaflet', '@vue-leaflet/vue-leaflet'].join('|');
module.exports = {
  testEnvironment: 'jsdom',
  transform: {
    '^.+\\.vue$': '@vue/vue3-jest',
    '^.+\\js$': 'babel-jest',
    '.+\\.(css|styl|less|sass|scss|png|jpg|ttf|woff|woff2)$': 'jest-transform-stub'
  },
  transformIgnorePatterns: [`/node_modules/(?!${esModules})`],
  testRegex: '(/__tests__/.*|(\\.|/)(test|spec))\\.(js|ts)$',
  moduleFileExtensions: ['vue', 'js'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^.+.(css|styl|less|sass|scss|png|jpg|ttf|woff|woff2)$': 'jest-transform-stub'
  },
  coveragePathIgnorePatterns: ['/node_modules/', '/tests/'],
  coverageReporters: ['text', 'json-summary'],
  // Fix in order for vue-test-utils to work with Jest 29
  // https://test-utils.vuejs.org/migration/#test-runners-upgrade-notes
  testEnvironmentOptions: {
    customExportConditions: ['node', 'node-addons']
  },
  verbose: true,
  collectCoverage: true,
  coverageDirectory: '<rootDir>/src/test/coverage',
  coverageReporters: ['html', 'text']
};
