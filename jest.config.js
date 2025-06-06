module.exports = {
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': ['babel-jest', { configFile: './babel-jest.config.js' }],
  },
};