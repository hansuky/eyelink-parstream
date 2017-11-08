var should = require('should');
var assert = require("assert")
var request = require("supertest");
var expect = require("chai").expect;
var config = require('../../config/config.json');
global.config = config;
global._rawDataByDay = {};
require('date-utils');

// config.json 파일의 내용에서 database 내용을 변경한다.
global.config.fetchData.database = 'elasticsearch'
global.config.fetchData.method = 'nodelib-es'

console.log('config : %j', global.config);

describe("InitApp", function(){
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

  describe("ElasticSearch -> ", function() {
    var initapps = require('../../routes/initApp');
    var queryParser = require('../../routes/dao//queryParser');

    // 서버 시작시 초기 7일간의 데이터 적재 모듈 테스트
    it('LoadQuery : 서버 시작시 Query Loading 테스트 ', function(done) {
      initapps.loadQuery(function() {
        var query1 = '';
        console.log('testInitApps -> global.query : %s', global.query.queryList.test[0].query[0].$.id);

        (global.query.queryList.test.length).should.be.above(0);
        query1 = queryParser.getQuery('test', 'test01');
        query1.should.be.equal('{q : \'aaa\'}');
        query1 = queryParser.getQuery('test', 'test02');
        query1.should.be.equal('{q : \'bbb\'}');
        done();
      });
    });

    it('LoadData : 서버 시작시 초기 7일간의 데이터 메모리 적재 모듈 테스트 ', function(done) {
      _rawDataByDay = {};
      initapps.loadData(function(params) {
        var sDate = params['LOAD_DATE'];
        // console.log('testInitApps -> date : %s', sDate);
        // console.log('testInitApps -> flag : %s', params.FLAG);
        // console.log('testInitApps -> length : ' + _rawDataByDay[sDate].length);
        (_rawDataByDay[sDate].length).should.be.above(-1);
        if (params.FLAG === 'C')
          done();
      });
    });
  });
});
