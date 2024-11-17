import { ManagerService } from './manager.service';
import { UserResponseDto } from '../users/dto/user-response.dto';
import { Request } from 'express';
import { InvitationResponseDto } from './dto/response-invitation.dto';
export declare class ManagerController {
    private readonly managerService;
    constructor(managerService: ManagerService);
    createInvitation(subordinateUuid: string, req: Request): Promise<InvitationResponseDto>;
    getInvitationSend(req: Request): Promise<InvitationResponseDto[]>;
    getInvitationReceived(req: Request): Promise<InvitationResponseDto[]>;
    getInvitationUsers(managerUuid: string, subordinateUuid: string): Promise<InvitationResponseDto>;
    getInvitation(id: number): Promise<InvitationResponseDto>;
    acceptInvitation(id: number, req: Request): Promise<InvitationResponseDto>;
    rejectInvitation(id: number, req: Request): Promise<InvitationResponseDto>;
    cancelInvitation(id: number, req: Request): Promise<InvitationResponseDto>;
    removeSubordinate(subordinateUuid: string, req: Request): Promise<void>;
    removeManager(managerUuid: string, req: Request): Promise<void>;
    getManagerList(req: Request): Promise<UserResponseDto[]>;
    getSubordinateList(req: Request): Promise<UserResponseDto[]>;
}
