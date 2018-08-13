//导入工具包 require('node_modules里对应模块')
var gulp = require('gulp'), //本地安装gulp所用到的地方
    less = require('gulp-less'),
    cssmin=require("gulp-clean-css"),
    imagemin = require('gulp-imagemin'),
    pngquant = require('imagemin-pngquant'),//深度压缩图片
    cache = require('gulp-cache'),//只压缩修改的图片。
    babel = require('gulp-babel'),
    uglify = require('gulp-uglify'),//压缩js
    autoprefixer = require('gulp-autoprefixer'), // gulp-autoprefixer根据设置浏览器版本自动处理浏览器前缀
    browserSync = require('browser-sync').create(),
    concat=require('gulp-concat'),
    fileinclude  = require('gulp-file-include');
var reload=browserSync.reload;


// 引用共同的文件 html
gulp.task('fileinclude', function() {
    // 适配page中所有文件夹下的所有html，排除page下的include文件夹中html
    // gulp.src(['src/**.html','!page/include/**.html'])
 return gulp.src(['src/**/**.html','!src/component/**.html'])
        .pipe(fileinclude({
          prefix: '@@',
          basepath: '@file'
        }))
    .pipe(gulp.dest('dist/')) //不指定路径 会默认生成原路径
    .pipe(reload({stream:true}));//浏览器重载不需要，手动重载需要
});

// 压缩img
gulp.task('imagemin',function() {
  gulp.src('src/img/*.{png,jpg,gif,ico,PNG}')
  .pipe(cache(imagemin({
    optimizationLevel: 5, //类型：Number  默认：3  取值范围：0-7（优化等级）
    progressive: true, //类型：Boolean 默认：false 无损压缩jpg图片
    interlaced: true, //类型：Boolean 默认：false 隔行扫描gif进行渲染
    multipass: true ,//类型：Boolean 默认：false 多次优化svg直到完全优化
    svgoPlugins: [{removeViewBox: false}],//不要移除svg的viewbox属性
    use: [pngquant()] //使用pngquant深度压缩png图片的imagemin插件
  })))
  .pipe(gulp.dest('dist/static/img'));
});


// less, css编译后的css将注入到浏览器里实现更新 可以指定文件名字 合并  自动添加前缀
gulp.task('css', function () {
  return gulp.src(['src/css/*.{less,css}','!src/css/variable.less']) //该任务针对的文件
        .pipe(less()) //该任务调用的模块
        // .pipe(concat('index.min.css'))  //屏蔽可拿到单独的css文件
        .pipe(autoprefixer({
            browsers: ['last 2 versions', 'Android >= 4.0'],
            cascade: true, //是否美化属性值 默认：true 像这样：
            //-webkit-transform: rotate(45deg);
            //        transform: rotate(45deg);
            remove:true //是否去掉不必要的前缀 默认：true
        }))
        .pipe(cssmin({
            advanced: false,//类型：Boolean 默认：true [是否开启高级优化（合并选择器等）]
            compatibility: 'ie7',//保留ie7及以下兼容写法 类型：String 默认：''or'*' [启用兼容模式； 'ie7'：IE7兼容模式，'ie8'：IE8兼容模式，'*'：IE9+兼容模式]
            keepBreaks: false,//类型：Boolean 默认：false [是否保留换行]
            keepSpecialComments: '*'
            //保留所有特殊前缀 当你用autoprefixer生成的浏览器前缀，如果不加这个参数，有可能将会删除你的部分前缀
        }))
        .pipe(gulp.dest('dist/static/css/'))
        .pipe(reload({stream:true})); //浏览器重载不需要，手动重载需要
});


//定义一个js=>min.js任务（自定义任务名称）压缩
gulp.task('js', function () {
    //压缩src/js目录下的所有js文件
    //除了test1.js和test2.js（**匹配src/js的0个或多个子文件夹）
  // gulp.src(['static/javascripts/*.js', '!src/js/**/{test1,test2}.js'])
  gulp.src('src/js/*.js')
    .pipe(babel({  
        presets: ['es2015']  
    }))
    .pipe(uglify({
      //mangle: true,//类型：Boolean 默认：true 是否修改变量名
      mangle: {except: ['require' ,'exports' ,'module' ,'$']},//排除混淆关键字
      compress: true,//类型：Boolean 默认：true 是否完全压缩
      // preserveComments: 'all' //保留所有注释 默认不保留
  }))
  .pipe(gulp.dest('dist/static/js/'));
});

// 静态服务器 + 监听 lesss/html 文件

//手动重载 （myself）使用默认任务启动Browsersync，监听JS文件
gulp.task('server', ['css','js','fileinclude'], function() {
  // 从这个项目的根目录启动服务器
  browserSync.init({
    server: "./dist"
  });
  //  添加 browserSync.reload 到任务队列里
  // 所有的浏览器重载后任务完成。
  gulp.watch("src/**/*.{less,css}", ['css']);
  gulp.watch("src/**/*.js", ['js']);
  gulp.watch("src/**/*.html", ['fileinclude']);
  //上面的fileinclude的任务里面已经有了刷新的，下面的代码在用就会重用 出现刷新中断的问题
  // gulp.watch("**/*.html").on('change', reload);
});


gulp.task('default',['server']); //定义默认任务 elseTask为其他任务，该示例没有定义elseTask任务
 //定义默认任务 elseTask为其他任务，该示例没有定义elseTask任务
// gulp.task('norefrash',['jsmin','cssmin','imagemin']); //不会监视变化,也不刷新
// gulp.task('default',['outputCssmin']); //定义默认任务 elseTask为其他任务，该示例没有定义elseTask任务

//gulp.task(name[, deps], fn) 定义任务  name：任务名称 deps：依赖任务名称 fn：回调函数
//gulp.src(globs[, options]) 执行任务处理的文件  globs：处理的文件路径(字符串或者字符串数组)
//gulp.dest(path[, options]) 处理完后文件生成路径
