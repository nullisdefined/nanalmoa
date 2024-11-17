import { InvitationsService } from './invitations.service';
import { InvitationsDto } from './dto/invitations.dto';
import { Request } from 'express';
import { UsersService } from '../users/users.service';
export declare class InvitationsController {
    private readonly invitationService;
    private readonly usersService;
    constructor(invitationService: InvitationsService, usersService: UsersService);
    getUserInvitations(req: Request): Promise<InvitationsDto[]>;
}
