import { GroupInfoResponseDto } from './response-group.dto';
import { GroupMemberResponseDto } from './response-group-member.dto';
export declare class GroupDetailResponseDto extends GroupInfoResponseDto {
    members: GroupMemberResponseDto[];
}
