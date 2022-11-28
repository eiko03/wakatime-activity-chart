const bodyparser= require('body-parser')
const express = require('express');
const app = express();
const puppeteer = require('puppeteer');
const PAGE_URL = 'https://wakatime.com/@';
let svg_content;

const svg_body_start = "<svg width=\"250\" height=\"250\" xmlns=\"http://www.w3.org/2000/svg\"> <rect x=\"0\" y=\"0\" width=\"250\" height=\"250\" fill=\"aquamarine\" /> <foreignobject x=\"0\" y=\"0\" width=\"250\" height=\"250\"> <body xmlns=\"http://www.w3.org/1999/xhtml\"> <div>"
const svg_body_end = "</div> </body> </foreignobject> </svg>"

function formatSVG(text) {
    const begin = "<div style=\"display: inline-block; max-width: 100%; overflow-x: auto;\">";

    const end = "</svg>";
    const firstChar = text.indexOf(begin) + begin.length;
    const lastChar = text.indexOf(end);
    let prefinal = text.substring(firstChar, lastChar)+end;
    prefinal = prefinal.slice(4);
    return "<svg xmlns=\"http://www.w3.org/2000/svg\" xmlns:xlink=\"http://www.w3.org/1999/xlink\" version=\"1.1\"" + prefinal;
}

async function scrap(id) {
    const browser = await puppeteer.launch({
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox'
        ],
    });

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
        svg_content = formatSVG(links);
    }
    else{
        svg_content = svg_body_start+ "Wakatime User not found" + svg_body_end;
    }


    await page.close();
    await browser.close();

    return svg_content;
}


app.use(express.urlencoded({ extended: false }));
app.use(bodyparser.json());



app.get('/:id', (req, res) =>{

    scrap(req.params.id).then(function (result) {
        res.setHeader("Content-Type", "image/svg+xml");
            res.status(200).send(result);
        })

})

app.get('/', (req, res) => {
    res.setHeader("Content-Type", "image/svg+xml");
    res.status(200).send(svg_body_start+ "Please give a wakatime user name" + svg_body_end);
});


app.listen(  process.env.PORT || 3030, function() {
    console.log( this.address().port )
});
