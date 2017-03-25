var through2Concurrent = require('through2-concurrent');
const Git = require("nodegit");

const csv = require('csv-streamify');
const fs = require('fs');

const parser = csv({ objectMode: true });

const file="clean_projects.csv";

const nodegitOptions = {
  fetchOpts: {
    callbacks: {
        certificateCheck: () => { return 1; },
        credentials: function(url, userName) {
          const cred = Git.Cred.sshKeyFromAgent(userName);
          return cred;
        }
    }
  }
};

let all = [];
fs.createReadStream(file)
.pipe(parser)
.pipe(through2Concurrent.obj(
  {maxConcurrency: 100},
  function (line, enc, done) {
    const self = this;
    const repo_api_path = line[1];
    const repo_name = repo_api_path.replace("https://api.github.com/repos/", "");
    const repo_git_address = "git@github.com:" + repo_name;
    const repo_download = Git.Clone(repo_git_address, "../repos/" + repo_name, nodegitOptions);
    repo_download.then(
      function(resolved) {
        console.log(resolved, repo_name);
        done();
      },
      function(rejected) {
        console.log(rejected, repo_name);
        done();
      }
    )
    self.push(repo_download)

}))
.on('data', function (data) {
  all.push(data)
  console.log("***IN DATA", data)
})
.on('end', function () {
  console.log(all)
})
