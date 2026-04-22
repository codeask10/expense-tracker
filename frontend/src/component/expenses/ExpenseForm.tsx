import { FormEvent, useRef, useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { useUpdateExpense } from '../hooks/useCreateExpense';
import type { Expense } from '../../types/expense';
import type { useCreateExpense } from '../hooks/useCreateExpense';

const CATEGORY_OPTIONS = [
  { value: '',               label: 'Select a category' },
  { value: 'Food',           label: 'Food' },
  { value: 'Transportation', label: 'Transportation' },
  { value: 'Housing',        label: 'Housing' },
  { value: 'Healthcare',     label: 'Healthcare' },
  { value: 'Entertainment',  label: 'Entertainment' },
  { value: 'Shopping',       label: 'Shopping' },
  { value: 'Education',      label: 'Education' },
  { value: 'Utilities',      label: 'Utilities' },
  { value: 'Other',          label: 'Other' },
];

interface FormState {
  amount: string;
  category: string;
  description: string;
  date: string;
}

const blank = (): FormState => ({
  amount: '',
  category: '',
  description: '',
  date: new Date().toISOString().slice(0, 10),
});

interface ExpenseFormProps {
  expense?: Expense | null;
  onSuccess?: () => void;
  onCancel: () => void;
  createMutation: ReturnType<typeof useCreateExpense>;
}

export function ExpenseForm({ expense, onSuccess, onCancel, createMutation }: ExpenseFormProps) {
  const isEdit = Boolean(expense);
  const submitting = useRef(false);
  const updateMutation = useUpdateExpense();
  const isPending = createMutation.isPending || updateMutation.isPending;

  const [form, setForm] = useState<FormState>(blank);
  const [errors, setErrors] = useState<Partial<FormState>>({});

  useEffect(() => {
    if (expense) {
      setForm({
        amount: String(expense.amount / 100),
        category: expense.category,
        description: expense.description,
        date: expense.date.slice(0, 10),
      });
    } else {
      setForm(blank());
    }
    setErrors({});
  }, [expense]);

  function change(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
    setErrors((p) => ({ ...p, [name]: undefined }));
  }

  function validate(): boolean {
    const next: Partial<FormState> = {};
    const amt = parseFloat(form.amount);
    if (!form.amount || isNaN(amt) || amt <= 0) next.amount = 'Enter a valid amount';
    if (!form.category) next.category = 'Select a category';
    if (!form.description.trim()) next.description = 'Description is required';
    if (!form.date) next.date = 'Date is required';
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (submitting.current || isPending) return;
    if (!validate()) return;

    submitting.current = true;
    const payload = {
      amount: parseFloat(form.amount),
      category: form.category,
      description: form.description.trim(),
      date: new Date(form.date).toISOString(),
    };

    try {
      if (isEdit && expense) {
        await updateMutation.mutateAsync({ id: expense._id, payload });
        toast.success('Expense updated!');
      } else {
        await createMutation.mutateAsync(payload);
        toast.success('Expense added!');
      }
      onSuccess?.();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      submitting.current = false;
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4">
      <Input
        label="Amount"
        name="amount"
        type="number"
        min="0.01"
        step="0.01"
        placeholder="0.00"
        value={form.amount}
        onChange={change}
        prefix="₹"
        error={errors.amount}
      />

      <Select
        label="Category"
        name="category"
        value={form.category}
        onChange={change}
        options={CATEGORY_OPTIONS}
        error={errors.category}
      />

      <div className="space-y-1">
        <label className="form-label">Description</label>
        <textarea
          name="description"
          rows={3}
          placeholder="What was this expense for?"
          value={form.description}
          onChange={change}
          maxLength={500}
          className={`input-field resize-none ${errors.description ? 'border-red-400' : ''}`}
        />
        {errors.description && <p className="text-xs text-red-500">{errors.description}</p>}
      </div>

      <Input
        label="Date"
        name="date"
        type="date"
        value={form.date}
        onChange={change}
        error={errors.date}
      />

      <div className="flex justify-end gap-3 pt-1">
        <Button type="button" variant="secondary" onClick={onCancel} disabled={isPending}>
          Cancel
        </Button>
        <Button type="submit" variant="primary" loading={isPending}>
          {isEdit ? 'Save Changes' : 'Add Expense'}
        </Button>
      </div>
    </form>
  );
}
