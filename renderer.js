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

// 확인 버튼: 키워드 파일이 선택되었으면 해당 파일에서 키워드 목록을 불러오고, 다음 화면으로 전환
document.getElementById("confirm-keyword-btn").addEventListener("click", async () => {
	if (!window.keywordFilePath) {
		alert("키워드 파일을 선택해주세요.");
		return;
	}
	keywordList = await ipcRenderer.invoke("load-excel-data", window.keywordFilePath);
	document.getElementById("file-selection").style.display = "none";
	transitionToSelectionScreen();
});

// 선택 완료 버튼: 사용자가 입력한 키워드와 나라를 태그로 표시
document.getElementById("confirm-selection-btn").addEventListener("click", () => {
	const keywordValue = document.getElementById("keyword-input").value;
	const countryValue = document.getElementById("country-input").value;

	if (!keywordValue || !countryValue) {
		alert("키워드와 나라를 모두 입력해주세요.");
		return;
	}

	// 선택된 태그들을 표시할 영역에 태그 추가
	const tagsContainer = document.getElementById("selected-tags");
	tagsContainer.innerHTML = ""; // 이전 태그 지우기

	const keywordTag = document.createElement("span");
	keywordTag.innerText = keywordValue;
	keywordTag.classList.add("tag");

	const countryTag = document.createElement("span");
	countryTag.innerText = countryValue;
	countryTag.classList.add("tag");

	tagsContainer.appendChild(keywordTag);
	tagsContainer.appendChild(countryTag);

	window.selectedKeyword = keywordValue;
	window.selectedCountry = countryValue;
});

// 나라 입력 필드 처리
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

// Enter 키 이벤트: 입력된 값이 keywordList에 있는 경우에만 태그 추가
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
	const result = await ipcRenderer.invoke("save-excel", window.selectedData, window.selectedSNS);
	alert(result);
}
