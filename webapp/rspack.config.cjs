/*!******************************************************************************
 * Copyright (c) 2024-2026 Voguh
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 ******************************************************************************/

const path = require("node:path");

const { RsdoctorRspackPlugin } = require("@rsdoctor/rspack-plugin");
const { CopyRspackPlugin, HtmlRspackPlugin, SourceMapDevToolPlugin } = require("@rspack/core");
const { glob } = require("glob");

/* ================================================================================================================== */

const isDev = process.env.NODE_ENV !== "production";

class OrphanFilesPlugin {
    /** @param {import("@rspack/core").Compiler} compiler */
    apply(compiler) {
        compiler.hooks.done.tapPromise("@unichat/build-tools", async (stats) => {
            const files = await glob("./src/**/*.{ts,tsx}", { cwd: __dirname, absolute: true, ignore: "**/*.d.ts" });
            const orphanFiles = files.filter((file) => !stats.compilation.fileDependencies.has(file)).sort();
            if (orphanFiles.length > 0) {
                const logLines = orphanFiles.map((file) => `║  ./${path.relative(__dirname, file)}`);
                logLines.unshift("╔══ Orphan files detected ══════════════════════════════════════════════════════");
                logLines.push("╚══════════════════════════════════════════════════════════════════════════════");
                compiler.getInfrastructureLogger("@unichat/build-tools").info(logLines.join("\n"));
            }
        });
    }
}

/* ================================================================================================================== */

/** @type {import("@rspack/core").Configuration} */
module.exports = {
    mode: isDev ? "development" : "production",
    devtool: process.env.BUNDLE_ANALYZE ? "source-map" : false,
    context: __dirname,

    entry: { index: path.resolve(__dirname, "src/main.tsx") },
    output: {
        path: path.resolve(__dirname, "dist"),
        publicPath: "/",
        filename: "js/[name]-[contenthash].js",
        chunkFilename: "js/[name]-[contenthash].js",
        cssFilename: "css/[name]-[contenthash].css",
        cssChunkFilename: "css/[name]-[contenthash].css",
        assetModuleFilename: "assets/[name]-[contenthash][ext]"
    },

    devServer: {
        port: 1421,
        hot: false,
        liveReload: true,
        static: { directory: path.resolve(__dirname, "public"), watch: false }
    },

    module: {
        parser: { "css/auto": { namedExports: false, dashedIdents: false } },
        generator: { "css/auto": { localIdentName: "[hash:base64:8]" } },
        rules: [
            {
                test: /\.tsx?$/,
                exclude: /node_modules/,
                use: [
                    {
                        loader: "builtin:swc-loader",
                        options: {
                            jsc: {
                                target: "es2023",
                                parser: { syntax: "typescript", tsx: true },
                                transform: { react: { runtime: "automatic", importSource: "preact" } }
                            }
                        }
                    }
                ]
            },
            {
                test: /\.css$/,
                resourceQuery: { not: [/raw/] },
                type: "css/auto",
                use: ["postcss-loader"]
            },
            {
                test: /\.(png|jpg|jpeg|gif|svg)$/,
                resourceQuery: { not: [/raw/] },
                type: "asset/resource"
            },
            {
                test: /\.(woff|woff2|eot|ttf|otf)$/,
                resourceQuery: { not: [/raw/] },
                type: "asset/resource"
            },
            {
                resourceQuery: /raw/,
                type: "asset/source"
            }
        ]
    },

    optimization: {
        minimize: !isDev,
        splitChunks: {
            cacheGroups: {
                vendor: {
                    test: /[\\/]node_modules[\\/]/,
                    name: "vendor",
                    chunks: "initial",
                    enforce: true
                }
            }
        }
    },

    resolve: {
        extensions: [".ts", ".tsx", ".js", ".jsx"],
        tsConfig: path.resolve(__dirname, "tsconfig.json"),
        alias: {
            react: "preact/compat",
            "react-dom/test-utils": "preact/test-utils",
            "react-dom": "preact/compat",
            "react/jsx-runtime": "preact/jsx-runtime"
        }
    },

    plugins: [
        process.env.BUNDLE_ANALYZE === "true" && new OrphanFilesPlugin(),
        process.env.BUNDLE_ANALYZE === "true" && new RsdoctorRspackPlugin(),
        process.env.BUNDLE_ANALYZE !== "true" &&
            new SourceMapDevToolPlugin({ filename: "[file].map", exclude: /vendor/ }),
        new CopyRspackPlugin({
            patterns: [
                {
                    from: path.resolve(__dirname, "public"),
                    globOptions: { ignore: ["**/index.html"] }
                }
            ]
        }),
        new HtmlRspackPlugin({ template: path.resolve(__dirname, "public/index.html"), minify: !isDev })
    ].filter(Boolean)
};
