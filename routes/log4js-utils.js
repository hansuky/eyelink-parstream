var log4js = require('log4js');

log4js.configure('./config/log4js_conf.json');

var jsfile = '';
Logger = function(jsfile) {
  this.jsfile = jsfile
}

var logger = log4js.getLogger('eyelink');
// FIXME, logs 폴더가 존재하지 않을 경우 작성하도록 로직 보완 필요.
// exports.logger = function(js){
//     var logger = log4js.getLogger('eyelink');//가져오기 설정 파일에 category normal 있는 appender 위해
//     // logger.setLevel('DEBUG');
//     return logger;
// }

// log 기록 파일명을 추가하기 위해서 별도로 debug, info, error, fetal 추가함.
Logger.prototype.debug = function(message) {
  logger.debug('(' + this.jsfile + ') ' + JSON.stringify(message));
}

Logger.prototype.info = function(message) {
  // var logger = log4js.getLogger('eyelink');
  logger.info('(' + this.jsfile + ') ' + JSON.stringify(message));
}

Logger.prototype.error = function(message) {
  // var logger = log4js.getLogger('eyelink');
  logger.error('(' + this.jsfile + ') ' + JSON.stringify(message));
}

Logger.prototype.fetal = function(message) {
  // var logger = log4js.getLogger('eyelink');
  logger.fetal('(' + this.jsfile + ') ' + JSON.stringify(message));
}

exports.Logger = Logger;