export const fluentMethod = fn => function (...args) {
	fn.bind(this)(...args);
	return this;
};
