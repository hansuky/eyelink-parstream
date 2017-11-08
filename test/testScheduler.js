// var should = require('should');
// var assert = require("assert")
var request = require("supertest");
var expect = require("chai").expect;
var QueryProvider = require('../routes/dao/elasticsearch/nodelib-es').QueryProvider;
var queryProvider = new QueryProvider();
var scheduler = require("../scheduler/schedulerApplicationInfo");

describe('Scheduler, ', function () {
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

  describe("check ElasticSearch Server", function() {
    it('test Ping', function (done) {
      queryProvider.ping(function(isAlive) {
        expect(isAlive).be.equal(true);
        done();
      })

    });

  })

  describe("test process()", function() {
    // this.timeout(5000);
    it('search all index list', function (done) {
      scheduler.process(function() {
        done();
      });
    });
  });

});
