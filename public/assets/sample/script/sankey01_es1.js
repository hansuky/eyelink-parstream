$(function(){
 var indexs = $('#indexs').val();       
  var mon = {'Jan' : '01', 'Feb' : '02', 'Mar' : '03', 'Apr' : '04', 'May' : '05', 'Jun' : '06', 'Jul' : '07', 'Aug' : '08', 'Sep' : '09', 'Oct' : '10', 'Nov' : '11', 'Dec' : '12' };    
  var day = new Date().toString().split(' ');    
  //var index = indexs+day[3]+'.'+mon[day[1]]+'.*';
  index = indexs+'2017.09.05';
  console.log(index);
$.ajax({
    url: "/sample/restapi/selectJiraAccReq" ,
    dataType: "json",
    type: "get",
    data: { index : index },
    success: function(result) {      
      if (result.rtnCode.code == "0000") {        
        makeData(result.rtnData);
      } else {
        //- $("#errormsg").html(result.message);
      }
    },
    error: function(req, status, err) {
      //- alert("code:"+request.status+"\n"+"message:"+request.responseText+"\n"+"error:"+error);
      $("#errormsg").html("code:"+status+"\n"+"message:"+req.responseText+"\n"+"error:"+err);
    }
  });     
});

function makeData(result){

  var node={}, nodes = [], line = {}, lines = [], req={},  last = {}, lineNode = {}, id={};
 var colors=['#FF0000', '#FF5E00', '#FFBB00', '#FFE400', '#ABF200', '#1DDB16', '#00D8FF', '#0054FF', '#0100FF', '#5F00FF',
                    '#FF00DD', '#FF007F', '#FFA7A7', '#FFE08C', '#CEF279', '#B2EBF4', '#B5B2FF', '#FFB2F5', '#CC723D', '#008299'];  
 var reqCnt = 0, nodeCnt = 0, lineCnt = 0, lineNodeCnt = 0, idCnt = 0;        
 var nodeNo = 0;
 var nodeList = [];
 result.forEach(function(d) {
  if(d._source.request != null) {        
  var a = d._source.request.split('?');                         
  var c = a[0].split('.');
  if(c[c.length-1]!='js'&&c[c.length-1]!='css'&&c[c.length-1]!='png'&&c[c.length-1]!='woff'&&c[c.length-1]!='json'&&c[c.length-1]!='jsp'&&c[c.length-1]!='ico'&&c[c.length-1]!='svg'&&c[c.length-1]!='gif'&&c[c.length-1]!='eot'&&c[c.length-1]!='charts'&&c[c.length-1]!='da'&&c[c.length-1]!='gadget'){             
   if(d._source.auth == null){
     d._source.auth = 'visitor';
    } 
    var b = a[0].split('/');  
      if(req[a[0]] == null) {          
        req[a[0]] = { no : reqCnt++, cnt : 1};
      } else {
        req[a[0]].cnt++;        
      }        
      
      if(id[b[b.length-1]] == null) {
        id[b[b.length-1]] = colors[idCnt++%20];                   
      }
      
      var nodeId = b[b.length-1]+'_'+req[a[0]].no;       
      
  if(node[nodeId] ==null){
        nodeList[nodeNo] = nodeId;
        node[nodeId] ={ name : a[0], id : nodeId, no : nodeNo++, errcnt : 0 };  
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
              node[from].no = lineNodeCnt;        
              nodes[lineNodeCnt++] = node[from];                        
            }
            if(lineNode[to] == null) {
              lineNode[to] = {};    
              node[to].no = lineNodeCnt;
              nodes[lineNodeCnt++] = node[to];                                
            }
            var source = node[from].no;
            var target = node[to].no;              
            if(line[source+'-'+target] == null) {                
              line[source+'-'+target] = { no : lineCnt };               
              if(d._source.response < 400){             
                lines[lineCnt++] = {  source:  source , target: target, value : 0.0001, cnt :  1, errcnt : 0 };                           
              } else {             
                lines[lineCnt++] = {  source:  source , target: target, value : 0.0001, cnt :  1, errcnt : 1, elist : d._id };
                nodes[target].errcnt++;                                         
             }  
            } else {                            
              lines[line[source+'-'+target].no].value += 0.0001;
              lines[line[source+'-'+target].no].cnt++;
              if(parseInt(d._source.response) >= 400){
                 if(lines[line[source+'-'+target].no].errcnt == 0) {
                    lines[line[source+'-'+target].no].elist = d._id;
                 } else {
                  lines[line[source+'-'+target].no].elist += ','+d._id;       
                 }       
               lines[line[source+'-'+target].no].errcnt++;             
               nodes[target].errcnt++;                           
                }
            }
          } else {                   
            lines[line[node[to].no+'-'+node[from].no].no].value += 0.0001;
            lines[line[node[to].no+'-'+node[from].no].no].cnt++;
          }
        } else {            
         if(lineNode[to] == null) {
            lineNode[to] = {};                  
            node[to].no = lineNodeCnt;              
            nodes[lineNodeCnt++] = node[to];                                
          }  
        }
      }        
      last[d._source.auth] =  node[nodeId].id;       
   }
 }
 });

 console.log(node);

 nodes.forEach(function(d){
  if(d.errcnt > 0){
    d.name = '[Err:'+ d.errcnt + '] '+d.name;
  }
 });

 var json = {"nodes" :nodes, "links" : lines };
 console.log(json);
 drawChart({rtnData : json, id : id});
}

function drawChart(data){  
console.log(data)   ;
/*  console.log(data.rtnData);
  console.log(data.id);*/
  var colors = data.id;
  /*var json = JSON.parse(data.rtnData); 
  console.log(json);*/
  var div = d3.select("body").append("div") 
    .attr("class", "tooltip")       
    .style("opacity", 0);

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
      .draw(data.rtnData);
    function label(node) {
      return node.name.replace(/\s*\(.*?\)$/, '');
    }

    /*function label(link) {
      return node.errcnt.replace(/\s*\(.*?\)$/, '');
    }*/
    
chart.on('link:mouseover', function(link) {  
  if(link.errcnt != 0){
          div.transition()    
                .duration(200)    
                .style("opacity", 1);    
 //           div .html(formatTime(new Date(start+((i+1)*60*1000))) + "<br/>"  + d)  
            div .html('ErrCnt</br>' + link.errcnt)  
                .style("left", (d3.event.pageX) + "px")   
                .style("top", (d3.event.pageY - 28) + "px");  
  }
    //alert('ErrCount : ' + link.errcnt);
  });

chart.on('link:mouseout', function(link) {  
  if(link.errcnt != 0){
          div.transition()    
                .duration(500)    
                .style("opacity", 0); 
  }
    //alert('ErrCount : ' + link.errcnt);
  });

chart.on('link:click', function(link) {  
  console.log(link.errcnt)
  console.log(link.elist);
  if(link.errcnt != 0){
    window.open('error_pop?link='+link.elist,'pop', 'menubar=no,status=no,scrollbars=no,resizable=no ,width=1000,height=640,top=50,left=50');
  }
    //alert('ErrCount : ' + link.errcnt);
  });

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
};