const homedir = require('homedir')()
const {writeFile} = require('fs')
const AWS = require('aws-sdk')
const mkdirp = require('mkdirp')
const path = require('path')
const readline = require('readline-sync')

const platforms = ['GCM', 'APNS', 'APNS_SANDBOX']
const configPath = path.join(homedir, '.aerolane', 'config')

function configureAWS() {
  const index = readline.keyInSelect(platforms, 'Which platform do you want to develop?')
  if (index == -1) {
    console.log('Aborted.')
    return
  }
  const arn = readline.question(`Input ARN for ${platforms[index]}.`)
  const name = readline.question('Input name for this AWS configuration.')
  return {name, platform: platforms[index], arn}
}

module.exports = () => {
  if (!AWS.config.credentials) {
    console.log('AWS credentials is not set. Configure AWS first.')
    return
  }

  mkdirp(path.join(homedir, '.aerolane', 'caches'), err => {
    if (err) {
      console.log(err)
      return
    }

    const region = readline.question('Input region.')
    const applications = {}
    const defaults = {}
    do {
      const application = configureAWS()
      if (application) {
        applications[application.name] = application
        if (readline.keyInYN(`Do you want to set ${application.name} as default application of ${application.platform}?`)) {
          defaults[application.platform] = application.name
        }
      }
    } while (!readline.keyInYN('Do you want to finish configuring AWS?'))
    const config = {region, applications, defaults}

    writeFile(configPath, JSON.stringify(config), err => {
      if (err) {
        console.log(err)
      } else {
        console.log(`Config data written in ${configPath}`)
      }
    })
  })
}