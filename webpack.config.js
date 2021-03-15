const path = require("path");
const fs = require("fs");
const CssMinimizerPlugin = require("css-minimizer-webpack-plugin");
const HTMLWebpackPlugin = require("html-webpack-plugin");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
// const CopyWebpackPlugin = require('copy-webpack-plugin');

const isDev = process.env.NODE_ENV === "development";

const filename = (ext) => {
    return isDev ? `[name].${ext}` : `[name].[contenthash].${ext}`;
};

function generateHtmlPlugins(templateDir) {
    const templateFiles = fs.readdirSync(path.resolve(__dirname, templateDir));
    return templateFiles.map((item) => {
        const [name, extension] = item.split(".");

        return new HTMLWebpackPlugin({
            filename: `${name}.html`,
            template: path.resolve(
                __dirname,
                `${templateDir}/${name}.${extension}`
            ),
        });
    });
}

const htmlPlugins = generateHtmlPlugins("./src/html");

module.exports = {
    // mode указывает для чего сборка
    mode: "development",
    //параметр context указывает корневую папку для сборки
    context: path.resolve(__dirname, "src"),
    // в entry уже указываем путь от кореневой папки src
    entry: "./index.js",
    // output Указывает куда склядывать скомпилированные файлы
    output: {
        filename: `./js/${filename("js")}`,
        path: path.resolve(__dirname, "dist"),
    },
    devServer: {
        historyApiFallback: true,
        contentBase: path.resolve(__dirname, "dist"),
        open: true,
        compress: true,
        hot: true,
        port: 8083,
    },
    devtool: isDev ? "source-map" : false,
    optimization: {
        minimize: true,
        minimizer: [
            new CssMinimizerPlugin({
                minimizerOptions: {
                    preset: [
                        "default",
                        {
                            discardComments: { removeAll: true },
                        },
                    ],
                },
            }),
        ],
    },
    module: {
        rules: [
            {
                test: /\.html$/,
                loader: "html-loader",
            },
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: {
                    loader: "babel-loader",
                    options: {
                        presets: ["@babel/preset-env"],
                        plugins: ["@babel/plugin-proposal-object-rest-spread"],
                    },
                },
            },
            {
                test: /\.css$/,
                use: [
                    {
                        loader: MiniCssExtractPlugin.loader,
                        options: {
                            publicPath: (resourcePath, context) => {
                                return (
                                    path.relative(
                                        path.dirname(resourcePath),
                                        context
                                    ) + "/"
                                );
                            },
                        },
                    },

                    "css-loader",

                    {
                        loader: "postcss-loader",
                        options: {
                            postcssOptions: {
                                plugins: ["postcss-preset-env"],
                            },
                        },
                    },
                ],
            },
            {
                test: /\.s[ac]ss$/,
                use: [
                    {
                        loader: MiniCssExtractPlugin.loader,
                        options: {
                            publicPath: (resourcePath, context) => {
                                return (
                                    path.relative(
                                        path.dirname(resourcePath),
                                        context
                                    ) + "/"
                                );
                            },
                        },
                    },

                    "css-loader",

                    {
                        loader: "postcss-loader",
                        options: {
                            postcssOptions: {
                                plugins: ["postcss-preset-env"],
                            },
                        },
                    },

                    "sass-loader",
                ],
            },
            {
                test: /\.(?:|png|jpg|jpeg|svg|gif)$/,
                type: "asset/resource",
                generator: {
                    filename: "img/[hash][ext][query]",
                },
            },
            {
                test: /\.(ico)$/,
                type: "asset/resource",
                generator: {
                    filename: "assets/[hash][ext][query]",
                },
            },
            {
                test: /\.(woff|woff2)$/,
                use: [
                    {
                        loader: "file-loader",
                        options: {
                            name: `./fonts/${filename("[ext]")}`,
                        },
                    },
                ],
            },
        ],
    },

    plugins: [
        new CleanWebpackPlugin(),
        new MiniCssExtractPlugin({
            filename: `./css/${filename("css")}`,
        }),
        // CopyWebpackPlugin конфликтует с asset/resource
        // new CopyWebpackPlugin({
        //   patterns: [
        //     {
        //       from: path.resolve(__dirname, 'src/assets'),
        //       to: path.resolve(__dirname, 'dist/assets')
        //     }
        //   ]
        // }),
    ].concat(htmlPlugins),
};
