const fs = require('fs')
const api_versions = JSON.parse(fs.readFileSync('./api_versions.json', 'utf-8'))
const guide_versions = JSON.parse(fs.readFileSync('./guide_versions.json', 'utf-8'))
const [node, file, url, text] = process.argv

let existingApiVersion = api_versions.find(v => v.url === url)
if (!existingApiVersion) {
    api_versions.unshift({ url, text })
} else {
    existingApiVersion = { url, text }
}
let existingGuideVersion = guide_versions.find(v => v.url === url)
if (!existingGuideVersion) {
    guide_versions.unshift({ url, text })
} else {
    existingGuideVersion = { url, text }
}

fs.writeFileSync('./api_versions.json', JSON.stringify(api_versions, null, 4), 'utf-8')
fs.writeFileSync('./guide_versions.json', JSON.stringify(guide_versions, null, 4), 'utf-8')