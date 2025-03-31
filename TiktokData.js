function TiktokData() {

	Log("시트 데이터 수집 시작");

	var ss = SpreadsheetApp.getActiveSpreadsheet();
	var sheet = ss.getActiveSheet();

	var token = getRequiredProperty("API_TOKEN");

	var period = sheet.getRange("C2").getValue();
	var sorting = sheet.getRange("D2").getValue();
	var matchExactly = sheet.getRange("E2").getValue();
	
	var lastRow = sheet.getLastRow();
	if (lastRow < 2) {
		throw new Error("입력된 데이터가 없습니다.");
	}

	var dataRange  = sheet.getRange(2, 1, lastRow - 1, 2).getValues();

	var filteredData = dataRange.filter(function(row) {
		return row[0] || row[1];
	});

	if (filteredData.length === 0) {
		throw new Error("국가 또는 키워드가 입력된 유효한 행이 없습니다.");
	}

	var tasks = filteredData.map(function(row) {
		return { country: row[0], keyword: row[1] };
	});

	return {
		token,
		period,
		sorting,
		matchExactly,
		tasks,
		ss
	};
}
