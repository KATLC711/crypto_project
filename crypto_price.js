var express = require('express');
var request = require('request');
var app = express();
var handlebars = require('express-handlebars').create({ defaultLayout: 'main' });
var bodyParser = require('body-parser');
const axios = require('axios');
const fs = require('fs').promises;
const { resolve } = require('path');



var crypto_list = ['BTC', 'ETH', 'BNB', 'VET', 'LINK', 'ADA', 'XLM']

var crypto_price = []
var promises = []
var all_crypto = []


for (let i = 0; i < crypto_list.length; i++) {

    promises.push(

        axios.get('https://api.cryptonator.com/api/full/' + crypto_list[i] + '-usd').then(response => {


            all_crypto.push(response.data.ticker.base)
            crypto_price.push(response.data.ticker.price)


        })
    )
}

Promise.all(promises).then(() => {



    console.log(all_crypto)
    console.log(crypto_price)



});