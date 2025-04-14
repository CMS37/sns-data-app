const InsMain = () => {
	try {
		Log("메인 시작");
		const sheetData = postData();
		Log("시트 데이터 수집 완료");
	} catch (error) {
		Log("메인 에러: " + error.toString());
		throw new Error("메인 에러: " + error.toString());
	}
}