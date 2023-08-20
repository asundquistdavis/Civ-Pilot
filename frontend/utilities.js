
export const capatalize = (str) => str[0].toUpperCase() + str.slice(1);
export const title = (str) => str.split(' ').map(capatalize).join(' ')
