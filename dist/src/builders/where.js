import proxy from '../lib/proxy-condition';
import { nodeSymbol } from './clause';
export default function (leftOperand, operator, rightOperand) {
    return proxy(this, this[nodeSymbol].where)(leftOperand, operator, rightOperand);
}
