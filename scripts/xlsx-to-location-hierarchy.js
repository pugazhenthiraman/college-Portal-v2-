// Usage: node scripts/xlsx-to-location-hierarchy.js
import xlsx from "xlsx";
import fs from "fs";
import path from "path";

// Path to the Excel file
const XLSX_PATH = path.join(
  __dirname,
  "../public/collegePortalExcel/villageNames.xlsx"
);
// Output JSON path
const OUT_PATH = path.join(__dirname, "../utils/village-location.json");

// Read the workbook
const workbook = xlsx.readFile(XLSX_PATH);
const sheetName = workbook.SheetNames[0];
const sheet = workbook.Sheets[sheetName];
const rows = xlsx.utils.sheet_to_json(sheet, { defval: "" });

// Build hierarchy: District -> Block -> Village Panchayat
const result = [];

rows.forEach((row) => {
  const district = row["District Name"]?.trim();
  const block = row["Block Name"]?.trim();
  const village = row["Village Panchayat Name"]?.trim();
  if (!district || !block || !village) return;

  let districtObj = result.find((d) => d.district === district);
  if (!districtObj) {
    districtObj = { district, blocks: [] };
    result.push(districtObj);
  }

  let blockObj = districtObj.blocks.find((b) => b.block === block);
  if (!blockObj) {
    blockObj = { block, villages: [] };
    districtObj.blocks.push(blockObj);
  }

  if (!blockObj.villages.includes(village)) {
    blockObj.villages.push(village);
  }
});

fs.writeFileSync(OUT_PATH, JSON.stringify(result, null, 2));
console.log("Done! Output written to", OUT_PATH);
