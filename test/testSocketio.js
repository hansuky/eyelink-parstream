var should = require('should');
var should = require('should');
var assert = require("assert")
var request = require("supertest");
var expect = require("chai").expect;
var net = require('net');

var io = require('socket.io-client');

var socketURL = 'http://localhost:5223';

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

  describe("refreshData -> ", function() {
    // it('login', login());

    it('전송 및 수신 테스트', function(done) {
      var client1 = io.connect(socketURL, options);

      var count = 0;
      client1.on('refreshData', function(data){
        console.log(data);
        data.count.should.equal(++count);
        // if (data == 5)
        //   done();

        client1.emit('getEventListForAlarm', 0);
      });

      client1.on('sendEventListForAlarm', function(data) {
        console.log(data);
        done();
      });
    })


  });

  describe("Python -> ", function() {
    it.only('TO-DO Socket Data 전송', function(done) {

      var Dwarves = getConnection("Dwarves");
      var Elves = getConnection("Elves");
      var Hobbits = getConnection("Hobbits");
      writeData(Dwarves, "More Axes");
      writeData(Elves, "More Arrows");
      writeData(Hobbits, "More Pipe Weed");
    })


  });
});

function getConnection(connName){
  var pUrl = '192.168.10.27';
  // var pUrl = 'localhost';
  var pPort = 50007;
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
  });
  return client;
}

function writeData(socket, data){
  var success = !socket.write(data);
  if (!success){
    (function(socket, data){
      socket.once('drain', function(){
        writeData(socket, data);
      });
    })(socket, data);
  }
}

