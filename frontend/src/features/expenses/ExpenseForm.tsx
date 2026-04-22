import { FormEvent, useRef, useState } from "react";
import toast from "react-hot-toast";
import { useCreateExpense } from "./useExpenses";

const CATEGORIES = [
  "Food",
  "Transport",
  "Housing",
  "Healthcare",
  "Entertainment",
  "Shopping",
  "Education",
  "Utilities",
  "Other",
];

interface FormState {
  amount: string;
  category: string;
  description: string;
  date: string;
}

const emptyForm = (): FormState => ({
  amount: "",
  category: "Food",
  description: "",
  date: new Date().toISOString().slice(0, 10),
});

export function ExpenseForm() {
  const [form, setForm] = useState<FormState>(emptyForm);
  const submittingRef = useRef(false); // guard against double-click
  const mutation = useCreateExpense();

  function handleChange(
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (submittingRef.current || mutation.isPending) return;

    const amount = parseFloat(form.amount);
    if (isNaN(amount) || amount <= 0) {
      toast.error("Enter a valid amount");
      return;
    }

    submittingRef.current = true;
    try {
      await mutation.mutateAsync({
        amount,
        category: form.category,
        description: form.description.trim(),
        date: new Date(form.date).toISOString(),
      });
      toast.success("Expense added!");
      setForm(emptyForm());
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to add expense");
    } finally {
      submittingRef.current = false;
    }
  }

  return (
    <form onSubmit={handleSubmit} className="card p-6 space-y-4">
      <h2 className="text-lg font-semibold text-gray-800">Add Expense</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="form-label" htmlFor="amount">
            Amount (₹)
          </label>
          <div className="relative">
            <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-gray-400 text-sm">
              ₹
            </span>
            <input
              id="amount"
              name="amount"
              type="number"
              min="0.01"
              step="0.01"
              placeholder="0.00"
              value={form.amount}
              onChange={handleChange}
              required
              className="input-field pl-7"
            />
          </div>
        </div>
        <div>
          <label className="form-label" htmlFor="category">
            Category
          </label>
          <select
            id="category"
            name="category"
            value={form.category}
            onChange={handleChange}
            required
            className="input-field"
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="form-label" htmlFor="date">
            Date
          </label>
          <input
            id="date"
            name="date"
            type="date"
            value={form.date}
            onChange={handleChange}
            required
            className="input-field"
          />
        </div>

        {/* Description */}
        <div>
          <label className="form-label" htmlFor="description">
            Description
          </label>
          <input
            id="description"
            name="description"
            type="text"
            placeholder="What was it for?"
            value={form.description}
            onChange={handleChange}
            required
            maxLength={500}
            className="input-field"
          />
        </div>
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={mutation.isPending}
          className="btn-primary min-w-[140px]"
        >
          {mutation.isPending ? (
            <>
              <Spinner />
              Saving…
            </>
          ) : (
            "Add Expense"
          )}
        </button>
      </div>
    </form>
  );
}

function Spinner() {
  return (
    <svg
      className="h-4 w-4 animate-spin"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
    </svg>
  );
}
