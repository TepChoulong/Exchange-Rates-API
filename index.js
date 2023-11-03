const PORT = process.env.PORT || 8000;
const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');

const app = express();


const Exchanges = [
    {
        name: 'TheGlobalEconomy',
        address: 'https://www.theglobaleconomy.com/rankings/Dollar_exchange_rate/',
        base: 'https://www.theglobaleconomy.com'
    },
    {
        // name: 'ABA Bank',
        // address: 'https://www.ababank.com/en/forex-exchange/'
    }
]


const Articles = [];


Exchanges.forEach(exchange => {
    axios.get(exchange.address)
        .then((response) => {
            const html = response.data;
            const $ = cheerio.load(html);

            $('tbody tr', html).each(function (index, element) { // Won't work on arrow function
                const tds = $(element).find('td');
                const as = $(element).find('td').find('a');

                const title = $(tds[0]).text() + ' Exchange Rates';
                const country = $(as[0]).text();
                const USD_exchange_rates = $(tds[1]).text();
                const date = $(tds[2]).text();
                const url = "https://www.theglobaleconomy.com" + $(as[0]).attr('href');

                Articles.push({
                    source: exchange.name,
                    title,
                    country,
                    USD_exchange_rates,
                    date,
                    url
                })

            })
        })
        .catch((err) => {

            console.log("ERROR: " + err);
        });
})


app.get('/', (req, res) => {
    res.json('Welcome to My First API');
})

app.get('/exchange-rates', (req, res) => {

    res.json(Articles);

    // axios.get('https://www.theglobaleconomy.com/rankings/Dollar_exchange_rate/')
    //     .then((response) => {
    //         const html = response.data;
    //         const $ = cheerio.load(html);

            // $('tbody tr', html).each(function (index, element) { // Won't work on arrow function
            //     const tds = $(element).find('td');
            //     const as = $(element).find('td').find('a');

            //     const country = $(as[0]).text();
            //     const USD_exchange_rates = $(tds[1]).text();
            //     const date = $(tds[2]).text();
            //     const url = "https://www.theglobaleconomy.com" + $(as[0]).attr('href');

            //     Articles.push({
            //         country,
            //         USD_exchange_rates,
            //         date,
            //         url
            //     })

            // })

    //         res.json(Articles);
    //     })
    //     .catch((err) => console.log("ERROR: " + err))

})

app.get('/exchange-rates/:exchangeRatesId', (req, res) => {

    const exchangeId = req.params.exchangeRatesId;

    const exchangeAddress = Exchanges.filter(exchange => exchange.name == exchangeId)[0].address;
    const exchangeBase = Exchanges.filter(exchange => exchange.name == exchangeId)[0].base

    axios.get(exchangeAddress)
        .then(response => {
            const html = response.data;
            const $ = cheerio.load(html);
            const specificArticles = [];

            $('tbody tr', html).each(function (index, element) { // Won't work on arrow function
                const tds = $(element).find('td');
                const as = $(element).find('td').find('a');

                const title = $(tds[0]).text() + ' Exchange Rates';
                const country = $(as[0]).text();
                const USD_exchange_rates = $(tds[1]).text();
                const date = $(tds[2]).text();
                const url = "https://www.theglobaleconomy.com" + $(as[0]).attr('href');

                specificArticles.push({
                    title,
                    source: exchangeId,
                    USD_exchange_rates,
                    url: exchangeBase + url
                })

            })

            res.json(specificArticles);
        })
        .catch((err) => {

            console.log("ERROR: " + err);
        });
})

app.listen(PORT, () => console.log(`Server is running on localhost:${PORT}`))