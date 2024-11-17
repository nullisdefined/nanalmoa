"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RefreshAccessTokenResponseSchema = exports.RefreshKakaoTokenResponseSchema = exports.RefreshNaverTokenResponseSchema = exports.RefreshBasicTokenResponseSchema = exports.KakaoTokenResponseSchema = exports.NaverTokenResponseSchema = exports.RefreshTokenErrorSchema = exports.VerifyCodeErrorSchema = exports.VerifyCodeResponseSchema = exports.SendVerificationCodeErrorSchema = exports.SendVerificationCodeResponseSchema = exports.BasicSignupResponseSchema = exports.RefreshTokenResponseSchema = exports.BasicLoginResponseSchema = exports.KakaoLoginResponseSchema = exports.NaverLoginResponseSchema = void 0;
exports.NaverLoginResponseSchema = {
    type: 'object',
    properties: {
        accessToken: {
            type: 'string',
            description: '발급된 액세스 토큰',
            example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        },
        refreshToken: {
            type: 'string',
            description: '발급된 리프레시 토큰',
            example: 'tyvx8E0QQgMsAQaNB2DV-a2eqtjk5W6AAAAAgop',
        },
    },
};
exports.KakaoLoginResponseSchema = {
    type: 'object',
    properties: {
        accessToken: {
            type: 'string',
            description: '발급된 액세스 토큰',
            example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        },
        refreshToken: {
            type: 'string',
            description: '발급된 리프레시 토큰',
            example: 'tyvx8E0QQgMsAQaNB2DV-a2eqtjk5W6AAAAAgop',
        },
    },
};
exports.BasicLoginResponseSchema = {
    type: 'object',
    properties: {
        accessToken: {
            type: 'string',
            description: '발급된 액세스 토큰',
            example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        },
        refreshToken: {
            type: 'string',
            description: '발급된 리프레시 토큰',
            example: 'tyvx8E0QQgMsAQaNB2DV-a2eqtjk5W6AAAAAgop',
        },
    },
};
exports.RefreshTokenResponseSchema = {
    type: 'object',
    properties: {
        accessToken: {
            type: 'string',
            description: '새로 발급된 액세스 토큰',
            example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        },
        refreshToken: {
            type: 'string',
            description: '새로 발급된 리프레시 토큰 (옵셔널)',
            example: 'tyvx8E0QQgMsAQaNB2DV-a2eqtjk5W6AAAAAgop',
        },
    },
};
exports.BasicSignupResponseSchema = {
    type: 'object',
    properties: {
        accessToken: {
            type: 'string',
            description: '발급된 액세스 토큰',
            example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        },
        refreshToken: {
            type: 'string',
            description: '발급된 리프레시 토큰',
            example: 'tyvx8E0QQgMsAQaNB2DV-a2eqtjk5W6AAAAAgop',
        },
    },
};
exports.SendVerificationCodeResponseSchema = {
    type: 'object',
    properties: {
        message: {
            type: 'string',
            example: '인증 코드 전송 성공',
        },
    },
};
exports.SendVerificationCodeErrorSchema = {
    type: 'object',
    properties: {
        statusCode: { type: 'number', example: 500 },
        message: { type: 'string', example: '인증 코드 전송에 실패했습니다' },
        error: { type: 'string', example: 'Internal Server Error' },
    },
};
exports.VerifyCodeResponseSchema = {
    type: 'object',
    properties: {
        message: {
            type: 'string',
            example: '인증 성공',
        },
    },
};
exports.VerifyCodeErrorSchema = {
    type: 'object',
    properties: {
        statusCode: { type: 'number', example: 400 },
        message: { type: 'string', example: '유효하지 않은 인증 코드입니다.' },
        error: { type: 'string', example: 'Bad Request' },
    },
};
exports.RefreshTokenErrorSchema = {
    type: 'object',
    properties: {
        statusCode: { type: 'number', example: 401 },
        message: { type: 'string', example: '액세스 토큰 갱신 실패' },
        error: { type: 'string', example: 'Unauthorized' },
    },
};
exports.NaverTokenResponseSchema = {
    type: 'object',
    properties: {
        access_token: {
            type: 'string',
            description: '네이버 액세스 토큰',
            example: 'AAAAOLtP40eH6P5S4Z7lrloCNvK1dcT5bcrwq2FGHfwTOBEtgA...',
        },
        refresh_token: {
            type: 'string',
            description: '네이버 리프레시 토큰',
            example: 'c8ceMEJisO4Se7uGCEYKK1k9dzjdas5AAAAAgop',
        },
    },
};
exports.KakaoTokenResponseSchema = {
    type: 'object',
    properties: {
        access_token: {
            type: 'string',
            description: '카카오 액세스 토큰',
            example: 'AAAAOLtP40eH6P5S4Z7lrloCNvK1dcT5bcrwq2FGHfwTOBEtgA...',
        },
        refresh_token: {
            type: 'string',
            description: '카카오 리프레시 토큰',
            example: 'c8ceMEJisO4Se7uGCEYKK1k9dzjdas5AAAAAgop',
        },
    },
};
exports.RefreshBasicTokenResponseSchema = {
    type: 'object',
    properties: {
        refreshToken: {
            type: 'string',
            description: '새로 발급된 기본 리프레시 토큰',
            example: 'tyvx8E0QQgMsAQaNB2DV-a2eqtjk5W6AAAAAgop',
        },
    },
};
exports.RefreshNaverTokenResponseSchema = {
    type: 'object',
    properties: {
        access_token: {
            type: 'string',
            description: '새로 발급된 네이버 액세스 토큰',
            example: 'AAAAOLtP40eH6P5S4Z7lrloCNvK1dcT5bcrwq2FGHfwTOBEtgA...',
        },
        refresh_token: {
            type: 'string',
            description: '새로 발급된 네이버 리프레시 토큰',
            example: 'c8ceMEJisO4Se7uGCEYKK1k9dzjdas5AAAAAgop',
        },
    },
};
exports.RefreshKakaoTokenResponseSchema = {
    type: 'object',
    properties: {
        access_token: {
            type: 'string',
            description: '새로 발급된 카카오 액세스 토큰',
            example: 'AAAAOLtP40eH6P5S4Z7lrloCNvK1dcT5bcrwq2FGHfwTOBEtgA...',
        },
        refresh_token: {
            type: 'string',
            description: '새로 발급된 카카오 리프레시 토큰',
            example: 'c8ceMEJisO4Se7uGCEYKK1k9dzjdas5AAAAAgop',
        },
    },
};
exports.RefreshAccessTokenResponseSchema = {
    type: 'object',
    properties: {
        accessToken: {
            type: 'string',
            description: '새로 발급된 액세스 토큰',
            example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        },
        refreshToken: {
            type: 'string',
            description: '새로 발급된 리프레시 토큰 (옵셔널)',
            example: 'tyvx8E0QQgMsAQaNB2DV-a2eqtjk5W6AAAAAgop',
        },
    },
};
//# sourceMappingURL=response.schema.js.map