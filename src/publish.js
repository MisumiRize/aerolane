const fsp = require('fs-promise')
const homedir = require('homedir')()
const path = require('path')

const sns = require('./sns')

async function publish(message) {
  const data = await fsp.readFile(path.join(homedir, '.aerolane', 'devices'), 'utf-8')
  const json = JSON.parse(data)
  json.devices.forEach(device => {
    sns.publish({
      Message: message,
      TargetArn: device.endpointArn
    }, (err, data) => {
      console.log(err)
      console.log(data)
    })
  })
}

module.exports = publish