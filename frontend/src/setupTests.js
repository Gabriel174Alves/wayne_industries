import '@testing-library/jest-dom'

// Polyfill ResizeObserver for Recharts ResponsiveContainer in tests
class ResizeObserverPolyfill {
	constructor(callback) {
		this.callback = callback
	}
	observe() {}
	unobserve() {}
	disconnect() {}
}

global.ResizeObserver = global.ResizeObserver || ResizeObserverPolyfill
