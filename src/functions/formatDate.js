export const formatDateConsulting = (date) => {
  let newDate = new Date(date);
  let dateFormat = newDate
    .toLocaleDateString("pt-BR")
    .split("/")
    .reverse()
    .join("-");

  return dateFormat;
};

export const currentDateFull = () => {
  var date = new Date();
  const dateFull = date
    .toLocaleDateString("pt-BR")
    .split("/")
    .reverse()
    .join("-");
  let hours = date.getHours();
  let minutes = date.getMinutes();
  let seconds = date.getSeconds();

  if (hours < 10) hours = "0" + hours;

  if (minutes < 10) minutes = "0" + minutes;

  if (seconds < 10) seconds = "0" + seconds;

  return `${dateFull}T${hours}:${minutes}:${seconds}`;
};

export const currentDateMonth = () => {
  const newDate = new Date();
  let dateFull = newDate
    .toLocaleDateString("pt-BR")
    .split("/")
    .reverse()
    .join("-");
  return dateFull;
};
