import proxy from '../lib/proxy-condition';

export default nodes => function (...args) {
	return proxy(this, nodes)(...args);
};
