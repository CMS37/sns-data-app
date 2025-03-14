const { ipcRenderer } = require("electron");
const countryMapping = require("./country_mapping.json");

let keywordlist = [];
let selectedSNS = null;


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
	const filePath = await ipcRenderer.invoke("open-excel-dialog", "keyword");
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
  
	// 태그 컨테이너에 태그가 하나라도 없는 경우 경고 없이 그냥 리턴
	if (keywordTagsContainer.children.length === 0 || countryTagsContainer.children.length === 0) {
		alert("키워드와 나라를 모두 입력해주세요.");
		return;
	}

	const selectedKeywords = Array.from(keywordTagsContainer.getElementsByClassName("tag"))
		.map(tag => tag.dataset.value);
  
	const selectedCountries = Array.from(countryTagsContainer.getElementsByClassName("tag"))
		.map(tag => {
			const koreanName = tag.dataset.value;
		// countryMapping은 파일에서 불러온 JSON 객체 (키: 영어 코드, value: { name: 한글 이름, ... })
		const code = Object.keys(countryMapping).find(key => countryMapping[key].name === koreanName);
		return code || koreanName; // 변환에 실패하면 입력한 값을 그대로 반환 (예외 처리)
	});

	window.selectedKeywords = selectedKeywords;
	window.selectedCountries = selectedCountries;

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

	document.getElementById("selection-screen").style.display = "none";
	document.getElementById("confirmation-screen").style.display = "block";
  });
  
// 최종 확인 버튼: 선택한 SNS, 키워드, 나라로 데이터 요청
document.getElementById("final-confirm-btn").addEventListener("click", async () => {
	const outputElem = document.getElementById("output");
	
	document.getElementById("confirmation-screen").style.display = "none";
	document.getElementById("result-screen").style.display = "block";

	outputElem.innerText = "";

	function appendLog(message) {
	  outputElem.innerText += message + "\n";
	}

	appendLog(`${window.selectedSNS} 데이터 요청 중...`);
	
	try {
	  const data = await ipcRenderer.invoke("fetch-data", window.selectedSNS, window.selectedKeywords, window.selectedCountries);
	  
	  if (data.error) {
		appendLog("오류 발생: " + data.error);
	  } else {
		appendLog(`${window.selectedSNS} 데이터 요청 완료 (${data.length} items)`);
		window.selectedData = data;
		document.getElementById("save-btn").style.display = "block";
	  }
	} catch (error) {
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

	// 키워드 입력 필드에 Awesomplete 초기화 (엑셀 파일에서 불러온 키워드 목록 사용)
	new Awesomplete(keywordInput, {
		list: keywordList,
		minChars: 0,
		autoFirst: true
	});

	// 나라 입력 필드에 Awesomplete 초기화 (mapping.json의 나라 목록 사용)
	const countryList = Object.values(countryMapping).map(item => item.name);
	new Awesomplete(countryInput, {
		list: countryList,
		minChars: 0,
		autoFirst: true
	});

	// 선택 화면 보이기
	document.getElementById("selection-screen").style.display = "block";
}
//SNS선택후 파일선택 전환
function transitionToFileSelection() {
	document.getElementById("sns-selection").style.display = "none";
	document.getElementById("file-selection").style.display = "block";
}

function addTag(type, text) {
	// 해당 타입에 맞는 태그 컨테이너의 ID 설정
	const containerId = type === "keyword" ? "keyword-tags" : "country-tags";
	const container = document.getElementById(containerId);
  
	// 이미 같은 값이 있는지 검사 (중복 방지)
	const existingTags = Array.from(container.getElementsByClassName("tag")).map(tag => tag.dataset.value);
	if (existingTags.includes(text)) return;
  
	// 태그 요소 생성
	const tag = document.createElement("span");
	tag.classList.add("tag");
	tag.dataset.value = text;
	tag.innerText = text + " ";
  
	// 삭제 버튼 생성
	const removeBtn = document.createElement("button");
	removeBtn.innerText = "x";
	removeBtn.addEventListener("click", () => {
	  container.removeChild(tag);
	});
  
	tag.appendChild(removeBtn);
	container.appendChild(tag);
}

async function fetchData(sns) {
	// 두 파일 경로가 모두 선택되었는지 확인
	if (!window.keywordFilePath || !window.countryFilePath) {
		document.getElementById("output").innerText = "키워드 파일과 나라 파일을 모두 선택해주세요.";
		return;
	}

	document.getElementById("output").innerText = `${sns} 데이터 가져오는 중...`;
	// 파일 경로를 함께 전달합니다.
	const data = await ipcRenderer.invoke("fetch-data", sns, window.keywordFilePath, window.countryFilePath);

	if (data.error) {
		document.getElementById("output").innerText = data.error;
	} else {
		document.getElementById("output").innerText = `${sns} 데이터 가져오기 완료 (${data.length} items)`;
		window.selectedData = data;
		window.selectedSNS = sns;
		document.getElementById("save-btn").style.display = "block";
	}
}

async function saveExcel() {
	try {
	  // window.selectedData와 window.selectedSNS에 저장된 데이터를 전달합니다.
	  const result = await ipcRenderer.invoke("save-excel", window.selectedData, window.selectedSNS);
	  alert(result);
	} catch (error) {
	  alert("엑셀 저장 중 오류 발생: " + error.message);
	}
  }