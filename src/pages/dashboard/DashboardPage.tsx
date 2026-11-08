import React from 'react';
import {
  Wallet,
  Receipt,
  PiggyBank,
  Clock,
  CheckCircle2,
  Calendar,
  Users2,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { StatCard } from '@/components/ui/StatCard';
import { Button } from '@/components/ui/Button';
import { FamilyBadge, PaymentBadge } from '@/components/ui/Badge';
import { useWedding } from '@/app/context/WeddingContext';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Link } from 'react-router-dom';

export const DashboardPage: React.FC = () => {
  const { wedding, expenses, tasks, events, announcements, metrics, toggleTaskStatus } = useWedding();

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-wine-900 via-wine-800 to-wine-950 p-6 sm:p-8 text-white shadow-wedding-lg border border-gold-500/20">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold-400/20 text-gold-300 border border-gold-400/30 text-xs font-semibold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-gold-400" />
              Shared Wedding Workspace
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-serif font-bold tracking-tight">
              {wedding.brideName} & {wedding.groomName}
            </h2>
            <p className="text-wine-100 text-sm max-w-xl">
              {wedding.venueName} • {formatDate(wedding.weddingDate, 'long')}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link to="/expenses">
              <Button variant="gold" size="md">
                <Receipt className="w-4 h-4" />
                Manage Expenses
              </Button>
            </Link>
            <Link to="/invitation/editor">
              <Button variant="outline" size="md" className="border-gold-300 text-gold-100 hover:bg-white/10">
                <Sparkles className="w-4 h-4 text-gold-300" />
                Digital Invitation
              </Button>
            </Link>
          </div>
        </div>

        {/* Ambient background decoration */}
        <div className="absolute -right-10 -bottom-10 w-64 h-64 rounded-full bg-gold-500/10 blur-3xl pointer-events-none" />
      </div>

      {/* Financial Overview (PRD Section 8 - Mandatory Core Calculations) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard
          title="Total Budget"
          value={formatCurrency(metrics.totalBudget)}
          subtitle="Configured wedding budget"
          icon={<Wallet className="w-5 h-5" />}
          highlightColor="neutral"
        />
        <StatCard
          title="Recorded Expenses"
          value={formatCurrency(metrics.recordedExpenses)}
          subtitle="Total recorded spend"
          icon={<Receipt className="w-5 h-5" />}
          highlightColor="wine"
        />
        <StatCard
          title="Remaining Budget"
          value={formatCurrency(metrics.remainingBudget)}
          subtitle="Budget minus recorded expenses"
          icon={<PiggyBank className="w-5 h-5" />}
          highlightColor={metrics.remainingBudget >= 0 ? 'emerald' : 'amber'}
        />
        <StatCard
          title="Total Paid"
          value={formatCurrency(metrics.totalPaid)}
          subtitle="Actual payments disbursed"
          icon={<CheckCircle2 className="w-5 h-5" />}
          highlightColor="emerald"
        />
        <StatCard
          title="Outstanding"
          value={formatCurrency(metrics.outstandingPayments)}
          subtitle="Unpaid committed balance"
          icon={<Clock className="w-5 h-5" />}
          highlightColor="amber"
        />
      </div>

      {/* Two Families Split & Budget Utilization */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Family-Wise Spending Comparison */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Family Spending Comparison</CardTitle>
              <p className="text-xs text-charcoal-500 mt-1">
                Transparent breakdown of expenses recorded by each family
              </p>
            </div>
            <Link to="/expenses" className="text-xs font-semibold text-wine-800 hover:underline flex items-center gap-1">
              View details <ArrowRight className="w-3 h-3" />
            </Link>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Groom's Family */}
              <div className="p-4 rounded-xl bg-sky-50/60 border border-sky-100">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-sky-900 uppercase">Groom's Family</span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-sky-100 text-sky-800 font-bold">
                    {metrics.recordedExpenses > 0
                      ? Math.round((metrics.groomExpenses / metrics.recordedExpenses) * 100)
                      : 0}
                    %
                  </span>
                </div>
                <h4 className="text-xl font-bold font-serif text-charcoal-900 mt-2">
                  {formatCurrency(metrics.groomExpenses)}
                </h4>
                <p className="text-[11px] text-charcoal-500 mt-1">
                  Recorded across {expenses.filter((e) => e.familySide === 'groom').length} expense items
                </p>
              </div>

              {/* Bride's Family */}
              <div className="p-4 rounded-xl bg-pink-50/60 border border-pink-100">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-pink-900 uppercase">Bride's Family</span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-pink-100 text-pink-800 font-bold">
                    {metrics.recordedExpenses > 0
                      ? Math.round((metrics.brideExpenses / metrics.recordedExpenses) * 100)
                      : 0}
                    %
                  </span>
                </div>
                <h4 className="text-xl font-bold font-serif text-charcoal-900 mt-2">
                  {formatCurrency(metrics.brideExpenses)}
                </h4>
                <p className="text-[11px] text-charcoal-500 mt-1">
                  Recorded across {expenses.filter((e) => e.familySide === 'bride').length} expense items
                </p>
              </div>
            </div>

            {/* Split Progress Bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-semibold text-charcoal-600">
                <span>Groom: {formatCurrency(metrics.groomExpenses)}</span>
                <span>Bride: {formatCurrency(metrics.brideExpenses)}</span>
              </div>
              <div className="h-3 w-full bg-sand-200 rounded-full overflow-hidden flex">
                <div
                  className="bg-sky-600 transition-all duration-500"
                  style={{
                    width: `${metrics.recordedExpenses > 0 ? (metrics.groomExpenses / metrics.recordedExpenses) * 100 : 50}%`,
                  }}
                  title="Groom's family portion"
                />
                <div
                  className="bg-pink-500 transition-all duration-500"
                  style={{
                    width: `${metrics.recordedExpenses > 0 ? (metrics.brideExpenses / metrics.recordedExpenses) * 100 : 50}%`,
                  }}
                  title="Bride's family portion"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Budget Utilization Gauge Card */}
        <Card>
          <CardHeader>
            <CardTitle>Budget Health</CardTitle>
            <p className="text-xs text-charcoal-500 mt-1">Utilization against ₹20L total budget</p>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="text-center py-2">
              <div className="text-4xl font-serif font-bold text-wine-900">
                {metrics.budgetUtilization.toFixed(1)}%
              </div>
              <p className="text-xs font-medium text-charcoal-500 mt-1">
                {metrics.remainingBudget >= 0 ? 'Within allocated budget' : 'Budget exceeded!'}
              </p>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between text-xs text-charcoal-600">
                <span>Recorded: {formatCurrency(metrics.recordedExpenses)}</span>
                <span>Cap: {formatCurrency(metrics.totalBudget)}</span>
              </div>
              <div className="h-2.5 w-full bg-sand-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-wine-800 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, metrics.budgetUtilization)}%` }}
                />
              </div>
            </div>

            <div className="pt-2 border-t border-sand-border space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-charcoal-500">Uncommitted Budget</span>
                <span className="font-semibold text-emerald-700">{formatCurrency(metrics.remainingBudget)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-charcoal-500">Unpaid Vendor Dues</span>
                <span className="font-semibold text-amber-700">{formatCurrency(metrics.outstandingPayments)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tasks, Events & Announcements Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pending Coordination Tasks */}
        <Card className="lg:col-span-1">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-wine-800" />
              Family Tasks ({tasks.length})
            </CardTitle>
            <Link to="/tasks-events" className="text-xs font-semibold text-wine-800 hover:underline">
              View all
            </Link>
          </CardHeader>
          <CardContent className="space-y-3">
            {tasks.map((task) => (
              <div
                key={task.id}
                onClick={() => toggleTaskStatus(task.id)}
                className="p-3 rounded-xl border border-sand-border hover:border-gold-300 bg-sand-50/40 cursor-pointer transition-all flex items-start gap-3"
              >
                <input
                  type="checkbox"
                  checked={task.status === 'completed'}
                  onChange={() => {}}
                  className="mt-1 rounded border-sand-400 text-wine-800 focus:ring-wine-800"
                />
                <div className="flex-1 min-w-0">
                  <p
                    className={`text-xs font-semibold leading-tight ${
                      task.status === 'completed' ? 'line-through text-charcoal-400' : 'text-charcoal-800'
                    }`}
                  >
                    {task.title}
                  </p>
                  <div className="flex items-center gap-2 mt-1.5 text-[11px] text-charcoal-500">
                    <span>Due: {task.dueDate}</span>
                    <span className="text-wine-800 font-medium">{task.assigneeName}</span>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Upcoming Wedding Events */}
        <Card className="lg:col-span-1">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <Calendar className="w-4 h-4 text-gold-600" />
              Event Timeline ({events.length})
            </CardTitle>
            <Link to="/tasks-events" className="text-xs font-semibold text-wine-800 hover:underline">
              Full schedule
            </Link>
          </CardHeader>
          <CardContent className="space-y-3">
            {events.map((evt) => (
              <div key={evt.id} className="p-3 rounded-xl border border-sand-border bg-white space-y-1">
                <div className="flex items-center justify-between">
                  <h5 className="font-serif font-bold text-sm text-charcoal-900">{evt.name}</h5>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-sand-100 text-charcoal-700 uppercase">
                    {evt.eventType.replace('_', ' ')}
                  </span>
                </div>
                <p className="text-xs text-charcoal-500">{evt.venueName}</p>
                <p className="text-[11px] text-wine-800 font-medium">
                  {formatDate(evt.startTime, 'medium')}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Pinned Announcements */}
        <Card className="lg:col-span-1">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <Users2 className="w-4 h-4 text-wine-800" />
              Family Announcements
            </CardTitle>
            <Link to="/family" className="text-xs font-semibold text-wine-800 hover:underline">
              Discussions
            </Link>
          </CardHeader>
          <CardContent className="space-y-3">
            {announcements.map((ann) => (
              <div key={ann.id} className="p-3 rounded-xl bg-gold-50/50 border border-gold-200/70 space-y-1">
                <div className="flex items-center gap-1.5 text-[11px] font-semibold text-gold-800 uppercase">
                  <Sparkles className="w-3 h-3 text-gold-600" />
                  {ann.isPinned ? 'Pinned Notice' : 'Notice'}
                </div>
                <h5 className="text-xs font-bold text-charcoal-900">{ann.title}</h5>
                <p className="text-xs text-charcoal-600 leading-relaxed">{ann.content}</p>
                <p className="text-[10px] text-charcoal-400 pt-1">By {ann.authorName}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Recent Recorded Expenses List */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Recent Recorded Expenses</CardTitle>
            <p className="text-xs text-charcoal-500 mt-1">Latest financial transactions added to workspace</p>
          </div>
          <Link to="/expenses" className="text-xs font-semibold text-wine-800 hover:underline flex items-center gap-1">
            Open Expense Tracker <ArrowRight className="w-3 h-3" />
          </Link>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-sand-50/80 text-[11px] uppercase tracking-wider font-semibold text-charcoal-500 border-b border-sand-border">
                <tr>
                  <th className="py-3 px-4">Expense Details</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Family Side</th>
                  <th className="py-3 px-4">Total Amount</th>
                  <th className="py-3 px-4">Amount Paid</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-sand-border/70">
                {expenses.map((expense) => (
                  <tr key={expense.id} className="hover:bg-sand-50/50 transition-colors">
                    <td className="py-3 px-4">
                      <p className="font-semibold text-charcoal-900">{expense.name}</p>
                      <p className="text-xs text-charcoal-500">{expense.vendorName || 'Direct'}</p>
                    </td>
                    <td className="py-3 px-4 text-xs text-charcoal-700">{expense.categoryName}</td>
                    <td className="py-3 px-4">
                      <FamilyBadge side={expense.familySide} />
                    </td>
                    <td className="py-3 px-4 font-serif font-bold text-charcoal-900">
                      {formatCurrency(expense.totalAmount)}
                    </td>
                    <td className="py-3 px-4 text-emerald-700 font-semibold">
                      {formatCurrency(expense.amountPaid)}
                    </td>
                    <td className="py-3 px-4">
                      <PaymentBadge status={expense.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
