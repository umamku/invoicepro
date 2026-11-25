/**
 * Utility functions for Indonesian Rupiah formatting and thousands separators
 */

export const formatNumberWithDots = (value: number | string): string => {
  if (value === '' || value === undefined || value === null) return '';
  const num = typeof value === 'string' ? parseInt(value.replace(/\D/g, ''), 10) : Math.round(value);
  if (isNaN(num)) return '';
  return new Intl.NumberFormat('id-ID').format(num);
};

export const parseNumberFromDots = (value: string): number => {
  if (!value) return 0;
  const clean = value.replace(/\D/g, '');
  const parsed = parseInt(clean, 10);
  return isNaN(parsed) ? 0 : parsed;
};

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('id-ID', {
    style: 'decimal',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount || 0);
};
