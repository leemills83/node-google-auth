/**
 * Module dependencies.
 */

var express = require('express')
, http = require('http')
, path = require('path')
, googleapis = require('googleapis')
, OAuth2Client = googleapis.OAuth2Client
, config = require('./config.json');

var oauth2Client = new OAuth2Client(config.CLIENT_ID, config.CLIENT_SECRET, config.REDIRECT_URL),
    success = function(data) { console.log('success',data); },
    failure = function(data) { console.log('failure',data); };

var app = express();

// all environments
app.set('port', process.env.PORT || 58305);
app.set('views', __dirname + '/views');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
    app.use(express.errorHandler());
}

var grabToken = function (code, errorCallback, successCallback){
    oauth2Client.getToken(code, function(err, tokens){
        if (!!err){
            errorCallback(err);
        } else {
            console.log('tokens',tokens);
            oauth2Client.credentials = tokens;
            successCallback();
        }
    });
};

var gotToken = function () {
    //Do something with token here...
};

app.get('/', function(req,res){
    if (!oauth2Client.credentials){
        var perms = config.PERMISSIONS.join(" "),
            url = oauth2Client.generateAuthUrl({
            access_type: 'offline',
            scope: perms
        });
        res.redirect(url);
    } else {
        gotToken();
    }
    res.send('something happened');
    res.end();
 
});

app.get('/REDIRECT_URL', function(req, res){
    grabToken(req.query.code, failure, function(){ res.redirect('/'); });
});

http.createServer(app).listen(app.get('port'), function(){
    console.log('Express server listening on port ' + app.get('port'));
});