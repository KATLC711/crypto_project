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


for (i = 0; i < crypto_list.length; i++) {

    let request_name = crypto_list[i]


    promises.push(console.log(request_name))
}

Promise.all(promises).then(() => console.log(crypto_price));