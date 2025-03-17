// const testData = require("./TiktokTest.json");

async function saveTiktokData(client, selectedKeywords, selectedCountries, period, sorting, matchExactly) {
	console.log("TikTok Data loading...");
	
	const data = [];

// 	for (const country of selectedCountries) {
// 		for (const keyword of selectedKeywords) {
// 			Data.push({
// 				country: country,
// 				keyword: keyword,
// 				data: testData.data
// 			});
// 		}
// 	}
// 	return Data;
// }
	const promises = [];

	for (const country of selectedCountries) {
		for (const keyword of selectedKeywords) {
			console.log(`Country: ${country}, Keyword: ${keyword}`);
			promises.push(
				client.tiktok.fullKeywordSearch({
					keyword: keyword,
					country: country,
					period: Number(period), //주어진 기간보다 최근 게시물 = "0", "1", "7", "30", "90", "180" (일)
					sorting: Number(sorting), // 0: 관련성, 1: 좋아요순
					match_exactly: matchExactly, // 정확히 일치하는 게시물만 가져오기 (true/false)
				}).then(result => {
					if (result.error) {
						console.error(`API Error for country "${country}", keyword "${keyword}":`, result.error);
						return;
					}

					console.log(`Data Success for country "${country}", keyword "${keyword}" (${result.data.length} items)`);

					data.push({
						country: country,
						keyword: keyword,
						data: result.data,
					});
				}).catch(error => {
					console.error(`Exception for country "${country}", keyword "${keyword}":`, error);
				})
			);
		}
	}

	await Promise.all(promises);
	return data;
}

module.exports = {
	saveTiktokData,
};