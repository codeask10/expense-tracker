import { Schema, model, Document } from 'mongoose';

export interface IExpense extends Document {
  amount: number;      // stored in paise (₹1 = 100 paise)
  category: string;
  description: string;
  date: Date;
  createdAt: Date;
}

const expenseSchema = new Schema<IExpense>(
  {
    amount: {
      type: Number,
      required: true,
      min: [1, 'Amount must be at least 1 paise'],
    },
    category: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
      maxlength: 500,
    },
    date: {
      type: Date,
      required: true,
      index: true,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
    versionKey: false,
  }
);

// Compound index for common query pattern: filter by category, sort by date
expenseSchema.index({ category: 1, date: -1 });

export const Expense = model<IExpense>('Expense', expenseSchema);
