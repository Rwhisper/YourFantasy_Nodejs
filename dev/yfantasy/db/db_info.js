// db 접속 정보를 모아둔 모듈
// 로컬, 실서버, 스테이징, 개발 서버 정보 기록
module.exports = (() => {
    return {
        local: {
            host: '',
            port: '',
            user: '',
            password: '',
            database: '',
            multipleStatements: true,
        },
        real: {
            host: '',
            port: '',
            user: '',
            password: '',
            database: ''
        },
        staging: {
            host: '',
            port: '',
            user: '',
            password: '',
            database: ''
        },
        dev: {
            host: '',
            port: '',
            user: '',
            password: '',
            database: ''
        }

    }
})();
