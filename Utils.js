const Log = message => Logger.log(message);

const getResultSheetName = sns => {
	const now = new Date();
	const formattedDate = Utilities.formatDate(now, Session.getScriptTimeZone(), "yyyy-MM-dd HHmmss");
	return `${formattedDate} ${sns} data`;
};

const getRequiredProperty = key => {
	const value = PropertiesService.getScriptProperties().getProperty(key);
	if (!value) throw new Error(`스크립트 속성에 '${key}'가 없습니다.`);
	return value;
};

const fetchAllInBatches = (urls, batchSize, delay) => {
	let responses = [];
	for (let i = 0; i < urls.length; i += batchSize) {
		const batch = urls.slice(i, i + batchSize);
		responses = responses.concat(UrlFetchApp.fetchAll(batch));
		if (i + batchSize < urls.length) {
			Utilities.sleep(delay);
		}
	}
	return responses;
};
