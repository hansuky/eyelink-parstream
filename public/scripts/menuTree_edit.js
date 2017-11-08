$(function() {
  getMenu();    
  $("#register-submit-btn").click(function() {
    if ($("#upcode").val() == "") {          
      $("#register_tnc_error").html("Upper Menu를 먼저 등록하세요.");
      $("#register_tnc_error").show();
      return false;
    }
    if ($("#code").val() == "") {
      $("#code").focus();
      $("#register_tnc_error").html("Code를 입력하세요.");
      $("#register_tnc_error").show();
      return false;
    }
    if (9999<parseInt($("#code").val())||parseInt($("#code").val())<999) {
      console.log(parseInt($("#code").val()));
      $("#code").focus();
      $("#register_tnc_error").html("Code는 4자리 숫자로 입력하세요");
      $("#register_tnc_error").show();
      return false;
    }
    if (($("#code").val()).substring(0,1)/1000 != ($("#upcode").val()).substring(0,1)/1000) {
      console.log(($("#code").val()).substring(0,1));
      console.log(parseInt($("#upcode").val()));
      $("#code").focus();
      $("#register_tnc_error").html("첫자리는 Upper Menu code와 동일하게 입력해주세요");
      $("#register_tnc_error").show();
      return false;
    }        
    if ($("#name").val() == "") {
      $("#name").focus();
      $("#register_tnc_error").html("Name을 입력하세요.");
      $("#register_tnc_error").show();
      return false;
    }      

    // TODO 메시지 공통 영역으로
    if (confirm("등록 하시겠습니까? ")) {
      var code = $("#code").val();      
      $.ajax({
        url: "/management/menu/" + code,
        dataType: "json",
        type: "POST",
        data:$('#create_account').serialize(),
        success: function(result) {
          console.log(result)
          alert('(' + result.rtnCode.code + ')' +result.rtnCode.message);
          if (result.rtnCode.code == "D001") {
            location.href = "/management/menu/editMenu";
          }
         },
        error: function(req, status, err) {
          //- alert("code:"+request.status+"\n"+"message:"+request.responseText+"\n"+"error:"+error);
          $("#errormsg").html("code:"+status+"\n"+"message:"+req.responseText+"\n"+"error:"+err);
        }
      });
    }
  });         
});

function getMenu() {        
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
  sb.append('<table class="table tree-2 table-bordered table-striped table-condensed">');
  data.forEach(function(d){      
    if(d._source.upcode == "0000"){
     sb.append('<tr class="treegrid-'+ parseInt(d._source.code) +' treegrid-parent-'+ parseInt(d._source.upcode)+'"><td>'+d._source.name+'</td><td>'+d._source.code+'</td><td></td></tr>');          
    } else if(d._source.upcode != null){
      sb.append('<tr class="treegrid-'+ parseInt(d._source.code) +' treegrid-parent-'+ parseInt(d._source.upcode)+'"><td>'+d._source.name+'</td><td>'+d._source.code+'</td><td>');
      sb.append('<a class="btn default btn-xs balck" onclick="drawUpdate('+"'"+d._id+"',"+d._source.code+",'"+d._source.name+"',"+d._source.upcode+')"><i class="fa fa-edit"></i> Update </a>');         
      sb.append('<a class="btn default btn-xs balck" onclick="clickDelete('+"'"+d._id+"'"+')"><i class="fa fa-trash-o"></i> Delete </a></td></tr>');         
    } else {
       sb.append('<tr class="treegrid-'+ parseInt(d._source.code) +'"><td>name</td><td>code</td><td></td></tr>');         
    }     
  });
  sb.append('</table></div>');  
  $('#call').append(sb.toString());  
    $('.tree-2').treegrid({
    expanderExpandedClass: 'glyphicon glyphicon-minus',
    expanderCollapsedClass: 'glyphicon glyphicon-plus'
  }); 
}

function clickDelete(id){
  if (confirm("삭제 하시겠습니까? ")) {
    deleteMenu(id, true);    
  }
}

function deleteMenu(id, status){
  $.ajax({
    url: "/management/menu/" + id,
    dataType: "json",
    type: "DELETE",
    data: {id : id},
    success: function(result) {
      if(status){
        alert('(' + result.rtnCode.code + ')' +result.rtnCode.message);
        if (result.rtnCode.code == "D003") {
         location.href = "/management/menu/editMenu";     
        }
      }
    },
    error: function(req, status, err) {
        //- alert("code:"+request.status+"\n"+"message:"+request.responseText+"\n"+"error:"+error);
        $("#errormsg").html("code:"+status+"\n"+"message:"+req.responseText+"\n"+"error:"+err);
      }
   });
}

function drawUpdate(id, code, name, upcode){
  console.log(id, name);
  var list = JSON.parse($('#upList').val());
  console.log(list);
  $('#edit').empty();
  var sb = new StringBuffer();
  sb.append('<div class="row"><div class="col-md-12"><div class="portlet light bordered">');
  sb.append('<div class="portlet-title"><div class="caption font-dark"><span class="caption-subject bold uppercase font-blue-sharp">');
  sb.append('Edit Menu</span></div></div><div class="portlet-body form">');
  sb.append('<form onsubmit="return false;" class="form-horizontal form-bordered">');
  sb.append('<div class="form-body"><div class="form-group"><label class="control-label col-md-5">Upper Menu</label>');
  sb.append('<div class="col-md-3"><label class="control-label visible-ie8 visible-ie9">Uppser Menu</label>');
  sb.append('<select id="eupcode" name="eupcode" class="select2 form-control">');
  list.forEach(function(d){    
    if(upcode == d.code){
      sb.append('<option value="'+d.code+'" selected>'+d.code+'-'+d.name+'</option>');
    } else {
      sb.append('<option value="'+d.code+'">'+d.code+'-'+d.name+'</option>');
    }
  })
  sb.append('</select></div><label class="control-label col-md-5">Code</label><div class="col-md-3"><label class="control-label visible-ie8 visible-ie9">Code</label>');
  sb.append('<div class="input-icon"><i class="fa fa-role"></i><input id="ecode" type="text" autocomplete="off" placeholder="Code" name="ecode" value="'+code+'" class="form-control placeholder-no-fix"/>');
  sb.append('</div></div><label class="control-label col-md-5">Name</label><div class="col-md-3">');
  sb.append('<label class="control-label visible-ie8 visible-ie9">Name</label><div class="input-icon">');
  sb.append('<input id="ename" type="text" placeholder="Name" name="ename" value="'+name+'" class="form-control placeholder-no-fix"/></div>');
  sb.append('</div><div class="col-md-12" id="register_tnc_eerror" style="text-align:center;"></div>');
  sb.append('<div class="col-md-11"><button id="register-submit-btn2" class="btn green pull-right" onclick="clickUpdate('+"'"+id+"'"+')">Update</button>');
  sb.append('</div></div></form></div></div></div></div>');  
  $('#edit').append(sb.toString());     
}

function clickUpdate(id){
  if ($("#ecode").val() == "") {
    $("#ecode").focus();
    $("#register_tnc_eerror").html("Code를 입력하세요.");
    $("#register_tnc_eerror").show();
    return false;
  }
  if (9999<parseInt($("#ecode").val())||parseInt($("#ecode").val())<999) {
    console.log(parseInt($("#ecode").val()));
    $("#ecode").focus();
    $("#register_tnc_eerror").html("Code는 4자리 숫자로 입력하세요");
    $("#register_tnc_eerror").show();
    return false;
  }
  if (($("#ecode").val()).substring(0,1)/1000 != ($("#eupcode").val()).substring(0,1)/1000) {
    console.log(($("#ecode").val()).substring(0,1));
    console.log(parseInt($("#eupcode").val()));
    $("#ecode").focus();
    $("#register_tnc_eerror").html("첫자리는 Upper Menu code와 동일하게 입력해주세요");
    $("#register_tnc_eerror").show();
    return false;
  }        
  if ($("#ename").val() == "") {
    $("#ename").focus();
    $("#register_tnc_eerror").html("Name을 입력하세요.");
    $("#register_tnc_eerror").show();
    return false;
  }  

  if (confirm("수정 하시겠습니까? ")) {
    var code = $("#ecode").val();
    var upcode = $("#eupcode").val();
    var name = $("#ename").val();    
    console.log(id, code, upcode, name);
    $.ajax({
      url: "/management/menu/" + code,
      dataType: "json",
      type: "PUT",
      data: { id : id, code : code, name : name, upcode : upcode },
      success: function(result) {                  
        alert('(' + result.rtnCode.code + ')' +result.rtnCode.message);
        location.href = "/management/menu/editMenu";        
      },
      error: function(req, status, err) {
        //- alert("code:"+request.status+"\n"+"message:"+request.responseText+"\n"+"error:"+error);
        $("#errormsg").html("code:"+status+"\n"+"message:"+req.responseText+"\n"+"error:"+err);
      }
    });    
  }
}
