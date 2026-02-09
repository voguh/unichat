/*!******************************************************************************
 * Copyright (c) 2026 Voguh
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 ******************************************************************************/

/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require("node:fs");
const path = require("node:path");

const CopyWebpackPlugin = require("@webpack/plugin-copy");
const CssMinimizerPlugin = require("@webpack/plugin-css-minimizer");
const HtmlWebpackPlugin = require("@webpack/plugin-html");
const MiniCssExtractPlugin = require("@webpack/plugin-mini-css-extract");
const NodePolyfillPlugin = require("@webpack/plugin-node-polyfill");
const TerserPlugin = require("@webpack/plugin-terser");
const JSONC = require("jsonc-parser");

const distPath = path.resolve(__dirname, "dist");
const publicPath = path.resolve(__dirname, "public");

const isDev = process.env.NODE_ENV === "development";

const tsConfigRaw = fs.readFileSync(path.resolve(__dirname, "tsconfig.json"), { encoding: "utf-8" });
const tsConfig = JSONC.parse(tsConfigRaw) || {};
const tsConfigPaths = Object.entries(tsConfig?.compilerOptions?.paths ?? {}).reduce((acc, [key, value]) => {
    return {
        ...acc,
        [key.replace("/*", "")]: path.resolve(__dirname, value[0].replace("/*", ""))
    };
}, {});

if (fs.existsSync(distPath)) {
    fs.rmSync(distPath, { recursive: true, force: true });
}

/* ============================================================================================================== */

/** @type {import("webpack").Configuration & { devServer?: import("webpack-dev-server").Configuration }} */
module.exports = {
    mode: isDev ? "development" : "production",
    devtool: "source-map",

    entry: path.resolve(__dirname, "src", "main.tsx"),
    output: {
        path: distPath,
        filename: "[name].js",
        chunkFilename: "[name].chunk.js",
        clean: true
    },

    devServer: {
        port: 1421,
        hot: false,
        liveReload: true,
        compress: false
    },

    module: {
        rules: [
            {
                test: /\.m?js/,
                resolve: { fullySpecified: false }
            },
            {
                test: /\.[t|j]sx?$/,
                exclude: /node_modules/,
                use: ["babel-loader"]
            },
            {
                test: /\.css$/,
                resourceQuery: { not: [/raw/] },
                use: [MiniCssExtractPlugin.loader, "css-loader"]
            },
            {
                test: /\.s[ac]ss$/,
                resourceQuery: { not: [/raw/] },
                use: [
                    MiniCssExtractPlugin.loader,
                    "css-loader",
                    {
                        loader: "sass-loader",
                        options: {
                            sassOptions: {
                                quietDeps: true,
                                silenceDeprecations: ["import"]
                            }
                        }
                    }
                ]
            },
            {
                test: /\.(png|jpg|jpeg|gif|webp|svg|ico)$/,
                resourceQuery: { not: [/raw/] },
                type: "asset/resource",
                generator: { filename: "[name]-[hash].[ext]" }
            },
            {
                test: /\.(woff|woff2|eot|ttf|otf)$/,
                resourceQuery: { not: [/raw/] },
                type: "asset/resource",
                generator: { filename: "[name]-[hash].[ext]" }
            },
            {
                resourceQuery: /raw/,
                type: "asset/source"
            }
        ]
    },

    optimization: {
        minimize: !isDev,
        minimizer: isDev ? [] : [new TerserPlugin(), new CssMinimizerPlugin()],
        splitChunks: {
            cacheGroups: {
                vendor: {
                    test: /[\\/]node_modules[\\/]/,
                    name: "vendor",
                    chunks: "all",
                    enforce: true
                }
            }
        }
    },

    resolve: {
        extensions: [".ts", ".tsx", ".js", ".jsx"],
        fullySpecified: false,
        alias: { ...tsConfigPaths }
    },

    plugins: [
        new NodePolyfillPlugin(),
        new MiniCssExtractPlugin({ filename: "[name].css", chunkFilename: "[name].chunk.css" }),
        new HtmlWebpackPlugin({ template: path.resolve(publicPath, "index.html"), filename: "index.html" }),
        new CopyWebpackPlugin({
            patterns: [{ from: publicPath, to: distPath, globOptions: { ignore: ["**/index.html"] } }]
        })
    ]
};
