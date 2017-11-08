$(function(){
  var colors = {
           'sunghan.bae': '#61DBF0',
            'hyeyoung.lee':              '#f5662b',
            'undefined':         '#FAED7D',
            'edit':              '#367d85',
            'diagram':             '#AB6CFF',
            'gallery':             '#97ba4c',
            'timeline': '#3f3e47',
            'fallback':            '#9f9fa3',
            'status' : '#1F50B5',
            'manager' : '#FFBB00'
          };
      /*  d3.json("/assets/sample/data/test.json", function(error, json) {          */
     d3.json("/sample/restapi/selectJiraAccReq", function(error, data) {        
         var temp = {}, links = {},req={};
        var cnt = 0;
     
       var node={}, nodes = [], line = {}, lines = [], req={},  last = {}, lineNode = {};
     var reqCnt = 0, nodeCnt = 0, lineCnt = 0, lineNodeCnt = 0;        
     var nodeNo = 0;
     var nodeList = [];
     data.rtnData.forEach(function(d) {        
      console.log(d._source);
      console.log(d._source.request);
        var a = d._source.request.split('?');                     
        
        if(req[a[0]] == null) {          
          req[a[0]] = { no : reqCnt++, cnt : 1};
        } else {
          req[a[0]].cnt++;        
        }        
        var nodeId = d._source.auth+'_'+req[a[0]].no;
        
        if(node[nodeId] ==null){
          nodeList[nodeNo] = nodeId;
          node[nodeId] ={ name : a[0], id : nodeId, no : nodeNo++ };          
        }
        if(last[d._source.auth] != null){
          var from = last[d._source.auth];
          var to = nodeId;
          if(node[from].no > node[to].no){
            from = nodeId;
            to = last[d._source.auth];
          }
          if(from != to){
            if(line[node[to].no+'-'+node[from].no] == null){
              if(lineNode[from] == null) {                
                lineNode[from] = {};        
                console.log(node[from]);
                node[from].no = lineNodeCnt;       
                console.log(node[from]);
                nodes[lineNodeCnt++] = node[from];                        
              }
              if(lineNode[to] == null) {
                lineNode[to] = {};    
                console.log(node[to]);
                node[to].no = lineNodeCnt;
                console.log(node[to]);
                nodes[lineNodeCnt++] = node[to];                                
              }
              var source = node[from].no;
              var target = node[to].no;              
              if(line[source+'-'+target] == null) {                
                line[source+'-'+target] = { no : lineCnt };               
                lines[lineCnt++] = {  source:  source , target: target, value : 0.0001 };                
              } else {                            
                lines[line[source+'-'+target].no].value += 0.0001;
              }
            } else {                   
              lines[line[node[to].no+'-'+node[from].no].no].value += 0.0001;
            }            
          } else {
            console.log(from);
            console.log(to);
           if(lineNode[to] == null) {
              lineNode[to] = {};    
              console.log(node[to]);
              node[to].no = lineNodeCnt;
              console.log(node[to]);
              nodes[lineNodeCnt++] = node[to];                                
            }
          }
        }        
        last[d._source.auth] =  node[nodeId].id;                
       });       
     console.log(line);
     console.log(lines);
     console.log(node);
      console.log(nodes);
      console.log(json);
       /* var chart = d3.select("#chart").append("svg").chart("Sankey.Path");
       chart
          .name(label)
          .colorNodes(function(name, node) {
            return color(node, 1) || colors.fallback;
          })
          .colorLinks(function(link) {
            return color(link.source, 4) || color(link.target, 1) || colors.fallback;
          })
          .nodeWidth(15)
          .nodePadding(10)
          .spread(true)
          .iterations(0)
          .draw(json);
        function label(node) {
          return node.name.replace(/\s*\(.*?\)$/, '');
        }
        function color(node, depth) {
          var id = node.id.replace(/(_score)?(_\d+)?$/, '');
          if (colors[id]) {
            return colors[id];
          } else if (depth > 0 && node.targetLinks && node.targetLinks.length == 1) {
            return color(node.targetLinks[0].source, depth-1);
          } else {
            return null;
          }
        }*/
      });
    });