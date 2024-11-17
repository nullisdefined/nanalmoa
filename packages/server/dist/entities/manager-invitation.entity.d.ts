export declare enum InvitationStatus {
    PENDING = "PENDING",
    ACCEPTED = "ACCEPTED",
    REJECTED = "REJECTED",
    CANCELED = "CANCELED",
    REMOVED = "REMOVED"
}
export declare class ManagerInvitation {
    managerInvitationId: number;
    managerUuid: string;
    subordinateUuid: string;
    status: InvitationStatus;
    createdAt: Date;
    updatedAt: Date;
}
