var should = require('should');
var should = require('should');
var assert = require("assert")
var request = require("supertest");
var expect = require("chai").expect;
var net = require('net');

require('date-utils');
var io = require('socket.io-client');

var socketURL = 'http://localhost:5223';
// var socketURL = 'http://m2utech.eastus.cloudapp.azure.com:5223';

var options ={
  transports: ['websocket'],
  'force new connection': true
};

var chatUser1 = {'name':'Tom'};
var chatUser2 = {'name':'Sally'};
var chatUser3 = {'name':'Dana'};

describe("Socketio", function(){
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

  describe("Simple Test -> ", function() {
    // it('login', login());

    it('send/receive', function(done) {
      var client1 = io.connect(socketURL, options);
      // var count = 0;
      // client1.on('refreshData', function(data){
      //   console.log(data);
      //   data.count.should.equal(++count);
      //   // if (data == 5)
      //   //   done();

      //   client1.emit('getEventListForAlarm', 0);
      // });
      var sendData = {clientId : 100, message : 'Hi'}
      client1.emit('receiveSocketEventTest', sendData);

      client1.on('sendEventSocketEventTest', function(data) {
        console.log(data);
        done();
      })
    })

  });

  describe("Alarm Test -> ", function() {
    // it('login', login());

    it('socket.io send/receive', function(done) {
      var client1 = io.connect(socketURL, options);
      // var count = 0;
      // client1.on('refreshData', function(data){
      //   console.log(data);
      //   data.count.should.equal(++count);
      //   // if (data == 5)
      //   //   done();

      //   client1.emit('getEventListForAlarm', 0);
      // });
      var d = new Date();
      var regTimeStamp = d.removeDays(1).toFormat('YYYY-MM-DDTHH24:MI:SS');
      var sendData = {
        applicationType : 'ELAGENT',
        agentId : 'test_app',
        timestamp : regTimeStamp,
        alarmType : 'CPU_90',
        alarmTypeName : '',
        message : 'CPU over 90%'}
      client1.emit('receiveAlarmData', sendData);

      client1.on('returnAlarmData', function(data) {
        console.log(data);
        done();
      })
    })
  });

  describe("Python -> ", function() {
    it('TO-DO Socket Data 전송 (test 모듈 내에서 connection 처리함)', function(done) {

      // FIX-ME done() 처리 시점 재정의 필요함.
      var datas = '{"start_date":"2017-02-01", "end_date":"2017-02-02", "time_interval":15}';
      getConnection("Dwarves", function(socket) {
        writeData(socket, datas, function() {
          done();
        });
      });
      // var Elves = getConnection("Elves");
      // var Hobbits = getConnection("Hobbits");
      // writeData(Elves, "More Arrows");
      // writeData(Hobbits, "More Pipe Weed");
      // data.count.should.equal(++count);
      //done();
    })
  });
});

function getConnection(connName, callback){
  // var pUrl = '192.168.10.27';
  var pUrl = 'localhost';
  var pPort = 5226;
  var client = net.connect({port: pPort, host:pUrl}, function() {
    console.log(connName + ' Connected: ');
    console.log('   local = %s:%s', this.localAddress, this.localPort);
    console.log('   remote = %s:%s', this.remoteAddress, this.remotePort);
    this.setTimeout(500);
    this.setEncoding('utf8');
    this.on('data', function(data) {
      console.log(connName + " From Server: " + data.toString());
      this.end();
    });
    this.on('end', function() {
      console.log(connName + ' Client disconnected');
    });
    this.on('error', function(err) {
      console.log('Socket Error: ', JSON.stringify(err));
    });
    this.on('timeout', function() {
      console.log('Socket Timed Out');
    });
    this.on('close', function() {
      console.log('Socket Closed');
    });
    callback(client);
  });
  // return client;
}

function writeData(socket, data, callback){
  var success = !socket.write(data);
  console.log('success : ' + success);
  if (!success){
    (function(socket, data){
      socket.once('drain', function(){
        console.log('drain');
        writeData(socket, data);
      });
    })(socket, data);
  }

  if (success) {
    callback();
  }
}

