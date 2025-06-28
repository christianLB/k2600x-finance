module.exports = {
  projects: [
    {
      displayName: 'frontend',
      testEnvironment: 'jsdom',
      setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
      testMatch: ['<rootDir>/src/**/(*.)test.ts', '<rootDir>/src/**/(*.)test.tsx', '!**/src/services/**/*.test.ts'],
      transform: {
        '^.+\.(js|jsx|ts|tsx)$': ['babel-jest', { configFile: './babel-jest.config.js' }],
      },
      moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/src/$1',
      },
    },
    {
      displayName: 'backend',
      testEnvironment: 'node',
      testMatch: ['<rootDir>/src/services/**/*.test.ts'],
      transform: {
        '^.+\.(js|jsx|ts|tsx)$': ['babel-jest', { configFile: './babel-jest.config.js' }],
      },
      moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/src/$1',
      },
    },
  ],
};