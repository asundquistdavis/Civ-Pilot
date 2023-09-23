const path = require('path');
const autoprefixer = require('autoprefixer');
const HTMLWebpackPlugin = require('html-webpack-plugin');
const webpack = require('webpack');

module.exports = {
    devtool: 'eval-source-map',
    entry: {index: './frontend/index.js'},
    output: {
        path: path.join(__dirname, '.\\static'),
        filename: '[name].js'
    },
    plugins: [
        new HTMLWebpackPlugin({template: './templates/index.html'}),
        // new webpack.optimize.MinChunkSizePlugin({minChunkSize: 1})
        // new HTMLWebpackPlugin({favicon: "./src/favicon.ico"})
    ],
    module: {
        rules: [
            {
                test: /.js$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader',
                    options: {presets: ['@babel/preset-env', '@babel/preset-react']}
                }
            },
            {
                test: /\.(css)$/,
                use: {loader: 'css-loader'},
            },
            {
                test: /\.(scss)$/,
                use: [
                {loader: 'style-loader'},
                {loader: 'css-loader'},
                {
                    loader: 'postcss-loader',
                    options: {postcssOptions: {plugins: () => [autoprefixer]}}
                },
                {loader: 'sass-loader'},
                ]
            },
            {
                test: /\.(png|svg|jpg|jpeg|gif)$/i,
                use: {loader: 'file-loader'}
            },

        ]
     }
};