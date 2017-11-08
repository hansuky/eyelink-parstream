function getAllData(day){ 
 $.ajax({
    url: "/dashboard/restapi/getAllMapData",
    dataType: "json",
    type: "GET",    
    data: { date : day },
    success: function(result) {      
      if (result.rtnCode.code == "0000") {        
        //- $("#successmsg").html(result.message);        
        var elseJson = { nodes : result.nodes, edges : result.edges };                      
        getServerMap(elseJson);
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

