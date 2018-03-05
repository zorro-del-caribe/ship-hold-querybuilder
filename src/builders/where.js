import proxy from '../lib/proxy-condition';
import {nodeSymbol} from './clause';

export default function (...args) {
	return proxy(this, this[nodeSymbol].where)(...args);
}
