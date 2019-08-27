export default (Handlebars) => {
  if (!Handlebars) {
    throw Error('you need to pass Handlebars instance here, for registering all the helpers!');
  }
  Handlebars.registerHelper('prettyNumber', (number) => {
    const stringified = number.toString();
    const [, decimals] = stringified.split('.');
    if (!decimals) {
      return `${number}.00`;
    }
    return decimals.length === 1 ? `${number}0` : number;
  });

  Handlebars.registerHelper('prettyVat', number => `${number * 100}%`);
};
