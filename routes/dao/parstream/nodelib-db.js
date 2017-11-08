var Utils = require('../../util');
var parstream = require("./m2u-parstream")
var queryParser = require('../queryParser');
var opts = {
    host: 'm2u-parstream.eastus.cloudapp.azure.com',
    // host: 'm2u-da.eastus.cloudapp.azure.com',
    port: 9042,
    size: 5,
}
// var parstream =  parstream.createPool(opts);

QueryProvider = function() {

}
// 단건에 대해서 Query를 수행한다.
QueryProvider.prototype.selectSingleQueryByID = function (type, queryId, datas, callback) {
  var vTimeStamp = Date.now();
  console.log('queryId : '+queryId);
  console.time('nodelib-db/selectSingleQueryByID -> '+ queryId +' total ');
  console.log('nodelib-db/selectSingleQueryByID -> (%s) queryID', queryId)

  // no pool method
  var parstream = require("./m2u-parstream").createClient(opts);

  parstream.connect(function(err) {
    if (err) {
      callback(err);
    } else {

      // SQL 내 파라메타를 변경해준다.
      var sSql = Utils.replaceSql(queryParser.getQuery(type, queryId), datas);
      console.log('nodelib-db/selectSingleQueryByID -> ' + sSql);

      console.time('nodelib-db/selectSingleQueryByID -> ('+ queryId +') executeQuery');
      parstream.query(sSql, function(err, resultset) {
        console.timeEnd('nodelib-db/selectSingleQueryByID -> ('+ queryId +') executeQuery');
        // console.log('nodelib-db/selectSingleQueryByID -> resultset : %j', resultset);

        // console.log(err);
        // occur error
        var err = null;
        if (typeof resultset.error === 'string') {
          console.log('nodelib-db/selectSingleQueryByID -> (%s) resultset error : %s', queryId, (typeof resultset.error === 'string'));
          err = resultset.error;
          console.timeEnd('nodelib-db/selectSingleQueryByID -> '+ queryId +' total ');
          parstream.close();
          callback(resultset.error, [[]], datas);
        } else {
          console.log('nodelib-db/selectSingleQueryByID -> (%s) resultset.rows.length : %d', queryId, resultset.rows.length);
          // console.log('nodelib-db/selectSingleQueryByID -> resultset type : %s', (typeof resultset === 'object'));
          // console.log('nodelib-db/selectSingleQueryByID -> resultset rows type : %s', (typeof resultset.rows === 'object'));
          console.timeEnd('nodelib-db/selectSingleQueryByID -> '+ queryId +' total ');
          parstream.close();
          callback(err, [resultset.rows], datas);
        }
        // parstream.close(function () {
        // })
      });
    }
  });
};

// Insert Query를 수행한다.
QueryProvider.prototype.insertQueryByID = function (type, queryId, datas, callback) {
  var vTimeStamp = Date.now();
  console.time('nodelib-db/insertQueryByID -> '+ queryId +' total ');
  console.log('nodelib-db/insertQueryByID -> (%s) queryID', queryId)

  // no pool method
  var parstream = require("./m2u-parstream").createClient(opts);

  parstream.connect(function(err) {
    if (err) {
      callback(err);
    } else {

      // SQL 내 파라메타를 변경해준다.
      var sSql = Utils.replaceSql(queryParser.getQuery(type, queryId), datas);
      console.log('nodelib-db/insertQueryByID -> ' + sSql);

      console.time('nodelib-db/insertQueryByID -> ('+ queryId +') executeQuery');
      parstream.query(sSql, function(err) {
        if (err) {
          callback(err);
        }
        console.timeEnd('nodelib-db/insertQueryByID -> ('+ queryId +') executeQuery');

        console.log(err);
        parstream.close();
        callback(err, 'D001');
        // parstream.close(function () {
        // })
      });
    }
  });
};

exports.QueryProvider = QueryProvider;