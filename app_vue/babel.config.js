/*
* export a configuration object that specifies the Babel presets to be used when running tests in the test environment
*/ 
module.exports = {
  env: {
      test: {
          presets: [
              [
                  "@babel/preset-env",
                  {
                      targets: {
                          node: "current",
                      },
                  },
              ],
          ],
      },
  },
}
