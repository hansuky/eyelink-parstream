$(document).ready(function() {      
  $("#register-submit-btn").click(function() {
    if ($("#roleid").val() == "") {
      $("#roleid").focus();
      $("#register_tnc_error").html(m.common.check.id);
      $("#register_tnc_error").show();
      return false;
    }
    if ($("#rolename").val() == "") {
      $("#rolename").focus();
      $("#register_tnc_error").html(m.common.check.name);
      $("#register_tnc_error").show();
      return false;
    }      

    // TODO 메시지 공통 영역으로
    if (confirm(m.common.confirm.add)) {
      var roleid = $("#roleid").val();
      var data = $('#create_account').serialize();
      var in_data = { url : "/management/role/"+roleid, type : "POST", data : data };
      ajaxTypeData(in_data, function(result){
        alert('(' + result.rtnCode.code + ')' +result.rtnCode.message);
        if (result.rtnCode.code == "D001") {
          location.href = "/management/role";
        } 
      });
    }
  });

  $("#roleid").keydown(function() {
    $("#register_tnc_error").html("");
    $("#register_tnc_error").hide();
  });
  $("#rolename").keydown(function() {
    $("#register_tnc_error").html("");
    $("#register_tnc_error").hide();
  });     
});