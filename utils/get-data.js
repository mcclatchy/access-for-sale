const fs = require('fs-extra');
const Gootenberg = require('gootenberg');
const { getCredentials } = require('./get-credentials');

const file = './src/js/modules/data.json';

async function getDoc() {
  const goot = new Gootenberg();
  const c = await getCredentials();

  await goot.auth.jwt(c);

  let data;
  let id = process.argv[2];
  let type = process.argv[3];

  if (type == 'doc') {
    data = await goot.parse.archie(id);
  } else if (type == 'sheet') {
    data = await goot.parse.table(id);

    // Custom mapping to filter extra columns
    data.nodes = data.nodes.map(node => ({
      id: node.id,
      group: node.group,
      photo: node.photo,
      tooltip: node.tooltip
    }));

    data.links = data.links.map(link => ({
      source: link.source,
      target: link.target,
      relationship: link.relationship
    }));
  } else {
    throw new Error(`No file type provided`)
  }

  await fs.outputJson(file, data, {spaces: 2})

  console.log(`Downloaded ${type}: ${id}`);
}

getDoc().catch(console.error);