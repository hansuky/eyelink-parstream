$(document).ready(function() { 
      TableManaged.init();
      $('a').click(function(event){
        //- event.preventDefault();
        if ('deleteMem' != $(this).attr('flag')) return;
        var roleid = $('#roleid').val();
        var memid = $(this).attr('memid');
        if (memid == "") {
          return false;
        }        
        // TODO 메시지 공통 영역으로
        if (confirm("삭제 하시겠습니까? ")) {
          var in_data = { url : "/management/mem/"+memid, type : "DELETE", data : { memid : memid } };
          ajaxGetData(in_data, function(result){          
            alert('(' + result.rtnCode.code + ')' +result.rtnCode.message);
            if (result.rtnCode.code == "D003") {
              location.href = "/management/memList/"+roleid;
            }            
          });
        }        
      });

      $('#btn_search').click(function() {           
        var userid= $('#user').val();
        var roleid = $('#roleid').val();
        
        if (userid == "") {  return false; }        
        // TODO 메시지 공통 영역으로
        if (confirm("추가 하시겠습니까? ")) {          
          var in_data = { url : "/management/mem/"+roleid, type : "POST", data : { userid : userid } };
          ajaxGetData(in_data, function(result){          
            alert('(' + result.rtnCode.code + ')' +result.rtnCode.message);
            if (result.rtnCode.code == "D001") {
              location.href = "/management/memList/"+roleid;
            }            
          });
        }        
      });
    });