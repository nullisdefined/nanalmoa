import { InvitationStatus } from '@/entities/manager-invitation.entity';
export declare class RespondToInvitationDto {
    invitationId: number;
    groupId: number;
    inviterUuid: string;
    inviteeUuid: string;
    status: InvitationStatus;
}
