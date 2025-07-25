export const formatCurrency = (value) => {
  // Remove caracteres não numéricos e formata como moeda
  try {
    let formattedValue;
    if (isNaN(value)) {
      const numericValue = value.replace(/\D/g, "");
      formattedValue = new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL",
      }).format(parseFloat(numericValue) / 100); // Divide por 100 para considerar centavos
    } else {
      formattedValue = new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL",
      }).format(parseFloat(value)); // Divide por 100 para considerar centavos
    }

    return formattedValue;
  } catch (err) {
    console.log(err);
    return "R$ 0,00";
  }
};
