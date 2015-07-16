
	var yaml = require('js-yaml'),
		marked = require('marked');

module.exports = function(text) {

	var regexp = /^\-\-\-\n([\S\s]*?)\n\-\-\-\n([\S\s]*)$/;
	var matches = regexp.exec(text);

	var md, settings;

	if(!matches) {
		settings = {};
		md = text;
	} else {
		if(matches.length > 2) {
			settings = yaml.safeLoad(matches[1]);
			md = marked(matches[2]);
		} else {
			md = text;
			settings = {};
		}
	}

	settings.title = settings.title || "Default Title";

	return {
		settings: settings,
		text: md
	};
}
