# node-puppets

browser techs (css, js, svg, etc) and resources are widely-available
and visually is easier to develop; to be a waste (mottainai) if not re-used.

node-puppets creates a [pool](https://github.com/coopernurse/node-pool) of [puppeteer](https://github.com/GoogleChrome/puppeteer) pages for a given url

## synopsis

`nodePuppets({ launchOptions, gotoUrl, gotoOptions, poolOptions })`

where:

- launchOptions is [puppeteer launch options](https://github.com/GoogleChrome/puppeteer/blob/v1.11.0/docs/api.md#puppeteerlaunchoptions)
    ```
    launchOptions = {
        executablePath: process.env.CHROME_BIN,
        args: ['--no-sandbox', '--headless', '--disable-gpu']
    }
    ```

- gotoUrl and gotoOptions are [puppeteer goto url options](https://github.com/GoogleChrome/puppeteer/blob/v1.11.0/docs/api.md#pagegotourl-options)
    ```
    gotoUrl = 'https://example.com',
    gotoOptions = { waitUtil: 'networkidle2' },
    ```
-  poolOptions is [generic pool options](https://github.com/coopernurse/node-pool)
    ```
    poolOptions = { min:2, max:10 }
    ```

`nodePuppets.exec(fn)`

acquires a new page from pool, calls fn(page); and if not returning a false, releases the page

`nodePuppets.end()`

drains and clears the pool; and close the browser



## notes

* to build docker image, and to run index.js in corresponding example-folder-name

    ```
    docker build -t puppets-dev -f puppets-dev.dockerfile .
    docker run --rm -it --name puppets-dev -v ${pwd}/example-folder-name:/work puppets-dev
    ```

* simple multiple screenshot and pdf

    ```
    // test.js
    // docker run --rm -it -v ${pwd}:/work puppets-dev node test.js

    const nodePuppets = require('./node-puppets')
    const pool = nodePuppets({ })

    const buildPage = (i) => {
        let t = 'Example ' + i
        document.body.querySelector('h1').innerHTML = t
        return t
    }

    Promise.all(
        [...Array(20).keys()]
        .map(i => pool.exec(async page => {
            let t = await page.evaluate(buildPage, i)
            console.log('--', t)
            await page.screenshot({ path: 'a' + i +'.png' })
            await page.pdf({ path: 'a' + i +'.pdf' })
        }))
    ).then(() => {
        pool.end()
        process.exit(1)
    })
    ```

* [example-pdf-builder](example-pdf-builder) - a poor-man pdf generator;

    it creates a pool of test.html pages,
    it evaluates buildReport() to build print-friendly page.
    css is used for page-breaks.
    it then uses [page.pdf](https://github.com/GoogleChrome/puppeteer/blob/v1.11.0/docs/api.md#pagepdfoptions)
    to generates pdf files.



