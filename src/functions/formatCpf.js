export const formatInputCPF = (value) => {
  if (!value.replace(/\D/g, "")) {
    return "";
  }

  const cleaned = value.replace(/\D/g, ""); // Remove caracteres não numéricos
  const match = cleaned.match(/(\d{3})(\d{3})(\d{3})(\d{2})/);

  if (match) {
    return `${match[1]}.${match[2]}.${match[3]}-${match[4]}`;
  }

  return value;
};

export const formatCleanCpf = (value) => {
  return value.replace(/[-.]/g, "");
};
