const fs = require('fs')
const puppeteer = require('puppeteer')

async function run() {
    const results = []
    const browser = await puppeteer.launch({
        executablePath: '/usr/bin/google-chrome',
        headless: true,
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-accelerated-2d-canvas',
            '--no-first-run',
            '--no-zygote',
            '--single-process',
            '--disable-gpu',
        ],
    })
    page = await browser.newPage()
    await page.goto('http://localhost:1337')

    await Promise.all([
        page.addScriptTag({
            url: 'https://code.jquery.com/jquery-3.5.1.slim.min.js',
        }),
        page.addScriptTag({
            url: 'https://cdnjs.cloudflare.com/ajax/libs/chai/4.2.0/chai.min.js',
        }),
    ])

    try {
        await page.evaluate(async () => {
            const assert = window.chai.assert
            const square = document.getElementById('square')
            assert(square.clientWidth === 100 && square.clientHeight === 100)
        })
        results.push(true)
    } catch (error) {
        results.push(false)
    }

    try {
        await page.evaluate(async () => {
            const assert = window.chai.assert
            const circle = document.getElementById('circle')
            assert(circle.clientWidth === 100 && circle.clientHeight === 100 && (window.getComputedStyle(circle).borderRadius === '50%' || window.getComputedStyle(circle).borderRadius === '50px'))
        })
        results.push(true)
    } catch (error) {
        results.push(false)
    }

    try {
        await page.evaluate(async () => {
            const assert = window.chai.assert
            const circleStyles = getComputedStyle(document.querySelector('#circle')).backgroundColor
            const squareStyles = getComputedStyle(document.querySelector('#square')).backgroundColor

            assert(circleStyles !== 'rgba(0, 0, 0, 0)' && squareStyles !== 'rgba(0, 0, 0, 0)')
        })
        results.push(true)
    } catch (error) {
        results.push(false)
    }

    fs.writeFileSync(process.env.UNIT_TEST_OUTPUT_FILE, JSON.stringify(results))
    await browser.close().catch((err) => {})
    process.exit(0)
}
run()