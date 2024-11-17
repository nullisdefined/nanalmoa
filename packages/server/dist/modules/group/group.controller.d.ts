import { GroupService } from './group.service';
import { InviteGroupMemberDto } from './dto/invite-group-memeber.dto';
import { RespondToInvitationDto } from './dto/response-invitation.dto';
import { Request } from 'express';
import { GroupInfoResponseDto } from './dto/response-group.dto';
import { GroupMemberResponseDto } from './dto/response-group-member.dto';
import { GroupDetailResponseDto } from './dto/response-group-detail.dto';
import { GroupInvitationDetailDto } from './dto/response-group-invitation-detail.dto';
export declare class GroupController {
    private readonly groupService;
    constructor(groupService: GroupService);
    createGroup(groupName: string, req: Request): Promise<GroupInfoResponseDto>;
    deleteGroup(groupId: number, req: Request): Promise<{
        message: string;
    }>;
    getUserGroups(req: Request): Promise<GroupInfoResponseDto[]>;
    getGroupMembers(groupId: number, req: Request): Promise<GroupMemberResponseDto[]>;
    inviteGroupMembers(inviteGroupMemberDto: InviteGroupMemberDto, req: Request): Promise<{
        results: ({
            inviteeUuid: string;
            status: import("../../entities/manager-invitation.entity").InvitationStatus;
            invitationId: number;
            message?: undefined;
        } | {
            inviteeUuid: string;
            message: any;
            status?: undefined;
            invitationId?: undefined;
        })[];
    }>;
    removeGroupMember(groupId: number, memberUuid: string, req: Request): Promise<{
        message: string;
    }>;
    acceptInvitation(id: number, req: Request): Promise<{
        message: string;
    }>;
    rejectInvitation(id: number, req: Request): Promise<{
        message: string;
    }>;
    cancelInvitation(id: number, req: Request): Promise<{
        message: string;
    }>;
    getSentInvitations(req: Request): Promise<RespondToInvitationDto[]>;
    getReceivedInvitations(req: Request): Promise<RespondToInvitationDto[]>;
    getGroupInvitationDetail(id: number): Promise<GroupInvitationDetailDto>;
    getGroupDetail(groupId: number, req: Request): Promise<GroupDetailResponseDto>;
}
