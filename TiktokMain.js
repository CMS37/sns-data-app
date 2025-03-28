function mainProcess() {
	try {
		Log("메인 시작");
		var sheetData = TiktokData();
		Log("시트 데이터: " + JSON.stringify(sheetData));

		var ss = sheetData.ss;
		var tasks = sheetData.tasks;
		var period = sheetData.period;
		var sorting = sheetData.sorting;
		var matchExactly = sheetData.matchExactly;
		var token = sheetData.token;
		
		Log("키워드 API 요청 시작");
		tasks = fetchAllKeywordData(tasks, period, sorting, matchExactly, token);
		Log("키워드 API 요청 완료");

		Log("유저 API 요청 시작");
		tasks = fetchAllUserData(tasks, token);
		Log("유저 API 요청 완료");

		Log("결과 시트 생성 및 데이터 입력");
		RecordToSheet(ss, tasks);
		Log("결과 시트 생성 및 데이터 입력 완료");

		Log("메인 종료");
	} catch (error) {
		Log("메인 에러: " + error.toString());
	}
}
