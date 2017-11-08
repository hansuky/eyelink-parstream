var should = require('should');
var assert = require("assert")
var request = require("supertest");
var expect = require("chai").expect;
// var app = require("../app.js");
// var svr = "http://localhost:5223";
var svr = "http://m2utech.eastus.cloudapp.azure.com:5223";
var http = require('http');

describe("Test", function(){
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

  describe("Dashboard -> ", function() {
    // it('login', login());

    it('성공 건수 조회', function(done) {
      var datas = {};
      request(svr)
        .get("/dashboard/restapi/get_successcount")
        .send(datas)
        .expect('Content-Type', /json/)
        .expect(200, function(err, res) {
          if (err) return done(err);
          // console.log(res.body.rtnCode.code);
          res.body.rtnCode.code.should.be.equal('0000');
          done();
        });
    });

    it('전력량, 금액, 이벤트 발생건수, 오류 발생건수, 전일 대비 값 조회', function(done) {
      var datas = {todate:'2017-01-12', yesterdate:'2017-01-11'};
      request(svr)
        .get("/dashboard/restapi/getDashboardSection1?todate=" + datas.todate + "&yesterdate=" + datas.yesterdate)
        // .send(datas)
        .expect('Content-Type', /json/)
        .expect(200, function(err, res) {
          if (err) return done(err);
          // console.log(res.body);
          // console.log(res.body.rtnCode.code);
          res.body.rtnCode.code.should.be.equal('0000');
          console.log('testDashboard -> rtnData : ', res.body.rtnData);
          (res.body.rtnData[0].today_event_cnt).should.be.above(0);
          done();
        });
    });

    it('날짜별 Event Trend 출력 리스트 조회 ', function(done) {
      var datas = {};
      request(svr)
        .get("/dashboard/restapi/getDashboardRawData")
        .send(datas)
        .expect('Content-Type', /json/)
        .expect(200, function(err, res) {
          if (err) return done(err);
          // console.log(res.body);
          console.log('testDashboard -> rtnData length : %s', res.body.rtnData.length);
          res.body.rtnCode.code.should.be.equal('0000');
          res.body.rtnData.length.should.be.above(0);
          done();
        });
    });

    it('조회 기간내 Event Trend 출력 리스트 조회 ', function(done) {
      var datas = {from:'2017-02-25', to:'2017-02-27'};
      request(svr)
        .get("/dashboard/restapi/getTbRawDataByPeriod?startDate=" + datas.from + "&endDate=" + datas.to)
        .send(datas)
        .expect('Content-Type', /json/)
        .expect(200, function(err, res) {
          if (err) return done(err);
          // console.log(res.body);
          console.log('testDashboard -> rtnData length : %s', res.body.rtnData.length);
          res.body.rtnCode.code.should.be.equal('0000');
          res.body.rtnData.length.should.be.above(0);
          done();
        });
    });
  });


  function login() {
    return function(done) {
      var data = {
        user_id: user_id,
        password : password,
        mem_type : mem_type
      };
      request(svr)
        .post("/member/login")
        .send(data)
        .expect(200)
        .end(function(err, res) {
          if (err) return done(err);
          res.body.code.should.be.equal('0000');
          cookie = res.headers['set-cookie'];
          done();
        });
    }
  }
});
