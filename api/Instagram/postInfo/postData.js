const extractShortcode = (url) => {
	const match = url.match(/\/p\/([^\/?]+)/);
	return match ? match[1] : "";
}


const postData = () => {
	Log("시트 데이터 수집 시작");
	const ss = SpreadsheetApp.getActiveSpreadsheet();
	const sheet = ss.getActiveSheet();
	const token = getRequiredProperty("API_TOKEN");

	const lastRow = sheet.getLastRow();
	const urls = sheet.getRange(2, 1, lastRow - 1, 1).getValues().flat();
	const shortcodes = urls.map(url => extractShortcode(url));

	return { token, urls, shortcodes, sheet };
}
