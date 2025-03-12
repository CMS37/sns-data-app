const ExcelJS = require("exceljs");
const path = require("path");

// 엑셀 파일의 첫 번째 워크시트, 첫 번째 열 데이터를 배열로 읽어오는 함수
async function loadExcelData(fileName) {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(path.join(__dirname, fileName));
  const worksheet = workbook.getWorksheet(1);
  const data = [];
  worksheet.eachRow({ includeEmpty: false }, (row) => {
    data.push(row.getCell(1).value);
  });
  return data;
}

async function saveTiktokData(client) {
	console.log("TikTok Data loading...");

	const keywords = await loadExcelData("keyword.xlsx");
	// const countries = await loadExcelData("country.xlsx");

  for (const keyword of keywords) {
    console.log("Data Request: ", keyword);
  }
	// for (const country of countries) {
	// 	for (const keyword of keywords) {
	// 		console.log("Data Request: ", keyword, country);
	// 	}
	// }

  return "TickTok 요청 처리 완료"
}

module.exports = {
  saveTiktokData,
};

// const result = await client.tiktok.fullKeywordSearch({
//     keyword: "St. Ives",
//     country: "US",
//     period: 1, //주어진 기간보다 최근 게시물 = "0", "1", "7", "30", "90", "180" (일)
//     sorting: 0, // 0: 관련성, 1: 좋아요순
//     matchExactly: false, // 정확히 일치하는 게시물만 가져오기 (true/false)
// });

// if (result.error) {
//     console.log("Error");
//     return result.error;
// }
// console.log("Data Success");
// return result.data;