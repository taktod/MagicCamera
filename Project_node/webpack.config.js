var webpack = require("webpack");
module.exports = {
  entry: __dirname + "/src/app.ts",
  output: {
    path: __dirname + "/dest/",
    filename: "app.js"
  },
  devtool: "#inline-source-map",
  module: {
    rules: [
      {
        test: /\.ts$/,
        loader: "awesome-typescript-loader"
      }
    ]
  },
  resolve: {
    modules: [
      "node_modules",
    ],
    extensions: [".ts", ".js"]
  },
  externals: {
    "electron": "electron"
  }
}
