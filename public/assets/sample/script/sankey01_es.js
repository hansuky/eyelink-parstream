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
     
       data.rtnData.forEach(function(d) {
        var a = d._source.request.split('?');   
        var name = a[0];
        var count = {};
        if(temp[d._source.auth] == null) {
          count[name] = { count : 1}
          temp[d._source.auth] = {name: d._source.auth, values:[], count:0, links:[], cnt : count };                   
        } else {
          if(temp[d._source.auth].cnt[name] == null){
            count[name] = { count : 1 }
            temp[d._source.auth].cnt = count;
          } else {
            temp[d._source.auth].cnt[name].count++;
            console.log(temp[d._source.auth].cnt[name].count);
          }

        }
        
          temp[d._source.auth].values.push({'name' : a[0], 'id' : d._source.auth+'_'+cnt, 'no' : cnt++ });          
          console.log(temp[d._source.auth].count);
          if(temp[d._source.auth].count > 0){
            temp[d._source.auth].links.push({ 'source' : cnt-1, 'target' : cnt, 'value' : 0.01 });
          }
          temp[d._source.auth].count++;
          console.log(temp);
        });       
/*       var nodes = temp
        console.log(nodes);
        console.log(links);
        var json =  { 'nodes' : nodes, 'links' : links};  
        console.log(json);*/

        var chart = d3.select("#chart").append("svg").chart("Sankey.Path");
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
        }
      });
    });