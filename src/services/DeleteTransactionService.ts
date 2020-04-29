import { getRepository } from 'typeorm';
import AppError from '../errors/AppError';

import Transaction from '../models/Transaction';

class DeleteTransactionService {
  public async execute(id: string): Promise<void> {
    const transactionsRepository = getRepository(Transaction);

    const checkDelete = await transactionsRepository.delete(id);

    if (checkDelete.affected === 0) {
      throw new AppError('Id not found');
    }
  }
}

export default DeleteTransactionService;
