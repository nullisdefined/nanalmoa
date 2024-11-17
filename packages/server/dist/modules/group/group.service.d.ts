import { CreateGroupDto } from './dto/create-group.dto';
import { DataSource, Repository } from 'typeorm';
import { Group } from '@/entities/group.entity';
import { UserGroup } from '@/entities/user-group.entity';
import { GroupInfoResponseDto } from './dto/response-group.dto';
import { InviteGroupMemberDto } from './dto/invite-group-memeber.dto';
import { GroupInvitation } from '@/entities/group-invitation.entity';
import { InvitationStatus } from '@/entities/manager-invitation.entity';
import { RespondToInvitationDto } from './dto/response-invitation.dto';
import { GroupMemberResponseDto } from './dto/response-group-member.dto';
import { RemoveGroupMemberDto } from './dto/remove-group-member.dto';
import { UsersService } from '../users/users.service';
import { GroupDetailResponseDto } from './dto/response-group-detail.dto';
import { GroupInvitationDetailDto } from './dto/response-group-invitation-detail.dto';
import { Schedule } from '@/entities/schedule.entity';
import { GroupSchedule } from '@/entities/group-schedule.entity';
import { GroupInfo } from '../schedules/dto/create-schedule.dto';
import { UserInfo } from '../users/dto/user-info-detail.dto';
import { User } from '@/entities/user.entity';
export declare class GroupService {
    private groupRepository;
    private userGroupRepository;
    private groupInvitationRepository;
    private userRepository;
    private dataSource;
    private usersService;
    private groupScheduleRepository;
    constructor(groupRepository: Repository<Group>, userGroupRepository: Repository<UserGroup>, groupInvitationRepository: Repository<GroupInvitation>, userRepository: Repository<User>, dataSource: DataSource, usersService: UsersService, groupScheduleRepository: Repository<GroupSchedule>);
    createGroup(createGroupDto: CreateGroupDto): Promise<GroupInfoResponseDto>;
    inviteGroupMembers(inviteGroupMemberDto: InviteGroupMemberDto, inviterUuid: string): Promise<{
        results: ({
            inviteeUuid: string;
            status: InvitationStatus;
            invitationId: number;
            message?: undefined;
        } | {
            inviteeUuid: string;
            message: any;
            status?: undefined;
            invitationId?: undefined;
        })[];
    }>;
    acceptInvitation(id: number, inviteeUuid: string): Promise<{
        message: string;
    }>;
    rejectInvitation(id: number, inviteeUuid: string): Promise<{
        message: string;
    }>;
    cancelInvitation(id: number, inviterUuid: string): Promise<{
        message: string;
    }>;
    getSentInvitations(userUuid: string): Promise<RespondToInvitationDto[]>;
    getReceivedInvitations(userUuid: string): Promise<RespondToInvitationDto[]>;
    private getInvitation;
    deleteGroup(groupId: number, adminUuid: string): Promise<void>;
    getUserGroups(userUuid: string): Promise<GroupInfoResponseDto[]>;
    getGroupMembers(groupId: number, requestingUserUuid: string): Promise<GroupMemberResponseDto[]>;
    removeGroupMember(removeGroupMemberDto: RemoveGroupMemberDto, adminUuid: string): Promise<void>;
    getGroupDetail(groupId: number, userUuid: string): Promise<GroupDetailResponseDto>;
    getGroupInvitationDetail(invitationId: number): Promise<GroupInvitationDetailDto>;
    linkScheduleToGroupsAndUsers(schedule: Schedule, groupInfo: GroupInfo[]): Promise<void>;
    getUsersForGroup(groupId: number): Promise<UserInfo[]>;
    removeGroupMembersFromSchedule(scheduleId: number, groupInfo: GroupInfo[]): Promise<void>;
}
