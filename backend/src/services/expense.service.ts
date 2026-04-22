import { z } from "zod";
import mongoose from "mongoose";
import { Expense, IExpense } from "../models/Expense";
import { Idempotency } from "../models/Idempotency";
import { hashObject } from "../utils/hash.util";
import { createError } from "../middleware/error.middleware";

// ─── Schemas ─────────────────────────────────────────────────────────────────

export const createExpenseSchema = z.object({
  amount: z
    .number({ required_error: "amount is required" })
    .positive("amount must be positive"),
  category: z.string().min(1, "category is required").max(100),
  description: z.string().min(1, "description is required").max(500),
  date: z.string().datetime({ message: "date must be a valid ISO string" }),
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
  idempotencyKey: string | undefined,
): Promise<{
  statusCode: number;
  body: { success: boolean; data: ExpenseResponse; message: string };
}> {
  const requestHash = hashObject(input);

  if (idempotencyKey) {
    const existing = await Idempotency.findOne({ key: idempotencyKey });
    if (existing) {
      if (existing.requestHash !== requestHash) {
        throw createError(
          "Idempotency key reused with a different request body",
          422,
        );
      }
      return {
        statusCode: existing.statusCode,
        body: existing.response as {
          success: boolean;
          data: ExpenseResponse;
          message: string;
        },
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
    message: "Expense created successfully",
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
  sortBy?: "date" | "category";
  order?: "asc" | "desc";
  limit?: number;
  offset?: number;
}

export async function getExpenses(
  params: GetExpensesParams = {},
): Promise<PaginatedExpenses> {
  const {
    category,
    sortBy = "date",
    order = "desc",
    limit = 20,
    offset = 0,
  } = params;

  const filter: Record<string, unknown> = {};
  if (category && category !== "All") filter.category = category;

  const sortField = sortBy === "category" ? "category" : "date";
  const sortDir = order === "asc" ? 1 : -1;

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

// ─── Recent Expenses (Independent) ────────────────────────────────────────────

export interface GetRecentExpensesParams {
  limit?: number;
  offset?: number;
}

export async function getRecentExpenses(
  params: GetRecentExpensesParams = {},
): Promise<PaginatedExpenses> {
  const { limit = 10, offset = 0 } = params;

  const [data, total] = await Promise.all([
    Expense.find({})
      .sort({ date: -1, createdAt: -1 })
      .skip(offset)
      .limit(limit)
      .lean<IExpense[]>(),
    Expense.countDocuments({}),
  ]);

  return {
    data: data.map(toResponse),
    total,
    limit,
    offset,
  };
}

// ─── Stats ────────────────────────────────────────────────────────────────────

export interface ExpenseStats {
  totalExpense: number; // paise
  thisMonthExpense: number; // paise
  averageExpense: number; // paise
}

export async function getExpenseStats(): Promise<ExpenseStats> {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1; // $month is 1-based in MongoDB

  const [overall, thisMonth] = await Promise.all([
    Expense.aggregate<{ total: number; count: number }>([
      { $group: { _id: null, total: { $sum: "$amount" }, count: { $sum: 1 } } },
    ]),
    Expense.aggregate<{ total: number }>([
      {
        $match: {
          $expr: {
            $and: [
              { $eq: [{ $year: "$date" }, currentYear] },
              { $eq: [{ $month: "$date" }, currentMonth] },
            ],
          },
        },
      },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]),
  ]);

  const totalExpense = overall[0]?.total ?? 0;
  const count = overall[0]?.count ?? 0;
  const thisMonthExpense = thisMonth[0]?.total ?? 0;
  const averageExpense = count > 0 ? Math.round(totalExpense / count) : 0;

  return { totalExpense, thisMonthExpense, averageExpense };
}

export interface CategoryBreakdown {
  name: string;
  amount: number; // paise
}

export interface MonthData {
  month: string;
  total: number; // paise
  categories: CategoryBreakdown[];
}

export interface MonthlyDistributionResult {
  year: number;
  availableYears: number[];
  monthlyData: MonthData[];
}

const MONTH_NAMES = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

export async function getMonthlyDistribution(
  year?: number,
): Promise<MonthlyDistributionResult> {
  const yearResults = await Expense.aggregate<{ _id: number }>([
    { $group: { _id: { $year: "$date" } } },
    { $sort: { _id: -1 } },
  ]);

  const availableYears = yearResults.map((r) => r._id);
  const targetYear =
    year !== undefined && availableYears.includes(year)
      ? year
      : (availableYears[0] ?? new Date().getFullYear());

  // Group by month AND category in a single pass
  const monthCategoryAgg = await Expense.aggregate<{
    _id: { month: number; category: string };
    total: number;
  }>([
    { $match: { $expr: { $eq: [{ $year: "$date" }, targetYear] } } },
    {
      $group: {
        _id: { month: { $month: "$date" }, category: "$category" },
        total: { $sum: "$amount" },
      },
    },
    { $sort: { "_id.month": 1, total: -1 } },
  ]);

  // Reconstruct: month → { total, categories }
  const monthMap: Record<
    number,
    { total: number; cats: Record<string, number> }
  > = {};
  for (const {
    _id: { month, category },
    total,
  } of monthCategoryAgg) {
    if (!monthMap[month]) monthMap[month] = { total: 0, cats: {} };
    monthMap[month].cats[category] = total;
    monthMap[month].total += total;
  }

  const monthlyData = MONTH_NAMES.map((month, i) => {
    const num = i + 1;
    const entry = monthMap[num];
    if (!entry) return { month, total: 0, categories: [] };
    const categories = Object.entries(entry.cats)
      .map(([name, amount]) => ({ name, amount }))
      .sort((a, b) => b.amount - a.amount);
    return { month, total: entry.total, categories };
  });

  return { year: targetYear, availableYears, monthlyData };
}

// ─── Update ───────────────────────────────────────────────────────────────────

export async function updateExpense(
  id: string,
  input: UpdateExpenseInput,
): Promise<ExpenseResponse | null> {
  if (!mongoose.Types.ObjectId.isValid(id))
    throw createError("Invalid expense ID", 400);

  const update: Record<string, unknown> = {};
  if (input.amount !== undefined)
    update.amount = Math.round(input.amount * 100);
  if (input.category !== undefined) update.category = input.category.trim();
  if (input.description !== undefined)
    update.description = input.description.trim();
  if (input.date !== undefined) update.date = new Date(input.date);

  const expense = await Expense.findByIdAndUpdate(
    id,
    { $set: update },
    { new: true },
  );
  return expense ? toResponse(expense) : null;
}

// ─── Delete ───────────────────────────────────────────────────────────────────

export async function deleteExpense(id: string): Promise<boolean> {
  if (!mongoose.Types.ObjectId.isValid(id))
    throw createError("Invalid expense ID", 400);
  return (await Expense.findByIdAndDelete(id)) !== null;
}
