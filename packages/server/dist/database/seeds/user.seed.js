"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserSeeder = void 0;
const user_entity_1 = require("../../entities/user.entity");
const auth_entity_1 = require("../../entities/auth.entity");
const ko_1 = require("@faker-js/faker/locale/ko");
class UserSeeder {
    constructor() {
        this.koreanLastNames = [
            '김',
            '이',
            '박',
            '최',
            '정',
            '강',
            '조',
            '윤',
            '장',
            '임',
            '한',
            '오',
            '서',
            '신',
            '권',
            '황',
            '안',
            '송',
            '전',
            '홍',
            '유',
            '고',
            '문',
            '양',
            '손',
            '배',
            '조',
            '백',
            '허',
            '유',
            '남',
            '심',
            '노',
            '정',
            '하',
            '곽',
            '성',
            '차',
            '주',
            '우',
            '구',
            '신',
            '임',
            '전',
            '민',
            '유',
            '류',
            '나',
            '진',
            '지',
            '엄',
            '채',
            '원',
            '천',
            '방',
            '공',
            '강',
            '현',
            '팽',
            '변',
            '염',
            '양',
            '변',
            '여',
            '추',
            '노',
            '도',
            '소',
            '신',
            '석',
            '선',
            '설',
            '마',
            '길',
            '주',
            '연',
            '방',
            '위',
            '표',
            '명',
            '기',
            '반',
            '왕',
            '금',
            '옥',
            '육',
            '인',
            '맹',
            '제',
            '모',
            '장',
            '남',
            '탁',
            '국',
            '여',
            '진',
            '어',
            '은',
            '편',
            '구',
            '용',
        ];
        this.koreanFirstNames = [
            '민준',
            '서준',
            '도윤',
            '예준',
            '시우',
            '주원',
            '하준',
            '지호',
            '지후',
            '준서',
            '준우',
            '현우',
            '도현',
            '지훈',
            '건우',
            '우진',
            '선우',
            '서진',
            '민재',
            '현준',
            '연우',
            '유준',
            '정우',
            '승우',
            '승현',
            '시윤',
            '준혁',
            '은우',
            '지환',
            '승민',
            '지우',
            '유찬',
            '윤우',
            '민성',
            '준영',
            '시온',
            '이준',
            '은찬',
            '윤호',
            '민우',
            '주호',
            '진우',
            '시후',
            '지원',
            '은호',
            '승준',
            '유진',
            '서연',
            '서윤',
            '지우',
            '서현',
            '민서',
            '하은',
            '하윤',
            '윤서',
            '지유',
            '채원',
            '지민',
            '수아',
            '지아',
            '소율',
            '다은',
            '아인',
            '예은',
            '수빈',
            '지원',
            '소윤',
            '예린',
            '지안',
            '은서',
            '가은',
            '시은',
            '채은',
            '윤아',
            '유나',
            '예나',
            '민지',
            '서아',
            '한나',
            '서영',
            '다인',
            '수민',
            '예서',
            '다연',
            '수연',
            '예원',
            '은지',
            '수현',
            '시아',
            '지은',
            '채린',
            '유진',
            '윤지',
            '지현',
            '수진',
            '소은',
            '다현',
            '예지',
            '지윤',
            '유빈',
            '서희',
            '은채',
            '민채',
            '윤희',
            '태윤',
            '동현',
            '재윤',
            '재우',
            '준호',
            '민혁',
            '영민',
            '서우',
            '도훈',
            '현서',
            '재원',
            '시현',
            '은성',
            '지성',
            '현석',
            '동욱',
            '태현',
            '민규',
            '재현',
            '우빈',
            '명헌',
            '현빈',
            '다희',
            '다온',
            '하린',
            '서진',
            '지원',
            '서우',
            '하영',
            '서연',
            '하늘',
            '지율',
            '서아',
            '하람',
            '서영',
            '소연',
            '서윤',
            '하리',
            '서은',
            '하나',
            '서하',
            '하연',
        ];
        this.profileImageTemplates = [
            'https://example.com/avatars/profile1.jpg',
            'https://example.com/avatars/profile2.jpg',
            'https://example.com/avatars/profile3.jpg',
            'https://example.com/avatars/profile4.jpg',
            'https://example.com/avatars/profile5.jpg',
            'https://example.com/avatars/profile6.jpg',
            'https://example.com/avatars/profile7.jpg',
            'https://example.com/avatars/profile8.jpg',
            'https://example.com/avatars/profile9.jpg',
            'https://example.com/avatars/profile10.jpg',
        ];
    }
    generateKoreanName() {
        const lastName = ko_1.faker.helpers.arrayElement(this.koreanLastNames);
        const firstName = ko_1.faker.helpers.arrayElement(this.koreanFirstNames);
        return `${lastName}${firstName}`;
    }
    generateRandomDate(start, end) {
        return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
    }
    generatePhoneNumber() {
        return `010-${ko_1.faker.string.numeric(4)}-${ko_1.faker.string.numeric(4)}`;
    }
    async run(dataSource, factoryManager) {
        const userRepository = dataSource.getRepository(user_entity_1.User);
        const authRepository = dataSource.getRepository(auth_entity_1.Auth);
        const users = [];
        const auths = [];
        const specificUser = new user_entity_1.User();
        specificUser.userUuid = '9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d';
        specificUser.name = this.generateKoreanName();
        specificUser.profileImage = ko_1.faker.helpers.arrayElement(this.profileImageTemplates);
        const specificAuth = new auth_entity_1.Auth();
        specificAuth.authProvider = auth_entity_1.AuthProvider.BASIC;
        specificAuth.refreshToken = ko_1.faker.string.alphanumeric({ length: 64 });
        specificAuth.user = specificUser;
        users.push(specificUser);
        auths.push(specificAuth);
        for (let i = 0; i < 100; i++) {
            const user = new user_entity_1.User();
            user.name = this.generateKoreanName();
            user.profileImage = ko_1.faker.helpers.arrayElement(this.profileImageTemplates);
            user.isManager = ko_1.faker.datatype.boolean({ probability: 0.2 });
            const createdAt = this.generateRandomDate(new Date(2024, 0, 1), new Date(2024, 9, 31));
            user.createdAt = createdAt;
            user.updatedAt = this.generateRandomDate(createdAt, new Date(2024, 9, 31));
            const auth = new auth_entity_1.Auth();
            auth.authProvider = ko_1.faker.helpers.arrayElement(Object.values(auth_entity_1.AuthProvider));
            const hasEmail = ko_1.faker.datatype.boolean({ probability: 0.7 });
            const hasPhone = hasEmail
                ? ko_1.faker.datatype.boolean({ probability: 0.7 })
                : true;
            if (hasEmail) {
                if (auth.authProvider === auth_entity_1.AuthProvider.KAKAO) {
                    user.email = `${ko_1.faker.internet.userName().toLowerCase()}${ko_1.faker.number.int(999)}@kakao.com`;
                }
                else if (auth.authProvider === auth_entity_1.AuthProvider.NAVER) {
                    user.email = `${ko_1.faker.internet.userName().toLowerCase()}${ko_1.faker.number.int(999)}@naver.com`;
                }
                else {
                    user.email = `${ko_1.faker.internet.userName().toLowerCase()}${ko_1.faker.number.int(999)}@${ko_1.faker.internet.domainName()}`;
                }
            }
            else {
                user.email = null;
            }
            user.phoneNumber = hasPhone ? this.generatePhoneNumber() : null;
            if (auth.authProvider !== auth_entity_1.AuthProvider.BASIC) {
                auth.oauthId = ko_1.faker.string.uuid();
            }
            auth.refreshToken = ko_1.faker.string.alphanumeric({ length: 64 });
            users.push(user);
            auths.push(auth);
        }
        await dataSource.transaction(async (transactionalEntityManager) => {
            for (let i = 0; i < users.length; i++) {
                try {
                    const savedUser = await transactionalEntityManager.save(user_entity_1.User, users[i]);
                    auths[i].userUuid = savedUser.userUuid;
                    auths[i].user = savedUser;
                    await transactionalEntityManager.save(auth_entity_1.Auth, auths[i]);
                    console.log(`사용자 생성: ${savedUser.name} (${savedUser.userUuid})`);
                    console.log(`사용자 인증 생성: ${savedUser.name}, 소셜 프로바이더: ${auths[i].authProvider}`);
                }
                catch (error) {
                    console.error(`사용자 및 인증 생성 오류: ${users[i].name}`, error);
                }
            }
        });
        console.log(`총 ${users.length}개의 사용자 및 인증 항목이 생성되었습니다.`);
    }
}
exports.UserSeeder = UserSeeder;
//# sourceMappingURL=user.seed.js.map