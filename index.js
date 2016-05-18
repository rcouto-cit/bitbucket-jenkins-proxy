var express = require('express');
var bodyParser = require('body-parser');
var config = require('./config');
var request = require('request');

var app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.get('/', function(req, res){
	res.type('text/plain');
	res.send('I\'m running...');
});

app.post('/proxy', function(req, res){
	if((req.query.token < 0)|| (req.query.token !== config.bitbucket.token)){
		res.statusCode = 500;
		return res.send('Error 500: Invalid token');
	}
	if((req.query.job < 0) || (config.jenkins.jobsWhiteList.indexOf(req.query.job) == -1)){
		res.statusCode = 501;
		return res.send('Error 501: Invalid job');
	}
	var payload = req.body;
	console.log(payload.pullrequest.source.branch.name);
	callJob(req.query.job, payload.pullrequest.source.branch.name, res);
});

app.listen(process.env.PORT || 3232);

var callJob = function(jobName, branchName, bitbucket_response){
	var headers = {
		'User-Agent': 'Super Agent/0.0.1',
		'Content-Type': 'application/x-www-form-urlencoded'
	}

	var options = {
		url: config.jenkins.url + '/job/' + jobName + '/buildWithParameters',
		method: 'POST',
		headers: headers,
		qs: {'BRANCH': branchName, 'token': config.jenkins.token}
	}

	request(options, function(error, response, body) {
		console.log(body);
		bitbucket_response.statusCode = response.statusCode;
		bitbucket_response.send(body);
	});
};



