// var should = require('should');
// var assert = require("assert")
var request = require("supertest");
var expect = require("chai").expect;
var QueryProvider = require('../../routes/dao/elasticsearch/nodelib-es').QueryProvider;
var queryProvider = new QueryProvider();

describe('ElasticSearch, ', function () {
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

  describe("서버 Ping", function() {
    it('Alive 테스트', function (done) {
      queryProvider.ping(function(isAlive) {
        expect(isAlive).be.equal(true);
        done();
      })

    });

  })

  describe("Simple QueryString", function() {
    it('"aaa"가 존재하는 Doc Qeury 테스트', function (done) {
      var in_qparam = {q : 'aaa'};
      queryProvider.selectQueryString(in_qparam, function(err, count, datas) {
        if (err) { throw err; }
        expect(count).be.above(0);
        expect(datas[0]._type).be.equal('log');
        done();
      })
    });

    it('"bbb"가 존재하지 않는 Doc Qeury 테스트', function (done) {
      var in_qparam = {q : 'bbb'};
      queryProvider.selectQueryString(in_qparam, function(err, count, datas) {
        if (err) { throw err; }
        expect(count).be.equals(0);
        done();
      })
    });
  })

  describe("Defined Query", function() {
    it('index, type, body 일치 Query 수행 테스트 : 성공', function (done) {
      var in_qparam = {q : 'bbb'};
      queryProvider.selectSingleQueryByID('test', '', '', function(err, count, datas) {
        if (err) { throw err; }
        // console.log(count);
        expect(count).be.above(0);
        done();
      })
    });

  })

  describe("Index Test", function() {
    it('testindex내 id : 1 doc 생성', function (done) {
      var in_qparam = {q : 'bbb'};
      queryProvider.createIndexForTest(function(err, datas) {
        if (err) { throw err; }
        // console.log(count);
        // expect(count).be.above(0);
        done();
      })
    });

    // elasticsearch update api는 정상 동작하지 않음.
    // it('id : 1 doc 수정', function (done) {
    //   var in_qparam = {q : 'bbb'};
    //   queryProvider.updateDocForTest(function(err, datas) {
    //     if (err) { throw err; }
    //     // console.log(count);
    //     // expect(count).be.above(0);
    //     done();
    //   })
    // });

    it('id : 1 doc 삭제', function (done) {
      var in_qparam = {q : 'bbb'};
      queryProvider.deleteDocForTest(function(err, datas) {
        if (err) { throw err; }
        done();
      })
    });

  })

});
