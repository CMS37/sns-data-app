const TiktokData = () => {
	Log("시트 데이터 수집 시작");
	const ss = SpreadsheetApp.getActiveSpreadsheet();
	const sheet = ss.getActiveSheet();
	const token = getRequiredProperty("API_TOKEN");
  
	const period = sheet.getRange("C2").getValue();
	if (![0, 1, 7, 30, 90, 180].includes(period)) {
		throw new Error(`기간은 숫자여야 합니다 숫자들은 참고사항을 확인해 주세요. 현재 값: ${period}`);
	}
  
	const sorting = sheet.getRange("D2").getValue();
	if (![0, 1].includes(sorting)) {
		throw new Error(`정렬은 0이거나 1이어야 합니다. 현재 값: ${sorting}`);
	}
  
	const lastRow = sheet.getLastRow();
	if (lastRow < 2) {
		throw new Error("입력된 데이터가 없습니다.");
	}
  
	const dataRange = sheet.getRange(2, 1, lastRow - 1, 2).getValues();
	const filteredData = dataRange.filter(row => row[0] || row[1]);
  
	if (filteredData.length === 0) {
		throw new Error("국가 또는 키워드가 입력된 유효한 행이 없습니다.");
	}
  
	const tasks = filteredData.map(row => ({ country: row[0], keyword: row[1] }));
	return { token, period, sorting, tasks, ss };
};
