import {expressionNode, pointerNode} from '../lib/nodes';
import {fluentMethod} from "../lib/util"

const isSubQuery = node => node.value && typeof node.value.build === 'function';
export default nodes => fluentMethod((...args) => nodes.add(...args.map(n => isSubQuery(n) ? expressionNode(n) : pointerNode(n))));
