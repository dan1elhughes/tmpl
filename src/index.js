const arg = require("arg");
const yaml = require("js-yaml");
const nunjucks = require("nunjucks");
const path = require("path");
const { createReadStream, createWriteStream } = require("fs");

const cli = require("./cli.json");
const pkg = require("../package.json");
const { readStream, writeStream } = require("./stream-helpers");
const { readAsset } = require("./asset-helpers");
const { formatToNative } = require("./cli-helpers");

const argOptions = {};
const help = [
  `${pkg.name} ${pkg.version}: ${pkg.description}\n\n`,
  `Usage: ${pkg.name} --template <file>\n\n`,
];

for (const option of cli) {
  help.push(`${option.flag}`);
  if (option.alias) {
    help.push(`, ${option.alias}`);
    argOptions[option.alias] = option.flag;
  }

  help.push(` ${option.description} `);
  help.push(`[${option.format}] `);

  const format = formatToNative(option.format);
  argOptions[option.flag] = format;

  help.push(`\n`);
}

help.push(`\nCopyright Dan Hughes 2020`);

let args;
try {
  args = arg(argOptions);
} catch (e) {
  console.error(e);
  process.exit(1);
}

async function main() {
  if (args["--help"]) {
    console.log(help.join(""));
    process.exit(0);
  }

  if (!args["--template"]) {
    console.error("Missing required argument: --template [string]");
    process.exit(1);
  }
  const template = args["--template"];
  const templateStream = createReadStream(template);

  const dataArg = args["--data"];
  const dataStream = dataArg ? createReadStream(dataArg) : process.stdin;

  const outputArg = args["--output"];
  const outputStream = outputArg
    ? createWriteStream(outputArg)
    : process.stdout;

  try {
    // Read inputs.
    const data = await readStream(dataStream);
    const template = await readStream(templateStream);

    // Parse data into variables.
    const variables = yaml.safeLoad(data);

    // Execute variables into template.
    const output = nunjucks.renderString(template, variables);

    // Write output.
    await writeStream(output, outputStream);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}

main();
