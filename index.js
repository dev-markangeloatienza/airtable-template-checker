// const converter = require("json-2-csv");
const converter = require("@json2csv/plainjs");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

const { API_KEY, BASE_ID, CLIENT_BASE_ID, API_ENDPOINT } = process.env;

const getTableHeaders = async (id, table) => {
  let api = `${API_ENDPOINT}/${id}/tables`;
  let options = {
    method: "GET",
    headers: {
      Authorization: `Bearer ${API_KEY}`,
    },
  };

  try {
    const fetchTable = await fetch(api, options);
    const response = await fetchTable.json();
    return response.tables;
  } catch (error) {
    console.error("Error fetching tables:", error);
  }
};

const saveCsv = async (csvData, title, isTable = false) => {
  const folderPath = isTable
    ? path.resolve("./missing_tables")
    : path.resolve("./missing_fields");
  const fileName = `${title}.csv`;
  const filePath = path.join(folderPath, fileName);
  console.log("Folder Path: ", folderPath);

  try {
    const parser = new converter.Parser();
    const csv = parser.parse(csvData);
    if (!fs.existsSync(folderPath)) {
      console.log("Folder does not exist, creating folder...");
      fs.mkdirSync(folderPath, { recursive: true });
    }
    fs.writeFile(filePath, csv, (err) => {
      if (err) {
        console.error("Error writing CSV to file:", err);
      } else {
        console.log(`CSV file saved to ${filePath}`);
      }
    });
  } catch (err) {
    console.error(err);
  }
};

const run = async () => {
  const baseTables = await getTableHeaders(BASE_ID);
  const clientBaseTables = await getTableHeaders(CLIENT_BASE_ID);

  const sameTables = baseTables.filter((base) =>
    clientBaseTables.some((client) => client["name"] === base["name"])
  );

  const missingTables = baseTables.filter(
    (base) =>
      !clientBaseTables.some((client) => client["name"] === base["name"])
  );

  missingTables.forEach((missingTable) => {
    let currentTable = missingTable["name"];
    let fields = missingTable["fields"];
    let csvData = fields.map((field) => {
      return {
        name: field["name"],
        type: field["type"],
      };
    });
    saveCsv(csvData, currentTable, true);
  });

  sameTables.forEach((sameTable) => {
    clientBaseTables.forEach((clientTable) => {
      if (clientTable["name"] === sameTable["name"]) {
        let currentTable = sameTable["name"];
        let baseFields = sameTable["fields"];
        let clientFields = clientTable["fields"];
        let fields = baseFields.filter(
          (base) =>
            !clientFields.some((client) => client["name"] === base["name"])
        );
        console.log("Fields: ", fields);
        if (fields && fields.length > 0) {
          let csvData = fields.map((field) => {
            return {
              name: field["name"],
              type: field["type"],
              options: field["options"],
            };
          });
          saveCsv(csvData, currentTable);
        }
      }
    });
  });
};

run();
