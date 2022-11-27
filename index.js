const bodyparser= require('body-parser')
const express = require('express');
const app = express();
const puppeteer = require('puppeteer');
const PAGE_URL = 'https://wakatime.com/@';
let svg_content;


function betweenMarkers(text) {
    const begin = "<div class=\"title\">\n" +
        "          ACTIVITY LAST YEAR\n" +
        "        </div>";

    const end = "<hr>";
    const firstChar = text.indexOf(begin) + begin.length;
    const lastChar = text.indexOf(end);
    return begin.replace("ACTIVITY", "WAKATIME ACTIVITY")+text.substring(firstChar, lastChar);
}

async function run(id) {
    const browser = await puppeteer.launch({
        headless: true,
        executablePath: '/usr/bin/google-chrome',
        args: ['--disable-gpu','--disable-extensions']});

    const device_width = 1920;
    const device_height = 1080;



    const page = await browser.newPage();

    await page.setCacheEnabled(false);
    await page.setViewport({width: device_width, height: device_height})
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/61.0.3163.100 Safari/537.36');

    const response = await page.goto(PAGE_URL+id, {
        timeout: 60000,
        waitUntil: 'networkidle0'
    })


    if(response.status() === 200){
        const links = await page.content();
        svg_content = betweenMarkers(links);
    }
    else{
        svg_content = "<h1>Wakatime  User not found </h1>";
    }


    await page.close();
    await browser.close();

    return svg_content;
}


app.use(express.urlencoded({ extended: false }));
app.use(bodyparser.json());



app.get('/:id', (req, res) =>{

         run(req.params.id).then(function (result) {
            res.setHeader("Content-Type", "text/html")
            res.status(200).send(result);
        })

})

app.get('/', (req, res) => {
    res.setHeader("Content-Type", "text/html")
    res.status(502).send("<h1>Please give a wakatime user name</h1>");
});


app.listen(  process.env.PORT || 3030, function() {
    console.log( this.address().port )
});
