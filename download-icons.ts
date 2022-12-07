import axios from 'axios'
import * as fs from 'fs'
import avaxPools from './src/utils/pools/avax.json'
import bscPools from './src/utils/pools/bsc.json'
import ethPools from './src/utils/pools/eth.json'
import fantomPools from './src/utils/pools/fantom.json'
import hecoPools from './src/utils/pools/heco.json'
import polygonPools from './src/utils/pools/polygon.json'

const allPools = [
    ...avaxPools,
    ...bscPools,
    ...ethPools,
    ...fantomPools,
    ...hecoPools,
    ...polygonPools,
]

const CONTENT_TYPE_EXTENSIONS = {
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/webp': 'webp',
}

;(async () => {
    if (!fs.existsSync('tmp')) {
        fs.mkdirSync('tmp')
    }
    if (!fs.existsSync('tmp/downloaded-icons')) {
        fs.mkdirSync('tmp/downloaded-icons')
    }

    const poolIcons = {}
    for (let pool of allPools) {
        if (pool.icon1) {
            poolIcons[pool.icon1] = true
        }
        if (pool.icon2) {
            poolIcons[pool.icon2] = true
        }
    }

    const foundIcons = {}

    const coingeckoTokenList = (await axios.get('https://tokens.coingecko.com/uniswap/all.json')).data
    const entriesBySymbol = {}
    for (let entry of coingeckoTokenList.tokens) {
        const symbol = entry.symbol.toLowerCase()
        if (!entriesBySymbol[symbol]) {
            entriesBySymbol[symbol] = []
        }
        entriesBySymbol[symbol].push(entry)
    }

    for (let icon in poolIcons) {
        if (entriesBySymbol[icon]) {
            if (entriesBySymbol[icon].length > 1) {
                console.log('WARNING: More than 1 variant for', icon, '--', entriesBySymbol[icon].map((e) => e.name).join(', '))
            }
            foundIcons[icon] = entriesBySymbol[icon][0].logoURI
        }
    }

    let missingIconsOutput = ''
    for (let icon in poolIcons) {
        if (!foundIcons[icon]) {
            console.log('No entries for', icon)
            missingIconsOutput += icon + '\n'
        }
    }
    fs.writeFileSync('tmp/missing-icons.txt', missingIconsOutput)

    console.log(Object.keys(foundIcons).length, 'icons to download')
    let outputScript = 'export const DOWNLOADED_ICONS = {\n'
    for (let icon in foundIcons) {
        console.log('Downloading', icon)
        const response = await axios({
            method: 'get',
            url: foundIcons[icon].replace('/thumb/', '/small/'), // Fetch not 25x25 but 50x50 images.
            responseType: 'stream'
        })
        const contentType = response.headers['content-type']
        const ext = CONTENT_TYPE_EXTENSIONS[contentType]
        if (!ext) {
            console.log('Unexpected content type:', contentType, 'for', icon)
            continue
        }
        let targetName = `${icon}.${ext}`
        if (icon === 'con') {
            // A file name "con.*" is illegal on windows.
            targetName = `_${icon}.${ext}`
        }
        response.data.pipe(fs.createWriteStream(`tmp/downloaded-icons/${targetName}`))
        outputScript += `    '${icon}': require('../images/downloaded-icons/${targetName}'),\n`
    }
    outputScript += '}'
    fs.writeFileSync('tmp/downloaded-icons.ts', outputScript)
})()
