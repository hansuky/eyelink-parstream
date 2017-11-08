var should = require('should');
var CONSTS = require('../routes/consts');
var Utils = require('../routes/util');

describe("Util.js", function(){
  var cookie;

  before(function() {

  });

  after(function() {

  });

  beforeEach(function(){

    // simulate async call w/ setTimeout
    // setTimeout(function(){
    //   foo = true;
    // }, 50);

  });

  afterEach(function() {

  });

  describe("SQL Query -> ", function() {
    // it('login', login());

    it('Parstream Query내 파라메타 변환 처리(replaceSql)', function(done) {
      var sql = "SELECT * FROM A WHERE DATE >= #DATE# AND ID = #ID# AND NUM = #NUM#";
      // console.log("sql : %s ", sql);

      var params = {ID : 'AAAA', DATE: '2016-12-12', NUM: 5};

      sql = Utils.replaceSql(sql, params)
      // console.log(sql);
      sql.should.be.equal("SELECT * FROM A WHERE DATE >= '2016-12-12' AND ID = 'AAAA' AND NUM = 5");
      done();
    })

    it('Parstream Query내 "in" 구문 배 파라메타 변환 처리(replaceSql)', function(done) {
      var sql = "SELECT * FROM A WHERE node_id in (##node_id##)";
      // console.log("sql : %s ", sql);

      var params = {node_id : ['AAAA', 'BBBB', 'CCCCC'],
            node_type : [10, 20],
            node_name : "aaa",
            node_name2 : 10};

      // console.log(params.node_id.length);
      sql = Utils.replaceSql(sql, params)
      // console.log(sql);
      sql.should.be.equal("SELECT * FROM A WHERE node_id in ('AAAA','BBBB','CCCCC')");
      done();
    })

    it('ES Query내 파라메타 변환 처리(replaceSql2)', function(done) {
      var sql = '{ "index" : "corecode-2017-05", "type" : "corecode", "body" : {  "size" : 9999, '
                      + ' "sort" : { "event_time" : { "order" : "asc" }},'
                      + ' "_source" : ["node_id", "event_time", "ampere", "voltage", "active_power", "power_factor", "event_type"],'
                      + ' "query" : { "bool" : { "must" : [  { "match_all": {} }  ], '
                      + ' "filter" : [ { "term" : { "event_type": "1" } }, { "terms" : { "node_id": [##NODE##] } }, '
                        + ' {"range" : { "event_time" : { "gte" : #START#,      "lt" :  #END# } } } ] } } } }';
      // console.log("sql : %s ", sql);

      var params = {
              START : "2016-12-29T16:15:41.000Z",
              END: "2016-12-30T16:15:41.000Z",
              NODE: ["0001.00000013", "0002.0000002E", "0001.00000011", "0002.0000003F"]
          };

      sql = Utils.replaceSql2(sql, params)
      console.log(sql);
      sql.should.be.equal('{ "index" : "corecode-2017-05", "type" : "corecode", "body" : {  "size" : 9999, '
                      + ' "sort" : { "event_time" : { "order" : "asc" }},'
                      + ' "_source" : ["node_id", "event_time", "ampere", "voltage", "active_power", "power_factor", "event_type"],'
                      + ' "query" : { "bool" : { "must" : [  { "match_all": {} }  ], '
                      + ' "filter" : [ { "term" : { "event_type": "1" } }, { "terms" : { "node_id": ["0001.00000013","0002.0000002E","0001.00000011","0002.0000003F"] } }, '
                        + ' {"range" : { "event_time" : { "gte" : "2016-12-29T16:15:41.000Z",      "lt" :  "2016-12-30T16:15:41.000Z" } } } ] } } } }');
      done();
    })

    it('ES Query내 파라메타 변환 처리(replaceSql2-Json)', function(done) {
      var sql = '{ "index" : [##index##],  "type"  : "access", "body" : { "size" : 0, "aggs" : { "group_by_x" : { '
             + ' "range": { "field": "@timestamp", "ranges":  [#range#], "keyed" : true }, "aggs": { "by_type" : { '
             + ' "range": { "field": "responsetime", "ranges" : [ { "key" : "s1", "to" : "1000" }, '
             + ' { "key" : "s3", "from" : "1000", "to" : "3000" }, { "key" : "s5", "from" : "3000", "to" : "5000" }, '
             + ' { "key" : "slow", "from" : "5000" } ], "keyed" : true }, "aggs" : { "by_response" : { '
             + ' "range" : { "field": "response", "ranges" : [{ "key" : "cnt", "to" : 400 }] } } } }, '
             + ' "aggs" : { "range" : { "field": "response", "ranges" : [{ "key" : "error", "from" : 400 }] } } } } } } } ';

      // console.log("sql : %s ", sql);

      var params = {
          index : ["filebeat_jira_access-2017.06.*", "filebeat_jira_access-2017.07.*"],
          range : '{"key" : "2017-06", "from" : "2017-06-01T00:00:00.000Z", "to" : "2017-07-01T00:00:00.000Z" },{"key" : "2017-07", "from" : "2017-07-01T00:00:00.000Z", "to" : "2017-08-01T00:00:00.000Z" }'
        };
        console.log(params);
      sql = Utils.replaceSql2(sql, params)
      console.log(sql);
      sql.should.be.equal('{ "index" : ["filebeat_jira_access-2017.06.*","filebeat_jira_access-2017.07.*"],  "type"  : "access", "body" : { "size" : 0, "aggs" : { "group_by_x" : { '
             + ' "range": { "field": "@timestamp", "ranges":  [{"key" : "2017-06", "from" : "2017-06-01T00:00:00.000Z", "to" : "2017-07-01T00:00:00.000Z" },{"key" : "2017-07", "from" : "2017-07-01T00:00:00.000Z", "to" : "2017-08-01T00:00:00.000Z" }], "keyed" : true }, "aggs": { "by_type" : { '
             + ' "range": { "field": "responsetime", "ranges" : [ { "key" : "s1", "to" : "1000" }, '
             + ' { "key" : "s3", "from" : "1000", "to" : "3000" }, { "key" : "s5", "from" : "3000", "to" : "5000" }, '
             + ' { "key" : "slow", "from" : "5000" } ], "keyed" : true }, "aggs" : { "by_response" : { '
             + ' "range" : { "field": "response", "ranges" : [{ "key" : "cnt", "to" : 400 }] } } } }, '
             + ' "aggs" : { "range" : { "field": "response", "ranges" : [{ "key" : "error", "from" : 400 }] } } } } } } } ');
      done();


    })
  });


  describe("Merge Data -> ", function() {
    // it('login', login());

    it('2 Data가 존재하는 경우', function(done) {
      global._rawDataByDay = {
        '2016-12-11' : [{event_type:1, als_level:2}, {event_type:12, als_level:2}],
        '2016-12-10' : [{event_type:12, als_level:2}]};
      var out_data = [[]];
      out_data[0] = null;
      console.log('typeof array is not undefined : %s', (typeof out_data[0] !== 'undefined'));
      console.log('array is null: %s', (out_data[0] === null));
      out_data = Utils.mergeLoadedData(out_data);
      console.log(out_data);
      out_data[0].length.should.be.equal(3);
      out_data = [[{event_type:21, als_level:2},{event_type:22, als_level:2},{event_type:23, als_level:2}]];
      console.log(out_data);
      Utils.mergeLoadedData(out_data);
      console.log(out_data[0]);
      out_data[0].length.should.be.equal(6);
      done();
    })
    it('Query로 조회한 데이터가 존재하지 않는 경우', function(done) {
      global._rawDataByDay = {
        '2016-12-11' : [{event_type:1, als_level:2}, {event_type:12, als_level:2}],
        '2016-12-10' : [{event_type:12, als_level:2}]};
      var out_data = [undefined];
      // out_data[0] = null;
      out_data = Utils.mergeLoadedData(out_data);
      console.log(out_data);
      out_data[0].length.should.be.equal(3);
      out_data = [[{event_type:21, als_level:2},{event_type:22, als_level:2},{event_type:23, als_level:2}]];
      console.log(out_data);
      Utils.mergeLoadedData(out_data);
      console.log(out_data[0]);
      out_data[0].length.should.be.equal(6);
      done();
    })
  });

  describe("Random -> ", function() {
    // it('login', login());

    it('난수 발생', function(done) {
      var num = Utils.generateRandom(0, 100);
      console.log(num);
      should.exist(num);
      done();
    })

    it('Hex to Binary', function(done) {
      var num = hex2bin('1000');
      console.log(num);
      should.exist(num);
      done();
    })

    it('Hex to Binary2', function(done) {
      var num = 'b637eb9146e84cb79f6d981ac9463de1'.hex2bin();
      console.log(num);
      console.log(num.bin2hex());
      should.exist(num);
      done();
    })
  });

  describe.only("오늘 날짜 조회 (Utils.getToday()) 테스트 -> ", function() {
    var fmt1 = CONSTS.DATEFORMAT.DATE;
    var fmt2 = CONSTS.DATEFORMAT.DATETIME;
    var fmt3 =  CONSTS.DATEFORMAT.DATETIMEMILLI;
    var fmt4 = "YYYY.MM.DD";
    it('오늘날짜 조회', function(done) {
      var desc = '오늘날짜 조회';
      var curDate = Utils.getToday();
      console.log('%s - 포맷 미지정 : %s', desc, curDate);
      curDate = Utils.getToday(fmt2);
      console.log('%s : format(%s), %s', desc, fmt2, curDate);
      curDate = Utils.getToday(fmt3);
      console.log('%s : format(%s), %s', desc, fmt3, curDate);
      curDate = Utils.getToday(fmt4);
      console.log('%s : format(%s), %s', desc, fmt4, curDate);
      should.exist(curDate);
      done();
    })

    it('오늘날짜를 UTC 시간(-9시간)으로 조회', function(done) {
      var desc = '오늘날짜를 UTC 시간(-9시간)으로 조회';
      var curDate = Utils.getToday(fmt1, 'Y');
      console.log('%s : format(%s), %s', desc, fmt1, curDate);
      curDate = Utils.getToday(fmt2, 'Y');
      console.log('%s : format(%s), %s', desc, fmt2, curDate);
      curDate = Utils.getToday(fmt3, 'Y');
      console.log('%s : format(%s), %s', desc, fmt2, curDate);
      should.exist(curDate);
      done();
    })

    it('오늘날짜를 LocalTime "T" 유형으로 조회', function(done) {
      var desc = '오늘날짜를 LocalTime "T" 유형으로 조회';
      var curDate = Utils.getToday(fmt1, 'N', 'Y');
      console.log('%s : format(%s), %s', desc, fmt1, curDate);
      curDate = Utils.getToday(fmt2, 'N', 'Y');
      console.log('%s : format(%s), %s', desc, fmt2, curDate);
      curDate = Utils.getToday(fmt3, 'N', 'Y');
      console.log('%s : format(%s), %s', desc, fmt3, curDate);
      should.exist(curDate);
      done();
    })

    it('오늘날짜를 UTC 시간(-9시간) "T" 유형으로 조회', function(done) {
      var desc = '오늘날짜를 UTC 시간(-9시간) "T" 유형으로 조회';
      var curDate = Utils.getToday(fmt1, 'Y', 'Y');
      console.log('%s : format(%s), %s', desc, fmt1, curDate);
      curDate = Utils.getToday(fmt2, 'Y', 'Y');
      console.log('%s : format(%s), %s', desc, fmt2, curDate);
      curDate = Utils.getToday(fmt3, 'Y', 'Y');
      console.log('%s : format(%s), %s', desc, fmt3, curDate);
      should.exist(curDate);
      done();
    })
  });

  describe("날짜 변환 조회 (Utils.getDateLocal2UTC()) LocalTime -> UTC로 변환 테스트", function() {
    var testLocalDate = '2017-10-18 08:26:40';
    var fmt1 = CONSTS.DATEFORMAT.DATE;
    var fmt2 = CONSTS.DATEFORMAT.DATETIME;
    var fmt3 =  CONSTS.DATEFORMAT.DATETIMEMILLI;


    it('지정날짜를 UTC 시간(-9시간)으로 조회', function(done) {
      var testLocalDate = '2017-10-18 08:26:40';
      var desc = '지정날짜를 UTC 시간(-9시간)으로 조회';
      var curDate = Utils.getDateLocal2UTC(testLocalDate, fmt1);
      console.log('%s(%s) : format(%s), %s', desc, testLocalDate, fmt1, curDate);
      curDate = Utils.getDateLocal2UTC(testLocalDate, fmt2);
      console.log('%s(%s) : format(%s), %s', desc, testLocalDate, fmt2, curDate);
      testLocalDate = '2017-10-18T08:26:40';
      curDate = Utils.getDateLocal2UTC(testLocalDate, fmt2);
      console.log('%s(%s) : format(%s), %s', desc, testLocalDate, fmt2, curDate);
      curDate.should.be.equal('2017-10-17 23:26:40Z');
      done();
    })

    it('지정날짜를 UTC 시간(-9시간) "T" 유형으로 조회', function(done) {
      var testLocalDate = '2017-10-18 08:26:40';
      var desc = '지정날짜를 UTC 시간(-9시간) "T" 유형으로 조회';
      var curDate = Utils.getDateLocal2UTC(testLocalDate, fmt1, 'Y');
      console.log('%s(%s) : format(%s), %s', desc, testLocalDate, fmt1, curDate);
      curDate = Utils.getDateLocal2UTC(testLocalDate, fmt2, 'Y');
      console.log('%s(%s) : format(%s), %s', desc, testLocalDate, fmt2, curDate);
      curDate = Utils.getDateLocal2UTC(testLocalDate, fmt3, 'Y');
      console.log('%s(%s) : format(%s), %s', desc, testLocalDate, fmt2, curDate);
      curDate.should.be.equal('2017-10-17T23:26:40.000Z');
      done();
    })
  });

  describe("날짜 변환 조회 (Utils.getDateUTC2Local()) UTC Time -> LocalTime 변환 테스트", function() {
    var testUTCDate = '2017-10-24T03:48:53Z';
    var fmt1 = CONSTS.DATEFORMAT.DATE;
    var fmt2 = CONSTS.DATEFORMAT.DATETIME;
    var fmt3 = CONSTS.DATEFORMAT.DATETIMEMILLI;

    it('지정 UTC 날짜를 Local 시간(+9시간)으로 조회', function(done) {
      var desc = '지정 UTC 날짜를 Local 시간(+9시간)으로 조회';
      var curDate = Utils.getDateUTC2Local(testUTCDate, fmt1);
      console.log('%s(%s) : format(%s), %s', desc, testUTCDate, fmt1, curDate);
      curDate.should.be.equal('2017-10-24');
      curDate = Utils.getDateUTC2Local(testUTCDate, fmt2);
      console.log('%s(%s) : format(%s), %s', desc, testUTCDate, fmt2, curDate);
      curDate.should.be.equal('2017-10-24 12:48:53');
      curDate = Utils.getDateUTC2Local(testUTCDate, fmt3);
      console.log('%s(%s) : format(%s), %s', desc, testUTCDate, fmt2, curDate);
      curDate.should.be.equal('2017-10-24 12:48:53.000');
      done();
    })

    it('지정 UTC 날짜를 Local 시간(+9시간) "T" 유형으로 조회', function(done) {
      var testUTCDate = '2017-10-17 22:26:40';
      var desc = '지정 UTC 날짜를 Local 시간(+9시간) ISO 유형으로 조회';
      var curDate = Utils.getDateUTC2Local(testUTCDate, fmt1, 'Y');
      console.log('%s(%s) : format(%s), %s', desc, testUTCDate, fmt1, curDate);
      curDate = Utils.getDateUTC2Local(testUTCDate, fmt2, 'Y');
      console.log('%s(%s) : format(%s), %s', desc, testUTCDate, fmt2, curDate);
      curDate = Utils.getDateUTC2Local(testUTCDate, fmt3, 'Y');
      console.log('%s(%s) : format(%s), %s', desc, testUTCDate, fmt3, curDate);
      curDate.should.be.equal('2017-10-18T07:26:40.000');
      done();
    })
  });

  describe("날짜 차이 계산 (Utils.getDate()) 테스트", function() {
    var testDate = '2017-10-17 22:26:40';
    var fmt1 = CONSTS.DATEFORMAT.DATE;
    var fmt2 = CONSTS.DATEFORMAT.DATETIME;
    var fmt3 = CONSTS.DATEFORMAT.DATETIMEMILLI;

    it('지정날짜에서 가감 결과 조회', function(done) {
      var curDate = Utils.getDate(testDate, fmt1, -2, 0, 0, 0);
      console.log('지정날짜(%s)에서 -2일 결과 조회 : format(%s), %s', testDate, fmt1, curDate);
      curDate.should.be.equal('2017-10-15');

      var curDate = Utils.getDate(testDate, fmt2, -2, -1, -10, -15);
      console.log('지정날짜(%s)에서 -2일 결과 조회 : format(%s), %s', testDate, fmt2, curDate);
      curDate.should.be.equal('2017-10-15 21:16:25');

      var curDate = Utils.getDate(testDate, fmt2, 2, 1, 10, 15);
      console.log('지정날짜(%s)에서 +2일 결과 조회 : format(%s), %s', testDate, fmt2, curDate);
      curDate.should.be.equal('2017-10-19 23:36:55');
      done();
    })

  });
});


function hex2bin(hex)
{
    var bytes = [], str;
    for(var i=0; i< hex.length-1; i+=2)
        bytes.push(parseInt(hex.substr(i, 2), 16));
    return String.fromCharCode.apply(String, bytes);
}

String.prototype.hex2bin = function ()
{
  var i = 0, l = this.length - 1, bytes = []

  for (i; i < l; i += 2)
  {
    bytes.push(parseInt(this.substr(i, 2), 16))
  }

  return String.fromCharCode.apply(String, bytes)

}

String.prototype.bin2hex = function ()
{

  var i = 0, l = this.length, chr, hex = ''

  for (i; i < l; ++i)
  {

    chr = this.charCodeAt(i).toString(16)

    hex += chr.length < 2 ? '0' + chr : chr

  }

  return hex

}

// alert('b637eb9146e84cb79f6d981ac9463de1'.hex2bin().bin2hex())

