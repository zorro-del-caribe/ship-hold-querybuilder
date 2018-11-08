import node from 'rollup-plugin-node-resolve';

export default {
    input: './dist/src/index.js',
    output: [{
        file: './dist/bundle/ship-hold-querybuilder.js',
        format: 'iife',
        name: 'ShipHoldQuery',
        sourcemap: true
    }, {
        file: './dist/bundle/ship-hold-querybuilder.es.js',
        format: 'es',
        sourcemap: true
    }],
    plugins: [node()]
};
