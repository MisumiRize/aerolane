const {spawn} = require('child_process')
const {render} = require('ejs')
const fs = require('fs')
const fsp = require('fs-promise')
const homedir = require('homedir')()
const path = require('path')

const settings = require('./settings')

const cwd = path.join(__dirname, '..', 'platforms', 'gradle')
const templateDist = path.join(cwd, 'lib', 'src', 'main', 'java', 'org', 'aerolane', 'lib', 'Constants.java')
const artifactDir = path.join(cwd, 'lib', 'build', 'outputs', 'aar')

async function build() {
  const template = await fsp.readFile(path.join(__dirname, '..', 'templates', 'Constants.java'), 'utf-8')
  const source = render(template, settings)
  await fsp.writeFile(templateDist, source)

  await new Promise((resolve, reject) => {
    const proc = spawn(path.join(cwd, 'gradlew'), ['build'], {cwd})
    proc.on('close', code => {
      if (code == 0) {
        resolve()
      } else {
        reject()
      }
    })
  });

  const copy = ['debug', 'release'].map(variant => {
    const aar = `lib-${variant}.aar`
    return new Promise((resolve, reject) => {
      const read = fs.createReadStream(path.join(artifactDir, aar))
      read.on('error', e => reject(e))
      const write = fs.createWriteStream(path.join(homedir, '.aerolane', 'caches', 'gradle', aar))
      write.on('error', e => reject(e))
      write.on('close', () => resolve())
      read.pipe(write)
    })
  })
  await Promise.all(copy)
}

module.exports = build