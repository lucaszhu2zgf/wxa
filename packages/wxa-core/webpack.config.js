const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
module.exports = {
    mode: 'production',
    output: {
        library: 'wxa',
        libraryTarget: 'umd',
    },
    module: {
        rules: [
            {
                test: /\.(ts|js)$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader',
                },
            },
        ],
    },
    resolve: {
        extensions: ['.js', '.ts'],
    },
    plugins: [
        new UglifyJsPlugin(),
    ],
    // devtool: 'source-map',
    target: 'node',
};
