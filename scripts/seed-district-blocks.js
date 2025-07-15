// Usage: node scripts/seed-district-blocks.js
const { PrismaClient } = require("@prisma/client");
const fs = require("fs");
const path = require("path");

const prisma = new PrismaClient();
const DATA_PATH = path.join(__dirname, "../utils/village-location.json");

async function main() {
  const data = JSON.parse(fs.readFileSync(DATA_PATH, "utf8"));
  for (const district of data) {
    const createdDistrict = await prisma.district.upsert({
      where: { name_state: { name: district.district, state: "Tamil Nadu" } },
      update: {},
      create: {
        name: district.district,
        state: "Tamil Nadu",
      },
    });
    for (const block of district.blocks) {
      await prisma.block.upsert({
        where: {
          name_districtId: {
            name: block.block,
            districtId: createdDistrict.id,
          },
        },
        update: {},
        create: {
          name: block.block,
          districtId: createdDistrict.id,
        },
      });
    }
  }
  console.log("Seeding complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
