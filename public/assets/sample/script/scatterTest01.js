$(function(){ 
      $('#png-down').click(function(e){
        var sImageUrl = oScatterChart.getChartAsPNG();
        $(this).attr('href', sImageUrl);
      });
      $('#jpg-down').click(function(e){
        var sImageUrl = oScatterChart.getChartAsJPEG();
        $(this).attr('href', sImageUrl);
      });
      var date = new Date();
      if(Modernizr.canvas){
        doBigScatterChart();
      }
      var oScatterChart;
      function doBigScatterChart(){
        oScatterChart = new BigScatterChart({
          sContainerId : 'chart1',
          nWidth : 800,
          nHeight : 600,
          nXMin: date.getTime() - 86400000, nXMax: date.getTime(),
          nYMin: 0, nYMax: 10000,
          nZMin: 0, nZMax: 5,
          nBubbleSize: 3,
          nDefaultRadius : 3,
          htTypeAndColor : {
      'Success' : '#b6da54', // type name : color
      'Warning' : '#fcc666',
      'Failed' : '#fd7865',
      'Others' : '#55c7c7'
    },
    sXLabel : '(time)',
    sYLabel : '(ms)',
    htGuideLine : {
      'nLineWidth' : 1,
      'aLineDash' : [2, 5],
      'nGlobalAlpha' : 0.2
    },
    sXLabel : '',
    nPaddingRight : 5,
    fOnSelect : function(htPosition, htXY){
      console.log('fOnSelect', htPosition, htXY);
      console.time('fOnSelect');
      var aData = this.getDataByXY(htXY.nXFrom, htXY.nXTo, htXY.nYFrom, htXY.nYTo);
      console.timeEnd('fOnSelect');
      console.log('adata length', aData.length);
      //alert('Selected data count : ' + aData.length);
    }
  });
        var data = [];
        for(var i=date.getTime() - 86400000; i<date.getTime() - 69120000; i+=173){
          
          data.push({
            x : i,
            y : Math.round(_.random(0, 10000) / _.random(1, 1000)),
            type : _.random(0,100) < 80 ? 'Success' : (_.random(0,100) < 80 ? 'Failed' : (_.random(0,100) < 80 ? 'Warning' : 'Others'))
          });
        }
        console.log(data);
        oScatterChart.setBubbles(data);
        oScatterChart.redrawBubbles();
        setTimeout(function(){
          var data = [];
          for(var i=date.getTime() - 69120001; i<date.getTime() - 51840000; i+=173){
            data.push({
              x : i,
              y : Math.round(_.random(0, 10000) / _.random(1, 1000)),
              type : _.random(0,100) < 80 ? 'Success' : (_.random(0,100) < 80 ? 'Failed' : (_.random(0,100) < 80 ? 'Warning' : 'Others'))
            });
          }
          oScatterChart.addBubbleAndDraw(data);
        }, 1);
        setTimeout(function(){
          var data = [];
          for(var i=date.getTime() - 51840001; i<date.getTime() - 17280000; i+=173){
            data.push({
              x : i,
              y : Math.round(_.random(0, 10000) / _.random(1, 1000)),
              type : _.random(0,100) < 80 ? 'Success' : (_.random(0,100) < 80 ? 'Failed' : (_.random(0,100) < 80 ? 'Warning' : 'Others'))
            });
          }
          oScatterChart.addBubbleAndDraw(data);
        }, 1);
        setTimeout(function(){
          var data = [];
          for(var i=date.getTime() - 17280001; i<date.getTime() - 0; i+=173){
            data.push({
              x : i,
              y : Math.round(_.random(0, 10000) / _.random(1, 1000)),
              type : _.random(0,100) < 80 ? 'Success' : (_.random(0,100) < 80 ? 'Failed' : (_.random(0,100) < 80 ? 'Warning' : 'Others'))
            });
          }
          oScatterChart.addBubbleAndDraw(data);
        }, 1);
        setTimeout(function(){
          var data = [];
          for(var i=date.getTime(), nLen=date.getTime() + 3600000; i<nLen; i+=360){
            data.push({
              x : i,
              y : Math.round(_.random(0, 10000) / _.random(1, 1000)),
              r : _.random(3,5),
              type : _.random(0,100) < 80 ? 'Success' : (_.random(0,100) < 80 ? 'Failed' : (_.random(0,100) < 80 ? 'Warning' : 'Others'))
            });
          }
          oScatterChart.addBubbleAndMoveAndDraw(data, date.getTime() + 3600000);
        }, 5000);
        setTimeout(function(){
          var data = [];
          for(var i=date.getTime() + 3600001, nLen=date.getTime() + 7200000; i<nLen; i+=360){
            data.push({
              x : i,
              y : Math.round(_.random(0, 10000) / _.random(1, 1000)),
              type : _.random(0,100) < 80 ? 'Success' : (_.random(0,100) < 80 ? 'Failed' : (_.random(0,100) < 80 ? 'Warning' : 'Others'))
            });
          }
          oScatterChart.addBubbleAndMoveAndDraw(data, date.getTime() + 7200000);
        }, 8000);
        setTimeout(function(){
          var data = [];
          for(var i=date.getTime() + 7200001, nLen=date.getTime() + 10800000; i<nLen; i+=360){
            data.push({
              x : i,
              y : Math.round(_.random(0, 10000) / _.random(1, 1000)),
              type : _.random(0,100) < 80 ? 'Success' : (_.random(0,100) < 80 ? 'Failed' : (_.random(0,100) < 80 ? 'Warning' : 'Others'))
            });
          }
          oScatterChart.addBubbleAndMoveAndDraw(data, date.getTime() + 10800000);
        }, 11000);
        setTimeout(function(){
          var data = [];
          for(var i=date.getTime() + 10800001, nLen=date.getTime() + 14400000; i<nLen; i+=360){
            data.push({
              x : i,
              y : Math.round(_.random(0, 10000) / _.random(1, 1000)),
              type : _.random(0,100) < 80 ? 'Success' : (_.random(0,100) < 80 ? 'Failed' : (_.random(0,100) < 80 ? 'Warning' : 'Others'))
            });
          }
          oScatterChart.addBubbleAndMoveAndDraw(data, date.getTime() + 14400000);
        }, 14000);
        setTimeout(function(){
          var data = [];
          for(var i=date.getTime() + 14400001, nLen=date.getTime() + 18000000; i<nLen; i+=360){
            data.push({
              x : i,
              y : Math.round(_.random(0, 10000) / _.random(1, 1000)),
              type : _.random(0,100) < 80 ? 'Success' : (_.random(0,100) < 80 ? 'Failed' : (_.random(0,100) < 80 ? 'Warning' : 'Others'))
            });
          }
          oScatterChart.addBubbleAndMoveAndDraw(data, date.getTime() + 18000000);
        }, 17000);
        setTimeout(function(){
          var data = [];
          for(var i=date.getTime() + 18000001, nLen=date.getTime() + 21600000; i<nLen; i+=360){
            data.push({
              x : i,
              y : Math.round(_.random(0, 10000) / _.random(1, 1000)),
              r : _.random(4,5),
              type : _.random(0,100) < 80 ? 'Success' : (_.random(0,100) < 80 ? 'Failed' : (_.random(0,100) < 80 ? 'Warning' : 'Others'))
            });
          }
          oScatterChart.addBubbleAndMoveAndDraw(data, date.getTime() + 21600000);
        }, 21000);
        setTimeout(function(){
          var data = [];
          for(var i=date.getTime() + 21600001, nLen=date.getTime() + 25200000; i<nLen; i+=360){
            data.push({
              x : i,
              y : Math.round(_.random(0, 10000) / _.random(1, 1000)),
              type : _.random(0,100) < 80 ? 'Success' : (_.random(0,100) < 80 ? 'Failed' : (_.random(0,100) < 80 ? 'Warning' : 'Others'))
            });
          }
          oScatterChart.addBubbleAndMoveAndDraw(data, date.getTime() + 25200000);
        }, 24000);
        setTimeout(function(){
          var data = [];
          for(var i=date.getTime() + 25200001, nLen=date.getTime() + 28800000; i<nLen; i+=360){
            data.push({
              x : i,
              y : Math.round(_.random(0, 10000) / _.random(1, 1000)),
              r : _.random(3,5),
              type : _.random(0,100) < 80 ? 'Success' : (_.random(0,100) < 80 ? 'Failed' : (_.random(0,100) < 80 ? 'Warning' : 'Others'))
            });
          }
          oScatterChart.addBubbleAndMoveAndDraw(data, date.getTime() + 28800000);
        }, 27000);
        setTimeout(function(){
          var data = [];
          for(var i=date.getTime() + 28800001, nLen=date.getTime() + 32400000; i<nLen; i+=360){
            data.push({
              x : i,
              y : Math.round(_.random(0, 10000) / _.random(1, 1000)),
              type : _.random(0,100) < 80 ? 'Success' : (_.random(0,100) < 80 ? 'Failed' : (_.random(0,100) < 80 ? 'Warning' : 'Others'))
            });
          }
          oScatterChart.addBubbleAndMoveAndDraw(data, date.getTime() + 32400000);
        }, 30000);
      }
});