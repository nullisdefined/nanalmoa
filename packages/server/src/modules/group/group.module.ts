import { GroupInvitation } from '@/entities/group-invitation.entity'
import { GroupSchedule } from '@/entities/group-schedule.entity'
import { Group } from '@/entities/group.entity'
import { UserGroup } from '@/entities/user-group.entity'
import { User } from '@/entities/user.entity'
import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { UsersModule } from '../users/users.module'
import { GroupController } from './group.controller'
import { GroupService } from './group.service'

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Group,
      UserGroup,
      GroupSchedule,
      GroupInvitation,
      User,
    ]),
    UsersModule,
  ],
  controllers: [GroupController],
  providers: [GroupService],
  exports: [GroupService],
})
export class GroupModule {}
