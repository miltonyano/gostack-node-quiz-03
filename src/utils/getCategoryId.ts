import { getRepository } from 'typeorm';

import Category from '../models/Category';

export default async function getCategoryId(
  categoryTitle: string,
): Promise<string> {
  const categoriesRepository = getRepository(Category);

  let category = await categoriesRepository.findOne({
    where: { title: categoryTitle },
  });

  if (!category) {
    category = categoriesRepository.create({
      title: categoryTitle,
    });

    await categoriesRepository.save(category);
  }
  return category.id;
}
