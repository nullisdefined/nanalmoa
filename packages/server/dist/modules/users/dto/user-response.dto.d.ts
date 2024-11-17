export declare class UserResponseDto {
    userUuid: string;
    name: string;
    profileImage: string;
    email: string;
    isManager: boolean;
    constructor(user: Partial<UserResponseDto>);
}
