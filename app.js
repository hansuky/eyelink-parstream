var cors = require('cors');
var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var morgan = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');
var multer  = require('multer');
var pug = require('pug');

// Logging 처리, 다른 파일에서도 사용하기 위해서 global 변수에 등록.
global.log4js = require('log4js');
log4js.configure('./config/log4js_conf.json');

global.logger = global.log4js.getLogger('app');
global.config = require('./config/config.json');
// global.config = config;


// npm start 시작시 입력받은 pcode 값으로 global.config.pcode 값 변경.
global.config.pcode = process.argv[2];
global.config.productname = global.config.products[global.config.pcode].productName;
logger.info('config : %j', config);

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');


app.use(cors());
// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(morgan('dev'));
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

var intro = require('./routes/intro');
var login = require('./routes/nodeLogin');
var initapps = require('./routes/'+global.config.pcode+'/initApp');
var socketapp = require('./routes/socketApp');
var node = require('./routes/nodeCon');
var sample = require('./routes/nodeSample');
var simulator = require('./routes/nodeSimulator');
try {
  var dashboard = require('./routes/'+global.config.pcode+'/nodeDashboard');
  app.use('/dashboard', dashboard);
} catch(e) {}
try {
  var timeseries = require('./routes/'+global.config.pcode+'/nodeTimeseries');
  app.use('/timeseries', timeseries);
} catch(e) {}
try {
  var reports = require('./routes/'+global.config.pcode+'/nodeReport');
  app.use('/reports', reports);
} catch (e) {}
try {
  var analysis = require('./routes/'+global.config.pcode+'/nodeAnalysis');
  app.use('/analysis', analysis);
} catch (e) {}
try {
  var management = require('./routes/'+global.config.pcode+'/nodeManagement');
  app.use('/management', management);
} catch(e) {}
try {
} catch(e) {}

app.use('/', login);
app.use('/intro', intro);
app.use('/node', node);
app.use('/sample', sample);
app.use('/simulator', simulator);
app.use('/socketapp', socketapp);

global._rawDataByDay = {};
// dbquery.xml 파일 내용을 loading
initapps.loadQuery(function() {
  // Management 관련 데이터를 Caching
  initapps.loadManagementData(function() {});

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
