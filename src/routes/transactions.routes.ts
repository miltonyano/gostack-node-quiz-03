import { Router } from 'express';
import { getCustomRepository } from 'typeorm';
import multer from 'multer';
import uploadConfig from '../config/upload';

import CreateTransactionService from '../services/CreateTransactionService';
import TransactionsRepository from '../repositories/TransactionsRepository';
import DeleteTransactionService from '../services/DeleteTransactionService';
import ImportTransactionsService from '../services/ImportTransactionsService';

const transactionsRouter = Router();
const upload = multer(uploadConfig);

transactionsRouter.get('/', async (request, response) => {
  const transactionRepository = getCustomRepository(TransactionsRepository);

  const rawTransactionsCategory = await transactionRepository.find({
    select: ['id', 'title', 'value', 'type'],
    relations: ['category'],
  });

  const transactions = rawTransactionsCategory.map(rawTransactionCategory => {
    const transaction = rawTransactionCategory;
    if (transaction.category) {
      delete transaction.category.created_at;
      delete transaction.category.updated_at;
    }
    return transaction;
  });

  const balance = await transactionRepository.getBalance();

  return response.json({ transactions, balance });
});

transactionsRouter.post('/', async (request, response) => {
  const { title, value, type, category } = request.body;

  if (['income', 'outcome'].indexOf(type) === -1) {
    return response.status(400).json({ error: 'type parameter is invalid' });
  }

  const createTransaction = new CreateTransactionService();

  const transaction = await createTransaction.execute({
    title,
    value,
    type,
    categoryTitle: category,
  });

  return response.json(transaction);
});

transactionsRouter.delete('/:id', async (request, response) => {
  const { id } = request.params;

  const deleteTransaction = new DeleteTransactionService();

  await deleteTransaction.execute(id);

  return response.status(200).send();
});

transactionsRouter.post(
  '/import',
  upload.single('file'),
  async (request, response) => {
    const importTransaction = new ImportTransactionsService();

    const transactions = await importTransaction.execute(request.file.path);

    return response.json(transactions);
  },
);

export default transactionsRouter;
