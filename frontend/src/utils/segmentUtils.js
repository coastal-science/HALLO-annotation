export const queryFormater = (ids) => {
    const queryNumber = Math.trunc(ids.length / 2000);
    const formatedIdsArray = [];

    for (let i = 0; i < queryNumber; i++) {
        formatedIdsArray.push(ids.slice(i * 2000, (i + 1) * 2000));
    }

    formatedIdsArray.push(ids.slice(queryNumber * 2000));
    return formatedIdsArray;
};


