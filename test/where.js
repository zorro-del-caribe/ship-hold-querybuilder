import test from 'zora';
import where from '../src/builders/where';
import {compositeNode} from '../src/lib/nodes';

test('where builder: create a chainable delegation', t => {
	const mainBuilder = () => {
		const whereNodes = compositeNode();
		return {
			foo() {
				return this;
			},
			build() {
				const queryNode = compositeNode();
				queryNode.add('build >', whereNodes);
				return queryNode.build();
			},
			where: where(whereNodes)
		};
	};

	const actual = mainBuilder()
		.where('blah', 'woot')
		.and('test', 'test2')
		.foo()
		.build().text;
	const expected = `build > "blah" = 'woot' AND "test" = 'test2'`;
	t.equal(actual, expected);
});
