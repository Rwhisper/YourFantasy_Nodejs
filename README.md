# Your_Fantasy

Nodejs를 이용한 웹 소설 공유 플랫폼 개인프로젝트

## 사용 스택
- front-end : ejs, bootstrap
- back-end : node.js, express
- db : mysql

## 일정 
- 2022.05.27 ~ 2022.06.04 : 기획 및 db 구조생성, express 프로젝트 생성, 일부 모듈 및 라우터 작성
- 2022.06.05 ~ 2022.06.06 : 템플릿 수정 및 라우터 작성
- 2022.06.06 : 세션 인증 추가
- 2022.06.06 ~ 2022.06.10 : 종료

## DB 정의
https://github.com/Rwhisper/Novel-Sharing-Platform_Nodejs/blob/main/DB.md

## 페이지(사용자 인터페이스) 정의
https://github.com/Rwhisper/Novel-Sharing-Platform_Nodejs/blob/main/page.md

## 사용
- dev/yfantasy 에서 
- npm i 명령어를 사용해 package.json파일에있는 모듈들을 다운받아준다.
- 연결한 mysql 접속정보를 db_info와 app.js의  option에 넣고 mysql db에 noveldb데이터베이스를 만들어 테이블을 만들어준다.
- npm start로 프로젝트를 실행하고 브라우저에서 동작을 확인한다.
