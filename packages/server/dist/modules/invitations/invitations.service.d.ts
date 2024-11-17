import { Repository } from 'typeorm';
import { GroupInvitation } from 'src/entities/group-invitation.entity';
import { ManagerInvitation } from 'src/entities/manager-invitation.entity';
import { InvitationsDto } from './dto/invitations.dto';
import { UsersService } from '../users/users.service';
export declare class InvitationsService {
    private groupInvitationRepository;
    private managerInvitationRepository;
    private usersService;
    constructor(groupInvitationRepository: Repository<GroupInvitation>, managerInvitationRepository: Repository<ManagerInvitation>, usersService: UsersService);
    getUserInvitations(userUuid: string): Promise<InvitationsDto[]>;
}
