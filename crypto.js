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
app.set('port', 6453);


var cred_info = []
var cheungke = {
    'username': 'cheungke',
    'password': 'abc1234',
    'holdings': ['VET', 'ETH'],
    'amount': [5, 10]
}
var nokkiu = {
    'username': 'nokkiu',
    'password': '123456',
    'holdings': ['BIT', 'ETH'],
    'amount': [100, 10]
}

cred_info.push(cheungke)
cred_info.push(nokkiu)



app.get('/', function (req, res) {
    res.render('home');
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
        var cryprolist = []



        //for (var i = 0; i < holdings.length; i++) {

        /*
                    request('https://api.cryptonator.com/api/full/' + holdings[i] + '-usd', handleGet);
         
                    function handleGet(err, response, body) {
                        if (!err && response.statusCode < 400) {
         
                            var request_result = JSON.parse(body);
                            //console.log(request_result)
                            quote = request_result.ticker.price
                            console.log(quote)
                        } else {
                            console.log(err);
                            console.log(response.statusCode);
                        }
                    }
         
        */

        /*
         
                    const axios = require('axios');
                    const fs = require('fs').promises;
         
         
                    axios.get('https://api.cryptonator.com/api/full/' + holdings[i] + '-usd')
                        .then((response) => {
                            console.log('Here you are');
                            crypto_response = response.data.ticker.price
                            console.log(crypto_response)
                        })
         
        */
        //cryprolist.push({ 'holdings': holdings[i], 'amount': amount[i], 'price': crypto_response })

        //}


        //context.cryprolist = cryprolist
        res.render('login', context);

    } else {
        res.redirect('/')
    }


});







function login_cred(username_from_post, password_from_post) {
    var i;
    for (i = 0; i < cred_info.length; i++) {
        if (cred_info[i].username == username_from_post && cred_info[i].password == password_from_post) {
            return [true, cred_info[i]];
        }
    }
    return [false, ""];
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
