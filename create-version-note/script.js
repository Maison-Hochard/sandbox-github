require('console-stamp')(console, 'yyyy-mm-dd HH:MM:ss');
require('dotenv').config();

const commander = require("commander");
const axios = require('axios');
const {Octokit} = require("octokit");

commander
    .version("1.0.0")
    .usage('[options]')
    .option('-v, --version <version>', '1.0.0')
    .option('-t, --title <title>', 'Title of the release')
    .parse(process.argv);

const program = commander.opts();

const octokit = new Octokit({
    auth: process.env.GITHUB_TOKEN,
});

const createRelease = async () => {
    const response = await octokit.request('POST /repos/{owner}/{repo}/releases', {
        owner: process.env.GITHUB_OWNER,
        repo: process.env.GITHUB_REPO,
        tag_name: program.version,
        target_commitish: 'master',
        name: program.title,
        body: 'Description of the release',
        draft: false,
        prerelease: false,
        generate_release_notes: false
    });
    return response.data;
}

async function launchScript() {
    const release = await createRelease();
    console.log(release);
    console.log("Release created !!!");
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
