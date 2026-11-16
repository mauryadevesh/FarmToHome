const INR_FORMATTER = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2
});

export const formatCurrency = (value = 0) => {
  const numericValue = Number(value);
  if (!Number.isFinite(numericValue)) {
    return INR_FORMATTER.format(0);
  }
  return INR_FORMATTER.format(numericValue);
};
