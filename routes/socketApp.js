var Logger = require('./log4js-utils').Logger;
var logger = new Logger('socketApp');
var socketio = require('socket.io');
var CONSTS = require('./consts');
var express = require('express');
var router = express.Router();
var QueryProvider = require('./dao/' + global.config.fetchData.database + '/'+ config.fetchData.method).QueryProvider;
var queryProvider = new QueryProvider();
var s_io;

function initSocket(app, callback) {
  logger.info('start initSocket()');
  app.io = socketio();
  s_io = app.io;
  s_io.sockets.on('connection', function(socket) {
    logger.debug('connection open');

    emitAlarmCount();

    // Dashboard Alarm에 Event List 출력을 위해서 데이터를 조회해서 Client로 전송한다.
    socket.on('getEventListForAlarm', function(data) {
      logger.debug(' getEventListForAlarm : data : %s', data);
      // DB Query
      var in_data = {last_pos:data};
      queryProvider.selectSingleQueryByID("selectEventListForAlarm", in_data, function(err, out_data, params) {
        logger.debug('getEventListForAlarm -> out_data : %j', out_data[0]);
        var rtnCode = CONSTS.getErrData('0000');
        if (out_data == null) {
          rtnCode = CONSTS.getErrData('0001');
        } else {
        }
        s_io.sockets.emit('sendEventListForAlarm', out_data[0]);
      });
    });

    // recevie Alarm Data from Agent, Data Analytics
    socket.on('receiveAlarmData', function(data) {
      logger.debug('receiveAlarmData Sucess : data ' + JSON.stringify(data));
      saveAlarmData(data);
    });

    // socket test module
    socket.on('receiveSocketEventTest', function(data) {
      logger.debug('receiveSocketEventTest Sucess : data ', JSON.stringify(data));
      var out_data = {code : '0000', message : 'SUCCESS'};
      s_io.sockets.emit('sendEventSocketEventTest', out_data);
    });
  });

}

function saveAlarmData(data, cb) {
  var management = require('./nodeManagement' + global.config.pcode);
  management.saveAlarmData(data, function(odata) {
    logger.debug(odata);
    var out_data = {
      code : odata.rtnCode.code,
      message : odata.rtnCode.message};
    logger.debug('saveAlarmData : data ' + JSON.stringify(out_data));
    emitAlarmCount();
  });
}

function emitAlarmCount() {
  var management = require('./nodeManagement' + global.config.pcode);
  management.selectAlarmList(function(data) {
    // count+1 => saveAlarmData에서 저장후 ES refresh 되기전 조회가 되므로 count가 반영되지 않음.
    var out_data = {
      code : '0000',
      message : 'SUCCESS',
      count : data.rtnCount+1};
    logger.debug('emitAlarmCount : data ' + JSON.stringify(out_data));
    s_io.sockets.emit('returnAlarmData', out_data);
  });
}

router.post('/restapi/Alarm/:id', function(req, res, next) {
  logger.debug('start /restapi/Alarm/' + req.params.id);
  emitAlarmCount();
  res.json({code: '0000', message : 'SUCCESS'});
});

module.exports = router;
module.exports.initSocket = initSocket;
