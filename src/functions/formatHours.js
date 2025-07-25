export const formatInputHours = (num) => {
  // Remove caracteres não numéricos e os dois pontos
  const cleaned = num.replace(/[^\d:]/g, "");

  // Verifica se a string limpa não contém nenhum dígito
  if (!cleaned.replace(/\D/g, "")) {
    return "00:00:00";
  }

  // Conta quantos pontos foram encontrados
  const colonCount = (cleaned.match(/:/g) || []).length;

  // Se não houver dois pontos, retorna "00:00:00"
  if (colonCount !== 2) {
    return "00:00:00";
  }

  // Remove os dois pontos para processamento
  const withoutColons = cleaned.replace(/:/g, "");

  // Preenche com zeros à esquerda para garantir que a string tenha pelo menos 8 caracteres
  const paddedNum = withoutColons.padStart(8, "0");

  // Extrai partes da string
  const hours = paddedNum.slice(-6, -4); // Horas
  const minutes = paddedNum.slice(-4, -2); // Minutos
  const seconds = paddedNum.slice(-2); // Segundos

  // Formata a string no formato hh:mm:ss
  return `${hours}:${minutes}:${seconds}`;
};
