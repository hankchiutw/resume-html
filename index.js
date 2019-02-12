#!/usr/bin/env node
/* globals __dirname, process */

require("dotenv").load({ silent: true });
var pkg = require(__dirname + "/package.json");
var program = require("commander");
var chalk = require("chalk");
var path = require("path");
var fs = require("fs");
var jsonlint = require("jsonlint");

async function getResume() {
  var jsonLocation = "./resume.json";
  process.argv.forEach(function(arg) {
    if (arg.indexOf("--resume") !== -1 || arg.indexOf("-r") !== -1) {
      jsonLocation = arg.replace("--resume=", "").replace("-r=", "");
    }
  });

  return new Promise((resolve, reject) => {
    fs.readFile(jsonLocation, function(resumeJsonDoesNotExist, data) {
      if (resumeJsonDoesNotExist) {
        if (["export", "publish", "test"].indexOf(process.argv[2]) !== -1) {
          // removed serve. test this later
          console.log("There is no resume.json file located in this directory");
          console.log("Type: `resume init` to initialize a new resume");
          return;
        }
        resolve("");
      } else {
        try {
          jsonlint.parse(String(data));
          var resumeJson = JSON.parse(data);
          resolve(resumeJson);
        } catch (error) {
          reject(error);
        }
      }
    });
  });
}

(async () => {
  const resumeJson = await getResume();

  program
    .usage("[command] [options]")
    .version(pkg.version)
    .option(
      "-t, --theme <theme name>",
      "Specify theme for export (default: jsonresume-theme-flat)",
      "jsonresume-theme-flat"
    )
    .option(
      "-r, --resume <resume filename>",
      "Used by `serve` (default: resume.json)",
      path.join(process.cwd(), "resume.json")
    );

  program
    .command("export [fileName]")
    .description("Export locally to .html")
    .action(function(fileName) {
      const theme = require(`./theme/${program.theme}`);
      const html = theme.render(resumeJson);
      fs.writeFile(fileName, html, () => {
        console.log(
          chalk.green(
            "\nDone! Find your new resume at:\n",
            path.resolve(process.cwd(), fileName)
          )
        );
      });
    });

  program.parse(process.argv);

  var validCommands = program.commands.map(function(cmd) {
    return cmd._name;
  });

  if (!program.args.length) {
    console.log("resume-cli:".cyan, "https://jsonresume.org", "\n");
    program.help();
  } else if (validCommands.indexOf(process.argv[2]) === -1) {
    console.log("Invalid argument:".red, process.argv[2]);
    console.log("resume-cli:".cyan, "https://jsonresume.org", "\n");
    program.help();
  }
})();
