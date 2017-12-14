$(document).ready(function() {
  initRecipeList();
  $('#search-recipe-btn').click(function() {
    searchRecipeBtn();
  })

  $('#list-add-btn').click(function() {
    goViewAddRecipe();
  })

  $('#new-save-recipe-btn').click(function() {
    addNewRecipeBtn();
  })

  $('#edit-save-recipe-btn').click(function() {
    saveEditRecipeBtn();
  })

  $('#edit-delete-recipe-btn').click(function() {
    deleteEditRecipeBtn();
  })

  $('#cancel-recipe-btn').click(function() {
    window.history.back()
  })

  $('#history-recipe-btn').click(function() {
    showHistoryView();
  })


  // Check ID 버튼을 클릭한 경우
  $('#check_id').click(function() {
    checkId();
  })

  $('#id').change(function() {
    $('#checked_id').val('');
    changeErrMsg(false, '');
  });
});

function initRecipeList() {
  // $('#serachStep').val($('#serachStep').attr('condData'));
  // $('#searchCid').val($('#searchCid').attr('condData'));
}

function searchRecipeBtn() {
  location.href = '/management/recipe?step=' + $('#serachStep').val() + '&cid=' + $('#searchCid').val();
}

function goViewAddRecipe() {
  location.href = '/management/recipe/NEW?step=' + $('#serachStep').val() + '&cid=' + $('#searchCid').val();
}

function goViewEditRecipe(vId) {
  location.href = '/management/recipe/'+ vId + '?step=' + $('#serachStep').val() + '&cid=' + $('#searchCid').val();
}

function addNewRecipeBtn() {
  if(checkInvalidInput()) return false;
  if(checkInvalidId()) return false;

  // TODO 메시지 공통 영역으로
  if (confirm("저장 하시겠습니까? ")) {
    var id = $("#id").val();
    var data = $('#add_recipe').serialize();
    var in_data = { url : "/management/recipe/"+id, type : "POST", data : data };
    ajaxTypeData(in_data, function(result){
      alert('(' + result.rtnCode.code + ')' +result.rtnCode.message);
      if (result.rtnCode.code == "D001") {
        goRecipeListPage();
      }
    });
  }
}

function saveEditRecipeBtn() {
  if(checkInvalidInput()) return false;

  // TODO 메시지 공통 영역으로
  if (confirm("저장 하시겠습니까? ")) {
    var id = $("#_id").val();
    var data = $('#update_recipe').serialize();
    var in_data = { url : "/management/recipe/"+id, type : "PUT", data : data };
    ajaxTypeData(in_data, function(result){
      alert('(' + result.rtnCode.code + ')' +result.rtnCode.message);
      if (result.rtnCode.code == "D002") {
        goRecipeListPage();
      }
    });
  }
}

function deleteEditRecipeBtn() {
  // TODO 메시지 공통 영역으로
  if (confirm("삭제 하시겠습니까? ")) {
    var id = $("#_id").val();
    var data = $('#update_recipe').serialize();
    var in_data = { url : "/management/recipe/"+id, type : "DELETE", data : data };
    ajaxTypeData(in_data, function(result){
      alert('(' + result.rtnCode.code + ')' +result.rtnCode.message);
      if (result.rtnCode.code == "D003") {
        goRecipeListPage();
      }
    });
  }
}

function goRecipeListPage() {
  location.href = "/management/recipe?step="+$('#step').val() + "&cid="+$('#cid').val();
}

function changeErrMsg(isShow, msg) {
  $("#register_tnc_error").html(msg);
  if (isShow)
    $("#register_tnc_error").show();
  else
    $("#register_tnc_error").hide();
}

function checkId() {
  if(checkInvalidInput(true)) return true;

  var id = $("#id").val();
  var in_data = { url : "/management/restapi/checkId/"+id, type : "GET", data : null };
  ajaxTypeData(in_data, function(result) {
    $('#modal-message').html('(' + result.rtnCode.code + ') ' +result.rtnCode.message)
    if (result.rtnCode.code == 'M001')
      $('#checked_id').val('Y');
    $('#modal-msg').modal("show");
  });
}

function checkInvalidInput(checkIdOnly) {
  if ($("#id").val() == "") {
    $("#id").focus();
    changeErrMsg(true, "ID를 입력하세요.");
    return true;
  }
  if (checkIdOnly) return false;

  if ($("#name").val() == "") {
    $("#name").focus();
    changeErrMsg(true, "Name을 입력하세요.");
    return true;
  }
  return false;
}

function checkInvalidId() {
  console.log($("#checked_id").val())
  if ($("#checked_id").val() == "Y") {
    return false;
  } else {
    $("#id").focus();
    changeErrMsg(true, "Check ID를 수행해 주세요.");
    return true;
  }
}

function showHistoryView() {
  $('#modal-history').modal("show");
}
