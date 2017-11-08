function drawCountChart() {
  var sdate = $('#sdate').val();  
  $.ajax({
    url: "/dashboard/restapi/getHeapData" ,
    dataType: "json",
    type: "get",
    data: { date : sdate, type : 'normal' },
    success: function(result) {      
      if (result.rtnCode.code == "0000") {        
        drawHeap(result.heap);
        drawPermgen(result.perm);
      } else {
        //- $("#errormsg").html(result.message);
      }
    },
    error: function(req, status, err) {
      //- alert("code:"+request.status+"\n"+"message:"+request.responseText+"\n"+"error:"+error);
      $("#errormsg").html("code:"+status+"\n"+"message:"+req.responseText+"\n"+"error:"+err);
    }
  });
   $.ajax({
    url: "/dashboard/restapi/getJvmSysData" ,
    dataType: "json",
    type: "get",
    data: { date : sdate, type : 'normal' },
    success: function(result) {      
      if (result.rtnCode.code == "0000") {                
        drawJvmSys(result.rtnData);
      } else {
        //- $("#errormsg").html(result.message);
      }
    },
    error: function(req, status, err) {
      //- alert("code:"+request.status+"\n"+"message:"+request.responseText+"\n"+"error:"+error);
      $("#errormsg").html("code:"+status+"\n"+"message:"+req.responseText+"\n"+"error:"+err);
    }
  });
   $.ajax({
    url: "/dashboard/restapi/getStatTransaction" ,
    dataType: "json",
    type: "get",
    data: { date : sdate, type : 'normal' },
    success: function(result) {
      if (result.rtnCode.code == "0000") {        
        drawTransaction(result.rtnData);
      } else {
        //- $("#errormsg").html(result.message);
      }
    },
    error: function(req, status, err) {
      //- alert("code:"+request.status+"\n"+"message:"+request.responseText+"\n"+"error:"+error);
      $("#errormsg").html("code:"+status+"\n"+"message:"+req.responseText+"\n"+"error:"+err);
    }
  });

   $.ajax({
    url: "/dashboard/restapi/getActiveTrace" ,
    dataType: "json",
    type: "get",
    data: { date : sdate, type : 'normal' },
    success: function(result) {      
      if (result.rtnCode.code == "0000") {        
        drawActiveTrace(result.rtnData);
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

function drawHeap(data) {    
  var chartName = '#ts-chart01';
  chart01 = d3.timeseries()
    .addSerie(data,{x:'timestamp',y:'max'},{interpolate:'step-before'})
    .addSerie(data,{x:'timestamp',y:'used'},{interpolate:'linear'})        
    .xscale.tickFormat(d3.time.format("%H:%M:%S"))
    .width($(chartName).parent().width()-10)
    .height(270)
    // .yscale.tickFormat(french_locale.numberFormat(",f"))
    .margin.left(0);

    // console.log(chart01);
  chart01(chartName);
}

function drawPermgen(data) {  
  var chartName = '#ts-chart02';
  chart02 = d3.timeseries()
    .addSerie(data,{x:'timestamp',y:'max'},{interpolate:'step-before'})
    .addSerie(data,{x:'timestamp',y:'used'},{interpolate:'linear'})        
    .xscale.tickFormat(d3.time.format("%H:%M:%S"))
    .width($(chartName).parent().width()-10)
    .height(270)
    // .yscale.tickFormat(french_locale.numberFormat(",f"))
    .margin.left(0);

    // console.log(chart01);
  chart02(chartName);
}

function drawJvmSys(data) {
  var chartName = '#ts-chart03';
  chart03 = d3.timeseries()
    .addSerie(data,{x:'timestamp',y:'jvm'},{interpolate:'step-before'})
    .addSerie(data,{x:'timestamp',y:'system'},{interpolate:'linear'})        
    .xscale.tickFormat(d3.time.format("%H:%M:%S"))
    .width($(chartName).parent().width()-10)
    .height(270)
    // .yscale.tickFormat(french_locale.numberFormat(",f"))
    .margin.left(0);

    // console.log(chart01);
  chart03(chartName);
}

function drawTransaction(data) {
  var chartName = '#ts-chart04';
  chart04 = d3.timeseries()
    .addSerie(data,{x:'timestamp',y:'S.C'},{interpolate:'step-before'})
    .addSerie(data,{x:'timestamp',y:'S.N'},{interpolate:'linear'})        
    .addSerie(data,{x:'timestamp',y:'U.C'},{interpolate:'linear'})
    .addSerie(data,{x:'timestamp',y:'U.N'},{interpolate:'linear'})        
    .addSerie(data,{x:'timestamp',y:'Total'},{interpolate:'linear'})    
    .xscale.tickFormat(d3.time.format("%H:%M:%S"))
    .width($(chartName).parent().width()-10)
    .height(270)
    // .yscale.tickFormat(french_locale.numberFormat(",f"))
    .margin.left(0);

    // console.log(chart01);
  chart04(chartName);
}

function drawActiveTrace(data) {  
  var chartName = '#ts-chart05';
  chart05 = d3.timeseries()
    .addSerie(data,{x:'timestamp',y:'Fast'},{interpolate:'step-before'})
    .addSerie(data,{x:'timestamp',y:'Normal'},{interpolate:'linear'})        
    .addSerie(data,{x:'timestamp',y:'Slow'},{interpolate:'linear'})
    .addSerie(data,{x:'timestamp',y:'Very Slow'},{interpolate:'linear'})            
    .xscale.tickFormat(d3.time.format("%H:%M:%S"))
    .width($(chartName).parent().width()-10)
    .height(270)
    // .yscale.tickFormat(french_locale.numberFormat(",f"))
    .margin.left(0);

    // console.log(chart01);
  chart05(chartName);
}