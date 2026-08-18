export const formatCurrency = (amount: number, currency: string = "XOF"): string => {
  if (typeof amount !== "number" || isNaN(amount)) return `0 ${currency}`;
  const formatted = Math.round(amount).toLocaleString("fr-FR");
  if (currency === "XOF" || currency === "FCFA") {
    return `${formatted} FCFA`;
  }
  return `${formatted} ${currency}`;
};

export const formatDate = (dateInput: string | Date | number): string => {
  try {
    const d = new Date(dateInput);
    return d.toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return String(dateInput);
  }
};
