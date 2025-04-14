const mainProcess = () => {
	try {
	  Log("메인 시작");
	  const sheetData = TiktokData();
	  Log("시트 데이터 수집 완료");
  
	  const { ss, tasks, period, sorting, token } = sheetData;
  
	  Log("키워드 API 요청 시작");
	  const updatedTasks = fetchAllKeywordData(tasks, period, sorting, token);
	  Log("키워드 API 요청 완료");
  
	  Log("유저 API 요청 시작");
	  const finalTasks = fetchAllUserData(updatedTasks, token);
	  Log("유저 API 요청 완료");
  
	  Log("결과 시트 생성 및 데이터 입력");
	  RecordToSheet(ss, finalTasks);
	  Log("결과 시트 생성 및 데이터 입력 완료");
  
	  Log("메인 종료");
	} catch (error) {
	  Log("메인 에러: " + error.toString());
	  throw new Error("메인 에러: " + error.toString());
	}
};
  