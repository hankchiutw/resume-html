#!/usr/bin/env node
/* globals __dirname, process */

const pkg = require(__dirname + "/package.json");
const program = require("commander");
const chalk = require("chalk");
const path = require("path");
const fs = require("fs");
const jsonlint = require("jsonlint");

async function parseResume(filePath) {
  return new Promise((resolve, reject) => {
    fs.readFile(filePath, function(error, data) {
      if (error) {
        reject(error);
      }

      try {
        jsonlint.parse(String(data));
        var resumeJson = JSON.parse(data);
        resolve(resumeJson);
      } catch (e) {
        reject(e);
      }
    });
  });
}

program
  .usage("[fileName] [options]")
  .arguments("[fileName] [options]")
  .version(pkg.version)
  .option(
    "-t, --theme <theme name>",
    "Specify theme for export",
    "jsonresume-theme-flat"
  )
  .option(
    "-r, --resume <resume file path>",
    "Path to the resume json file",
    "resume.json"
  )
  .action(async fileName => {
    if (!fileName) {
      console.error('Empty fileName');
      program.help();
      process.exit(1);
    }

    const resumeJson = await parseResume(program.resume).catch(error => {
      console.error("parseResume error:", error);
      throw error;
    });

    const theme = require(program.theme);
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
