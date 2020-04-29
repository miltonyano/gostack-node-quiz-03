import { getCustomRepository } from 'typeorm';
import AppError from '../errors/AppError';

import getCategoryId from '../utils/getCategoryId';

import TransactionRepository from '../repositories/TransactionsRepository';
import Transaction from '../models/Transaction';

interface Request {
  title: string;
  value: number;
  type: 'income' | 'outcome';
  categoryTitle: string;
}

class CreateTransactionService {
  public async execute({
    title,
    value,
    type,
    categoryTitle,
  }: Request): Promise<Transaction> {
    const transactionsRepository = getCustomRepository(TransactionRepository);

    if (type === 'outcome') {
      const balance = await transactionsRepository.getBalance();

      if (value > balance.total) {
        throw new AppError("You don't have enough funds for this transaction");
      }
    }

    const category_id = await getCategoryId(categoryTitle);

    const transaction = transactionsRepository.create({
      title,
      value,
      type,
      category_id,
    });

    await transactionsRepository.save(transaction);

    return transaction;
  }
}

export default CreateTransactionService;
