import { Repository } from 'typeorm';
import { User } from '@/entities/user.entity';
import { Auth } from '@/entities/auth.entity';
export declare class UsersService {
    private readonly userRepository;
    private readonly authRepository;
    constructor(userRepository: Repository<User>, authRepository: Repository<Auth>);
    getUserByUuid(userUuid: string): Promise<User>;
    getUsersByUuids(userUuids: string[]): Promise<User[]>;
    checkUserExists(userUuid: string): Promise<boolean>;
    private determineSearchType;
    searchUser(keyword: string): Promise<User[]>;
    updateUser(userUuid: string, updateData: Partial<User>): Promise<User>;
    isEmailTaken(email: string, currentUserUuid?: string): Promise<boolean>;
    findOne(userUuid: string): Promise<User>;
}
