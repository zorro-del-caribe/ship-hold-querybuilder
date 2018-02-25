export const fluentMethod = fn => function (...args) {
	fn(...args);
	return this;
};