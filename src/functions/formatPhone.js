export const formatInputPhone = (value) => {
  if (!value.replace(/\D/g, "")) {
    return "";
  }

  const cleaned = value.replace(/\D/g, ""); // Remove caracteres não numéricos
  const match = cleaned.match(/(\d{2})(\d{5})(\d{4})/);

  if (match) {
    return `(${match[1]})${match[2]}-${match[3]}`;
  }

  return value;
};

export const formatCleanPhone = (value) => {
  return value.replace(/[()-]/g, "");
};
