import { Router } from 'express';
import {
  handleCreateExpense,
  handleGetExpenses,
  handleUpdateExpense,
  handleDeleteExpense,
} from '../controllers/expense.controller';

const router = Router();

router.get('/', handleGetExpenses);
router.post('/', handleCreateExpense);
router.patch('/:id', handleUpdateExpense);
router.delete('/:id', handleDeleteExpense);

export default router;
