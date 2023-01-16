require('console-stamp')(console, 'yyyy-mm-dd HH:MM:ss');
require('dotenv').config();

const commander = require("commander");
const {Octokit} = require("octokit");

commander
    .version("1.0.0")
    .usage('[options]')
    .option('-t, --title <title>', 'Title of the branch')
    .parse(process.argv);

const program = commander.opts();

const octokit = new Octokit({
    auth: process.env.GITHUB_TOKEN,
});

const getBranches = async () => {
    const response = await octokit.request('GET /repos/{owner}/{repo}/branches', {
        owner: process.env.GITHUB_OWNER,
        repo: process.env.GITHUB_REPO,
    });
    return response.data;
}

const checkBranchName = (branchName, branches) => {
    return branches.find(branch => branch.name === branchName);
}

const getLatestCommitOnMaster = async (branches) => {
    const branch = branches.find(branch => branch.name === 'master');
    const response = await octokit.request('GET /repos/{owner}/{repo}/commits/{ref}', {
        owner: process.env.GITHUB_OWNER,
        repo: process.env.GITHUB_REPO,
        ref: branch.commit.sha,
    });
    return response.data;
}

async function launchScript() {
    const branchName = program.title;
    const branches = await getBranches();
    const branch = checkBranchName(branchName, branches);
    if (branch) {
        console.log("Branch already exists");
        return false;
    }
    const latestCommitOnMaster = await getLatestCommitOnMaster(branches);
    console.log("Creating branch : " + branchName);
    const response = await octokit.request('POST /repos/{owner}/{repo}/git/refs', {
        owner: process.env.GITHUB_OWNER,
        repo: process.env.GITHUB_REPO,
        ref: `refs/heads/${branchName}`,
        sha: latestCommitOnMaster.sha,
    });
    console.log("Response", response);
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


// const getVersion = async () => {
//     const response = await octokit.request('GET /repos/{owner}/{repo}/releases/latest', {
//         owner: process.env.GITHUB_OWNER,
//         repo: process.env.GITHUB_REPO
//     })
//     return response.data.tag_name;
// }
// const newVersion = (version, versionSent) => {
//
//     // if (compare(versionSent, version) === 1) {
//     //     return versionSent;
//     // }
//     // else {
//     //     version = inc(version, 'patch');
//     //     return version;
//     // }
// }
//
//
// async function launchScript() {
//     console.log("Launching script");
//     //let versionSent = options.version;
//     // get the version to the latest release
//     //let version = await getVersion();
//     // check if the version is the same as the one in the release else create a new version
//     //version = await newVersion(version, versionSent);
//     //console.log("version", version);
//     const release = await createRelease();
//     console.log(release);
//     console.log("Release created !!!");
// }