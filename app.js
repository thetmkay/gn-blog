var express = require('express'),
  cons = require('consolidate'),
  nunjucks = require('nunjucks'),
  request = require('request'),
  async = require('async'),
  crypto = require('crypto'),
  path = require('path');


var app = module.exports = express();

/**
 * Configuration
 */

var view_paths = [
  path.join(__dirname,'views'),
  path.join(__dirname, 'node_modules', 'gn_components', 'views'),
  path.join(__dirname, '..', 'gn_components', 'views')
];

var env = new nunjucks.Environment(new nunjucks.FileSystemLoader(view_paths));

env.addFilter('date', function(string) {
	var date = new Date(string);
	
	return date.getYear() + '-' + (date.getMonth()+1)+'-'+ date.getDate();
	
});

env.express(app);
/*
var passport = require('passport');
var DropboxOAuth2Strategy = require('passport-dropbox-oauth2').Strategy;


passport.use(new DropboxOAuth2Strategy({
    clientID:"1i5lfpof8lksm4q", 
    clientSecret: "gffgqjj900lc415",
    callbackURL: "http://localhost:3000/auth2/callback"
  },
  function(accessToken, refreshToken, profile, done) {
	console.log('accesstoken');
    console.log(accessToken);
	
	done();
  }));
var dbox = require('dbox');
var dapp = dbox.app({"app_key":"1i5lfpof8lksm4q","app_secret":"gffgqjj900lc415"});
var Dropbox = require('dropbox');
var dbClient = new Dropbox.Client({
    key: "1i5lfpof8lksm4q",
    secret: "gffgqjj900lc415"
});*/

var dropbox = require('./lib/dropbox');
var passport = require('passport'),
	BasicStrategy = require('passport-http').BasicStrategy;

// all environments

var serveStatic = require('./lib/static');
app.use(serveStatic(express.static(path.join(__dirname, 'public'))));
app.engine('html', cons.nunjucks);

app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'html');
// development only

/**
 * Routes
 */



passport.serializeUser(function(user, done) {
  done(null, user);
});
 
passport.deserializeUser(function(user, done) {
  done(null, user);
});

passport.use(new BasicStrategy(function(username,password,done){
	var shasum = crypto.createHash('sha512');
	shasum.update(password,'utf8');
	var shpw = shasum.digest('hex');
	if(username === process.env.DRAFT_UN && shpw === process.env.DRAFT_PW) {
		done(null,{'name':'george'});
	} else{
		done(null,false);
	}
}));
app.use(passport.initialize());
/*
var reqtoken, client;

var final_files = [];

function isAuthenticated(callback) {
	return function(req,res) {
		if(!reqtoken) {
			console.log('auth');
			res.redirect('/auth');
		}
		else if(!client) {
			console.log('auth callback');
			res.redirect('/auth/callback');
		} else {
			callback(req,res);
		}
	}
}*/

app.get('/', function(req,res) {
	dropbox.getFiles('final',(function(response,posts) {
        response.render('index', {posts:posts});
    }).bind(null,res));
});

app.get('/posts/:name', function(req,res) {
	var name = path.join('final',req.params.name) + '.md';
	dropbox.getFile(name, (function(response,post) {
		response.render('post', {post:post});
	}).bind(null,res));
});

app.get('/drafts/:name', passport.authenticate('basic',{session:false}), function(req,res) {
	var name = path.join('drafts',req.params.name) + '.md';
	dropbox.getFile(name, (function(response,post) {
		response.render('post', {post:post});
	}).bind(null,res));
});

app.get('/login', passport.authenticate('local',{session:false}),function(req,res){
	res.render('login');
});

/*
app.get('/auth', function(req,res){
	dapp.requesttoken(function(status, request_token){
	    res.redirect(request_token.authorize_url + '&oauth_callback=http://localhost:3000/auth/callback');		 reqtoken = request_token;
		console.log(request_token);
	})
});

app.get('/auth/callback', 
function(req, res) {
// Successful authentication, redirect home.
	dapp.accesstoken(reqtoken, function(status,accesstoken) {
		console.log(accesstoken);
		client = dapp.client(accesstoken);
		res.redirect('/');;
	}); 
	
});

/*
app.get('/auth2', passport.authenticate('dropbox-oauth2', function(req,res) {
	res.send({});
}));

app.get('/auth2/callback', passport.authenticate('dropbox-oauth2', function(req, res) {
	res.sendJSON({});
}));*/


