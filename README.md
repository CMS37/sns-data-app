# SNS 데이터 수집 앱

## 기능
- **SNS 선택:** TikTok, Twitter, YouTube 중 사용자가 원하는 SNS를 선택
- **키워드 파일 선택 및 데이터 로드:** Excel 파일에서 키워드 목록을 불러옴
- **태그 입력 및 자동완성:** 나라와 키워드를 입력하여 태그로 추가 (자동완성 기능 포함)
- **옵션 설정:** 기간, 정렬(관련순/좋아요순), 정확도 옵션 선택
- **최종 확인 및 API 요청:** 선택한 항목들을 확인 후 API 요청 실행 및 결과 로그 표시
- **Excel 저장:** API 요청 결과를 Excel 파일로 저장

## npm 명령어
- `npm install` – 프로젝트 의존성 설치
- `npm start` – 개발 모드로 앱 실행
- `npm run build` – electron-builder를 사용하여 앱 패키징

## 프로젝트 구조
- **main.js:** Electron 메인 프로세스 (창 생성, IPC 핸들러, 환경 변수 로드 등)
- **renderer.js:** UI 제어, 화면 전환, 사용자 입력 및 API 요청 처리
- **tiktok.js:** TikTok 데이터를 수집하는 API 호출 로직 (ensembledata 라이브러리 사용)
- **index.html:** 전체 UI 레이아웃 (SNS 선택, 파일 선택, 입력, 확인, 결과 화면)
- **country_mapping.json:** 나라 이름과 코드 매핑 데이터
- **.env:** API 토큰 등 환경 변수 (build 시 extraResources로 포함)
- **TiktokTest.json, keyword.xlsx:** 테스트 및 데이터 파일
