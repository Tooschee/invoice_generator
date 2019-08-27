import 'babel-polyfill';
import puppeteer from 'puppeteer';
import Handlebars, { compile } from 'handlebars';
import fs from 'fs';
import less from 'less';
import express from 'express';
import config from './config';
import invoices from './invoices.json';
import { prepareInvoiceItems, prepareInvoiceSummary, errorReport } from './helpers';
import hbHelpers from './hbHelpers';

hbHelpers(Handlebars);

let lessCompiled;
let browser;

const renderInvoice = async (oneInvoice, template) => {
  const page = await browser.newPage();
  try {
    const invoiceItems = prepareInvoiceItems(oneInvoice);
    const invoice = {
      ...oneInvoice,
      items: invoiceItems,
      summary: prepareInvoiceSummary(invoiceItems),
    };
    const pageVariables = {
      css: lessCompiled.css,
      localServer: `http://localhost:${config.expressPort}/`,
      invoice,
    };

    // if you have diferrent delimiter than " / ", change this method
    const preparedFilename = oneInvoice.number.replace(' ', '').replace('/', '_');

    if (!fs.existsSync(config.pdfPath)) {
      fs.mkdirSync(config.pdfPath);
    }
    const pageSetup = {
      path: `${config.pdfPath}${preparedFilename}.pdf`,
      printBackground: true,
      format: 'A4',
    };

    await page.setContent(
      template(pageVariables),
      // necessary for googleFonts + images to load properly
      { waitUntil: 'networkidle2' },
    );
    await page.pdf(pageSetup);
    await browser.close();
  } catch (e) {
    errorReport(e);
  }
};

const init = async () => {
  browser = await puppeteer.launch();
  const templatePrecompiled = fs.readFileSync(config.handlebardsIndex, 'utf-8');
  const templateOptions = {
    noEscape: true,
    strict: true,
  };
  const template = compile(templatePrecompiled, templateOptions);

  const app = express();
  app.use(express.static(config.templatePath));
  app.listen(config.expressPort);

  try {
    const lessIndexPath = `${config.lessFolder}/index.less`;
    const lessIndex = fs.readFileSync(lessIndexPath, 'utf-8');
    const options = {
      paths: [config.lessFolder],
    };
    lessCompiled = await less.render(lessIndex, options);

    fs.writeFileSync(`${config.templatePath}styles.css`, lessCompiled.css);
  } catch (e) {
    errorReport(e);
  }

  if (config.generateAll) {
    for await (const invoice of invoices) {
      renderInvoice(invoice, template);
    }
  } else {
    await renderInvoice(invoices[0], template);
  }
};

// since this:
// https://github.com/tc39/proposal-top-level-await
// using simple .then.catch way:

init().then(() => {
  console.log(`\x1b[32m
  *************************************
           INVOICES GENERATED!
  *************************************`);
  process.exit();
}).catch(errorReport);
