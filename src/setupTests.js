// jest-dom adds custom jest matchers for asserting on DOM nodes.
import '@testing-library/jest-dom';

// Polyfill window.scrollTo for jsdom
if (typeof window !== 'undefined') {
  window.scrollTo = jest.fn();
}

// Polyfill IntersectionObserver & ResizeObserver for framer-motion in JSDOM
class MockIntersectionObserver {
  constructor(callback) {
    this.callback = callback;
  }
  observe = jest.fn();
  unobserve = jest.fn();
  disconnect = jest.fn();
}
if (typeof window !== 'undefined') {
  window.IntersectionObserver = MockIntersectionObserver;
  window.ResizeObserver = MockIntersectionObserver;
}
global.IntersectionObserver = MockIntersectionObserver;
global.ResizeObserver = MockIntersectionObserver;

// Mock Lenis smooth scroll for headless test environment
jest.mock('lenis', () => {
  return jest.fn().mockImplementation(() => ({
    raf: jest.fn(),
    scrollTo: jest.fn(),
    destroy: jest.fn(),
    on: jest.fn(),
    off: jest.fn(),
    start: jest.fn(),
    stop: jest.fn(),
    scroll: 0,
    velocity: 0,
    direction: 0,
  }));
});


