// a pool of puppeteer pages to evaluated
// newPuppets({ url: 'my-page.html' }).exec({ fn: async page => {
//     await page.evaluate('my_func', {a:123})
//     // await page.screenshot({path: 'example.png'})
//     await page.pdf({ path:'my-pdf.pdf', printBackground:true })
// }}).then(async me => {
//     await me.end()
//     process.exit(1)
// })

const genericPool = require('generic-pool')
const puppeteer = require('puppeteer')

function nodePuppets({
        launchOptions =  {},
        gotoUrl = 'https://example.com',
        gotoOptions = { waitUtil: 'networkidle2' },
        poolOptions = {}
    } = {}) {

    launchOptions = Object.assign({
        executablePath: process.env.CHROME_BIN,
        args: ['--no-sandbox', '--headless', '--disable-gpu']
    }, launchOptions)


    let factory = {
        _browser: null,

        create: async function() {
            let me = this
            me._browser = me._browser
                || await puppeteer.launch(launchOptions)

            let page = await me._browser.newPage()
            await page.goto(gotoUrl, gotoOptions)
            return page
        },

        destroy: async function(page) {
            return await page.close()
        }
    }

    poolOptions = Object.assign({
        max: 10,
        min: 2
    }, poolOptions)

    let pool = genericPool.createPool(factory, poolOptions)

    return Object.assign(pool, {

        exec: async function(fn) {
            let page = await this.acquire()
            let a = await fn(page)
            if (a!==false) {
                await this.release(page)
            }
            return this
        },

        end: async function() {
            await this.drain()
            await this.clear()
            if (this.size==0) {
                await this._factory._browser.close()
            }
            return this
        }

    })
}

if (typeof exports === 'object' && typeof module === 'object') {
    module.exports = nodePuppets
}
