var extractText = require('./extract'),
	_ = require('underscore'),
	path = require('path'),
	request = require('request'),
	async = require('async');

var authToken = process.env.DROPBOX_TOKEN; 
var req_options =	{
		'auth': {
			'bearer': authToken
	  	}
};

/*
exports.readAllFiles = function(dirname, client, callback) {
	client.readdir(dirname, {root: '/'}, function(status, reply) {
		
	});
}*/

function checkFilename(name) {
	return /[a-zA-Z0-9\-]*/.test(name)
}

var getFile = function getFile(filename, callback) {
	var url = 'https://api-content.dropbox.com/1/files/auto/'+filename;
	request(url,req_options,function(error,response,file){
		if(!error && response.statusCode === 200) {
			var metadata = JSON.parse(response.headers['x-dropbox-metadata']);
			var post = extractText(file.toString());
			post.metadata = metadata;
			post.url = path.basename(metadata.path, '.md');
			callback(post);
		} else{
			callback({});
		}
	});	
}

var getFiles = function(folder,callback) {
	var url = 'https://' + path.join('api.dropbox.com/1/search/auto' , folder);

	var options = req_options;

	options['qs'] = {
		query:'md',
		include_deleted:false
	};

	request(url, options, function(error,response,body){
		var posts = [];
		var body = JSON.parse(body);
		docs = _.filter(body, function(item) {
			return (path.basename(item['path']).indexOf('.') !== 0);
		});
		async.each(docs, function(item, done){
			var name = item['path'];
			getFile(name, function(post) {
				if(post.metadata !== undefined){
					posts.push(post);
				}
				done();
			});
		}, (function(err) {
			posts = _.sortBy(posts, function(post){
				return new Date(post.metadata.modified);
			}).reverse();
			callback(posts);
		}).bind(null,callback));
	});
}

exports.getFile = getFile;
exports.getFiles = getFiles;

