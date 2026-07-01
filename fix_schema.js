const fs = require('fs');
let c = fs.readFileSync('prisma/schema.prisma', 'utf8');
c = c.replace(/model\s+(\w+)\s+\{/g, 'model $1 {\n  @@schema("public")');
c = c.replace(/enum\s+(\w+)\s+\{/g, 'enum $1 {\n  @@schema("public")');
fs.writeFileSync('prisma/schema.prisma', c);
