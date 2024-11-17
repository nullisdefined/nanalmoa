import { Group } from './group.entity';
export declare class UserGroup {
    userGroupId: number;
    userUuid: string;
    group: Group;
    isAdmin: boolean;
    createdAt: Date;
    updatedAt: Date;
}
