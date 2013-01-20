(function Challengerz() {

  var http = require('http');
  var _ = require('underscore');
  var Challengerz = exports;
  Challengerz.slugifier = require('slugifier');
  var stack = [];
  var endpoints = {
    'development': { host: 'localhost', port: 3000 },
    'staging': { host: 'challengerz-staging.herokuapp.com', port: 80 },
    'production': { host: 'www.challengerz.net', port: 80 }
  };

  var doRequest = function doRequest(method, url, model, callback) {
    var postData = JSON.stringify(model);
    if(!Challengerz.apiKey) {
      throw new Error('apiKey not set');
    }
    url = url + '?apiKey=' + Challengerz.apiKey;

    var postOptions = {
      host: Challengerz.endpoint.host,
      port: Challengerz.endpoint.port,
      path: url,
      method: method,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    };

    var post_req = http.request(postOptions, function(res) {
      var result = "";
      res.setEncoding('utf8');
      res.on('data', function (chunk) {
        result += chunk;
      });
      res.on('end', function() {
        callback(JSON.parse(result));
      });
    });

    post_req.on('error', function(e) {
      console.log(e);
    });

    post_req.write(postData);
    post_req.end();
  };

  Challengerz.init = function init(apiKey, env) {
    Challengerz.apiKey = apiKey;
    Challengerz.env = env || 'staging'
    Challengerz.endpoint = endpoints[Challengerz.env];
    if( !Challengerz.endpoint ) {
      throw new Error('Unknown endpoint for <'+Challengerz.env+'>');
    }
  };

  Challengerz.queue = function queue(func) {
    stack.push(func);
  };

  Challengerz.processQueue = function processQueue() {
    var func = stack.shift();
    if(func) {
      func(Challengerz.processQueue);
    }
  };

  Challengerz.createEventSource = function createEventSource(eventSource, callback) {
    doRequest('POST', '/api/create-event-source', eventSource, callback);
  };

  Challengerz.createEvent = function createEvent(event, callback) {
    doRequest('POST', '/api/create-event', event, callback);
  };

})();
