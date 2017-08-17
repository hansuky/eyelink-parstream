function getData(){
 var indexs = $('#indexs').val();       
 indexs = "filebeat_jira_access-";
  var mon = {'Jan' : '01', 'Feb' : '02', 'Mar' : '03', 'Apr' : '04', 'May' : '05', 'Jun' : '06', 'Jul' : '07', 'Aug' : '08', 'Sep' : '09', 'Oct' : '10', 'Nov' : '11', 'Dec' : '12' };    
  var day = new Date().toString().split(' ');    
  var index = indexs+day[3]+'.'+mon[day[1]]+'.'+day[2];
  console.log(index);
$.ajax({
    url: "/sample/restapi/selectJiraAccId" ,
    dataType: "json",
    type: "get",
    data: { index : index },
    success: function(result) {
      console.log(result);
      if (result.rtnCode.code == "0000") {        
        drawSankey(result);
      } else {
        //- $("#errormsg").html(result.message);
      }
    },
    error: function(req, status, err) {
      //- alert("code:"+request.status+"\n"+"message:"+request.responseText+"\n"+"error:"+error);
      $("#errormsg").html("code:"+status+"\n"+"message:"+req.responseText+"\n"+"error:"+err);
    }
  });     
};
function drawSankey(data){    
  
  console.log(data.id);
  var colors = data.id;
  /*var json = JSON.parse(data.rtnData); 
  console.log(json);*/
    var chart = d3.select("#sankey").append("svg").chart("Sankey.Path");
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