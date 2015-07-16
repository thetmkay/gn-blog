var path = require('path'),
	_ = require('underscore');

statics = ['.js','.css','.woff','.ttf','.eot','.svg','.png','.jpg'];

module.exports = function(middleware){
	return function(req,res,next) {
		var extname = path.extname(req.url);

		var file = _.find(statics, function(exts) {
			return exts === extname;
		});

		if(file !== undefined ) {

			var basename = path.basename(req.path);
			var reqpath;
			switch(extname){
				case '.js':
					reqpath = '/js/'+basename;
					break;
				case '.css':
					reqpath = '/css/' + basename;
					break;
				case '.woff':
				case '.ttf':
				case '.eot':
				case '.svg':
					reqpath = '/fonts/' + basename;
				default:
					reqpath = '/img/' + basename;
			}
			req.url = reqpath;
			middleware(req,res,next);
		} else {
			next();
		}
	
	};
}
