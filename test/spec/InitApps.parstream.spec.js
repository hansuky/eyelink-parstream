var should = require('should');
var assert = require("assert")
var request = require("supertest");
var expect = require("chai").expect;
var svr = "http://localhost:5223";
var http = require('http');
var config = require('../../config/config.json');
global.config = config;
global._rawDataByDay = {};
var initapps = require('../../routes/initApp');
var queryParser = require('../../routes/dao/parstream/queryParser');
require('date-utils');
console.log('config : %j', config);

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

  describe("ParStream -> ", function() {
    // 서버 시작시 초기 7일간의 데이터 적재 모듈 테스트
    it('LoadQuery : 서버 시작시 Query Loading 테스트 ', function(done) {
      global.config.fetchData = {
        database : 'parstream',
        method : 'nodelib-db'
      };
      initapps.loadQuery(function() {
        var query1 = '';
        console.log('testInitApps -> global.query : %s', global.query.queryList.test[0].query[0].$.id);

        (global.query.queryList.test.length).should.be.above(0);
        query1 = queryParser.getQuery('test', 'test01');
        query1.should.be.equal('SELECT count(*) as cnt FROM tb_node_raw');
        query1 = queryParser.getQuery('test', 'test02');
        query1.should.be.equal('SELECT event_time as cnt FROM tb_node_raw');
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
