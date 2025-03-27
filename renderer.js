const { ipcRenderer } = require("electron");
const countryMapping = require("./country_mapping.json");

// SNS 선택 버튼
document.getElementById("sns-tiktok").addEventListener("click", () => {
	window.selectedSNS = "TikTok";
	transitionToFileSelection();
});

document.getElementById("sns-twitter").addEventListener("click", () => {
	window.selectedSNS = "Twitter";
	transitionToFileSelection();
});

document.getElementById("sns-youtube").addEventListener("click", () => {
	window.selectedSNS = "YouTube";
	transitionToFileSelection();
});

// 키워드 파일 선택 버튼
document.getElementById("select-keyword-btn").addEventListener("click", async () => {
	const filePath = await ipcRenderer.invoke("open-excel-dialog");
	if (filePath) {
		document.getElementById("keyword-file-path").innerText = filePath;
		window.keywordFilePath = filePath;
	}
});

// 키워드 파일 확인 버튼
document.getElementById("confirm-keyword-btn").addEventListener("click", async () => {
	if (!window.keywordFilePath) {
		alert("키워드 파일을 선택해주세요.");
		return;
	}
	keywordList = await ipcRenderer.invoke("load-excel-data", window.keywordFilePath);
	document.getElementById("file-selection").style.display = "none";
	transitionToSelectionScreen();
});

// 키워드 선택 완료 버튼: 사용자가 입력한 키워드와 나라를 태그로 표시
document.getElementById("confirm-selection-btn").addEventListener("click", () => {
	const keywordTagsContainer = document.getElementById("keyword-tags");
	const countryTagsContainer = document.getElementById("country-tags");
  
	if (keywordTagsContainer.children.length === 0 || countryTagsContainer.children.length === 0) {
		alert("키워드와 나라를 모두 입력해주세요.");
		return;
	}

	const selectedKeywords = Array.from(keywordTagsContainer.getElementsByClassName("tag"))
		.map(tag => tag.dataset.value);
  
	const selectedCountries = Array.from(countryTagsContainer.getElementsByClassName("tag"))
		.map(tag => {
			const koreanName = tag.dataset.value;
		const code = Object.keys(countryMapping).find(key => countryMapping[key].name === koreanName);
		return code || koreanName;
	});

	const period = document.getElementById("period-select").value;
	const sorting = document.getElementById("sorting-select").value;
	const matchExactly = document.getElementById("matchExactly-checkbox").checked;

	window.selectedKeywords = selectedKeywords;
	window.selectedCountries = selectedCountries;
	window.period = period;
	window.sorting = sorting;
	window.matchExactly = matchExactly;


	document.getElementById("confirm-sns").innerText = window.selectedSNS;
  
	const confirmCountryContainer = document.getElementById("confirm-country-tags");
	confirmCountryContainer.innerHTML = "";
	Array.from(countryTagsContainer.getElementsByClassName("tag")).forEach(tag => {
		const displayTag = document.createElement("span");
		displayTag.classList.add("tag");
		displayTag.innerText = tag.dataset.value;
		confirmCountryContainer.appendChild(displayTag);
	});
  
	const confirmKeywordContainer = document.getElementById("confirm-keyword-tags");
	confirmKeywordContainer.innerHTML = "";
	selectedKeywords.forEach(keyword => {
		const tag = document.createElement("span");
		tag.classList.add("tag");
		tag.innerText = keyword;
		confirmKeywordContainer.appendChild(tag);
	});
	document.getElementById("confirm-period").innerText = window.period + "일";
	document.getElementById("confirm-sorting").innerText = window.sorting ? "좋아요순" : "관련순";
	document.getElementById("confirm-match-exactly").innerText = window.matchExactly ? "Yes" : "No";
	document.getElementById("selection-screen").style.display = "none";
	document.getElementById("confirmation-screen").style.display = "block";
});
  
// 최종 확인 버튼: 선택한 SNS, 키워드, 나라로 데이터 요청
document.getElementById("final-confirm-btn").addEventListener("click", async () => {
	const outputElem = document.getElementById("output");
	const spinnerElem = document.getElementById("spinner");
	
	document.getElementById("confirmation-screen").style.display = "none";
	document.getElementById("result-screen").style.display = "block";

	outputElem.innerText = "";

	function appendLog(message) {
		outputElem.innerText += message + "\n";
	}

	appendLog(`${window.selectedSNS} 데이터 요청 중 ...`);
	
	try {
		const data = await ipcRenderer.invoke("fetch-data", 
			window.selectedSNS,
			window.selectedKeywords,
			window.selectedCountries,
			window.period,
			window.sorting,
			window.matchExactly
		);
	  
		if (data.error) {
			appendLog("오류 발생: " + data.error);
		} else {
			let totalCount = 0;
			if (Array.isArray(data)) {
				data.forEach(item => {
					if (Array.isArray(item.data)) {
						totalCount += item.data.length;
					}
				});
			}
			appendLog(`${window.selectedSNS} 데이터 요청 완료 (${totalCount} items)`);
			console.log(data);
			window.selectedData = data;
			document.getElementById("save-btn").style.display = "block";
		}
	} catch (error) {
		spinnerElem.style.display = "none";
		appendLog("요청 처리 중 예외 발생: " + error.message);
	}
});

const countryInput = document.getElementById("country-input");
const countryList = Object.values(countryMapping).map(item => item.name);

countryInput.addEventListener("awesomplete-selectcomplete", function(e) {
	addTag("country", e.text.value);
	this.value = "";
});

countryInput.addEventListener("keydown", function(e) {
	if (e.key === "Enter") {
    	e.preventDefault();
    	const inputEl = this;
    	setTimeout(() => {
			const value = inputEl.value.trim();
			if (!value) return;
			if (countryList.map(v => v.toLowerCase()).includes(value.toLowerCase())) {
				addTag("country", value);
			}
			inputEl.value = "";
			inputEl.focus();
		}, 10);
	}
});

const keywordInput = document.getElementById("keyword-input");

keywordInput.addEventListener("awesomplete-selectcomplete", function(e) {
	addTag("keyword", e.text.value);
	this.value = "";
});

keywordInput.addEventListener("keydown", function(e) {
	if (e.key === "Enter") {
		e.preventDefault();
		const inputEl = this;
		setTimeout(() => {
			const value = inputEl.value.trim();
			if (!value) return;
			if (keywordList.map(v => v.toLowerCase()).includes(value.toLowerCase())) {
				addTag("keyword", value);
			}
			inputEl.value = "";
			inputEl.focus();
		}, 10);
	}
});

function transitionToSelectionScreen() {
	const keywordInput = document.getElementById("keyword-input");
	const countryInput = document.getElementById("country-input");

	new Awesomplete(keywordInput, {
		list: keywordList,
		minChars: 0,
		autoFirst: true
	});

	const countryList = Object.values(countryMapping).map(item => item.name);
	new Awesomplete(countryInput, {
		list: countryList,
		minChars: 0,
		autoFirst: true
	});

	document.getElementById("selection-screen").style.display = "block";
}

//SNS선택후 파일선택 전환
function transitionToFileSelection() {
	document.getElementById("sns-selection").style.display = "none";
	document.getElementById("file-selection").style.display = "block";
}

function addTag(type, text) {
	const containerId = type === "keyword" ? "keyword-tags" : "country-tags";
	const container = document.getElementById(containerId);
	const existingTags = Array.from(container.getElementsByClassName("tag")).map(tag => tag.dataset.value);

	if (existingTags.includes(text))
		return;

	const tag = document.createElement("span");
	tag.classList.add("tag");
	tag.dataset.value = text;
	tag.innerText = text + " ";

	const removeBtn = document.createElement("button");
	removeBtn.innerText = "x";
	removeBtn.addEventListener("click", () => {
		container.removeChild(tag);
	});
  
	tag.appendChild(removeBtn);
	container.appendChild(tag);
}

async function saveExcel() {
	try {
		const result = await ipcRenderer.invoke("save-excel", window.selectedData, window.selectedSNS);
		alert(result);
	} catch (error) {
		alert("엑셀 저장 중 오류 발생: " + error.message);
	}
}