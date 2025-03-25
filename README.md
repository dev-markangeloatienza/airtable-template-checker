# Airtable template checker

This Airtable custom function is designed to compare the schema (templates) of two tables — one representing the updated template and the other representing the outdated template. The function identifies the fields that are present in the updated template but missing in the outdated template. It then generates a CSV file containing a list of these missing fields, making it easy to see which fields need to be added or updated in the outdated template.

## Get started

Install dependencies

```bash
npm install
```

## Inputs

Update the `.env` file using the `.env.local` as reference. Where `BASE_ID` serves as the updated template and `CLIENT_BASE_ID` for the outdated template.

## Run the script

To generate `CSVs` run the command: 

```bash

node index.js
```