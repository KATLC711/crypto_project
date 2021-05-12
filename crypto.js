var express = require('express');

var app = express();
var handlebars = require('express-handlebars').create({ defaultLayout: 'main' });
var bodyParser = require('body-parser');

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
cred_info.push(cheungke)



app.get('/', function (req, res) {
    res.render('home');
});


app.post('/', function (req, res) {
    console.log(login_cred(req.body.username, req.body.password))
    user_info = login_cred(req.body.username, req.body.password)

    if (user_info[0] == true) {

        var holdings = user_info[1].holdings
        var amount = user_info[1].amount
        var cryprolist = []

        for (var i = 0; i < holdings.length; i++) {
            cryprolist.push({ 'holdings': holdings[i], 'amount': amount[i] })
        }

        var context = []
        context.cryprolist = cryprolist

        res.render('login', context);


    } else {
        var context = []
        context.greetings = 'Your login credentials are not correct. Please retry.'
        console.log(context.greetings)
        res.render('home', context);
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
