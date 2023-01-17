require('console-stamp')(console, 'yyyy-mm-dd HH:MM:ss');
require('dotenv').config();

const {Octokit} = require("octokit");
const { Command } = require('commander');
const program = new Command();

program
    .usage('[options]')
    .option('-t, --title <title>', 'Title of the issue')
    .option('-d, --description <description>', 'Description of the issue')
    .option('-l, --label <label>', 'Label of the issue')
    .parse(process.argv);

const options = program.opts();

const octokit = new Octokit({
    auth: process.env.GITHUB_TOKEN,
});

const createIssue = async () => {
    console.log("Creating issue");
    const response = await octokit.request('POST /repos/{owner}/{repo}/issues', {
        owner: process.env.GITHUB_OWNER,
        repo: process.env.GITHUB_REPO,
        title:  options.title,
        body: options.description,
        labels: [options.label]

    })
    console.log("Response");
    return response.data;
}

async function launchScript() {
    const issue = await createIssue();
    console.log(issue);
    console.log("Branch created !!!");
}

launchScript()
    .then(_ => {
        console.log("Script ended");
        process.exit();
    })
    .catch(e => {
        console.log("Script failed: " + e);
        process.exit();
    });
