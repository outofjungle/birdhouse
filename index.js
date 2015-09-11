var Promise = require('bluebird');
var request = Promise.promisifyAll(require('request'));
var YAML = require('yamljs');

var getSiteStats = function(site) {
  var url = 'https://graph.facebook.com/fql?q=SELECT%20url,' +
        '%20normalized_url,%20share_count,%20like_count,' +
        '%20comment_count,%20total_count,commentsbox_count,' +
        '%20comments_fbid,%20click_count%20FROM' +
        '%20link_stat%20WHERE%20url=%27' + site + '%27';

  return request.getAsync(url)
    .get(1)
    .then(function (body) {
        return JSON.parse(body);
    })
    .get('data')
    .get(0);
};

var siteStats = {};
var sites = [
  'facebook.com',
  'reddit.com',
  't.co'
];

var statsChain = sites.reduce(function(chain, site) {
    var pause = 1000;
    return chain.then(function() {
        return getSiteStats(site)
        .then(function (stats) {
            siteStats[site] = stats;
        }).
        then(function () {
            console.info( site + ' stats fetched. waiting for ' + pause/1000 + ' sec.');
        })
        .delay(pause);
    });
}, Promise.resolve());

statsChain
.then(function () {
    yaml = YAML.stringify(siteStats, 4);
    console.log(yaml);
})
.done();
