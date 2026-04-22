import { Request, Response, NextFunction } from 'express';
import {
  createExpense,
  createExpenseSchema,
  updateExpenseSchema,
  getExpenses,
  updateExpense,
  deleteExpense,
} from '../services/expense.service';
import { createError } from '../middleware/error.middleware';

export async function handleCreateExpense(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const idempotencyKey = req.headers['idempotency-key'] as string | undefined;
    const input = createExpenseSchema.parse(req.body);
    const { statusCode, body } = await createExpense(input, idempotencyKey);
    res.status(statusCode).json(body);
  } catch (err) {
    next(err);
  }
}

export async function handleGetExpenses(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const {
      category,
      sortBy,
      order,
      limit: limitStr,
      offset: offsetStr,
    } = req.query as Record<string, string | undefined>;

    const limit = Math.min(Math.max(parseInt(limitStr ?? '20', 10) || 20, 1), 100);
    const offset = Math.max(parseInt(offsetStr ?? '0', 10) || 0, 0);

    const result = await getExpenses({
      category,
      sortBy: sortBy === 'category' ? 'category' : 'date',
      order: order === 'asc' ? 'asc' : 'desc',
      limit,
      offset,
    });

    res.json({ success: true, ...result });
  } catch (err) {
    next(err);
  }
}

export async function handleUpdateExpense(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    const input = updateExpenseSchema.parse(req.body);
    const expense = await updateExpense(id, input);
    if (!expense) throw createError('Expense not found', 404);
    res.json({ success: true, data: expense, message: 'Expense updated successfully' });
  } catch (err) {
    next(err);
  }
}

export async function handleDeleteExpense(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    const deleted = await deleteExpense(id);
    if (!deleted) throw createError('Expense not found', 404);
    res.json({ success: true, message: 'Expense deleted successfully' });
  } catch (err) {
    next(err);
  }
}
