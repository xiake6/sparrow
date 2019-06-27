// https://github.com/michael-ciniawsky/postcss-load-config

module.exports = {
  "plugins": {
    "postcss-import": {},         //用于@import导入css文件
    "postcss-url": {},            //路径引入css文件或node_modules文件
    // to edit target browsers: use "browserslist" field in package.json
    "autoprefixer": {}          //cssnext和cssnano都具有autoprefixer,事实上只需要一个，所以把默认的autoprefixer删除掉，然后把cssnano中的autoprefixer设置为false。
  }
}
