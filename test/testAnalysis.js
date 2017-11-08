var should = require('should');
var assert = require("assert")
var request = require("supertest");
var expect = require("chai").expect;
// var app = require("../app.js");
// var svr = "http://localhost:5223";
var svr = "http://m2utech.eastus.cloudapp.azure.com:5223";
var http = require('http');
var fs = require('fs');

describe("Analysis -> ", function(){
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

  describe("Clustering", function() {
    // it('login', login());

    it('Post로 결과 저장', function(done) {
      var datas = {tb_da_clustering_master: "node1:node2:node3",
                    tb_da_clustering_detail: "node4:node5"};
      request(svr)
        .post("/analysis/restapi/insertClusterRawData")
        .send(datas)
        .expect('Content-Type', /json/)
        .expect(200, function(err, res) {
          if (err) return done(err);
          // console.log(res.body.rtnCode.code);
          res.body.rtnCode.code.should.be.equal('0000');
          done();
        });
    });
    it('clustering_data.log 파일을 읽어서 Post로 결과 저장', function(done) {
      fs.readFile('./clustering_data.json', 'utf8', function(err, datas) {
        // the data is passed to the callback in the second argument


        console.log(datas);
        var datas = JSON.parse(datas);

        console.log(datas);
        console.log(datas.tb_da_clustering_master);
        console.log(datas.tb_da_clustering_master[0].da_time);
        console.log(datas.tb_da_clustering_detail[0].event_time);
        console.log(datas.tb_da_clustering_detail[1].event_time);
        request(svr)
          .post("/analysis/restapi/insertClusterRawData")
          .send(datas)
          .expect('Content-Type', /json/)
          .expect(200, function(err, res) {
            if (err) return done(err);
            // console.log(res.body.rtnCode.code);
            res.body.rtnCode.code.should.be.equal('0000');
            done();
          });
      });

    });
  });

  describe("Analysis ", function() {
    // svr = "http://m2utech.eastus.cloudapp.azure.com:5223";

    it.only('DA 서버에 분석 실행', function(done) {
      var datas = {"startDate": "2017-01-01",
                  "endDate" : "2017-01-02",
                  "interval" : "15"};
      console.log(datas);
      // var datas = JSON.parse(datas);
      request(svr)
        .post("/analysis/restapi/runAnalysis")
        .send(datas)
        .expect('Content-Type', /json/)
        .expect(200, function(err, res) {
          if (err) return done(err);
          // console.log(res.body.rtnCode.code);
          res.body.rtnCode.code.should.be.equal('0000');
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
