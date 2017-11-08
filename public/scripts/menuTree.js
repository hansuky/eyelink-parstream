function getMenu(id, date) {        
  $.ajax({
    url: "/management/restapi/getMenuList" ,
    dataType: "json",
    type: "get",
    data: {
      index : "management",
      type : "menu"
    },
    success: function(result) {
      if (result.rtnCode.code == "0000") {              
        drawMenuList(result.rtnData);        
      } else {
        //- $("#errormsg").html(result.message);
      }
    },
    error: function(req, status, err) {
      //- alert("code:"+request.status+"\n"+"message:"+request.responseText+"\n"+"error:"+error);
      $("#errormsg").html("code:"+status+"\n"+"message:"+req.responseText+"\n"+"error:"+err);
    }
  });
}

function drawMenuList(data){
  $('#call').empty();
  var sb = new StringBuffer();
  sb.append('<div class="portlet light bordered">');
  sb.append('<table class="table tree-2 table-bordered table-striped table-condensed">');
  data.forEach(function(d){    
    d = d._source;    
    if(d.upcode != null){
        sb.append('<tr class="treegrid-'+ parseInt(d.code) +' treegrid-parent-'+ parseInt(d.upcode)+'"><td>'+d.name+'</td></tr>');         
    } else {
       sb.append('<tr class="treegrid-'+ parseInt(d.code) +'"><td></td></tr>');         
    }
    
  });
  sb.append('</table></div>');  
  console.log(sb.toString());
  $('#call').append(sb.toString());  
    $('.tree-2').treegrid({
    expanderExpandedClass: 'glyphicon glyphicon-minus',
    expanderCollapsedClass: 'glyphicon glyphicon-plus'
  }); 
}