module.exports.getQuery = function(type, queryId) {
  // console.log('queryParser/getQuery -> global.queryList : %j', global.query.queryList);
  // console.log('queryParser/getQuery -> global.query.%s query length : %d', type, global.query.queryList[''+ type +''][0].query.length);
  var query = '';
  // console.log(type)
  for(var i = 0; i < global.query.queryList[''+type+''][0].query.length; i++) {
    // console.log('queryParser/getQuery -> %d, %s', i, global.query.queryList[''+type+''][0].query[i].$.id);
    if (global.query.queryList[''+type+''][0].query[i].$.id == queryId) {
      query = global.query.queryList[''+type+''][0].query[i]._;
      // console.log('queryParser/getQuery -> %s', query);
      break;
    }
  }
  // console.log('queryParser/getQuery -> [%s]', query);
  query = query.replace(/\r\n?/g, '').trim();
  query = query.replace(/\n?/g, '').trim();
  // console.log('queryParser/getQuery -> [%s]', query);
  return query;
}

