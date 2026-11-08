import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from '@/components/layout/Sidebar';
import { Navbar } from '@/components/layout/Navbar';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { useWedding } from '@/app/context/WeddingContext';
import { FamilySide, PaymentStatus } from '@/types';

export const DashboardLayout: React.FC = () => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);
  const { addExpense } = useWedding();

  // Quick Expense Form State
  const [name, setName] = useState('');
  const [totalAmount, setTotalAmount] = useState('');
  const [amountPaid, setAmountPaid] = useState('');
  const [familySide, setFamilySide] = useState<FamilySide>('groom');
  const [vendorName, setVendorName] = useState('');
  const [categoryName, setCategoryName] = useState('Venue and Decoration');

  const handleExpenseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const tot = parseFloat(totalAmount) || 0;
    const paid = parseFloat(amountPaid) || 0;

    let status: PaymentStatus = 'pending';
    if (paid >= tot && tot > 0) status = 'paid';
    else if (paid > 0) status = 'partially_paid';

    addExpense({
      categoryId: 'cat_' + categoryName.toLowerCase().replace(/\s+/g, '_'),
      categoryName,
      name,
      totalAmount: tot,
      amountPaid: paid,
      familySide,
      creatorId: 'usr_current',
      vendorName,
      expenseDate: new Date().toISOString().split('T')[0],
      paymentMethod: 'UPI',
      status,
    });

    // Reset & close
    setName('');
    setTotalAmount('');
    setAmountPaid('');
    setVendorName('');
    setIsAddExpenseOpen(false);
  };

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block h-full shrink-0">
        <Sidebar />
      </div>

      {/* Mobile Drawer */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-charcoal-900/50 backdrop-blur-xs transition-opacity"
            onClick={() => setIsMobileOpen(false)}
          />
          <div className="relative w-64 bg-white h-full z-10 shadow-2xl">
            <Sidebar onCloseMobile={() => setIsMobileOpen(false)} />
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Navbar
          onToggleMobile={() => setIsMobileOpen((prev) => !prev)}
          onOpenAddExpense={() => setIsAddExpenseOpen(true)}
        />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>

      {/* Quick Add Expense Modal */}
      <Modal
        isOpen={isAddExpenseOpen}
        onClose={() => setIsAddExpenseOpen(false)}
        title="Add Wedding Expense"
        description="Record a new expense and allocate it to the bride or groom family side."
      >
        <form onSubmit={handleExpenseSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-charcoal-700 uppercase tracking-wide mb-1">
              Expense Title *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Stage floral arrangement advance"
              className="w-full px-3.5 py-2 text-sm rounded-xl border border-sand-border focus:ring-2 focus:ring-wine-800 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-charcoal-700 uppercase tracking-wide mb-1">
                Total Amount (₹) *
              </label>
              <input
                type="number"
                required
                min="1"
                value={totalAmount}
                onChange={(e) => setTotalAmount(e.target.value)}
                placeholder="50000"
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-sand-border focus:ring-2 focus:ring-wine-800 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-charcoal-700 uppercase tracking-wide mb-1">
                Amount Paid (₹) *
              </label>
              <input
                type="number"
                required
                min="0"
                value={amountPaid}
                onChange={(e) => setAmountPaid(e.target.value)}
                placeholder="20000"
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-sand-border focus:ring-2 focus:ring-wine-800 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-charcoal-700 uppercase tracking-wide mb-1">
                Family Responsibility *
              </label>
              <select
                value={familySide}
                onChange={(e) => setFamilySide(e.target.value as FamilySide)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-sand-border bg-white focus:ring-2 focus:ring-wine-800 focus:outline-none"
              >
                <option value="groom">Groom's Family</option>
                <option value="bride">Bride's Family</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-charcoal-700 uppercase tracking-wide mb-1">
                Category
              </label>
              <select
                value={categoryName}
                onChange={(e) => setCategoryName(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-sand-border bg-white focus:ring-2 focus:ring-wine-800 focus:outline-none"
              >
                <option value="Venue and Decoration">Venue and Decoration</option>
                <option value="Catering and Food">Catering and Food</option>
                <option value="Clothing and Jewellery">Clothing and Jewellery</option>
                <option value="Photography and Videography">Photography</option>
                <option value="Invitations and Printing">Invitations</option>
                <option value="Transportation">Transportation</option>
                <option value="Miscellaneous">Miscellaneous</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-charcoal-700 uppercase tracking-wide mb-1">
              Vendor Name
            </label>
            <input
              type="text"
              value={vendorName}
              onChange={(e) => setVendorName(e.target.value)}
              placeholder="e.g. Royal Decorators"
              className="w-full px-3.5 py-2 text-sm rounded-xl border border-sand-border focus:ring-2 focus:ring-wine-800 focus:outline-none"
            />
          </div>

          <div className="pt-3 flex justify-end gap-2 border-t border-sand-border">
            <Button type="button" variant="ghost" onClick={() => setIsAddExpenseOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Save Expense
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
