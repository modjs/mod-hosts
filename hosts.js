var fs = require('fs'),
    hostsManager = require('./lib/hostsManager'),
    platform = process.platform;

var lineBreak = {
  'win32': '\r\n',
  'linux': '\n',
  'darwin': '\r'
}[platform];


exports.summary = 'Remapping of requests for one host to a different IP';

exports.usage = '<hosts> [options]';

exports.options = {
    hosts: {
        describe : 'the hosts'
    },
    action: {
        describe : 'the action',
        default: 'set'
    }
};


exports.run = function (options, callback) {

    var hosts = options.hosts;
    var group = options.group;

    var _ = exports._;

    if(_.isString(hosts)){
        if (fs.existsSync(hosts)){ // to support file path 
          hosts = fs.readFileSync(hosts).toString().split(lineBreak).filter(function(hosts){return hosts !== ''}); // to filter null line
        }
        else {
          hosts = [hosts];
        }
    }

    if(!_.isArray(hosts)){
        exports.error('hosts option must be string or array');
    }

    hosts.forEach(function(host){
        var m= host.match(/^\s*([^\s]+)\s+([^#\s]+)/);
        hostsManager.set(m[1], m[2], group);
        exports.log(m[1], m[2]);
    });

    hostsManager.save();
    callback();
};
