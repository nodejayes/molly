var TypedocWebpackPlugin = require('typedoc-webpack-plugin');

module.exports = {
    plugins: [
        new TypedocWebpackPlugin({})
    ],
    devtool: 'inline-source-map',
    entry: './src/index.ts',
    output: {
        filename: './dist/bundle.js',
        library: 'Molly',
        libraryTarget: 'umd',
        umdNamedDefine: true
    },
    resolve: {
        // Add `.ts` and `.tsx` as a resolvable extension.
        extensions: ['.ts', '.tsx', '.js']
    },
    module: {
        rules: [
        // all files with a `.ts` or `.tsx` extension will be handled by `ts-loader`
        { test: /\.tsx?$/, loader: 'ts-loader' }
        ]
    }
};