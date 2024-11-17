import { DataSource } from 'typeorm';
import { Seeder } from 'typeorm-extension';
export declare class ScheduleSeeder implements Seeder {
    private scheduleTemplates;
    private memoTemplates;
    private locationTemplates;
    run(dataSource: DataSource): Promise<void>;
}
