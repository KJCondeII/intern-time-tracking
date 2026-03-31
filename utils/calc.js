export function calculateHours(amIn, amOut, pmIn, pmOut) {
  const toDate = (t) => new Date(`1970-01-01T${t}:00`);

  const am = (toDate(amOut) - toDate(amIn)) / 3600000;
  const pm = (toDate(pmOut) - toDate(pmIn)) / 3600000;

  return (am + pm).toFixed(2);
}