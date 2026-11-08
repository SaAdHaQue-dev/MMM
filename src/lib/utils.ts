import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format currency according to Indian Rupee (INR) numbering system (Lakhs / Crores)
 * e.g., 2000000 -> ₹20,00,000
 */
export function formatCurrency(amount: number, currency: string = 'INR'): string {
  if (isNaN(amount) || amount === null || amount === undefined) {
    return '₹0';
  }

  const formatter = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: currency,
    maximumFractionDigits: 0,
  });

  return formatter.format(amount);
}

/**
 * Format date for friendly Indian wedding timeline display
 */
export function formatDate(dateString: string | Date, formatStr: 'short' | 'medium' | 'long' = 'medium'): string {
  if (!dateString) return '';
  const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
  
  if (isNaN(date.getTime())) return '';

  if (formatStr === 'short') {
    return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
  }

  if (formatStr === 'medium') {
    return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  }

  return date.toLocaleDateString('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}
