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

const fetchUserPosts = (usernames, reportSheet) => {
	const token = getRequiredProperty("API_TOKEN");

	const urls = usernames.map(user => buildUserPostUrl(user.name, token));
	urls.forEach((url, i) => {
		Log(`유저 ${usernames[i]} API 요청 URL: ${url}`);
	});
	const responses = fetchAllInBatches(urls, 100, 500);

	const DESIRED_TAGS = ["vtcosmetics", "reedleshot", "lipplumper", "microneedling"]; // 추후 시트에서 배열로 가져오기

	responses.forEach((response, i) => {
		const username = usernames[i];
		try {
			const userJson = JSON.parse(response.getContentText());
			if (!userJson.data || !Array.isArray(userJson.data)) {
				Log(`유저 ${username}의 데이터가 없습니다.`);
				return;
			}
		  	userJson.data.forEach((post, index) => {
				const textExtra = post.text_extra || [];
				const hashtags = textExtra.map(item => item.hashtag_name).filter(Boolean);
				const matchFound = hashtags.some(tag => {
					const cleanTag = tag.toLowerCase().replace(/^#/, "");
					return DESIRED_TAGS.includes(cleanTag);
				});
				if (matchFound) {
					const shareUrl = post.share_url || " Error ";
					const tagsJoined = hashtags.join(" + ");
					const playCount = post.statistics.play_count || 0;
					const diggCount = post.statistics.digg_count || 0;
					const collectCount = post.statistics.collect_count || 0;
					Log(`${index + 1} 번쨰 게시글 링크: ${shareUrl}`);
					Log(`게시글 태그: ${tagsJoined}`);
					Log(`조회수: ${playCount} 좋아요: ${diggCount} 저장수: ${collectCount}`);
					reportSheet.appendRow([shareUrl, playCount, diggCount, collectCount]);
				}
			});
		} catch (e) {
		  Log(`유저 ${username} API 응답 오류: ${e.toString()}`);
		}
	  });
}