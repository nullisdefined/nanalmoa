import { InvitationStatus } from '@/entities/manager-invitation.entity';
export declare class GroupInvitationDetailDto {
    inviterUuid: string;
    inviterName: string;
    inviteeUuid: string;
    inviteeName: string;
    groupName: string;
    groupId: number;
    status: InvitationStatus;
}
