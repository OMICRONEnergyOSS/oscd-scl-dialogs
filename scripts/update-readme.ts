import { readFileSync, writeFileSync } from 'fs';

/*
 * This script generates the README.md file from a template. It is used to create a support table for the wizards.
 *
 * The DOMParser and fetch are mocked to allow importing the wizards without
 * errors in a Node.js environment. If this offends your eyes - squint & scroll.
 */

class DocumentStub {
  documentElement = { nodeName: 'root' };
}

class MockDOMParser {
  // eslint-disable-next-line class-methods-use-this
  parseFromString(_s: string, _type: string) {
    return new DocumentStub(); // return anything non-null
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
(globalThis as any).DOMParser = MockDOMParser;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(globalThis as any).fetch = async () => ({
  ok: true,
  status: 200,
  json: async () => ({}),
  text: async () => '{}',
});

const supported = '✅';
const notSupported = '❌';

async function generateSupportTable() {
  // Dynamically import the wizards to avoid issues with DOMParser and fetch in Node.js
  const { wizards, emptyWizard } = await import('../wizards/wizards.js');
  let table = '| Tag Name | Supports Create | Supports Edit |\n';
  table += '|-------------|----------------|----------------|\n';

  for (const [key, value] of Object.entries(wizards)) {
    const createSupport =
      value.create === emptyWizard ? notSupported : supported;
    const editSupport = value.edit === emptyWizard ? notSupported : supported;

    table += `| ${key} | ${createSupport} | ${editSupport} |\n`;
  }

  return table;
}

async function main() {
  const template = readFileSync('./scripts/README.template.md', 'utf-8');
  const statusTable = await generateSupportTable();

  const output = template.replace('<!-- STATUS_TABLE -->', statusTable);
  writeFileSync('./README.md', output);
  console.log('README.md generated from template.');
}

main().catch(console.error);
