function define(name, value) {
	Object.defineProperty(exports, name, {
		value: value,
		enumerable : true,
	});
}

define("CONFIG", {
	"UPLOADPATH_OFFICE": {real: "/Users/baesunghan/git/dentalJobs/public/upload/office/",
						  relative: "/upload/office/"},
});

define("SCHEMA_EFMM", {
	"EFMM_NOTCHING_OEE": {'INDEX' : 'efmm_notching_oee', 'TYPE' : 'oee'},
	"EFMM_NOTCHING_STATUS": {'INDEX' : 'efmm_notching_status', 'TYPE' : 'status'},
	"EFMM_STACKING_OEE": {'INDEX' : 'efmm_stacking_oee', 'TYPE' : 'oee'},
	"EFMM_STACKING_STATUS": {'INDEX' : 'efmm_stacking_status', 'TYPE' : 'status'}
});

define("SCHEMA", {
	"EFSM_ALARM": {'INDEX' : 'efsm_alarm-', 'TYPE' : 'AgentAlarm'},
	"APPLICATION_INFO": {'INDEX' : 'efsm_applicationinfo', 'TYPE' : 'applicationInfo'}
});

define("APPLICATION_INFO", {
	"ELAGENT": 'elagent',
	"FILEBEAT": 'filebeat',
	"COLLECTION" : {"LOG" : "LOG", "AGENT": "AGENT"},
	"INDEX" : {"INDEX_NAME" : "efsm_applicationinfo", "TYPE_NAME" : "applicationInfo"}
});

define(	"CODE", {
	"MANAGEMENT" : {
		"M001": "사용할 수 있는 ID 입니다.",
		"M002": "동일한 ID가 이미 존재합니다."
	},
	"DASHBOARD" : {
		"B": "PERSONAL",
		"C": "OFFICE"
	}
});

define("DATEFORMAT", {
	"DATE" : "YYYY-MM-DD",
	"DATETIME" : "YYYY-MM-DD HH:MM:SS",
	"DATETIMEMILLI" : "YYYY-MM-DD HH:MM:SS.L",
	"INDEXDATE" : "YYYY.MM.DD"
});

define("TIMEZONE", {
	"KOREA" : "T15:00:00Z",
	"EFMM_START" : "T00:00:00Z",
	"EFMM_END" : "T23:59:59Z"
});

define("ERROR_CODE", {
	"0000": "SUCCESS!!!",
	"0001": "데이터가 존재하지 않습니다.",
	"E001": "일치하는 ID가 없습니다.",
	"E002": "비밀번호가 틀립니다.",
	"E003": "Upload할 파일이 없습니다.",
	"E004": "이미지 파일이 아닙니다.",
	"E005": "동일한 ID가 이미 존재합니다.",
	"E006": "이미 등록된 멤버입니다.",
	"E007": "ROLE에서 User가 삭제되지 않았습니다.",
	"D001": "등록되었습니다.",
	"D002": "수정되었습니다.",
	"D003": "삭제되었습니다.",
	"D004": "등록에 실패하였습니다.",
	"D005": "이미 등록된 코드입니다.",
	"D006" : "수정에 실패하였습니다.",
	"D007" : "수정할 내용이 없습니다.",
	"ER_DUP_ENTRY": "Duplicate entry for key 'PRIMARY'!!!",
	"ER_BAD_NULL_ERROR": "Column 'user_id' cannot be null",
});

function getErrData(key) {
	var msg = exports.ERROR_CODE[key];
	if (typeof msg == 'undefined')
		msg = "오류 코드(" + key + ")에 대한 메시지가 정의되어 있지 않습니다..";
	return {code: key, message : msg};
}

function getCodeValue(category, key) {
	console.log(key);
	if (key == "*") {
		return {code : key, message : exports.CODE[category]};
	} else {
		return {code : key, message : exports.CODE[category][key]};
	}
}

exports.getErrData = getErrData;
exports.getCodeValue = getCodeValue;
exports.UPLOADPATH_OFFICE = exports.CONFIG["UPLOADPATH_OFFICE"];
