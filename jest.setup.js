import '@testing-library/jest-dom';

// Set environment variables for Jest tests
process.env.STRAPI_API_URL = process.env.STRAPI_API_URL || 'http://localhost:1337';
process.env.STRAPI_API_TOKEN = process.env.STRAPI_API_TOKEN || 'test_token';

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // Deprecated
    removeListener: jest.fn(), // Deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});
