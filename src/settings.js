const homedir = require('homedir')()
const os = require('os')
const path = require('path')

const ifaces = os.networkInterfaces()
const ifname = Object.keys(ifaces).find(name => {
  const ipv4s = ifaces[name].filter(iface => iface.family == 'IPv4' && !iface.internal)
  return ipv4s.length > 0
})

const iface = ifaces[ifname].find(i => i.family == 'IPv4')
if (!iface) {
  throw new Error()
}

module.exports = {
  host: iface.address,
  port: 3000
}
