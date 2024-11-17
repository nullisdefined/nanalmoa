import { Repository } from 'typeorm';
import { UserRoutine } from 'src/entities/user-routine.entity';
import { UpdateUserRoutineDto } from './dto/update-user-routine.dto';
import { UserRoutineResponseDto } from './dto/response-user-routine.dto';
import { UsersService } from './users.service';
export declare class UsersRoutineService {
    private userRoutineRepository;
    private usersService;
    constructor(userRoutineRepository: Repository<UserRoutine>, usersService: UsersService);
    updateUserRoutine(userUuid: string, updateDto: UpdateUserRoutineDto): Promise<UserRoutineResponseDto>;
    getUserRoutine(userUuid: string): Promise<UserRoutineResponseDto>;
    private validateTimeOrder;
    private mapToResponseDto;
    private getDefaultRoutine;
}
