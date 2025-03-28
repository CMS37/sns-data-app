function TiktokData() {

	Log("데이터 수집 시작");

	var ss = SpreadsheetApp.getActiveSpreadsheet();
	var sheet = ss.getActiveSheet();

	var token = PropertiesService.getScriptProperties().getProperty("API_TOKEN");

	if (!token) {
		throw new Error("Script Properties에 API_TOKEN 값이 설정되어 있지 않습니다.");
	}

	var period = sheet.getRange("C2").getValue();
	var sorting = sheet.getRange("D2").getValue();
	var matchExactly = sheet.getRange("E2").getValue();
	
	var lastRow = sheet.getLastRow();
	if (lastRow < 2) {
		throw new Error("입력된 데이터가 없습니다.");
	}

	var data = sheet.getRange(2, 1, lastRow - 1, 2).getValues();
	var tasks = [];
	
	data.forEach(function(row) {
	  var country = row[0];
	  var keyword = row[1];
	  if (country && keyword) {
		tasks.push({ country: country, keyword: keyword });
	  }
	});

	return {
	  ss: ss,
	  tasks: tasks,
	  period: period,
	  sorting: sorting,
	  matchExactly: matchExactly,
	  token: token
	};
}
