// node-puppets as a pdf engine
//
const nodePuppets = require('../node-puppets')

function PdfBuilder({ url, buildFunction }) {

    return {
        _puppets: nodePuppets({
            gotoUrl: url
        }),

        build: async function({path, data}) {
            await this._puppets.exec(async page => {
                await page.evaluate(buildFunction, data)
                await page.waitFor(100) // for dom to settle
                await page.pdf({ path })
            })
            return this
        },

        end: async function() {
            return await this._puppets.end()
        }
    }
}

const pdfBuilder = PdfBuilder({
    launchOptions: { args:undefined },
    url: 'file://' + process.cwd() + '/test.html',
    buildFunction: (x) => new Promise(done => done(buildReport(x)))
})

let tasks = [...Array(10).keys()]
    .map((i) => {
        return pdfBuilder.build({
            path:`test-${i}.pdf`,
            data: { n:Math.min(i+1,5), m:100 + i}
        })
    })
Promise.all(tasks)
    .then(() => {
        console.log('---done')
        pdfBuilder.end()
        process.exit(1)
    })
