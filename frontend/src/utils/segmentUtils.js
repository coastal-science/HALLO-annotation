export const queryFormater = (ids) => {
  const queryNumber = Math.trunc(ids.length / 1000);
  const formatedIdsArray = [];

  for (let i = 0; i < queryNumber; i++) {
    formatedIdsArray.push(ids.slice(i * 1000, (i + 1) * 1000));
  }
  if (ids[queryNumber * 1000]) formatedIdsArray.push(ids.slice(queryNumber * 1000));
  return formatedIdsArray;
};


