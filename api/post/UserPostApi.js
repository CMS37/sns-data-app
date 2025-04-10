const extractHashtags = (post) => {
	const textExtra = post.text_extra || [];

	return textExtra.map(item => item.hashtag_name)
					.filter(Boolean)
					.map(tag => tag.toLowerCase().replace(/^#/, ''));
};

const extractWordsFromDesc = (desc) => {
	const cleanText = desc.replace(/#[^\s]+/g, '').toLowerCase();

	return cleanText.split(/\s+/).filter(Boolean);
};
  
const getCombinedKeywords = (post, desc) => {
	const tagsFromExtra = extractHashtags(post);
	const wordsFromDesc = extractWordsFromDesc(desc);

	return Array.from(new Set([...tagsFromExtra, ...wordsFromDesc]));
};

const buildPcUrl = (uniqueId, awemeId) => {
	return `https://www.tiktok.com/@${uniqueId}/video/${awemeId}`;
};

const buildUserPostUrl = (username, token) => {
	const root = "https://ensembledata.com/apis";
	const endpoint = "/tt/user/posts";
	const params = {
		depth: 1,
		username,
		token
		// start_cursor: 0, // 시작 위치
		// oldest_createtime: 0, // 해당 시간보다 이전 게시물은 제외
		// alternative_method: false, // 추가정보?
	};
	const queryString = Object.keys(params)
		.map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
		.join("&");

	return `${root}${endpoint}?${queryString}`;
}

const fetchUserPosts = (usernames, reportSheet, tags) => {
	const token = getRequiredProperty("API_TOKEN");

	const urls = usernames.map(user => buildUserPostUrl(user.name, token));
	const responses = fetchAllInBatches(urls, 100, 500);

	const allRows = [];

	responses.forEach((response, i) => {
		const username = usernames[i];
		try {
			const userJson = JSON.parse(response.getContentText());
			if (!userJson.data || !Array.isArray(userJson.data)) {
				Log(`유저의 데이터가 없습니다: ${username.name}`);
				return;
			}
		  	userJson.data.forEach((post, index) => {
				const Keywords = getCombinedKeywords(post, post.desc);
				const matchFound = Keywords.some(tag => {
					const cleanTag = tag.toLowerCase().replace(/^#/, "");
					return tags.includes(cleanTag);
				});
				if (matchFound) {
					const statistics = post.statistics || {};

					const awemeId = post.aweme_id || " Error ";
					const uniqueId = post.author.unique_id || " Error ";
					const pcUrl = buildPcUrl(uniqueId, awemeId);

					const playCount = statistics.play_count || 0;
					const diggCount = statistics.digg_count || 0;
					const collectCount = statistics.collect_count || 0;
					const commentCount = statistics.comment_count || 0;

					const followerCount = post.author.follower_count  || 0;
					const country = post.region || " Error ";

					const tagsJoined = Keywords.join(" | ");
					Log(`일치하는 ${index + 1} 번쨰 게시글: ${pcUrl}`);
					Log(`게시글 전체 태그: ${tagsJoined}`);

					allRows.push([
						uniqueId,
						country,
						followerCount,
						pcUrl,
						playCount,
						commentCount,
						diggCount,
						collectCount,
					]);
				}
			});
		} catch (e) {
		  Log(`유저 ${username.name} API 응답 오류: ${e.toString()}`);
		}
	});
	if (allRows.length > 0) {
		const startRow = reportSheet.getLastRow() + 1;
		reportSheet.getRange(startRow, 1, allRows.length, allRows[0].length).setValues(allRows);
	}

}