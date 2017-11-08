// var should = require('should');
// var assert = require("assert")
var request = require("supertest");
var expect = require("chai").expect;
var QueryProvider = require('../../routes/dao/elasticsearch/nodelib-es').QueryProvider;
var queryProvider = new QueryProvider();
var svr = "http://localhost:5223";
// var svr = "http://m2utech.eastus.cloudapp.azure.com:5223";

global.config = require('../../config/config.json');
global.config.fetchData.database = 'elasticsearch';
global.config.fetchData.method = 'nodelib-es';
global.config.loaddataonstartup.active = true;
var initapps = require('../../routes/initApp');
var queryParser = require('../../routes/dao/queryParser');

describe('Dashboard, ElasticSearch -> ', function () {
  before(function() {
    initapps.loadQuery(function() {});
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


  describe("Defined Query by QueryProvider -> ", function() {
    var in_data = {};
    it('TrendData 조회 ', function(done) {
      queryProvider.selectSingleQueryByID2("dashboard", "selectEventRawData", in_data, function(err, out_data, params) {
        console.log(out_data.length);
        if (err) return done(err);

        expect(out_data.length).be.above(0);
        done();
      });
    });
  });

  describe("Defined Query by Request -> ", function() {
    it('발생 이벤트 TrendData 조회', function(done) {
      var datas = {todate:'2017-01-12', yesterdate:'2017-01-11'};
      request(svr)
        .get("/dashboardes/restapi/getDashboardRawData")
        // .send(datas)
        .expect('Content-Type', /json/)
        .expect(200, function(err, res) {
          if (err) return done(err);
          // console.log(res.body);
          // console.log(res.body.rtnCode.code);
          // res.body.rtnCode.code.should.be.equal('0000');
          console.log('testDashboard -> rtnData : ', res.body.rtnData);
          expect(res.body.rtnCode.code).be.equals('0000');
          expect(res.body.rtnData[0]._source.node_id).be.equals('0001.0000001E');
          done();
        });
    });

  })
});
