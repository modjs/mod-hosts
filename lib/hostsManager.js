// inspired by https://github.com/jed/localhose/blob/master/lib/localhose.js

var fs = require("fs");
var path = require("path");
var exec = require("child_process").exec;
var platform = process.platform;

var hostsPath = {
        "darwin": "/private/etc/hosts",
        "win32": path.join(process.env["WinDir"] || "C:/Windows", "System32", "drivers", "etc", "hosts"),
        "linux": "/etc/hosts"
    }[platform];

var lineBreak = {
    'win32': '\r\n'
}[platform] || '\n';


/*
# <hosts>
# <group id=dev>
 10.136.149.161 openapi.qzone.qq.com
 10.136.149.161 graph.qq.com
 10.12.23.156 pub.idqqimg.com
# </group>
# <group id=dev2>
 10.136.149.161 openapi.qzone.qq.com
 10.136.149.161 graph.qq.com
 10.12.23.156 pub.idqqimg.com
# </group>
# </hosts>
*/
function HostsManager() {
    this.hosts = [];
}
HostsManager.prototype = {

    header: "# <hosts>",
    description: "# The following have been added temporarily by ModJS Hosts Plugin\n" +
        "# For more information, see https://github.com/modjs/hosts",
    footer: "# </hosts>",

    // attempt to flush the DNS
    flushDNS: function () {
        var dnsHandlers = {
            "darwin": function () {
                exec("dscacheutil -flushcache");
            },
            "win32": function () {
                exec("ipconfig /flushdns");
            },
            "linux": function () {
                // TODO: check if nscd is installed
                exec("/etc/rc.d/init.d/nscd restart");
            }
        };

        if (typeof dnsHandlers[platform]) {
            dnsHandlers[platform]();
        }
        else {
            throw "No DNS flush available for this platform.";
        }
    },

    getHostsContent: function () {
        try {
            var hosts = fs.readFileSync(hostsPath, "utf8");
            return hosts;
        }
        catch (e) {
            throw hostsPath + " does not exist or cannot be read."
        }
    },

    // Returns and array of domains
    list: function () {
        var end,
            hosts = [],
            hostReg = /^\s*([^\s]+)\s+([^#\s]+)/,
            commentedHostReg = /^\s*#\s*([^\s]+)\s+([^#\s]+)/,
            groupStartReg = /^\s*#\s*<group\s+id=['"]?([\w,\d]+)['"]?>/,
            groupEndReg = /^\s*#\s*<\/group\s*>/,
            commentReg = /^\s*#.*/,
            lines = this.getHostsContent().split(lineBreak),
            start = lines.indexOf(this.header);

        if (start !== -1) {
            end = lines.indexOf(this.footer);
            lines = lines.splice(start, 1 + end - start);

            // filter comments
            var currentGroupId;
            lines.forEach(function (line) {
                var m;
                if(m = line.match(groupStartReg)){

                    currentGroupId = m[1]
                }else if(line.match(groupEndReg)){

                    currentGroupId = null;
                }else if(m = line.match(commentedHostReg)){

                    hosts.push({
                        ip: m[1],
                        hostname: m[2],
                        status: 0, // off
                        group: currentGroupId
                    });
                }else if(m = line.match(hostReg)){
                    hosts.push({
                        ip: m[1],
                        hostname: m[2],
                        status: 1, // on
                        group: currentGroupId
                    });
                }

            });

        }

        return this.hosts = hosts;
    },

    switch: function(){
        // TODO

    },

    set: function (ip, hostname, groupId) {
        this.hosts.push({
            ip: ip,
            hostname: hostname,
            status: 1,
            group: groupId
        });
    },

    unset: function () {
        // TODO
    },


    // add additional passed domains without deleting existing ones
    add: function () {
        // TODO

    },

    /**
     * @private
     * @returns {*}
     */
    save: function () {
        var hosts, start, end;

        hosts = this.getHostsContent().split(lineBreak);
        start = hosts.indexOf(this.header);

        if (start !== -1) {
            end = hosts.indexOf(this.footer) || hosts.length
            hosts.splice(start, 1 + end - start)
        }

        hosts.push(
            this.header, this.description, this.toString(), this.footer
        );

        try {
            fs.writeFileSync(hostsPath, hosts.join(lineBreak))
        }catch (e) {
            throw hostsPath + " is not writeable, requires superuser access\n" + e
        }

        this.flushDNS();

        return this
    },




    toString: function () {
        var that= this, hosts = '';
        this.hosts.forEach(function(host, index){
            // TODO group set
            var arr = [host.ip, host.hostname];
            if(!host.status) arr.unshift("#");
            hosts += ( arr.join(' ') + (index === that.hosts.length-1 ? '' :lineBreak) );
        });
        return hosts;
    }

}

module.exports = new HostsManager;
