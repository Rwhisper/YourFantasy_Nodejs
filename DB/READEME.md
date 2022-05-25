## DB
### 사용 DataBase : 미정

## table (collestion)
### User
- user_id
- user_pw
- user_name

### board   // 글
- board_id		// 글 식별코드
- board_title		// 글 제목
- board_subtitle		// 소제목
- content			// 글 내용
- user_id			// 글 쓴 사람
- board_views		// 조회수
- board_stars		// 글에 좋아요
- board_sign		// 소설 표지
- category_id		// 글 카테고리 (장르)
- sign_img		// 글 표지

### category    // 카테고리
- category_id		// 카테고리 아이디
- category_name		// 카테고리 필드명
: 판타지, 로맨스 판타지, 현대 판타지, 무협, 퓨전 판타지, 팬픽, 현대 소설, 로맨스, 게임, 패러디, 일반, 문학, 라이트노벨, 스포츠, 역사
board_comment
- board_comment_id 	// 댓글 식별코드
- board_id		// 어떤 글의 댓글인지
- commnet		// 댓글 내용
- user_id			// 댓글 쓴 사람의 아이디
- stars			// 댓글에 좋아요

### favorite_category   // 유저별 선호장르
- user_id			// 유저 아이디
- category_id		// 카테고리 아이디






