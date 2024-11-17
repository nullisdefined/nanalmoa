import { InvitationStatus } from 'src/entities/manager-invitation.entity';
export declare class InvitationResponseDto {
    managerInvitationId: number;
    managerUuid: string;
    managerName: string;
    subordinateUuid: string;
    subordinateName: string;
    status: InvitationStatus;
    createdAt: Date;
    updatedAt: Date;
}
