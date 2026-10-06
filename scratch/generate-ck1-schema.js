const fs = require('fs');

const inputPath = process.argv[2];
if (!inputPath) throw new Error('Usage: node generate-ck1-schema.js <ck1-schema.sql>');
const sql = fs.readFileSync(inputPath, 'utf8');

const clusterDomains = {
  1: 'Customer Identity',
  2: 'CRM & Leads',
  3: 'Customer Service',
  4: 'Marketing',
  5: 'Projects & Property',
  6: 'Sales & Contracts',
  7: 'Property Operations',
  8: 'Finance & Accounting',
  9: 'Cross-domain Reference',
  10: 'Security & Governance'
};

const tableComments = new Map(
  [...sql.matchAll(/COMMENT ON TABLE\s+((?:\w+\.)?\w+)\s+IS\s+'((?:''|[^'])*)';/g)]
    .map(match => [match[1], match[2].replace(/''/g, "'")])
);

const tables = [...sql.matchAll(/CREATE TABLE\s+((?:\w+\.)?\w+)\s*\(([^]*?)\n\);/g)].map(match => {
  const qualifiedName = match[1];
  const [schema, name] = qualifiedName.includes('.') ? qualifiedName.split('.') : ['public', qualifiedName];
  const comment = tableComments.get(qualifiedName) || '';
  const clusterMatch = comment.match(/Cụm\s+(\d+)/i);
  const cluster = clusterMatch ? Number(clusterMatch[1]) : null;
  const grainMatch = comment.match(/Grain:\s*([^.]*(?:\.(?!\s+[A-ZÀ-Ỹ]))?[^.]*)/i);
  const description = comment.replace(/^Cụm\s+\d+\s+—\s+[^—]+—\s*/i, '').replace(/\s*Grain:[^]*$/i, '').trim();
  const label = description.split(/[.—]/)[0].trim() || name.replace(/_/g, ' ');
  const columns = match[2].split(/\r?\n/).map(line => line.trim()).filter(Boolean).map(line => {
    const column = line.replace(/,$/, '').match(/^([a-zA-Z_][\w]*)\s+(.+?)(?=\s+(?:DEFAULT|NOT\s+NULL|GENERATED|COLLATE|CONSTRAINT|REFERENCES|CHECK|UNIQUE|PRIMARY\s+KEY)\b|$)/i);
    if (!column || /^(CONSTRAINT|PRIMARY|UNIQUE|CHECK|FOREIGN)$/i.test(column[1])) return null;
    const type = column[2].replace(/\s+(?:DEFAULT|NOT NULL|GENERATED|COLLATE)\b[^]*$/i, '').trim();
    return { name: column[1], type };
  }).filter(Boolean);
  return {
    schema,
    name,
    qualifiedName,
    label,
    domain: clusterDomains[cluster] || 'Unclassified',
    cluster,
    description: description || comment || 'CK1 schema table.',
    grain: grainMatch ? grainMatch[1].trim() : 'See CK1 data dictionary.',
    columns
  };
});

const payload = {
  version: 'CK1 v2.1',
  database: 'PostgreSQL 16',
  schemaDate: '2026-10-01',
  source: 'ck1_schema_full_v2.sql (DA-025)',
  tableCount: tables.length,
  tables
};

process.stdout.write(`window.CK1_SCHEMA = ${JSON.stringify(payload, null, 2)};\n`);
