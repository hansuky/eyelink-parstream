var CONSTS = require('./consts');
var Utils = require('./util');
var express = require('express');
var router = express.Router();

var QueryProvider = require('./dao/' + global.config.fetchData.database + '/'+ config.fetchData.method).QueryProvider;
var queryProvider = new QueryProvider();

router.get('/restapi/getNodeEventDataList', function(req, res, next) {
  // console.log(_rawDataByDay);
  var in_data = {};
  queryProvider.selectSingleQueryByID("simulator", "selectNodeEventDataList", in_data, function(err, out_data, params) {
    var rtnCode = CONSTS.getErrData('0000');
    if (out_data[0] === null) {
      rtnCode = CONSTS.getErrData('0001');
    }
    var users = out_data[0];
    console.log(mainmenu);
    res.render('./management/user_list', { title: global.config.productname, mainmenu:mainmenu, users:users });
  });
});

// tb_node_raw 신규 등록
router.post('/restapi/addNodeEventData', function(req, res) {
  console.log('/restapi/addNodeEventData');
  var raw_data = req.body;
  var in_data = {
    NODE_IDE : raw_data.node_id,
    EVENT_TYPE : raw_data.event_type,
    VOLTAGE : raw_data.voltage,
    AMPERE : raw_data.ampere,
    POWER_FACTOR : raw_data.power_factor,
    ACTIVE_POWER : raw_data.active_power,
    REACTIVE_POWER : raw_data.reactive_power,
    APPARENT_POWER : raw_data.apparent_power,
    AMOUNT_ACTIVE_POWER : raw_data.amount_active_power,
    ALS_LEVEL : raw_data.als_level,
    DIMMING_LEVEL : raw_data.dimming_level,
    VIBRATION_X : raw_data.vibration_x,
    VIBRATION_Y : raw_data.vibration_y,
    VIBRATION_Z : raw_data.vibration_z,
    VIBARTION_MAX : raw_data.vibration_max,
    NOISE_ORIGIN_DECIVEL : raw_data.noise_origin_decibel,
    NOISE_ORIGIN_FREQUENCY : raw_data.noise_origin_frequency,
    NOISE_DECIBEL : raw_data.noise_decibel,
    NOISE_FREQUENCY : raw_data.noise_frequency,
    GPS_LONGITUDE : raw_data.gps_longitude,
    GPS_LATITUDE : raw_data.gps_latitude,
    GPS_ALTITUDE : raw_data.gps_altitude,
    GPS_SATELLITE_COUNT : raw_data.gps_satellite_count,
    STATUS_ALS : raw_data.status_als,
    STATUS_GPS : raw_data.status_gps,
    STATUS_NOISE : raw_data.status_noise,
    STATUS_VIBRATION : raw_data.status_vibration,
    STATUS_POWER_METER : raw_data.status_power_meter,
    STATUS_EMERGENCY_LED_ACTIVE : raw_data.status_emergency_led_active,
    STATUS_SELF_DIAGNOSTICS_LED_ACTIVE : raw_data.status_self_diagnostics_led_active,
    STATUS_ACTIVE_MODE : raw_data.status_active_mode,
    STATUS_LED_ON_OFF_TYPE : raw_data.status_led_on_off_type,
    REBOOT_TIME : raw_data.reboot_time,
    EVENT_REMAIN : raw_data.event_remain,
    FAILFIREMWAREUPDATE : raw_data.failfirmwareupdate
  };
  queryProvider.insertQueryByID("simulator", "insertNodeEventData", in_data, function(err, out_data) {
    var rtnCode = CONSTS.getErrData(out_data);
    if (err) { console.log(err);
      rtnCode = CONSTS.getErrData(out_data);
      console.log(rtnCode);
    }
    res.json({rtnCode: rtnCode});
  });
});

module.exports = router;