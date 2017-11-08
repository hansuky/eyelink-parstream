function drawDetail(detail, id, date, app, agent) {    
  $('#call').empty();
  var sb = new StringBuffer();
  sb.append('<div class="row"><div class="col-md-12"><div class="portlet light bordered"><div class="portlet-body form">');
  sb.append('<table class="table table-striped table-bordered table-hover"><tr>');
  sb.append('<th>Application : '+app+'</th><th>TransactionId : '+id+'</th><th>AgentId : '+agent+'</th></tr></table>')
  sb.append('<table class="table tree-2 table-bordered table-striped table-condensed">');
  sb.append('<tr><th>Method</th><th>Argument</th><th>Start Time</th><th>Gap(ms)</th>');
  sb.append('<th>Exec(ms)</th><th>Exec(%)</th><th>Self(ms)</th><th>Class</th><th>API</th><th>Agent</th><th>Application</th></tr>');  
  var level = 1;
  detail.callstack.forEach(function(d){
    if(d.start_time==null) {      d.start_time = '';    }    
    if(d.gap_time==null) {      d.gap_time = '';    }
    if(d.exec_time==null) {      d.exec_time = '';    }
    if(d.self_time==null) {      d.self_time = '';    }
    if(d.exec_class==null) {      d.exec_class = '';    }
    if(d.exec_time==null) {      d.exec_time = '';    }
    if(d.exec_api==null) {      d.exec_api = '';    }
    if(d.agent_id==null) {      d.agent_id = '';    }
    if(d.application_id==null) {      d.application_id = '';    }    
    if(d.level == 1){
      sb.append('<tr class="treegrid-'+d.sequence+'">');
      level = d.sequence;
    } else if(d.level != (level+1)){  
      sb.append('<tr class="treegrid-'+d.sequence+' treegrid-parent-'+level+'">');
      level = d.sequence;
    } else {
      sb.append('<tr class="treegrid-'+d.sequence+' treegrid-parent-'+level+'">');
    }
    sb.append('<td>'+d.method+'</td><td>'+d.argument+'</td><td>'+d.start_time+'</td><td>'+d.gap_time+'</td>')
    sb.append('<td>'+d.exec_time+'</td><td></td><td>'+d.self_time+'</td><td>'+d.exec_class+'</td>');
    sb.append('<td>'+d.exec_api+'</td><td>'+d.agent_id+'</td><td>'+d.application_id+'</td></tr>');
  });
  sb.append('</table></dir></dir></dir></dir>');  
  $('#call').append(sb.toString());  
    $('.tree-2').treegrid({
    expanderExpandedClass: 'glyphicon glyphicon-minus',
    expanderCollapsedClass: 'glyphicon glyphicon-plus'
  }); 
}