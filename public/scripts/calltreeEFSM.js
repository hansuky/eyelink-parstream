function getTransaction(id, date) {      
  console.log(date);  
  $.ajax({
    url: "/dashboard/restapi/getTransactionDetail" ,
    dataType: "json",
    type: "get",
    data: { date : date, id : id },
    success: function(result) {
      if (result.rtnCode.code == "0000") {              
        drawDetail(result.rtnData);       
        console.log(result.rtnData);
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

function drawDetail(data) {        
  $('#call').empty();  
  var sb = new StringBuffer();  
  sb.append('<div class="row"><div class="col-md-12"><div class="portlet light bordered"><div class="portlet-body form">');
  sb.append('<table class="table table-striped table-bordered table-hover"><tr>');  
  if(data.length != 0){
    sb.append('<th>Application : '+data[0]._source.rpc+'</th><th>TransactionId : '+data[0]._source.transactionId+'</th><th>AgentId : '+data[0]._source.agentId+'</th><th>ApplicationName : '+data[0]._source.applicationId+'</th></tr></table>')
  } else {
    sb.append('<th>Application : </th><th>TransactionId : </th><th>AgentId : </th><th>ApplicationName : </th></tr></table>')  
  }
  sb.append('<table class="table tree-2 table-bordered table-striped table-condensed">');
  sb.append('<tr><th>Method</th><th>Argument</th><th>Start Time</th><th>Gap(ms)</th>');
  sb.append('<th>Exec(ms)</th><th>Exec(%)</th><th>Self(ms)</th><th>Class</th><th>API</th><th>Agent</th><th>Application</th></tr>');    
  var ano = 0, grid = 1, tree = 1, depth = 0, dCnt = 0, maxDepth = 0, treeList = [];  
  for(n=0; n<data.length; n++){
    var d = data[n]._source;        
    var mon = {'Jan' : '01', 'Feb' : '02', 'Mar' : '03', 'Apr' : '04', 'May' : '05', 'Jun' : '06', 'Jul' : '07', 'Aug' : '08', 'Sep' : '09', 'Oct' : '10', 'Nov' : '11', 'Dec' : '12' };
    var stime = new Date(d.startTime).getTime()+18*60*60*1000;      
    var ftime = msToTime(stime); 
    maxDepth = depth;
    if(d.depth != -1){          
      d.depth += maxDepth;          
      if(depth < d.depth) {
        depth = d.depth;
        treeList[depth] = grid;
      } else if(d.depth == 0) {
        treeList[d.depth] = 1;        
      }
      tree = treeList[d.depth];
    }    
    if(d.annotationBoList[0] != null){
      for(i=0; i <d.annotationBoList.length;i++){       
        var z = d.annotationBoList[i];            
        if(z.key === 10000014){
          var a = z.value.split('\n');        
          var b = a[1].split(':');                                                                    
          var value = b[0];          
          if(i==0 && tree==1){                           
            sb.append('<tr class="treegrid-'+ tree +'">');        
          } else {                         
            sb.append('<tr class="treegrid-'+ ++grid +' treegrid-parent-'+tree+'">');        
          }        
          sb.append('<td>'+value+'</td><td>'+d.rpc+'</td><td>'+d.applicationId+'</td><td>'+d.gap+'</td>')
          sb.append('<td>'+d.elapsed+'</td><td>'+Math.round(d.executionTime/d.elapsed*100)+'%</td><td>'+d.executionTime+'</td>');
          if(d.hasException){
            sb.append('<td>'+d.execeptionClass+'</td>');
          } else {
            sb.append('<td></td>');
          }
          sb.append('<td>'+d.serviceTypeName+'</td><td>'+d.agentId+'</td><td>'+d.applicationId+'</td></tr>');  
          if(d.remoteAddr != null) {                
            sb.append('<tr class="treegrid-'+ ++grid +' treegrid-parent-'+tree+'">');              
            sb.append('<td>'+'<span class="label label-sm label-default">i</span> REMOTE ADDRESS'+'</td><td>'+d.remoteAddr+'</td><td>'+'</td><td>'+'</td>')
            sb.append('<td>'+'</td><td></td><td>'+'</td><td>'+'</td><td>'+'</td><td>'+'</td><td>'+'</td></tr>');     
          } else {
            tree =grid;
          }
        } else if(z.key === 10000013){        
          if(i==0 && tree==1){          
            sb.append('<tr class="treegrid-'+ grid +'">');        
          } else {                    
            sb.append('<tr class="treegrid-'+ ++grid +' treegrid-parent-'+tree+'">');        
          }        
          stime += d.gap;
          ftime = msToTime(stime);
          sb.append('<td>'+z.value+'</td><td>'+d.rpc+'</td><td>'+ftime+'</td><td>'+d.gap+'</td>')
          sb.append('<td>'+d.elapsed+'</td><td>'+Math.round(d.executionTime/d.elapsed*100)+'%</td><td>'+d.executionTime+'</td><td></td>');
          sb.append('<td>'+d.serviceTypeName+'</td><td>'+d.agentId+'</td><td>'+d.applicationId+'</td></tr>');  
          if(d.remoteAddr != null) {                          
            sb.append('<tr class="treegrid-'+ ++grid +' treegrid-parent-'+tree+'">');                             
            sb.append('<td>'+'<span class="label label-sm label-default">i</span> REMOTE ADDRESS'+'</td><td>'+d.remoteAddr+'</td><td>'+'</td><td>'+'</td>')
            sb.append('<td>'+'</td><td></td><td>'+'</td><td>'+'</td><td>'+'</td><td>'+'</td><td>'+'</td></tr>');     
          } 
        } else if(z.key === 13){        
          if(i==0 && tree==1){          
            sb.append('<tr class="treegrid-'+ grid +'">');        
          } else {                    
            sb.append('<tr class="treegrid-'+ ++grid +' treegrid-parent-'+tree+'">');        
          }        
          var zz = d.annotationBoList[++i];
          stime += d.gap;
          ftime = msToTime(stime);
          sb.append('<td>'+zz.value+'</td><td>'+d.rpc+'</td><td>'+ftime+'</td><td>'+d.gap+'</td>')
          sb.append('<td>'+d.elapsed+'</td><td>'+Math.round(d.executionTime/d.elapsed*100)+'%</td><td>'+d.executionTime+'</td><td></td>');
          sb.append('<td>'+d.serviceTypeName+'</td><td>'+d.agentId+'</td><td>'+d.applicationId+'</td></tr>');  
          if(d.remoteAddr != null) {                          
            sb.append('<tr class="treegrid-'+ ++grid +' treegrid-parent-'+tree+'">');                             
            sb.append('<td>'+'<span class="label label-sm label-default">i</span> REMOTE ADDRESS'+'</td><td>'+d.remoteAddr+'</td><td>'+'</td><td>'+'</td>')
            sb.append('<td>'+'</td><td></td><td>'+'</td><td>'+'</td><td>'+'</td><td>'+'</td><td>'+'</td></tr>');     
          } 
        } else {
          console.log(z.key);
        }
      }
      for(i=0; i <d.spanEventBoList.length; i++){      
        var z = d.spanEventBoList[i];         
        if(z.depth != -1){                         
          if(depth < z.depth) {
            depth = z.depth;
            treeList[depth] = grid;
            if(z.depth == 1){
              treeList[depth] = tree;
            }
          }         
          tree = treeList[z.depth];
        }                
        for(j=0; j<z.annotationBoList.length;j++){                     
          var y =  z.annotationBoList[j];        
          if( y.key === 10000014){          
            var a = y.value.split('\n');      
            var e = a[1].split('(');
            var b = e[0].split('.');  
            var c = a[1].split(b[b.length-2]);  
            var t = c[1].substring(1).split(':')          
            stime += z.gap;          
            ftime = msToTime(stime);                   
            sb.append('<tr class="treegrid-'+ ++grid +' treegrid-parent-'+tree+'">');                    
            sb.append('<td>'+t[0]+'</td><td>'+'</td><td>'+ftime+'</td><td>'+z.gap+'</td>')
            sb.append('<td>'+z.elapsed+'</td><td>'+Math.round(z.executionTime/d.elapsed*100)+'%</td><td>'+z.executionTime+'</td><td>'+b[4]+'</td>');
            sb.append('<td>'+z.serviceTypeName+'</td><td>'+d.agentId+'</td><td>'+d.applicationId+'</td></tr>');                        
          } else if( y.key === 10000013){
            stime += z.gap;
            ftime = msToTime(stime);                   
            sb.append('<tr class="treegrid-'+ ++grid +' treegrid-parent-'+tree+'">');                    
            sb.append('<td>'+y.value+'</td><td>'+'</td><td>'+ftime+'</td><td>'+z.gap+'</td>')
            sb.append('<td>'+z.elapsed+'</td><td>'+Math.round(z.executionTime/d.elapsed*100)+'%</td><td>'+z.executionTime+'</td><td></td>');
            sb.append('<td>'+z.serviceTypeName+'</td><td>'+d.agentId+'</td><td>'+d.applicationId+'</td></tr>');              
          } else if( y.key === 40){                              
            var yy =  z.annotationBoList[++j];
            var yyy =  z.annotationBoList[++j];
            var yyyy =  z.annotationBoList[++j];                        
            var a = yyyy.value.split('\n');      
            var e = a[1].split('(');
            var b = e[0].split('.');  
            var c = a[1].split(b[b.length-2]);  
            var t = c[1].substring(1).split(':')          
            stime += z.gap;          
            ftime = msToTime(stime);                   
            sb.append('<tr class="treegrid-'+ ++grid +' treegrid-parent-'+tree+'">');                    
            sb.append('<td>'+t[0]+'</td><td>'+y.value+'</td><td>'+ftime+'</td><td>'+z.gap+'</td>')
            sb.append('<td>'+z.elapsed+'</td><td>'+Math.round(z.executionTime/d.elapsed*100)+'%</td><td>'+z.executionTime+'</td><td>'+b[4]+'</td>');
            sb.append('<td>'+z.serviceTypeName+'</td><td>'+d.agentId+'</td><td>'+d.applicationId+'</td></tr>');  
            treeList[++depth] = grid;
            tree = treeList[depth];
            sb.append('<tr class="treegrid-'+ ++grid +' treegrid-parent-'+ tree+'">');       
            sb.append('<td>'+'<span class="label label-sm label-default">i</span> http.status.code'+'</td><td>'+yy.value+'</td><td>'+'</td><td>'+'</td>')
            sb.append('<td>'+'</td><td></td><td>'+'</td><td>'+'</td><td>'+'</td><td>'+'</td><td>'+'</td></tr>');  
            sb.append('<tr class="treegrid-'+ ++grid +' treegrid-parent-'+tree+'">');                    
            sb.append('<td>'+'<span class="label label-sm label-default">i</span> http.info'+'</td><td>'+yyy.value+'</td><td>'+'</td><td>'+'</td>')
            sb.append('<td>'+'</td><td></td><td>'+'</td><td>'+'</td><td>'+'</td><td>'+'</td><td>'+'</td></tr>');
            if(++n < data.length){  
              maxDepth = depth;             
              var dd = data[n]._source;
              if(dd.depth != -1){                   
                dd.depth += maxDepth;                                       
                if(depth < dd.depth) {
                  depth = dd.depth;
                  treeList[depth] = grid;
                }
                tree = treeList[dd.depth];
              }                          
              if(dd.annotationBoList[0] != null){
                for(x=0; x <dd.annotationBoList.length;x++){       
                  var zz = dd.annotationBoList[x];            
                  if(zz.key === 10000014){
                    var a = zz.value.split('\n');                                              
                    var b = a[1].split(':');                                                                    
                    var value = b[0];                    
                    sb.append('<tr class="treegrid-'+ ++grid +' treegrid-parent-'+tree+'">');                                                
                    sb.append('<td>'+value+'</td><td>'+dd.rpc+'</td><td>'+dd.applicationId+'</td><td>'+dd.gap+'</td>')
                    sb.append('<td>'+dd.elapsed+'</td><td>'+Math.round(dd.executionTime/dd.elapsed*100)+'%</td><td>'+dd.executionTime+'</td>');
                    if(dd.hasException){
                      sb.append('<td>'+dd.execeptionClass+'</td>');
                    } else {
                      sb.append('<td></td>');
                    }
                    sb.append('<td>'+dd.serviceTypeName+'</td><td>'+dd.agentId+'</td><td>'+dd.applicationId+'</td></tr>');  
                    if(dd.remoteAddr != null) {                                                                          
                      treeList[depth+1] = grid;                                
                      tree = grid;
                      sb.append('<tr class="treegrid-'+ ++grid +' treegrid-parent-'+tree+'">');                                                             
                      sb.append('<td>'+'<span class="label label-sm label-default">i</span> REMOTE ADDRESS'+'</td><td>'+dd.remoteAddr+'</td><td>'+'</td><td>'+'</td>')
                      sb.append('<td>'+'</td><td></td><td>'+'</td><td>'+'</td>');
                      sb.append('<td>'+'</td><td>'+'</td><td>'+'</td></tr>');                          
                    }
                  } else if(zz.key === 10000013){        
                    sb.append('<tr class="treegrid-'+ ++grid +' treegrid-parent-'+tree+'">');                               
                    stime += dd.gap;
                    ftime = msToTime(stime);
                    sb.append('<td>'+zz.value+'</td><td>'+dd.rpc+'</td><td>'+ftime+'</td><td>'+dd.gap+'</td>')
                    sb.append('<td>'+dd.elapsed+'</td><td>'+Math.round(dd.executionTime/dd.elapsed*100)+'%</td><td>'+dd.executionTime+'</td><td></td>');
                    sb.append('<td>'+dd.serviceTypeName+'</td><td>'+dd.agentId+'</td><td>'+dd.applicationId+'</td></tr>');  
                    if(dd.remoteAddr != null) {                          
                      sb.append('<tr class="treegrid-'+ ++grid +' treegrid-parent-'+tree+'">');                                       
                      sb.append('<td>'+'<span class="label label-sm label-default">i</span> REMOTE ADDRESS'+'</td><td>'+dd.remoteAddr+'</td><td>'+'</td><td>'+'</td>')
                      sb.append('<td>'+'</td><td></td><td>'+'</td><td>'+'</td>');
                      sb.append('<td>'+'</td><td>'+'</td><td>'+'</td></tr>');     
                    } 
                  } else {
                    console.log(zz.key);
                  }
                }
                for(x=0; x <dd.spanEventBoList.length; x++){      
                  var zz = dd.spanEventBoList[x];         
                  if(zz.depth != -1){ 
                    zz.depth += maxDepth;                      
                    if(depth < zz.depth && treeList.length <= zz.depth) {
                      depth = zz.depth;
                      treeList[depth] = grid;                     
                    }         
                    tree = treeList[zz.depth];
                  }                          
                  for(m=0; m<zz.annotationBoList.length;m++){                     
                    var y =  zz.annotationBoList[m];        
                    if( y.key === 10000014){          
                      var a = y.value.split('\n');      
                      var e = a[1].split('(');
                      var b = e[0].split('.');  
                      var c = a[1].split(b[b.length-2]);  
                      var t = c[1].substring(1).split(':');
                      stime += zz.gap;          
                      ftime = msToTime(stime);                   
                      sb.append('<tr class="treegrid-'+ ++grid +' treegrid-parent-'+tree+'">');                            
                      sb.append('<td>'+t[0]+'</td><td>'+'</td><td>'+ftime+'</td><td>'+zz.gap+'</td>')
                      sb.append('<td>'+zz.elapsed+'</td><td>'+Math.round(zz.executionTime/dd.elapsed*100)+'%</td><td>'+zz.executionTime+'</td><td>'+b[4]+'</td>');
                      sb.append('<td>'+zz.serviceTypeName+'</td><td>'+dd.agentId+'</td><td>'+dd.applicationId+'</td></tr>');                        
                    } else if( y.key === 10000013){
                      stime += zz.gap;
                      ftime = msToTime(stime);                   
                      sb.append('<tr class="treegrid-'+ ++grid +' treegrid-parent-'+tree+'">');                            
                      sb.append('<td>'+y.value+'</td><td>'+'</td><td>'+ftime+'</td><td>'+zz.gap+'</td>')
                      sb.append('<td>'+zz.elapsed+'</td><td>'+Math.round(zz.executionTime/dd.elapsed*100)+'%</td><td>'+zz.executionTime+'</td><td></td>');
                      sb.append('<td>'+zz.serviceTypeName+'</td><td>'+dd.agentId+'</td><td>'+dd.applicationId+'</td></tr>');              
                    } else if( y.key === 40){                              
                      var yy =  zz.annotationBoList[++m];
                      var yyy =  zz.annotationBoList[++m];
                      var yyyy =  zz.annotationBoList[++m];                        
                      var a = yyyy.value.split('\n');      
                      var e = a[1].split('(');
                      var b = e[0].split('.');  
                      var c = a[1].split(b[b.length-2]);  
                      var t = c[1].substring(1).split(':')          
                      stime += zz.gap;          
                      ftime = msToTime(stime);                   
                      sb.append('<tr class="treegrid-'+ ++grid +' treegrid-parent-'+tree+'">');                    
                      sb.append('<td>'+t[0]+'</td><td>'+y.value+'</td><td>'+ftime+'</td><td>'+zz.gap+'</td>')
                      sb.append('<td>'+zz.elapsed+'</td><td>'+Math.round(zz.executionTime/dd.elapsed*100)+'%</td><td>'+zz.executionTime+'</td><td>'+b[4]+'</td>');
                      sb.append('<td>'+zz.serviceTypeName+'</td><td>'+dd.agentId+'</td><td>'+dd.applicationId+'</td></tr>');  
                      treeList[++depth] = grid;
                      tree = treeList[depth];
                      sb.append('<tr class="treegrid-'+ ++grid +' treegrid-parent-'+ tree+'">');       
                      sb.append('<td>'+'<span class="label label-sm label-default">i</span> http.status.code'+'</td><td>'+yy.value+'</td><td>'+'</td><td>'+'</td>')
                      sb.append('<td>'+'</td><td></td><td>'+'</td><td>'+'</td><td>'+'</td><td>'+'</td><td>'+'</td></tr>');  
                      sb.append('<tr class="treegrid-'+ ++grid +' treegrid-parent-'+tree+'">');                    
                      sb.append('<td>'+'<span class="label label-sm label-default">i</span> http.info'+'</td><td>'+yyy.value+'</td><td>'+'</td><td>'+'</td>')
                      sb.append('<td>'+'</td><td></td><td>'+'</td><td>'+'</td><td>'+'</td><td>'+'</td><td>'+'</td></tr>');             
                    } else if( y.key === 48){      
                      var yy =  zz.annotationBoList[++m];     
                      var a = yy.value.split('\n');      
                      if(a[1] == "Tomcat Servlet Process:0or"){
                        var t = a[1].split(':');
                      } else {  
                        var e = a[1].split('(');
                        var b = e[0].split('.');  
                        var c = a[1].split(b[b.length-2]);  
                        var t = c[1].substring(1).split(':');
                      }
                      stime += zz.gap;          
                      ftime = msToTime(stime);                   
                      sb.append('<tr class="treegrid-'+ ++grid +' treegrid-parent-'+tree+'">');                    
                      sb.append('<td>'+t[0]+'</td><td>'+y.value+'</td><td>'+ftime+'</td><td>'+zz.gap+'</td>')
                      sb.append('<td>'+zz.elapsed+'</td><td>'+Math.round(zz.executionTime/dd.elapsed*100)+'%</td><td>'+zz.executionTime+'</td><td>'+b[4]+'</td>');
                      sb.append('<td>'+zz.serviceTypeName+'</td><td>'+dd.agentId+'</td><td>'+dd.applicationId+'</td></tr>');                 
                    }        
                  }      
                  if(zz.hasException === true){          
                    var x = zz.exceptionMessage.split(':');          
                    sb.append('<tr class="treegrid-'+ ++grid +' treegrid-parent-'+tree+'" style="background-color:#FFA7A7">');                  
                    sb.append('<td><i class="fa fa-bolt"></i>  '+zz.exceptionClass+'</td><td>'+zz.exceptionMessage+'</td><td>'+'</td><td>'+'</td>')
                    sb.append('<td>'+'</td><td></td><td>'+'</td><td>'+'</td><td>'+'</td><td>'+'</td><td>'+'</td></tr>');  
                    console.log(zz.exceptionMessage)
                  }
                }
              }
            }          
          } else if( y.key === 48){      
            var yy =  z.annotationBoList[++j];     
            var a = yy.value.split('\n');      
            if(a[1] == "Tomcat Servlet Process:0or"){
              var t = a[1].split(':');
            } else {  
              var e = a[1].split('(');
              var b = e[0].split('.');  
              var c = a[1].split(b[b.length-2]);  
              var t = c[1].substring(1).split(':');
            }          
            stime += z.gap;          
            ftime = msToTime(stime);                   
            sb.append('<tr class="treegrid-'+ ++grid +' treegrid-parent-'+tree+'">');                    
            sb.append('<td>'+t[0]+'</td><td>'+y.value+'</td><td>'+ftime+'</td><td>'+z.gap+'</td>')
            sb.append('<td>'+z.elapsed+'</td><td>'+Math.round(z.executionTime/d.elapsed*100)+'%</td><td>'+z.executionTime+'</td><td>'+b[4]+'</td>');
            sb.append('<td>'+z.serviceTypeName+'</td><td>'+d.agentId+'</td><td>'+d.applicationId+'</td></tr>');                 
          }        
        }      
        if(z.hasException === true){          
          var x = z.exceptionMessage.split(':');          
          sb.append('<tr class="treegrid-'+ ++grid +' treegrid-parent-'+tree+'" style="background-color:#FFA7A7">');                  
          sb.append('<td><i class="fa fa-bolt"></i>  '+z.exceptionClass+'</td><td>'+z.exceptionMessage+'</td><td>'+'</td><td>'+'</td>')
          sb.append('<td>'+'</td><td></td><td>'+'</td><td>'+'</td><td>'+'</td><td>'+'</td><td>'+'</td></tr>');  
          console.log(z.exceptionMessage)
        }
      }
    }  
    dCnt++;  
  };
  sb.append('</table></div></div></div></div>');  
  $('#call').append(sb.toString());    
  $('.tree-2').treegrid({
    expanderExpandedClass: 'glyphicon glyphicon-minus',
    expanderCollapsedClass: 'glyphicon glyphicon-plus'
  }); 
}


function msToTime(duration) {
    var milliseconds = parseInt(duration%1000)
        , seconds = parseInt((duration/1000)%60)
        , minutes = parseInt((duration/(1000*60))%60)
        , hours = parseInt((duration/(1000*60*60))%24);

    hours = (hours < 10) ? "0" + hours : hours;
    minutes = (minutes < 10) ? "0" + minutes : minutes;
    seconds = (seconds < 10) ? "0" + seconds : seconds;

    return hours + ":" + minutes + ":" + seconds + "." + milliseconds;
}