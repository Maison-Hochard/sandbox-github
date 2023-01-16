require('console-stamp')(console, 'yyyy-mm-dd HH:MM:ss');
require('dotenv').config();
const {compare, inc} = require("semver");
const {Octokit} = require("octokit");
const { Command } = require('commander');
const program = new Command();

console.log(process.env.GITHUB_TOKEN);
console.log(process.env.GITHUB_OWNER);
console.log(process.env.GITHUB_REPO);

program
    .usage('[options]')
    .option('-t, --title <title>', 'Title of the release')
    .option('-v, --version <version>', 'Version of the release')
    .option('-d, --draft <draft>', 'Draft of the release')
    .option('-p, --description <description>', 'Prerelease of the release')
    .parse(process.argv);



const octokit = new Octokit({
    auth: process.env.GITHUB_TOKEN,
});

const options = program.opts();
const createRelease = async (version) => {
    console.log("Creating release");
    const response = await octokit.request('POST /repos/{owner}/{repo}/releases', {
        owner: process.env.GITHUB_OWNER,
        repo: process.env.GITHUB_REPO,
        tag_name: version,
        target_commitish: 'master',
        name: options.title,
        body: options.description ?? '',
        draft: options.draft ? true : false,
        prerelease: false,
        generate_release_notes: false
    });
    console.log("Response", response);
    console.log(response.data);
    return response.data;
}

const getVersion = async () => {
    const response = await octokit.request('GET /repos/{owner}/{repo}/releases/latest', {
        owner: process.env.GITHUB_OWNER,
        repo: process.env.GITHUB_REPO
    })
    return response.data.tag_name;
}
const newVersion = (version, versionSent) => {

    if (compare(versionSent, version) === 1) {
        return versionSent;
    }
    else {
        version = inc(version, 'patch');
        return version;
    }
}


async function launchScript() {
    console.log("Launching script");
    let versionSent = options.version;
    // get the version to the latest release
    let version = await getVersion();
    // check if the version is the same as the one in the release else create a new version
    version = await newVersion(version, versionSent);
    const release = await createRelease(version);
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
