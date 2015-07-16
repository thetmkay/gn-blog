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

app.get('/', function(req,res) {
	dropbox.getFiles('final',(function(response,posts) {
        response.render('index', {posts:posts});
    }).bind(null,res));
});
