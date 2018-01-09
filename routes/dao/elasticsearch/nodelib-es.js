var logger = global.log4js.getLogger('nodelib-es');
var Utils = require('../../util');
var queryParser = require('../queryParser');
var elasticsearch = require('elasticsearch');

var vhost = 'http://m2u-parstream.eastus.cloudapp.azure.com:9200';

// Data Simulator에서는 global 객체를 찾을 수 없으므로 exception 발생함.
try {
  if (global.config.fetchData.url != undefined)
  vhost = global.config.fetchData.url;
} catch(e) {
  logger.info('global.config.fetchData.url is undefined');
}
logger.debug('host url : %s', vhost);

var client = new elasticsearch.Client({
  host: vhost,
  // log: 'trace'
});

QueryProvider = function() {

}

QueryProvider.prototype.ping = function (cb) {
  client.ping({
    // ping usually has a 3000ms timeout
    requestTimeout: Infinity
  }, function (err) {
    if (err) {
      console.trace('elasticsearch cluster is down!');
      cb(false);
    } else {
      // logger.debug('All is well');
      cb(true);
    }
  });
}


// 단순 QueryString을 이용한 Query 실행
// ex) {q : aaa} : aaa 값을 포함하는 모든 Document 조
QueryProvider.prototype.selectQueryString = function (qString, cb) {
  var vTimeStamp = Date.now();
  // logger.debug('nodelib-es/selectQueryString -> (%j)', qString);

  client.search(
    qString
  ).then(function (body) {
    var hits = body.hits.hits;
    // logger.debug(body)
    cb(null, body.hits.total, hits);
  }, function (err) {
    console.trace(err.message);
    cb(err.message);
  });
}

// 단순 QueryString을 이용한 Query 실행
// ex) {q : aaa} : aaa 값을 포함하는 모든 Document 조
QueryProvider.prototype.selectQueryStringCount = function (qString, cb) {
  var vTimeStamp = Date.now();
  // logger.debug('nodelib-es/selectQueryString -> (%j)', qString);

  client.count(
    qString
  ).then(function (body) {
    var count = body.count;
    // logger.debug(body)
    cb(null, body, count);
  }, function (err) {
    console.trace(err.message);
    cb(err.message);
  });
}

QueryProvider.prototype.insertQueryByID = function (type, queryId, datas, cb) {
  logger.debug('queryId : '+queryId);
   // SQL 내 파라메타를 변경해준다.
  var sQueryString = Utils.replaceSql2(queryParser.getQuery(type, queryId), datas);
  logger.debug('nodelib-es/insertQueryByID -> ' + sQueryString);

  sQueryString = JSON.parse(sQueryString);
  logger.debug(sQueryString);

  client.index(
    sQueryString
  ).then(function (resp) {
      logger.debug(resp);
      cb(null, resp);
  }, function (err) {
      logger.debug(err.message);
      cb(err.message);
  });
}

QueryProvider.prototype.deleteQueryByID = function (type, queryId, datas, cb) {
  logger.debug('queryId : '+queryId);
   // SQL 내 파라메타를 변경해준다.
  var sQueryString = Utils.replaceSql2(queryParser.getQuery(type, queryId), datas);
  console.log('nodelib-es/deleteQueryByID -> ' + sQueryString);

  sQueryString = JSON.parse(sQueryString);
  client.delete(
    sQueryString
  ).then(function (resp) {
      console.log(resp);
      cb(null, resp);
  }, function (err) {
      console.trace(err.message);
      cb(err.message);
  });
}

QueryProvider.prototype.updateQueryByID = function (type, queryId, datas, cb) {
  console.log('queryId : '+queryId);
   // SQL 내 파라메타를 변경해준다.
  var sQueryString = Utils.replaceSql2(queryParser.getQuery(type, queryId), datas);
  console.log('nodelib-es/updateQueryByID  -> ' + sQueryString);

  sQueryString = JSON.parse(sQueryString);
  client.update(
    sQueryString
  ).then(function (resp) {
      logger.debug(resp);
      cb(null, resp);
  }, function (err) {
      console.trace(err.message);
      cb(err.message);
  });
}

QueryProvider.prototype.insertBulkQuery = function (datas, cb) {
  client.bulk(
    {body : makeBulkData(datas)}
  ).then(function (resp) {
      // logger.debug(resp);
      cb(null, resp);
  }, function (err) {
      console.trace(err.message);
      cb(err.message);
  });
}

makeBulkData = function(datas) {
  var bulkData = [];
  for(var idx=0; idx<datas.body.length; idx++) {
    var obj = {
      index: {
        _index : datas.index,
        _type : datas.type}
    }
    bulkData.push(obj);
    bulkData.push(datas.body[idx]);
  }
  // logger.debug(bulkData);
  return bulkData;
}

// query.xml에 정의된 query를 이용한 query수행
QueryProvider.prototype.selectSingleQueryByID = function (type, queryId, datas, cb) {
  var vTimeStamp = Date.now();
  logger.debug('queryId : '+queryId);
  console.time('nodelib-es/selectSingleQueryByID -> '+ queryId +' total ');
  logger.debug('nodelib-es/selectSingleQueryByID -> (%s) queryID', queryId);

  var qString = {
    index: 'corecode-2017-05',
    type: 'corecode',
    body: {
      query: {
        match: {
          node_id : '0001.00000001'
        }
      }
    }
  }
  client.search(
    qString
  ).then(function (resp) {
      var hits = resp.hits.hits;
      // logger.debug(body)
      cb(null, resp.hits.total, hits);
  }, function (err) {
      console.trace(err.message);
      cb(err.message);
  });
}

// query.xml에 정의된 query를 이용한 query수행
QueryProvider.prototype.selectSingleQueryByID2 = function (type, queryId, datas, cb) {
  var vTimeStamp = Date.now();
  console.time('nodelib-es/selectSingleQueryByID2-> '+ queryId +' total ');
  logger.debug('selectSingleQueryByID2 -> queryID : %s', queryId);

  // SQL 내 파라메타를 변경해준다.
  var sql = queryParser.getQuery(type, queryId);
  if (sql == '') {
    return cb('Query is not found', {});
  }
  var sQueryString = Utils.replaceSql2(sql, datas);
  logger.debug('selectSingleQueryByID2 -> ' + sQueryString);

  sQueryString = JSON.parse(sQueryString);

  client.search(
    sQueryString
  ).then(function (resp) {
      //logger.debug(resp.hits);
      var hits = resp.hits.hits;
      logger.debug('selectSingleQueryByID2 -> total : ' + resp.hits.total);
      cb(null, hits, resp.hits.total);
  }, function (err) {
      console.trace(err.message);
      cb(err.message);
  });
}

// query.xml에 정의된 query를 이용한 query수행
QueryProvider.prototype.selectSingleQueryByID3 = function (type, queryId, datas, cb) {
  var vTimeStamp = Date.now();
  console.time('nodelib-es/selectSingleQueryByID3 -> '+ queryId +' total ');
  logger.debug('electSingleQueryByID3 -> (%s) queryID', queryId);

  // SQL 내 파라메타를 변경해준다.
   var sql = queryParser.getQuery(type, queryId);
  if (sql == '') {
    return cb('Query is not found', {});
  }
  var sQueryString = Utils.replaceSql2(sql, datas);
  logger.debug('selectSingleQueryByID3 -> ' + sQueryString);

  sQueryString = JSON.parse(sQueryString);

  client.search(
    sQueryString
  ).then(function (resp) {
      //logger.debug(resp.hits);
      var hits = resp.aggregations;
      logger.debug('selectSingleQueryByID3 -> total : %d', resp.hits.total);
      cb(null, hits);
  }, function (err) {
      console.trace(err.message);
      cb(err.message);
  });
}

// query.xml에 정의된 query를 이용한 query수행
QueryProvider.prototype.selectSingleQueryCount = function (type, queryId, datas, cb) {
  var vTimeStamp = Date.now();
  logger.debug('queryId : '+queryId);
  console.time('nodelib-es/selectSingleQueryCount -> '+ queryId +' total ');
  logger.debug('nodelib-es/selectSingleQueryCount -> (%s) queryID', queryId);

  // SQL 내 파라메타를 변경해준다.
  var sQueryString = Utils.replaceSql2(queryParser.getQuery(type, queryId), datas);
  logger.debug('nodelib-es/selectSingleQueryCount -> ' + sQueryString);

  sQueryString = JSON.parse(sQueryString);

  client.count(
    sQueryString
  ).then(function (resp) {
      //logger.debug(resp.hits);
      var count = resp.count;
      logger.debug('nodelib-es/selectSingleQueryCount -> count : %d', resp.count);
      cb(null, count);
  }, function (err) {
      console.trace(err.message);
      cb(err.message);
  });

}


QueryProvider.prototype.countDocForTest = function (cb) {

  client.count({
    index: 'testindex',
    type: 'testtype',
    id: '1',
   }).then(function (resp) {
      // var hits = resp.hits.hits;
      logger.debug(resp)
      cb(null, resp);
  }, function (err) {
      console.trace(err.message);
      cb(err.message);
  });

}

QueryProvider.prototype.createIndexForTest = function (cb) {

  client.create({
    index: 'testindex',
    type: 'testtype',
    id: '1',
    body: {
      title: 'Test 1',
      tags: ['y', 'z'],
      published: true,
      published_at: '2013-01-01',
      counter: 1
    }
  }).then(function (resp) {
      // var hits = resp.hits.hits;
      logger.debug(resp);
      cb(null, resp);
  }, function (err) {
      console.trace(err.message);
      cb(err.message);
  });

}


// FIXME update는 정상 동작하지 않음, library bug로 보여짐.
QueryProvider.prototype.updateDocForTest = function (cb) {

  client.update({
    index: 'testindex',
    type: 'testtype',
    id: '1',
    body: {
      title: 'Test 1 updated',
      tags: ['y', 'z'],
      published: "true",
      published_at: '2013-01-01',
      counter: "1"
    }
  }).then(function (resp) {
      // var hits = resp.hits.hits;
      logger.debug(resp);
      cb(null, resp);
  }, function (err) {
      console.trace(err.message);
      cb(err.message);
  });

}


QueryProvider.prototype.deleteDocForTest = function (cb) {

  client.delete({
    index: 'testindex',
    type: 'testtype',
    id: '1',
   }).then(function (resp) {
      // var hits = resp.hits.hits;
      logger.debug(resp)
      cb(null, resp);
  }, function (err) {
      console.trace(err.message);
      cb(err.message);
  });

}

// search all index list that created today in ES
QueryProvider.prototype.getIndicesStats = function (indexName, cb) {
  if (indexName == null)
    indexName = "_all";

  client.indices.stats({
   index: indexName,
   level: "indices"
  }).then(function (resp) {
    // logger.debug(resp)
    cb(null, Object.keys(resp.indices).length, resp.indices);
  }, function (err) {
    console.trace(err.message);
    cb(err.message, 0, null);
  });
}

// var pageNum = request.params.page;
// var perPage = request.params.per_page;
// var userQuery = request.params.search_query;
// var userId = request.session.userId;

// var searchParams = {
//   index: 'posts',
//   from: (pageNum - 1) * perPage,
//   size: perPage,
//   body: {
//     query: {
//       filtered: {
//         query: {
//           match: {
//             // match the query against all of
//             // the fields in the posts index
//             _all: userQuery
//           }
//         },
//         filter: {
//           // only return documents that are
//           // public or owned by the current user
//           or: [
//             {
//               term: { privacy: "public" }
//             },
//             {
//               term: { owner: userId }
//             }
//           ]
//         }
//       }
//     }
//   }
// };

// client.search(searchParams, function (err, res) {
//   if (err) {
//     // handle error
//     throw err;
//   }

//   response.render('search_results', {
//     results: res.hits.hits,
//     page: pageNum,
//     pages: Math.ceil(res.hits.total / perPage)
//   });
// });


exports.QueryProvider = QueryProvider;
