const ExcelJS = require("exceljs");
const path = require("path");

// 엑셀 파일의 첫 번째 워크시트, 첫 번째 열 데이터를 배열로 읽어오는 함수
async function loadExcelData(filePath) {
	const workbook = new ExcelJS.Workbook();
	await workbook.xlsx.readFile(filePath);
	const worksheet = workbook.getWorksheet(1);
	const data = [];
	worksheet.eachRow({ includeEmpty: false }, (row) => {
	  data.push(row.getCell(1).value);
	});
	return data;
  }

const testData = require("./TiktokTest.json");

async function saveTiktokData(client, keywordFilePath, countryFilePath) {
	console.log("TikTok Data loading...");
  
	const keywords = await loadExcelData(keywordFilePath);
	const countries = await loadExcelData(countryFilePath);
	const Data = [];
	console.log("== Data Request ==");
	console.log("Keywords:", keywords);
	console.log("Countries:", countries);
	for (const country of countries) {
	  for (const keyword of keywords) {
		// 테스트용: 실제 API 호출 대신 testData.data를 사용
		Data.push({
		  country: country,
		  keyword: keyword,
		  data: testData.data  // testData는 미리 require 해두었다고 가정
		});
	  }
	}
	return Data;
  }
	// for (const country of countries) {
	// 	for (const keyword of keywords) {
	// 		console.log(`Country: ${country}, Keyword: ${keyword}`);
	// 		try {
	// 			const result = await client.tiktok.fullKeywordSearch({
	// 				keyword: keyword,
	// 				country: country,
	// 				period: 1, //주어진 기간보다 최근 게시물 = "0", "1", "7", "30", "90", "180" (일)
	// 				sorting: 0, // 0: 관련성, 1: 좋아요순
	// 				matchExactly: false, // 정확히 일치하는 게시물만 가져오기 (true/false)
	// 			});

	// 			if (result.error) {
	// 				console.error(`API Error for country "${country}", keyword "${keyword}":`, result.error);
	// 				continue;
	// 			}
	// 			console.log(`Data Success for country "${country}", keyword "${keyword}" (${result.data.length} items)`);
	// 			Data.push({
	// 				country: country,
	// 				keyword: keyword,
	// 				data: result.data,
	// 			})
	// 		}
	// 		catch (error) {
	// 			console.error(`Exception for country "${country}", keyword "${keyword}":`, error);
	// 		}
	// 	}
	// }

module.exports = {
	saveTiktokData,
};