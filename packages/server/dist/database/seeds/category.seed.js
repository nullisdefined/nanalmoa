"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CategorySeeder = void 0;
const category_entity_1 = require("../../entities/category.entity");
class CategorySeeder {
    async run(dataSource, factoryManager) {
        const categoryRepository = dataSource.getRepository(category_entity_1.Category);
        const categories = [
            { categoryName: '병원' },
            { categoryName: '가족' },
            { categoryName: '종교' },
            { categoryName: '운동' },
            { categoryName: '경조사' },
            { categoryName: '복약' },
            { categoryName: '기타' },
        ];
        for (const category of categories) {
            const existingCategory = await categoryRepository.findOne({
                where: { categoryName: category.categoryName },
            });
            if (!existingCategory) {
                await categoryRepository.save(category);
                console.log(`카테고리 생성: ${category.categoryName}`);
            }
            else {
                console.log(`카테고리 이미 존재: ${category.categoryName}`);
            }
        }
    }
}
exports.CategorySeeder = CategorySeeder;
//# sourceMappingURL=category.seed.js.map