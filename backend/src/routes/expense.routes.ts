import { Router } from "express";
import {
  handleCreateExpense,
  handleGetExpenses,
  handleGetRecentExpenses,
  handleUpdateExpense,
  handleDeleteExpense,
  handleGetExpenseStats,
  handleGetMonthlyDistribution,
} from "../controllers/expense.controller";

const router = Router();

// Static routes must come before /:id to avoid Express treating them as IDs
router.get("/stats", handleGetExpenseStats);
router.get("/monthly-distribution", handleGetMonthlyDistribution);
router.get("/recent", handleGetRecentExpenses);

router.get("/", handleGetExpenses);
router.post("/", handleCreateExpense);
router.patch("/:id", handleUpdateExpense);
router.delete("/:id", handleDeleteExpense);

export default router;
