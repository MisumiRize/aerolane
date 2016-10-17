const AWS = require('aws-sdk')
const fs = require('fs')
const homedir = require('homedir')()
const path = require('path')

const dotfile = path.join(homedir, '.aerolane', 'config')
if (fs.existsSync(dotfile)) {
  const data = fs.readFileSync(dotfile, 'utf-8')
  const config = JSON.parse(data)
  AWS.config.update({region: config.region})
}
const sns = new AWS.SNS()

module.exports = sns