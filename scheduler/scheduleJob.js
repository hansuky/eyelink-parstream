var CronJob = require('cron').CronJob;
require('date-utils');
var config = require('../config/config.json');
console.log('config : %j', config);
global.config = config;

var schedule = require('./schedulerApplicationInfo');

new CronJob(global.config.schedule.application_info, function() {
  var d = new Date();
  console.log('+++++++++++++++++++++++++++++++++++++++++++');
  console.log('    time : %s', d.toFormat('YYYY-MM-DD HH24:MI:SS'))
  console.log('    scheduler application_info');
  schedule.process();
}, true, true, 'Asia/Seoul');

// new CronJob(simulconfig.schedule.event, function() {
//   console.log('+++++++++++++++++++++++++++++++++++++++++++');
//   console.log('    simulate Event Data');
//   ds.process('tb_node_raw_event_simul.csv', true);
// }, true, true, 'Asia/Seoul');
