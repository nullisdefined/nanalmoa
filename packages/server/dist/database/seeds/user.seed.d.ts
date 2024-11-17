import { DataSource } from 'typeorm';
import { Seeder, SeederFactoryManager } from 'typeorm-extension';
export declare class UserSeeder implements Seeder {
    private koreanLastNames;
    private koreanFirstNames;
    private profileImageTemplates;
    private generateKoreanName;
    private generateRandomDate;
    private generatePhoneNumber;
    run(dataSource: DataSource, factoryManager: SeederFactoryManager): Promise<void>;
}
