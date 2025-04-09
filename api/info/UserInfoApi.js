const buildUserInfoUrl = (username, token) => {
	const root = "https://ensembledata.com/apis";
	const endpoint = "/tt/user/info";
	const params = { username, secondary_method: true, token };
	const queryString = Object.keys(params)
	  .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
	  .join("&");
	return `${root}${endpoint}?${queryString}`;
};

const fetchAllUserData = (tasks, token) => {
	const usernameMap = {};
	tasks.forEach((task, taskIndex) => {
		if (task.keywordResult?.data?.length) {
			task.keywordResult.data.forEach((post, postIndex) => {
				const username = post.aweme_info?.author?.unique_id;
				if (username) {
					if (!usernameMap[username]) {
						usernameMap[username] = [];
					}
					usernameMap[username].push({ taskIndex, postIndex });
				}
			});
		}
	});

	const uniqueUsernames = Object.keys(usernameMap);
	if (!uniqueUsernames.length) return tasks;
  
	Log(`총 ${uniqueUsernames.length}개의 유저 API 요청 시작`);
	const userUrls = uniqueUsernames.map(username => buildUserInfoUrl(username, token));
	const responses = fetchAllInBatches(userUrls, 100, 500);
  
	responses.forEach((response, i) => {
		const username  = uniqueUsernames[i];
		try {
			const userJson = JSON.parse(response.getContentText());
			usernameMap[username].forEach(ref => {
				tasks[ref.taskIndex].keywordResult.data[ref.postIndex].userInfo = userJson;
			});
		} catch (e) {
			usernameMap[username].forEach(ref => {
				tasks[ref.taskIndex].keywordResult.data[ref.postIndex].userInfo = { error: e.toString() };
			});
		}
	});
	return tasks;
};
