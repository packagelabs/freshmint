const inquirer = require("inquirer");
const chalk = require("chalk");
const generateProject = require("./generate-project");
const generateWebAssets = require("./generate-web");
const { isExists } = require("./helpers");

const questions = [
  {
    type: "input",
    name: "projectName",
    message: "Name your new project:",
    validate: async function (input) {
      if (!input) {
        return "Please enter a name for your project.";
      }

      const exists = await isExists(input);

      if (exists) {
        return "A project with that name already exists.";
      }
      return true;
    }
  },
  {
    type: "input",
    name: "contractName",
    message: "Name the NFT contract (eg. MyNFT): ",
    validate: async function (input) {
      if (!input) {
        return "Please enter a name for your contract.";
      }

      return true;
    }
  },
  {
    type: "confirm",
    name: "startCustomFields",
    message: "Would you like to define custom NFT fields?"
  }
]

const fieldTypeChoices = [
  "String",
  "Int",
  "Int8",
  "Int16",
  "Int32",
  "Int64",
  "UInt",
  "UInt8",
  "UInt16",
  "UInt32",
  "UInt64",
  "Fix64",
  "UFix64"
]

function customFieldQuestions(count) {
  return [
    {
      type: "input",
      name: "name",
      message: `Custom field ${count} name:`,
      validate: async function (input) {
        if (input !== input.toLowerCase()) {
          return "Fields must be lowercase."
        }

        return true;
      }
    },
    {
      type: "list",
      name: "type",
      message: `Custom field ${count} type:`,
      choices: fieldTypeChoices
    },
    {
      type: "confirm",
      name: "continue",
      message: "Would you like to define another custom field?"
    }
  ]
}

async function getCustomFields(shouldStart) {

  const customFields = []

  let shouldContinue = shouldStart

  while (shouldContinue) {
    const count = customFields.length + 1
    const customField = await inquirer.prompt(
      customFieldQuestions(count)
    )

    customFields.push({
      name: customField.name,
      type: customField.type
    })

    shouldContinue = customField.continue
  }
  
  return customFields
}

async function start(spinner) {
  const ui = new inquirer.ui.BottomBar();

  ui.log.write(chalk.greenBright("Initializing new project. 🍃\n"));
  
  const answers = await inquirer.prompt(questions);

  const customFields = await getCustomFields(answers.startCustomFields);

  spinner.start("Generating project files...");

  const formattedContractName = answers.contractName
    // Remove spaces from the contract name.
    .replace(/\s*/g, "")
    .trim()
    .split(" ")
    // Ensure title-case
    .map((word) => word[0].toUpperCase() + word.slice(1))
    .join(" ");

  await generateProject(
    answers.projectName,
    formattedContractName,
    customFields
  );

  await generateWebAssets(answers.projectName, formattedContractName);

  spinner.succeed(
    `✨ Project initialized in ${chalk.white(`./${answers.projectName}\n`)}`
  );

  ui.log.write(
    `Use: ${chalk.magentaBright(
      `cd ./${answers.projectName}`
    )} to view your new project's files.\n`
  );

  ui.log.write(
    `Open ${chalk.blueBright(
      `./${answers.projectName}/README.md`
    )} to learn how to use your new project!`
  );
}

module.exports = start
