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

class NoParentImportsPlugin {
    static PLUGIN_NAME = "NoParentImportsPlugin";
    constructor(options = {}) {
        this.options = {
            pattern: "../",
            exclude: /node_modules/,
            level: "warning", // 'error' | 'warning'
            ...options
        };
    }

    /** @param {import("@rspack/core").Compiler} compiler */
    apply(compiler) {
        const pluginName = NoParentImportsPlugin.PLUGIN_NAME;
        const { pattern, exclude, level } = this.options;

        compiler.hooks.normalModuleFactory.tap(pluginName, (nmf) => {
            nmf.hooks.beforeResolve.tap(pluginName, (data) => {
                if (!data) {
                    return;
                }

                const request = data.request;
                const issuer = data.contextInfo && data.contextInfo.issuer;

                if (!request || !request.includes(pattern)) {
                    return;
                }

                if (issuer && exclude && exclude.test(issuer)) {
                    return;
                }

                const message = `[${NoParentImportsPlugin.PLUGIN_NAME}] Forbidden import detected: "${request}" in ${issuer || "unknown context"}`;
                if (level === "error") {
                    throw new Error(message);
                }

                compiler.hooks.thisCompilation.tap(pluginName, (compilation) => {
                    compilation.warnings.push(new Error(message));
                });
            });
        });
    }
}

/* ================================================================================================================== */

/** @type {import("@rspack/core").Configuration} */
module.exports = {
    mode: isDev ? "development" : "production",
    devtool: process.env.RSDOCTOR ? "source-map" : false,
    context: __dirname,

    entry: {
        index: path.resolve(__dirname, "src/main.tsx"),
        customEvent: path.resolve(__dirname, "src/customEvent.tsx")
    },
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
                    chunks: (chunk) => chunk.name === "index",
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
        process.env.RSDOCTOR === "true" && new OrphanFilesPlugin(),
        process.env.RSDOCTOR === "true" && new RsdoctorRspackPlugin(),
        process.env.RSDOCTOR !== "true" && new SourceMapDevToolPlugin({ filename: "[file].map", exclude: /vendor/ }),
        new NoParentImportsPlugin(),
        new CopyRspackPlugin({
            patterns: [
                {
                    from: path.resolve(__dirname, "public"),
                    globOptions: { ignore: ["**/index.html", "**/custom-event.html"] }
                }
            ]
        }),
        new HtmlRspackPlugin({
            template: path.resolve(__dirname, "public/index.html"),
            chunks: ["index"],
            minify: !isDev
        }),
        new HtmlRspackPlugin({
            template: path.resolve(__dirname, "public/custom-event.html"),
            filename: "custom-event.html",
            chunks: ["customEvent"],
            minify: !isDev
        })
    ].filter(Boolean)
};
