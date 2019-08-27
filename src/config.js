import path from 'path';

// change this variable to change the folder of invoice template
const templateName = 'default';

const config = {
  templatePath: `${__dirname}/template/${templateName}/`,
  pdfPath: `${path.resolve(__dirname, '../')}/generatedPdfs/`,
  expressPort: 3666,
  // if this is set to true, it will generate all invoices into .pdf's
  generateAll: false,
};

config.handlebardsIndex = `${config.templatePath}invoice.handlebars`;
config.lessFolder = `${config.templatePath}less/`;

export default config;
