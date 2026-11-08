import React, { useState } from 'react';
import { Trash2, Download, Search, Filter } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { FamilyBadge, PaymentBadge } from '@/components/ui/Badge';
import { StatCard } from '@/components/ui/StatCard';
import { useWedding } from '@/app/context/WeddingContext';
import { formatCurrency } from '@/lib/utils';
import { FamilySide } from '@/types';

export const ExpensesPage: React.FC = () => {
  const { expenses, metrics, deleteExpense } = useWedding();
  const [searchTerm, setSearchTerm] = useState('');
  const [familyFilter, setFamilyFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filteredExpenses = expenses.filter((e) => {
    const matchesSearch = e.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (e.vendorName && e.vendorName.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesFamily = familyFilter === 'all' || e.familySide === familyFilter;
    const matchesStatus = statusFilter === 'all' || e.status === statusFilter;
    return matchesSearch && matchesFamily && matchesStatus;
  });

  const exportCSV = () => {
    const headers = ['ID', 'Name', 'Category', 'Family Side', 'Total Amount', 'Amount Paid', 'Balance', 'Status', 'Vendor', 'Date'];
    const rows = filteredExpenses.map((e) => [
      e.id,
      `"${e.name}"`,
      `"${e.categoryName || ''}"`,
      e.familySide,
      e.totalAmount,
      e.amountPaid,
      e.totalAmount - e.amountPaid,
      e.status,
      `"${e.vendorName || ''}"`,
      e.expenseDate,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `make_my_marriage_expenses_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-serif font-bold text-wine-900">Expense Tracker</h2>
          <p className="text-xs text-charcoal-500 mt-1">
            Track combined wedding spending, family allocations, advances, and pending vendor dues.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={exportCSV}>
            <Download className="w-4 h-4 text-charcoal-600" />
            <span>Export CSV</span>
          </Button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Recorded Expenses"
          value={formatCurrency(metrics.recordedExpenses)}
          subtitle="All recorded items"
          highlightColor="wine"
        />
        <StatCard
          title="Paid Disbursed"
          value={formatCurrency(metrics.totalPaid)}
          subtitle="Actual payments made"
          highlightColor="emerald"
        />
        <StatCard
          title="Pending Dues"
          value={formatCurrency(metrics.outstandingPayments)}
          subtitle="Remaining to pay vendors"
          highlightColor="amber"
        />
        <StatCard
          title="Uncommitted Budget"
          value={formatCurrency(metrics.remainingBudget)}
          subtitle="₹20L Budget minus recorded"
          highlightColor={metrics.remainingBudget >= 0 ? 'emerald' : 'amber'}
        />
      </div>

      {/* Filter and Search Bar */}
      <Card>
        <CardContent className="p-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-charcoal-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search expense or vendor..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-sand-border focus:ring-2 focus:ring-wine-800 focus:outline-none"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            <div className="flex items-center gap-1 text-xs text-charcoal-500">
              <Filter className="w-3.5 h-3.5" />
              <span>Family:</span>
            </div>
            <select
              value={familyFilter}
              onChange={(e) => setFamilyFilter(e.target.value)}
              className="text-xs px-3 py-1.5 rounded-lg border border-sand-border bg-white text-charcoal-800"
            >
              <option value="all">All Families</option>
              <option value="groom">Groom's Side (₹12,00,000)</option>
              <option value="bride">Bride's Side (₹1,50,000)</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="text-xs px-3 py-1.5 rounded-lg border border-sand-border bg-white text-charcoal-800"
            >
              <option value="all">All Statuses</option>
              <option value="paid">Paid</option>
              <option value="partially_paid">Partially Paid</option>
              <option value="pending">Pending</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Expenses Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-sand-50/90 text-[11px] uppercase tracking-wider font-semibold text-charcoal-500 border-b border-sand-border">
                <tr>
                  <th className="py-3 px-5">Expense Details</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Family Responsible</th>
                  <th className="py-3 px-4">Total Amount</th>
                  <th className="py-3 px-4">Amount Paid</th>
                  <th className="py-3 px-4">Balance</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-sand-border/70">
                {filteredExpenses.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-xs text-charcoal-500">
                      No expenses found matching the selected filters.
                    </td>
                  </tr>
                ) : (
                  filteredExpenses.map((expense) => {
                    const balance = expense.totalAmount - expense.amountPaid;
                    return (
                      <tr key={expense.id} className="hover:bg-sand-50/50 transition-colors">
                        <td className="py-3.5 px-5">
                          <p className="font-semibold text-charcoal-900">{expense.name}</p>
                          <p className="text-xs text-charcoal-500">
                            {expense.vendorName ? `Vendor: ${expense.vendorName}` : 'Direct expense'} • {expense.expenseDate}
                          </p>
                        </td>
                        <td className="py-3.5 px-4 text-xs text-charcoal-700 font-medium">
                          {expense.categoryName}
                        </td>
                        <td className="py-3.5 px-4">
                          <FamilyBadge side={expense.familySide as FamilySide} />
                        </td>
                        <td className="py-3.5 px-4 font-serif font-bold text-charcoal-900">
                          {formatCurrency(expense.totalAmount)}
                        </td>
                        <td className="py-3.5 px-4 font-semibold text-emerald-700">
                          {formatCurrency(expense.amountPaid)}
                        </td>
                        <td className="py-3.5 px-4 font-semibold text-amber-700">
                          {formatCurrency(balance)}
                        </td>
                        <td className="py-3.5 px-4">
                          <PaymentBadge status={expense.status} />
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <button
                            onClick={() => {
                              if (confirm(`Are you sure you want to delete "${expense.name}"?`)) {
                                deleteExpense(expense.id);
                              }
                            }}
                            className="p-1.5 rounded-lg text-charcoal-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                            title="Delete Expense"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
