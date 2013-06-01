// inspired by https://github.com/jed/localhose/blob/master/lib/localhose.js

var fs = require("fs")
    , path = require("path")
    , exec = require("child_process").exec
    , platform = process.platform
    , platformPaths = {
        "darwin": "/private/etc/hosts",
        "win32": path.join(process.env["WinDir"], "System32", "drivers", "etc", "hosts"),
        "linux": "/etc/hosts"
    };

if (!platformPaths.hasOwnProperty(platform)) throw "Sorry, only tested on OS X, Linux and Windows. Feel free to submit pull requests to support other systems.";


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
    hostsPath: platformPaths[platform],

    header: "# <hosts>",
    description: "# The following have been added temporarily by ModJS Hosts Plugin\n" +
        "# For more information, see https://github.com/modjs/hosts",
    groupStart : "# <group id=>",
    groupEnd : "# </group>",
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
        var hostsPath = this.hostsPath
            , hosts;

        try {
            hosts = fs.readFileSync(hostsPath, "utf8");
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
            lines = this.getHostsContent().split("\n"),
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

        hosts = this.getHostsContent().split("\n");
        start = hosts.indexOf(this.header);

        if (start !== -1) {
            end = hosts.indexOf(this.footer) || hosts.length
            hosts.splice(start, 1 + end - start)
        }

        hosts.push(
            this.header, this.description, this.toString(), this.footer
        );

        try {
            fs.writeFileSync(this.hostsPath, hosts.join("\n"))
        }catch (e) {
            throw this.hostsPath + " is not writeable.\n" + e
        }

        this.flushDNS();

        return this
    },


    toString: function () {
        var hosts = '';
        this.hosts.forEach(function(host){
            hosts += [host.status? '': '#', host.ip, host.hostname].join(' ');
        });
        return hosts;
    }

}

module.exports = new HostsManager;