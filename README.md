# Invoice Generator

This is simple invoice generator, that let's you keep all your invoices as one, big `json` file, and generate `.pdf` from it when needed

## How to use it

* `config.js` keeps name of `template` path, so you can copy `default` template, and edit it to your needs. There is also a flag called `generateAll`, this gives you the possibility to either generate all invoices at once, or only the last one (default is `false`, which means only last invoice will be generated)
* `default` template is simply a skeleton from which you can create your own template
* `invoices.json` is most important file, since it keeps all the invoices to be generated.
* in an `item` in `items` in invoice has `sumNetto` `sumVat` and `sumBrutto` fields, they will not be calculated by the script, this is done for those situations, when for some reason you need to manually edit the values.

## How to generate invoices

* make proper entries in `invoices.json` and pick the template (or stay on `default`)
* launch `npm run generate`
* after finish, folder `generatedPdfs` will contain all generated invoices.

## Default template is prepared for Polish numbers

Since in Poland, standard invoices should have "amount in words" field, there is polish `amount to words generator` already implemented.

No other languages are supported at the moment (if someone wold like to add them - let me know)
