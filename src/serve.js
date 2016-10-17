const fsp = require('fs-promise')
const homedir = require('homedir')()
const app = require('koa')()
const jsonResponse = require('koa-json')()
const router = require('koa-router')()
const bodyParser = require('koa-bodyparser')()
const path = require('path')

const sns = require('./sns')

const devicesPath = path.join(homedir, '.aerolane', 'devices')

async function createPlatformEndpoint(params) {
  return new Promise((resolve, reject) => {
    sns.createPlatformEndpoint(params, (err, data) => {
      if (err) {
        reject(err)
      } else {
        resolve(data)
      }
    })
  })
}

function *requestSNSIfNotFound(application, token) {
  let json
  try {
    const data = yield fsp.readFile(devicesPath, 'utf-8')
    json = JSON.parse(data)
  } catch(e) {
    yield fsp.writeFile(devicesPath, '{"devices": []}')
    json = {devices: []}
  }

  const device = json.devices.find(d => d.token == token)
  if (!device) {
    const res = yield createPlatformEndpoint({
      PlatformApplicationArn: application.arn,
      Token: token
    })
    json.devices.push({token, endpointArn: res.EndpointArn, platform: application.platform})
    yield fsp.writeFile(devicesPath, JSON.stringify(json))
  }
}

router.post('/platforms/:platform/devices', function *() {
  const name = config.defaults[this.params.platform]
  if (!name) {
    this.status = 404
    this.body = {message: 'not found'}
    return
  }

  const application = config.applications[name]
  if (!application) {
    this.status = 404
    this.body = {message: 'not found'}
    return
  }

  yield requestSNSIfNotFound(application, this.request.body.token)

  this.body = {message: 'ok'}
})

router.post('/applications/:name/devices', function *() {
  const application = config.applications[this.params.name]
  if (!application) {
    this.status = 404
    this.body = {message: 'not found'}
    return
  }

  yield requestSNSIfNotFound(application, this.request.body.token)

  this.body = {message: 'ok'}
})

app
  .use(bodyParser)
  .use(jsonResponse)
  .use(router.routes())
  .use(router.allowedMethods())

module.exports = (port) => {
  app.listen(port || 3000)
}