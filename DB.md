## DB
### 사용 DataBase : 미정

## table (collestion)
### User
- user_id
- user_pw
- user_nickName
- email

### novel           // 소설 한 작품당 
- novel_id          // 식별코드
- novel_Introduce   // 작품설명
- user_id           // 작가
- category          // 카테고리(장르)
- novel_create_time // 소설 생성 일자


### contents        // 소설 한 화당
- novel_id		    // 글 식별코드
- contents_id       // 식별 코드
- novel_no         // 몇화인지
- novel_subtitle	// 소제목
- content			// 글 내용
- views             // 조회수
- stars             // 글에 좋아요
- status            // 완료 상태
- work_review       // 작품 후기(작가가 쓴)
- (sing_up)         // 글 표지 (보류)
- category_name		// 카테고리 필드명
: {판타지, 로맨스 판타지, 현대 판타지, 무협, 퓨전 판타지, 팬픽, 현대 소설, 로맨스, 게임, 패러디, 일반, 문학, 라이트노벨, 스포츠, 역사}

<!-- ### category    // 카테고리
- category_id		// 카테고리 아이디
-->

### comment
- comment_id 	    // 댓글 식별코드
- contents_id   	// 어떤 글의 댓글인지
- commnet		    // 댓글 내용
- user_id			// 댓글 쓴 사람의 아이디
- stars		    	// 댓글에 좋아요

### favorite_category   // 유저별 선호장르
- user_id			// 유저 아이디
- category		// 카테고리 아이디

### favorite_novel   // 유저별 선호장르
- user_id			// 유저 아이디
- novel_id		// 카테고리 아이디






