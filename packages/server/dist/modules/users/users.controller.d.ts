import { UsersService } from './users.service';
import { User } from '@/entities/user.entity';
import { UpdateUserDto } from './dto/update-user.dto';
import { AuthService } from '@/auth/auth.service';
import { DataSource } from 'typeorm';
export declare class UsersController {
    private readonly usersService;
    private readonly authService;
    private dataSource;
    constructor(usersService: UsersService, authService: AuthService, dataSource: DataSource);
    getCurrentUser(req: any): Promise<User>;
    searchUser(keyword: string): Promise<User[]>;
    updateUserInfo(req: any, updateUserDto: UpdateUserDto): Promise<{
        message: string;
        user: User;
    }>;
    deleteAccount(req: any): Promise<{
        message: string;
    }>;
}
