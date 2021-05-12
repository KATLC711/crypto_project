var express = require('express');

var app = express();
var handlebars = require('express-handlebars').create({ defaultLayout: 'main' });
var session = require('express-session');
var bodyParser = require('body-parser');


app.use(bodyParser.urlencoded({ extended: false }));
app.use(session({ secret: 'cryptoisascam' }));

app.engine('handlebars', handlebars.engine);
app.set('view engine', 'handlebars');
app.set('port', 6453);






app.listen(app.get('port'), function () {
    console.log('Express started on http://localhost:' + app.get('port') + '; press Ctrl-C to terminate.');
});
