function runAnalysis(interval) {
  var sdate = $('#sdate').val();
  var edate = $('#edate').val();    
  // TO-DO message config로 처리함.
  if (confirm("분석에 시간이 걸릴수 있어 Background로 작업이 수행됩니다.\n 진행하시겠습니까? ")) {
    $.ajax({
      url: "/analysis/restapi/runAnalysis" ,
      dataType: "json",
      type: "post",
      data: { startDate:sdate, endDate:edate , interval:interval },
      success: function(result) {
        if (result.rtnCode.code == "0000") {
          var master = result.rtnData;        
        }
      },
      error: function(req, status, err) {
        $("#errormsg").html("code:"+status+"\n"+"message:"+req.responseText+"\n"+"error:"+err);
      }
    });
  }
}
