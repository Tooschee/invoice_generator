const errorReport = (error) => {
  console.error('Something went wrong: ', error);
};

const prepareInvoiceItems = invoice => invoice.items.map((item) => {
  const noDecimals = {
    typePrice: item.quantityTypePriceNetto * 100,
  };

  // this gives you the possibility to make edits in the .json, if something
  // shouldn't be calculated through here,
  if (!item.sumNetto && !item.sumVat && !item.sumBrutto) {
    const outcomes = {
      sumNetto: Math.ceil(item.quantity * noDecimals.typePrice) / 100,
      sumVat: Math.ceil(item.quantity * noDecimals.typePrice * invoice.VAT) / 100,
    };
    outcomes.sumBrutto = outcomes.sumNetto + outcomes.sumVat;

    return {
      ...item,
      ...outcomes,
    };
  }
  return item;
});

const amountToWords = (amount) => {
  if (typeof amount !== 'number') {
    throw Error('you need to provide a number');
  }
  const singles = [
    '',
    'jeden',
    'dwa',
    'trzy',
    'cztery',
    'pięć',
    'sześć',
    'siedem',
    'osiem',
    'dziewięć'];
  const multis = [
    '',
    'jedenaście',
    'dwanaście',
    'trzynaście',
    'czternaście',
    'piętnaście',
    'szesnaście',
    'siedemnaście',
    'osiemnaście',
    'dziewiętnaście'];
  const tenths = [
    '',
    'dziesięć',
    'dwadzieścia',
    'trzydzieści',
    'czterdzieści',
    'pięćdziesiąt',
    'sześćdziesiąt',
    'siedemdziesiąt',
    'osiemdziesiąt',
    'dziewięćdziesiąt'];
  const hundreds = [
    '',
    'sto',
    'dwieście',
    'trzysta',
    'czterysta',
    'pięćset',
    'sześćset',
    'siedemset',
    'osiemset',
    'dziewięćset'];
  const groups = [
    ['', '', ''],
    [
      'tysiąc',
      'tysiące',
      'tysięcy',
    ],
  ];

  let outcome = '';
  let amountCopy = amount;
  if (amountCopy === 0) { outcome = 'zero'; }

  let groupId = 0;
  while (amountCopy > 0) {
    const amounts = {
      hundreds: Math.floor((amountCopy % 1000) / 100),
      tenths: Math.floor((amountCopy % 100) / 10),
      multis: 0,
      singles: Math.floor(amountCopy % 10),
    };

    if (amounts.tenths === 1 && amounts.singles > 0) {
      amounts.multis = amounts.singles;
      amounts.tenths = 0;
      amounts.singles = 0;
    }

    let wordType = 2;
    const sumExceptsinglies = amounts.hundreds + amounts.tenths + amounts.multis;
    if (amounts.singles === 1 && sumExceptsinglies === 0) { wordType = 0; }
    if ([2, 3, 4].includes(amounts.singles)) { wordType = 1; }

    if (sumExceptsinglies + wordType > 0) {
      outcome = `${hundreds[amounts.hundreds]} ${tenths[amounts.tenths]} ${multis[amounts.multis]} ${singles[amounts.singles]} ${groups[groupId][wordType]} ${outcome}`;
    }
    groupId += 1;
    amountCopy = Math.floor(amountCopy / 1000);
  }
  return outcome;
};

const prepareInvoiceSummary = (items) => {
  let netto = 0;
  let vat = 0;
  let global = 0;

  for (const item of items) {
    netto += item.sumNetto;
    vat += item.sumVat;
    global += item.sumBrutto;
  }

  const [decimal, fraction] = global.toString().split('.');
  let globalWords = '';

  const toInts = {
    decimal: parseInt(decimal, 10),
    fraction: parseInt(fraction, 10),
  };

  const lastDigitDecimal = parseInt(decimal[decimal.length - 1], 10);
  const wordEnding = [0, 1, 5, 6, 7, 8, 9, 10];

  const currencyWord = wordEnding.includes(lastDigitDecimal) ? 'złotych' : 'złote';
  globalWords = `${amountToWords(toInts.decimal)} ${currencyWord}`;
  if (fraction) {
    const lastDigitFraction = parseInt(fraction[fraction.length - 1], 10);
    const fractionWord = wordEnding.includes(lastDigitFraction) ? 'groszy' : 'grosze';
    globalWords = `${globalWords} ${amountToWords(toInts.fraction)} ${fractionWord}`;
  }

  return {
    netto,
    vat,
    global,
    globalWords,
  };
};

export {
  prepareInvoiceItems,
  prepareInvoiceSummary,
  amountToWords,
  errorReport,
};
