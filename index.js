const csv = require('csv-streamify')
const fs = require('fs')

const parser = csv({ objectMode: true }, function (err, result) {
})

// emits each line as a buffer or as a string representing an array of fields
parser.on('data', function (line) {
  const repo_api_path = line[1];
  const repo_name = repo_api_path.replace("https://api.github.com/repos/", "")

  console.log(repo_name);
})

// projects.csv is from http://ghtorrent.org/
fs.createReadStream('../projects.csv').pipe(parser)
