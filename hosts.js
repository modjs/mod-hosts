var hostsManager = require('./lib/hostsManager');

exports.summary = 'Remapping of requests for one host to a different IP';

exports.usage = '<action> [options]';

exports.options = {
    action: {
        describe : 'the action',
        default: 'set'
    },

    hosts: {
        describe : 'the hosts'
    }
};


exports.run = function (options, callback) {

    var hosts = options.hosts;
    var group = options.group;

    var _ = exports._;
    if(_.isString(hosts)){
        hosts = [hosts]
    }

    if(!_.isArray(hosts)){
        exports.error(hosts, 'must be string or array');
    }

    hosts.forEach(function(host){
        var m= host.match(/^\s*([^\s]+)\s+([^#\s]+)/);
        hostsManager.set(m[1], m[2], group);
        exports.log(m[1], m[2]);
    });

    hostsManager.save();
    callback();
};
