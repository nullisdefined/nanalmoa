export declare enum InvitationsType {
    GROUP = "group",
    MANAGER = "manager"
}
export declare enum InvitationsRole {
    MANAGER = "MANAGER",
    SUBORDINATE = "SUBORDINATE",
    GROUP_ADMIN = "GROUP_ADMIN",
    GROUP_MEMBER = "GROUP_MEMBER"
}
export declare class InvitationsDto {
    id: number;
    type: InvitationsType;
    role: InvitationsRole;
    status: string;
    createdAt: Date;
    updatedAt: Date;
    inviterUuid: string;
    inviterName: string;
    inviteeUuid: string;
    inviteeName: string;
    groupId?: number;
    groupName?: string;
}
