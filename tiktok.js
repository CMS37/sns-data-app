// const testData = require("./TiktokTest.json");

async function saveTiktokData(client, selectedKeywords, selectedCountries, period, sorting, matchExactly) {
	console.log("TikTok Data loading...");
  
	const data = [];
	const promises = [];
  
	for (const country of selectedCountries) {
		for (const keyword of selectedKeywords) {
			console.log(`Country: ${country}, Keyword: ${keyword}`);
			promises.push(
				client.tiktok.fullKeywordSearch({
					keyword: keyword,
					country: country,
					period: Number(period),
					sorting: Number(sorting),
					match_exactly: matchExactly,
				}).then(result => {
					if (result.error) {
						console.error(`API Error for country "${country}", keyword "${keyword}":`, result.error);
						return;
					}

					console.log(`Data Success for country "${country}", keyword "${keyword}" (${result.data.length} items)`);
					console.log('Now fetching user info...');

					const posts = result.data;

					const userInfoPromises = posts.map(post => {
						const secUid = post.aweme_info.author.sec_uid;
						
						console.log(`Fetching user info for ${post.aweme_info.author.nickname}`);

						client.tiktok.userInfoFromSecuid({ 
							secUid: secUid 
						}).then(userInfoResult => {
							post.userInfo = userInfoResult.data;
							console.log('User info fetched:', userInfoResult.data);
						}).catch(error => {
							console.error(`Failed to fetch user info for ${userName}:`, error);
						});
					});

					return Promise.all(userInfoPromises).then(() => {
						data.push({
						country: country,
						keyword: keyword,
						data: posts,
					});
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