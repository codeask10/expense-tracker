import { z } from 'zod';
import mongoose from 'mongoose';
import { Expense, IExpense } from '../models/Expense';
import { Idempotency } from '../models/Idempotency';
import { hashObject } from '../utils/hash.util';
import { createError } from '../middleware/error.middleware';

// ─── Schemas ─────────────────────────────────────────────────────────────────

export const createExpenseSchema = z.object({
  amount: z.number({ required_error: 'amount is required' }).positive('amount must be positive'),
  category: z.string().min(1, 'category is required').max(100),
  description: z.string().min(1, 'description is required').max(500),
  date: z.string().datetime({ message: 'date must be a valid ISO string' }),
});

export const updateExpenseSchema = createExpenseSchema.partial();

export type CreateExpenseInput = z.infer<typeof createExpenseSchema>;
export type UpdateExpenseInput = z.infer<typeof updateExpenseSchema>;

// ─── Shared response type ─────────────────────────────────────────────────────

export interface ExpenseResponse {
  _id: string;
  amount: number;
  category: string;
  description: string;
  date: string;
  createdAt: string;
}

export interface PaginatedExpenses {
  data: ExpenseResponse[];
  total: number;
  limit: number;
  offset: number;
}

function toResponse(doc: IExpense): ExpenseResponse {
  return {
    _id: doc._id.toString(),
    amount: doc.amount,
    category: doc.category,
    description: doc.description,
    date: doc.date.toISOString(),
    createdAt: doc.createdAt.toISOString(),
  };
}

// ─── Create ───────────────────────────────────────────────────────────────────

export async function createExpense(
  input: CreateExpenseInput,
  idempotencyKey: string | undefined
): Promise<{ statusCode: number; body: { success: boolean; data: ExpenseResponse; message: string } }> {
  const requestHash = hashObject(input);

  if (idempotencyKey) {
    const existing = await Idempotency.findOne({ key: idempotencyKey });
    if (existing) {
      if (existing.requestHash !== requestHash) {
        throw createError('Idempotency key reused with a different request body', 422);
      }
      return {
        statusCode: existing.statusCode,
        body: existing.response as { success: boolean; data: ExpenseResponse; message: string },
      };
    }
  }

  const amountInPaise = Math.round(input.amount * 100);

  const expense = await Expense.create({
    amount: amountInPaise,
    category: input.category.trim(),
    description: input.description.trim(),
    date: new Date(input.date),
  });

  const responseBody = {
    success: true as const,
    data: toResponse(expense),
    message: 'Expense created successfully',
  };

  if (idempotencyKey) {
    await Idempotency.create({
      key: idempotencyKey,
      requestHash,
      statusCode: 201,
      response: responseBody,
    });
  }

  return { statusCode: 201, body: responseBody };
}

// ─── Read (paginated) ─────────────────────────────────────────────────────────

export interface GetExpensesParams {
  category?: string;
  sortBy?: 'date' | 'category';
  order?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
}

export async function getExpenses(params: GetExpensesParams = {}): Promise<PaginatedExpenses> {
  const {
    category,
    sortBy = 'date',
    order = 'desc',
    limit = 20,
    offset = 0,
  } = params;

  const filter: Record<string, unknown> = {};
  if (category && category !== 'All') filter.category = category;

  const sortField = sortBy === 'category' ? 'category' : 'date';
  const sortDir = order === 'asc' ? 1 : -1;

  const [data, total] = await Promise.all([
    Expense.find(filter)
      .sort({ [sortField]: sortDir, createdAt: -1 })
      .skip(offset)
      .limit(limit)
      .lean<IExpense[]>(),
    Expense.countDocuments(filter),
  ]);

  return {
    data: data.map(toResponse),
    total,
    limit,
    offset,
  };
}

// ─── Update ───────────────────────────────────────────────────────────────────

export async function updateExpense(id: string, input: UpdateExpenseInput): Promise<ExpenseResponse | null> {
  if (!mongoose.Types.ObjectId.isValid(id)) throw createError('Invalid expense ID', 400);

  const update: Record<string, unknown> = {};
  if (input.amount !== undefined) update.amount = Math.round(input.amount * 100);
  if (input.category !== undefined) update.category = input.category.trim();
  if (input.description !== undefined) update.description = input.description.trim();
  if (input.date !== undefined) update.date = new Date(input.date);

  const expense = await Expense.findByIdAndUpdate(id, { $set: update }, { new: true });
  return expense ? toResponse(expense) : null;
}

// ─── Delete ───────────────────────────────────────────────────────────────────

export async function deleteExpense(id: string): Promise<boolean> {
  if (!mongoose.Types.ObjectId.isValid(id)) throw createError('Invalid expense ID', 400);
  return (await Expense.findByIdAndDelete(id)) !== null;
}
