export default {
	input: './src/index.js',
	output: [{
		format: 'cjs',
		file: './dist/index.js'
	},{
		format: 'es',
		file: './dist/index.mjs'
	}]
}