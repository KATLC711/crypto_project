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


app.use(express.static('public'));
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
    'holdings': ['VET', 'ETH', 'BNB'],
    'amount': [5.00, 10.00, 200.00],
    'cost': [0.185, 2331.50, 650.50],
    'history': [
        ['Buy', 'VET', 5.00, 0.185, '2020-01-01'],
        ['Buy', 'ETH', 10.00, 2331.50, '2020-03-01'],
        ['Buy', 'BNB', 200.00, 650.50, '2018-12-01']
    ]
}
var admin = {
    'username': 'admin',
    'password': '123456',
    'holdings': ['BTC', 'ETH', 'VET', 'ADA', 'XLM', 'MATIC', 'DOT', 'INJ', 'ENJ', 'LTC', 'AVAX', 'WIN', 'DOGE', 'USDT', 'ETC'],
    'amount': [13.466, 1.157, 5.474, 18.49, 7.889, 6.922, 9.854, 8.905, 3.522, 9.717, 24.679, 0.274, 1.933, 6.872, 6.1],
    'cost': [298.611399079162, 521.64, 509.353193277311, 650.057866414278, 630.431868424388, 670.14134065299, 202.73, 219.97, 765.21, 604.19, 532.259102880992, 146.98, 689.62, 510.367417054715, 146.41],
    'history': [
        ['Buy', 'ENJ', '3.522', '765.21', '2020-04-20'],
        ['Buy', 'AVAX', '0.653', '897.83', '2020-03-17'],
        ['Buy', 'USDT', '6.541', '503.43', '2020-03-14'],
        ['Buy', 'AVAX', '7.155', '714.61', '2020-02-9'],
        ['Buy', 'ADA', '2.038', '618.92', '2020-04-9'],
        ['Buy', 'XLM', '6.863', '630.03', '2020-03-5'],
        ['Buy', 'LTC', '9.717', '604.19', '2020-02-14'],
        ['Buy', 'ETH', '1.157', '521.64', '2020-02-2'],
        ['Buy', 'DOT', '9.854', '202.73', '2020-01-6'],
        ['Buy', 'VET', '4.978', '489.93', '2020-01-7'],
        ['Buy', 'DOGE', '1.933', '689.62', '2020-03-22'],
        ['Buy', 'BTC', '4.054', '913.97', '2020-01-10'],
        ['Buy', 'ETC', '6.1', '146.41', '2020-03-2'],
        ['Buy', 'INJ', '8.905', '219.97', '2020-01-30'],
        ['Buy', 'XLM', '1.026', '633.12', '2020-04-26'],
        ['Buy', 'VET', '0.496', '704.29', '2020-02-12'],
        ['Buy', 'BTC', '9.412', '33.56', '2020-02-11'],
        ['Buy', 'AVAX', '6.856', '686.27', '2020-04-12'],
        ['Buy', 'ADA', '2.732', '641.77', '2020-04-13'],
        ['Buy', 'USDT', '0.331', '647.46', '2020-01-25'],
        ['Buy', 'AVAX', '6.391', '67.14', '2020-01-29'],
        ['Buy', 'ADA', '9.675', '844.14', '2020-04-29'],
        ['Buy', 'AVAX', '3.624', '635.25', '2020-01-21'],
        ['Buy', 'WIN', '0.274', '146.98', '2020-01-10'],
        ['Buy', 'MATIC', '4.904', '785', '2020-03-25'],
        ['Buy', 'MATIC', '2.018', '391.02', '2020-04-6'],
        ['Buy', 'ADA', '4.045', '207.13', '2020-03-10']
    ]
}

cred_info.push(cheungke)
cred_info.push(admin)

var crypto_list = ['BTC', 'ETH', 'BNB', 'VET', 'LINK', 'ADA', 'XLM', 'MATIC', 'DOT', 'SOL', 'INJ', 'ENJ', 'LTC', 'TRX', 'CHZ', 'AVAX', 'ATOM', 'WIN', 'DOGE', 'USDT', 'ETC']


app.get('/', function (req, res) {
    req.session.loggedin = false
    res.render('login');
});


app.get('/register', function (req, res) {
    res.render('register');
});

app.get('/about-us', function (req, res) {

    if (req.session.loggedin) {
        res.render('aboutus');
    } else {
        res.redirect('/')
    }

});


app.post('/create_account', function (req, res) {
    var username = req.body.username;
    var password = req.body.password;
    var password2 = req.body.password2;
    if (check_userid(username) && password == password2) {
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

        res.render('login', context)
    } else if (password != password2) {
        var context = []
        context.status_msg = 'Password Entries are different.'
        res.render('register', context)
    } else {
        var context = []
        context.status_msg = 'User ID exists. Account creation failed.'
        res.render('register', context)
    }
});




app.post('/auth', function (req, res) {
    var username = req.body.username;
    var password = req.body.password;
    user_info = login_cred(req.body.username, req.body.password);
    if (user_info[0] == true) {
        var context = user_info
        req.session.loggedin = true
        res.redirect('/homepage')
    } else {
        var context = []
        context.status_msg = 'Wrong Credentials.'
        res.render('login', context)
    }
});




app.get('/homepage', function (req, res) {

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
                all_crypto.push({ 'crypto_name': crypto_name[i], 'crypto_price': parseFloat(crypto_price[i]).toFixed(5) })
            }

            for (i = 0; i < holdings.length; i++) {
                for (j = 0; j < all_crypto.length; j++) {
                    if (all_crypto[j].crypto_name == holdings[i]) {
                        cryptoholdings.push({
                            'crypto_name': holdings[i],
                            'crypto_amount': parseFloat(amount[i]).toFixed(2),
                            'crypto_cost': parseFloat(cost[i]).toFixed(5),
                            'crypto_price': parseFloat(all_crypto[j].crypto_price).toFixed(5),
                            'crypto_value': parseFloat(amount[i] * all_crypto[j].crypto_price).toFixed(5),
                            'crypto_profit': parseFloat(amount[i] * (all_crypto[j].crypto_price - cost[i])).toFixed(5)
                        })
                    }
                }
            }

            sort_crypto_by_name(all_crypto);
            sort_crypto_by_name(cryptoholdings);
            context.all_crypto = all_crypto
            context.cryptoholdings = cryptoholdings
            res.render('homepage', context);
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
            holding_amount_list.push({ 'crypto_name': user_info[1].holdings[i], 'crypto_amount': user_info[1].amount[i] })
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
        var crypto_date_purchased = req.body.date;



        if (check_crypto(user_info, crypto_name_purchased)[0]) {

            for (i = 0; i < cred_info.length; i++) {
                if (user_info[1].username == cred_info[i].username) {
                    for (j = 0; j < cred_info[i].holdings.length; j++) {
                        if (cred_info[i].holdings[j] == crypto_name_purchased) {

                            cred_info[i].cost[j] = (parseFloat(cred_info[i].cost[j]) * parseFloat(cred_info[i].amount[j]) + parseFloat(crypto_amount_purchased) * parseFloat(crypto_cost_purchased)) / (parseFloat(crypto_amount_purchased) + parseFloat(cred_info[i].amount[j]))
                            cred_info[i].amount[j] = parseFloat(cred_info[i].amount[j]) + parseFloat(crypto_amount_purchased)
                            cred_info[i].history.push(['Buy', crypto_name_purchased, crypto_amount_purchased, crypto_cost_purchased, crypto_date_purchased])
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
                    user_info[1].history.push(['Buy', crypto_name_purchased, crypto_amount_purchased, crypto_cost_purchased, crypto_date_purchased])
                }
            }
        }

        //console.log(user_info[1].history)

        var holding_amount_list = []

        for (i = 0; i < user_info[1].holdings.length; i++) {
            holding_amount_list.push({ 'crypto_name': user_info[1].holdings[i], 'crypto_amount': user_info[1].amount[i] })
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
        var crypto_date_sold = req.body.date;

        for (i = 0; i < user_info[1].holdings.length; i++) {
            if (user_info[1].holdings[i] == crypto_name_sold) {
                var crypto_on_hand = user_info[1].amount[i]
                break;
            }
        }

        if (crypto_amount_sold > crypto_on_hand) {
            context.status_msg_sell = "Exceeds volumne on hand"


            var holding_amount_list = []

            for (i = 0; i < user_info[1].holdings.length; i++) {
                holding_amount_list.push({ 'crypto_name': user_info[1].holdings[i], 'crypto_amount': user_info[1].amount[i] })
            }
            context.holding_amount_list = holding_amount_list
            res.render('buy-sell', context);
        } else {
            user_info[1].amount[i] = user_info[1].amount[i] - crypto_amount_sold

            var profit_sold = (crypto_amount_sold * (crypto_price_sold - user_info[1].cost[i])).toFixed(5);

            if (user_info[1].amount[i] == 0) {
                user_info[1].amount.splice(i, 1)
                user_info[1].holdings.splice(i, 1)
                user_info[1].cost.splice(i, 1)
                user_info[1].history.push(['Sell', crypto_name_sold, crypto_amount_sold, crypto_price_sold, crypto_date_sold])
            }


            var holding_amount_list = []

            for (i = 0; i < user_info[1].holdings.length; i++) {
                holding_amount_list.push({ 'crypto_name': user_info[1].holdings[i], 'crypto_amount': user_info[1].amount[i] })
            }

            if (profit_sold > 0) {
                context.status_msg_sell = "Sold Successful! You earned $" + profit_sold
            } else {
                context.status_msg_sell = "Sold Successful! You lost $" + Math.abs(profit_sold)
            }

            context.holding_amount_list = holding_amount_list
            res.render('buy-sell', context);
        }


    } else {
        res.redirect('/')
    }

});







app.get('/transaction-history', function (req, res) {

    if (req.session.loggedin) {
        var context = []
        var transaction_history = []
        //console.log(user_info[1].history)

        for (i = 0; i < user_info[1].history.length; i++) {
            transaction_history.push({ 'date': user_info[1].history[i][4], 'order-type': user_info[1].history[i][0], 'crypto_name': user_info[1].history[i][1], 'crypto_amount': user_info[1].history[i][2], 'crypto_price': user_info[1].history[i][3] })
        }
        sort_history(transaction_history);
        context.transaction_history = transaction_history
        //console.log(transaction_history)
        res.render('transaction-history', context)
    } else {
        res.redirect('/')
    }

});




function sort_crypto_by_name(crypto_object) {
    for (var i = 0; i < crypto_object.length; i++) {
        for (var j = 0; j < (crypto_object.length - i - 1); j++) {
            if (crypto_object[j].crypto_name > crypto_object[j + 1].crypto_name) {
                var temp = crypto_object[j]
                crypto_object[j] = crypto_object[j + 1]
                crypto_object[j + 1] = temp
            }
        }
    }
}




function sort_history(transaction_history) {
    for (var i = 0; i < transaction_history.length; i++) {
        for (var j = 0; j < (transaction_history.length - i - 1); j++) {
            if (transaction_history[j].date > transaction_history[j + 1].date) {
                var temp = transaction_history[j]
                transaction_history[j] = transaction_history[j + 1]
                transaction_history[j + 1] = temp
            }
        }
    }
}



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
