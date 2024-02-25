#!/usr/bin/env node

import { fileURLToPath } from 'url';
import util, { promisify } from "util";
import cp from "child_process";
import path from "path";
import fs from "fs";
import ora from "ora";

import { createFolder, copyFile, copyFolder } from './utils.mjs';

const exec = promisify(cp.exec);

const projectName = process.argv[2];
const currentPath = process.cwd();
const projectPath = path.join(currentPath, projectName);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const configFilePath = path.join(__dirname, '../config');
const srcPath = path.join(__dirname, '../src');



const lintStagedConfig = {
  "lint-staged": {
      "src/**/*.{ts,tsx}": [
          "prettier --write",
          "eslint --fix"
      ],
      "App.tsx": [
          "prettier --write",
          "eslint --fix"
      ]
  }
};

const writePackageJson = util.promisify(fs.writeFile);



if (fs.existsSync(projectPath)) {
  console.log(`The file ${projectName} already exists in the current directory, please give it another name.`);
  process.exit(1);
} else {
  const reactNativeSpinner = ora("Initializing React Native project...").start();
  await exec(`npx react-native@latest init ${projectName}`);
  reactNativeSpinner.succeed();

  process.chdir(projectName);
  const packageJsonPath = `${projectPath}/package.json`;

  const eslintPrettierSpinner = ora("Setting up ESlint & Prettier...").start();
  await exec("yarn add --dev @typescript-eslint/parser typescript-eslint");

  // copying .eslintrc.js & .prettierrc.js
  await copyFile(`${configFilePath}/.eslintrc.js`, `${projectPath}/.eslintrc.js`);
  await copyFile(`${configFilePath}/.prettierrc.js`, `${projectPath}/.prettierrc.js`);
  eslintPrettierSpinner.succeed();

  const huskyLintSpinner = ora("Setting up Husky & lint-staged...").start();
  await exec("yarn add -D husky lint-staged");
  await exec("yarn add -D @commitlint/cli @commitlint/config-conventional");
  await exec("npx husky init");

  // copying commitlint.config.js & pre-commit template
  await copyFile(`${configFilePath}/commitlint.config.js`, `${projectPath}/commitlint.config.js`);
  await copyFile(`${configFilePath}/pre-commit`, `${projectPath}/.husky/pre-commit`);
  
  // add lint-staged to project package.json
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  packageJson['lint-staged'] = lintStagedConfig['lint-staged'];
  await writePackageJson(packageJsonPath, JSON.stringify(packageJson, null, 2));

  huskyLintSpinner.succeed();

  const reactNavigationSpinner = ora("Setting up React Navigation...").start();
  await exec("yarn add @react-navigation/native react-native-screens react-native-safe-area-context");
  reactNavigationSpinner.succeed();

  const stackNavigatorSpinner = ora("Setting up Stack Navigator...").start();
  await exec("yarn add @react-navigation/stack react-native-gesture-handler");
  stackNavigatorSpinner.succeed();

  const testingSpinner = ora("Setting up React Native Testing Library...").start();
  await exec("yarn add -D @testing-library/react-native @types/jest");
  testingSpinner.succeed();
  
  // add babel-plugin-module-resolver & copying template
  const templateSpinner = ora("Copying template...").start();
  await exec("yarn add -D babel-plugin-module-resolver");

  // copying files
  await copyFile(`${configFilePath}/tsconfig.json`, `${projectPath}/tsconfig.json`);
  await copyFile(`${configFilePath}/babel.config.js`, `${projectPath}/babel.config.js`);
  await copyFile(`${configFilePath}/App.tsx`, `${projectPath}/App.tsx`);
  
  // creating src folder
  await createFolder(`${projectPath}/src`);

  // copying src folder
  await copyFolder(srcPath, `${projectPath}/src`);

  templateSpinner.succeed();
    
}




