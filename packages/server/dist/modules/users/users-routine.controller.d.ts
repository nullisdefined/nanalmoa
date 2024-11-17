import { UsersRoutineService } from './users-routine.service';
import { UserRoutineResponseDto } from './dto/response-user-routine.dto';
import { UpdateUserRoutineDto } from './dto/update-user-routine.dto';
import { Request } from 'express';
export declare class UsersRoutineController {
    private readonly usersRoutineService;
    constructor(usersRoutineService: UsersRoutineService);
    updateUserRoutine(req: Request, updateDto: UpdateUserRoutineDto): Promise<UserRoutineResponseDto>;
    getUserRoutine(req: Request): Promise<UserRoutineResponseDto>;
}
