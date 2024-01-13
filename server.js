var fs = require('fs');
var http = require('http');
var https = require('https');
var url = require('url');

var mindMap = null;
var mindMapHTML = fs.readFileSync('mindmap.html', 'utf8');

var mindMapHandler = (request, response) => {
    var parsedUrl = url.parse(request.url);
    response.setHeader('Access-Control-Allow-Origin', '*');
    response.setHeader('Access-Control-Allow-Methods', 'GET');
    response.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (parsedUrl.pathname === '/readyz') {
        if (mindMap) {
            response.writeHead(200);
            response.end('OK');
        } else {
            response.writeHead(404);
            response.end('Not Loaded');
        }
        return;
    }

    if (parsedUrl.pathname === '/api/mindmap' && mindMap) {
        response.writeHead(200, { 'Content-Type': 'application/json' });
        response.end(JSON.stringify(mindMap));
        return;
    }

    if (parsedUrl.pathname === '/mindmap_ui' && mindMap) {
        response.writeHead(200, { 'Content-Type': 'text/html' });
        response.end(mindMapHTML);
        return;
    }

    // Fallback for any other requests
    response.writeHead(404);
    response.end('Not Found');
}

var downloadMindMap = (url, file, callback) => {
    var stream = fs.createWriteStream(file);
    var req = https.get(url, function(res) {
        res.pipe(stream);
        stream.on('finish', function() {
            stream.close(callback);
            console.log('Mind map downloaded');
        });
    }).on('error', function(err) {
        fs.unlink(file);
        if (callback) callback(err.message);
    });
};

var loadMindMap = (file, callback) => {
    fs.readFile(file, (err, data) => {
        if (err) {
            console.log(err);
            callback(err);
            return;
        }
        mindMap = JSON.parse(data);
        console.log('Mind map loaded.');
        callback();
    })
};


downloadMindMap('https://raw.githubusercontent.com/notnotzero/dictionary-server/main/mind_map.json', 'mind_map.json', (err) => {
    if (err) {
        console.log(err);
        return;
    }
    loadMindMap('mind_map.json', (err) => {
        if (err) {
            console.log(err);
            return;
        }
        console.log('Ready to serve mind map');
    });
});

const server = http.createServer(mindMapHandler);

server.listen(8080, (err) => {
    if (err) {
        return console.log('Error starting server:', err);
    }

    console.log('Server is listening on 8080');
});
