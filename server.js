var http = require('http'); //HTTP server and client functionality
var fs = require('fs'); //filesystem
var path = require('path'); //filesystem path related functionality
var mime = require('mime'); //mime type from file extension
var cache = {}; //storage for cached files

//create http server
var server = http.createServer(function(request, response) {
	var filePath = false;
	if (request.url == '/') {
		filePath = 'public/index.html';
	} else {
		filePath = 'public' + request.url;
	}
	var absPath = './' + filePath;
	serveStatic(response, cache, absPath);
});
//starting http server
server.listen(3000, function() {
	console.log("Server listening on port 3000.");
});
//requested file doesn't exist
function send404(response) {
	response.writeHead(404, {'Content-Type': 'text/plain'});
	response.write('Error 404: resource not found.');
	response.end();
}
//serve file
function sendFile(response, filePath, fileContents) {
	response.writeHead(
		200,
		{"content-type": mime.lookup(path.basename(filePath))}
		);
	response.end(fileContents);
}
//check cache, first time read from disk and add to cache
function serveStatic(response, cache, absPath) {
	if (cache[absPath]) {
		sendFile(response, absPath, cache[absPath]);
	} else {
		fs.exists(absPath, function(exists) {
			if (exists) {
				fs.readFile(absPath, function(err, data) {
					if (err) {
						send404(response);
					} else {
						cache[absPath] = data;
						sendFile(response, absPath, data);
					}
				});
			} else {
				send404(response);
			}
		});
	}
}