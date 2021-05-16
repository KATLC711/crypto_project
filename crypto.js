var express = require('express');
var request = require('request');
var app = express();
var handlebars = require('express-handlebars').create({ defaultLayout: 'main' });
var bodyParser = require('body-parser');
var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
var async = require('asyncawait/async');
var await = require('asyncawait/await');
const axios = require('axios');
const fs = require('fs').promises;

var session = require('express-session');
app.use(session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true
}));

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.engine('handlebars', handlebars.engine);
app.set('view engine', 'handlebars');
app.set('port', 4232);


var cred_info = []
var cheungke = {
    'username': 'cheungke',
    'password': 'abc1234',
    'holdings': ['VET', 'ETH'],
    'amount': [5.00, 10.00],
    'cost': [0.185, 2331.50]
}
var nokkiu = {
    'username': 'nokkiu',
    'password': '123456',
    'holdings': ['BTC', 'ETH'],
    'amount': [100.00, 10.00],
    'cost': [36013.65, 1835.60]
}

cred_info.push(cheungke)
cred_info.push(nokkiu)

var crypto_list = ['BTC', 'ETH', 'BNB', 'VET', 'LINK', 'ADA', 'XLM']


app.get('/', function (req, res) {
    req.session.loggedin = false
    res.render('home');
});


app.get('/register', function (req, res) {
    res.render('register');
});


app.post('/create_acount', function (req, res) {
    var username = req.body.username;
    var password = req.body.password;
    if (check_userid(username)) {
        var new_user = new Object()
        new_user.username = username
        new_user.password = password
        new_user.holdings = []
        new_user.amount = []
        new_user.cost = []
        cred_info.push(new_user)
        console.log(cred_info)
        var context = []
        context.status_msg = 'Account Created.'

        res.render('home', context)
    } else {
        var context = []
        context.status_msg = 'User ID exists. Account creation failed.'
        res.render('home', context)
    }
});




app.post('/auth', function (req, res) {
    var username = req.body.username;
    var password = req.body.password;
    user_info = login_cred(req.body.username, req.body.password);
    if (user_info[0] == true) {
        var context = user_info
        req.session.loggedin = true
        res.redirect('/home')
    } else {
        res.render('relogin')
    }
});




app.get('/home', function (req, res) {

    if (req.session.loggedin) {

        console.log(user_info)
        var context = []
        var holdings = user_info[1].holdings
        var amount = user_info[1].amount
        var cost = user_info[1].cost
        var cryptoholdings = []
        var crypto_price = []
        var crypto_name = []
        var promises = []

        for (i = 0; i < crypto_list.length; i++) {
            promises.push(

                axios.get('https://api.cryptonator.com/api/full/' + crypto_list[i] + '-usd').then(response => {
                    // do something with response
                    crypto_price.push(response.data.ticker.price)
                    crypto_name.push(response.data.ticker.base)
                    //crypto_price.push(response.data.ticker.price);
                })
            )
        }

        Promise.all(promises).then(() => {

            var all_crypto = []

            for (i = 0; i < crypto_name.length; i++) {
                all_crypto.push({ 'crypto_name': crypto_name[i], 'crypto_price': crypto_price[i] })
            }

            for (i = 0; i < holdings.length; i++) {
                for (j = 0; j < all_crypto.length; j++) {
                    if (all_crypto[j].crypto_name == holdings[i]) {
                        cryptoholdings.push({ 'holdings': holdings[i], 'amount': amount[i], 'cost': cost[i], 'price': all_crypto[j].crypto_price, 'value': amount[i] * all_crypto[j].crypto_price, 'profit': amount[i] * (all_crypto[j].crypto_price - cost[i]) })
                    }
                }
            }

            context.all_crypto = all_crypto
            context.cryptoholdings = cryptoholdings
            res.render('login', context);
        }
        );

    } else {
        res.redirect('/')
    }

});



app.get('/buy-sell', function (req, res) {

    if (req.session.loggedin) {
        var context = []
        var holding_amount_list = []

        for (i = 0; i < user_info[1].holdings.length; i++) {
            holding_amount_list.push({ 'holding': user_info[1].holdings[i], 'amount': user_info[1].amount[i] })
        }

        context.holding_amount_list = holding_amount_list
        res.render('buy-sell', context);
    } else {
        res.redirect('/')
    }
});




app.post('/purchase-order', function (req, res) {

    if (req.session.loggedin) {
        var context = []

        var crypto_name_purchased = req.body.crypto_name;
        var crypto_amount_purchased = req.body.amount;
        var crypto_cost_purchased = req.body.cost;



        if (check_crypto(user_info, crypto_name_purchased)[0]) {

            for (i = 0; i < cred_info.length; i++) {
                if (user_info[1].username == cred_info[i].username) {
                    for (j = 0; j < cred_info[i].holdings.length; j++) {
                        if (cred_info[i].holdings[j] == crypto_name_purchased) {

                            cred_info[i].cost[j] = (parseFloat(cred_info[i].cost[j]) * parseFloat(cred_info[i].amount[j]) + parseFloat(crypto_amount_purchased) * parseFloat(crypto_cost_purchased)) / (parseFloat(crypto_amount_purchased) + parseFloat(cred_info[i].amount[j]))
                            cred_info[i].amount[j] = parseFloat(cred_info[i].amount[j]) + parseFloat(crypto_amount_purchased)
                        }

                    }
                }
            }

        } else {
            for (i = 0; i < cred_info.length; i++) {
                if (user_info[1].username == cred_info[i].username) {
                    user_info[1].holdings.push(crypto_name_purchased)
                    user_info[1].amount.push(parseFloat(crypto_amount_purchased))
                    user_info[1].cost.push(parseFloat(crypto_cost_purchased))
                }
            }
        }

        console.log(cred_info)

        var holding_amount_list = []

        for (i = 0; i < user_info[1].holdings.length; i++) {
            holding_amount_list.push({ 'holding': user_info[1].holdings[i], 'amount': user_info[1].amount[i] })
        }

        context.holding_amount_list = holding_amount_list
        context.status_msg_purchase = "Purchase in the record!"
        res.render('buy-sell', context);




    } else {
        res.redirect('/')
    }

});








app.post('/sell-order', function (req, res) {

    if (req.session.loggedin) {
        var context = []

        var crypto_name_sold = req.body.crypto_name;
        var crypto_amount_sold = req.body.amount;
        var crypto_price_sold = req.body.price;

        for (i = 0; i < user_info[1].holdings.length; i++) {
            if (user_info[1].holdings[i] == crypto_name_sold) {
                var crypto_on_hand = user_info[1].amount[i]
                break;
            }
        }

        if (crypto_amount_sold > crypto_on_hand) {
            context.status_msg_sell = "Exceeds volumne on hand"
            res.render('buy-sell', context);
        } else {
            user_info[1].amount[i] = user_info[1].amount[i] - crypto_amount_sold

            if (user_info[1].amount[i] == 0) {
                user_info[1].amount.splice(i, 1)
                user_info[1].holdings.splice(i, 1)
                user_info[1].cost.splice(i, 1)
            }

            var profit_sold = crypto_amount_sold * (crypto_price_sold - user_info[1].cost[i]).toFixed(5);
            var holding_amount_list = []

            for (i = 0; i < user_info[1].holdings.length; i++) {
                holding_amount_list.push({ 'holding': user_info[1].holdings[i], 'amount': user_info[1].amount[i] })
            }

            context.status_msg_sell = "Sold Successful! You earned $" + profit_sold
            context.holding_amount_list = holding_amount_list
            res.render('buy-sell', context);
        }


    } else {
        res.redirect('/')
    }

});























function check_crypto(user_info, crypto_name) {
    for (i = 0; i < user_info[1].holdings.length; i++) {
        if (user_info[1].holdings[i] == crypto_name) {
            return [true, i]
        }
    }
    return [false, -1]
}





function login_cred(username_from_post, password_from_post) {
    var i;
    for (i = 0; i < cred_info.length; i++) {
        if (cred_info[i].username == username_from_post && cred_info[i].password == password_from_post) {
            return [true, cred_info[i]];
        }
    }
    return [false, ""];
}


function check_userid(username_from_post) {
    var i;
    for (i = 0; i < cred_info.length; i++) {
        if (cred_info[i].username == username_from_post) {
            return false
        }
    }
    return true
}



app.use(function (req, res) {
    res.status(404);
    res.render('404');
});

app.use(function (err, req, res, next) {
    console.error(err.stack);
    res.type('plain/text');
    res.status(500);
    res.render('500');
});

app.listen(app.get('port'), function () {
    console.log('Express started on http://localhost:' + app.get('port') + '; press Ctrl-C to terminate.');
});
