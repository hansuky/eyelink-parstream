function define(name, value) {
	Object.defineProperty(exports, name, {
		value: value,
		enumerable : true,
	});
}

define(	"COMMONCODE", {
	"STEP" : [
		{"key" : "NOTCHING", "value" : "Notching"},
		{"key" : "STACKING", "value" : "Stacking"},
		{"key" : "TABWELDING", "value" : "Tab Welding"},
		{"key" : "STACPACKAGINGKING", "value" : "Packaging"},
		{"key" : "DEGASSING", "value" : "Degassing"},
	],
	"MACHINE" : {
		"TYPE" : [
			{
				"key" : "Motor Parameter (30 Axis)",
				"value" : "Motor Parameter (30 Axis)"
			},
			{
				"key" : "Productive Parameter",
				"value" : "Productive Parameter"
			}
		],
		"UNIT" : [
			{
				"key" : "mm/sec or degree/sec",
				"value" : "mm/sec or degree/sec"
			},
			{
				"key" : "mm or degree",
				"value" : "mm or degree"
			},
			{
				"key" : "mm",
				"value" : "mm"
			},
			{
				"key" : "ppm",
				"value" : "ppm"
			},
			{
				"key" : "msec",
				"value" : "msec"
			},
			{
				"key" : "Mpa",
				"value" : "Mpa"
			},
			{
				"key" : "count",
				"value" : "count"
			},
			{
				"key" : "cycle",
				"value" : "cycle"
			},
			{
				"key" : "0:미사용/1:사용",
				"value" : "0:미사용/1:사용"
			},
			{
				"key" : "0:왼쪽 / 1:오른쪽",
				"value" : "0:왼쪽 / 1:오른쪽"
			},
			{
				"key" : "0:음극 / 1:양극",
				"value" : "0:음극 / 1:양극"
			},
		],
		"DATATYPE" : [
			{
				"key" : "Double",
				"value" : "Double"
			},
			{
				"key" : "Short",
				"value" : "Short"
			},
			{
				"key" : "Integer",
				"value" : "Integer"
			}
		]
	},
    "RULE" : {
        "TYPE" : [
            { "key" : "oee", "value" : "OEE"},
            { "key" : "status", "value" : "STATUS"}
        ],
        "RULENAME" : [
            { "key" : "ooee", "value" : "Overall OEE", "pkey" : "oee"},
            { "key" : "availability", "value" : "Availability", "pkey" : "oee"},
            { "key" : "performance", "value" : "Performance", "pkey" : "oee"},
            { "key" : "quality", "value" : "Quality", "pkey" : "oee"},
            { "key" : "downtime", "value" : "Down Time", "pkey" : "oee"},
            { "key" : "plannedbreaktime", "value" : "Planned Break Time", "pkey" : "oee"},
            { "key" : "down", "value" : "Down", "pkey" : "status"},
            { "key" : "sepa_unwind", "value" : "Sepa Unwind", "pkey" : "status"},
        ],
        "CONDITION" : [
            { "key" : "less", "value" : "<"},
            { "key" : "lesseq", "value" : "<="},
            { "key" : "eq", "value" : "="},
            { "key" : "great", "value" : ">"},
            { "key" : "greateq", "value" : ">="},
        ],
        "ALARMTYPE" : [
            { "key" : "email", "value" : "E-mail"},
            { "key" : "sms", "value" : "SMS"}
        ]
    }
});
