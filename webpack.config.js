const { mode } = require("webpack-nano/argv");
const { merge } = require("webpack-merge"); // I have used merge here which is used to merge the properties in the functions which I have declared in parts.js. So, if any property will match than it will overwrite that property depending on it's type
const parts = require("./webpack.parts"); // parts is used to access functions defined in parts.js files
const path = require('path');

// I have used postcss-loader for using tailwind
const cssLoaders = [parts.autoprefix(), parts.tailwind()];

// this config is common for all modes: production, development or none
const commonConfig = merge([
  { output: {
    path: path.resolve(process.cwd(), "dist")
  } },
  parts.clean(),
  { entry: ["./src"] },
  parts.page({ title: "Demo" }), // It is used for telling the webpack which html to look for running the app
  parts.extractCSS({ loaders: cssLoaders }), // Extract css uses mini css extract plugin which is used to seperate css files and embed it into HTML file
  parts.loadJavaScript(), // In this function, I have loaded an asset which is JavaScript in this case. I have used babel-loader to load JavaScript here.
  parts.setFreeVariable("Yola", "How you doing?"),
]);

// for production mode
const productionConfig = merge([
  {
    output: {
      chunkFilename: "[name].[contenthash].js", // here contenthash will generate hash based on the content of the file so that we can validate the files on the client-side. If the file will change, so is it's hash and thus hash for changed file will not match and it will indicate their is a change in the file so user have to download the asset again
      filename: "[name].[contenthash].js",
      assetModuleFilename: "[name].[contenthash][ext][query]",
    },
  },
  { optimization: { splitChunks: { chunks: "all" }, runtimeChunk: { name: "runtime" }, } }, // It will split the bundles; app and vendor. You can see this by running npm run build
  parts.eliminateUnusedCSS(), // What this function will do is parse css files and will remove the unused css from the bundle while building
  parts.generateSourceMaps({ type: "source-map" }), // what source-map does is map original and transformed code so that debugging the code becomes easy when there is lot of transformed code generated. After running npm run build you can find seperate source map file with extension .map
  parts.attachRevision(), // this function uses git-revision-webpack-plugin which is used in the production for generating version and commitHash during building
  parts.minifyJavaScript(), // this function minifies the js code
  parts.minifyCSS({ options: { preset: ["default"] } }), // minifies css files and avoids duplicating css which is not done in mini css extract plugin
  { recordsPath: path.join(__dirname, "records.json") }, // records is used to implement caching while splitting the bundle. It stores the module Id's of all builds. To save it automatically as module Id's change, we created records.json. Now, whenever file will change, this records.json will also change
]);

// for development mode
const developmentConfig = merge([
  { entry: ["webpack-plugin-serve/client"] },
  parts.devServer(), // It specifies the port in which app will run and also used for live reloading of the app when it encounters any changes
]);

// It will check which mode we have specified and depending on that it will run the following code
const getConfig = (mode) => {
  switch (mode) {
    case "production":
      return merge(commonConfig, productionConfig, { mode });
    case "development":
      return merge(commonConfig, developmentConfig, { mode });
    default:
      throw new Error(`Trying to use an unknown mode, ${mode}`);
  }
};

module.exports = getConfig(mode);