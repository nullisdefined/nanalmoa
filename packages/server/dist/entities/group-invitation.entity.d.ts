import { Group } from './group.entity';
import { InvitationStatus } from './manager-invitation.entity';
import { User } from './user.entity';
export declare class GroupInvitation {
    groupInvitationId: number;
    group: Group;
    inviterUuid: string;
    inviteeUuid: string;
    status: InvitationStatus;
    createdAt: Date;
    updatedAt: Date;
    invitee: User;
    inviter: User;
}
