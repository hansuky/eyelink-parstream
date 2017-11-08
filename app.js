var cors = require('cors');
var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');
var multer  = require('multer');
var pug = require('pug');

var config = require('./config/config.json');
console.log('config : %j', config);
global.config = config;

var intro = require('./routes/intro');
var login = require('./routes/nodeLogin');
var dashboard = require('./routes/nodeDashboard' + global.config.pcode);
var reports = require('./routes/nodeReport' + global.config.pcode);
var analysis = require('./routes/nodeAnalysis' + global.config.pcode);
var initapps = require('./routes/initApp');
var socketapp = require('./routes/socketApp');
var node = require('./routes/nodeCon');
var management = require('./routes/nodeManagement' + global.config.pcode);
var sample = require('./routes/nodeSample');
var simulator = require('./routes/nodeSimulator');
// for ES Test
var dashboardes = require('./routes/nodeDashboard' + global.config.pcode);

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(cors());
// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));
app.use(multer());
app.use(cookieParser());
app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: true,
}));
app.use(express.static(path.join(__dirname, 'public')));

// app.use('/', intro);
app.use('/', login);
app.use('/dashboard', dashboard);
app.use('/reports', reports);
app.use('/analysis', analysis);
app.use('/intro', intro);
app.use('/node', node);
app.use('/management', management);
app.use('/sample', sample);
app.use('/simulator', simulator);
app.use('/dashboardes', dashboardes);
app.use('/socketapp', socketapp);

global._rawDataByDay = {};
// dbquery.xml 파일 내용을 loading
initapps.loadQuery(function() {
  // 지정된 기간의 Raw Data를 서버 시작시 메모리에 Loading
  if (config.loaddataonstartup.active === true)
    initapps.loadData(function(in_params) {});
});

// Client로 Data를 Push 하기위한 Socket 초기화.
socketapp.initSocket(app, function() {});

// catch 404 and forward to error handler
// app.use(function(req, res, next) {
//   var err = new Error('Not Found');
//   err.status = 404;
//   next(err);
// });

// error handlers

// development error handler
// will print stacktrace
// if (app.get('env') === 'development') {
//   app.use(function(err, req, res, next) {
//     res.status(err.status || 500);
//     res.render('error', {
//       message: err.message,
//       error: err
//     });
//   });
// }

// production error handler
// no stacktraces leaked to user
// app.use(function(err, req, res, next) {
//   res.status(err.status || 500);
//   res.render('error', {
//     message: err.message,
//     error: {}
//   });
// });


module.exports = app;
