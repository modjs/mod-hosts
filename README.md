hosts
======

enable remapping of requests for one host to a different IP, overriding DNS

## Examples


### By CLI
```sh
$ mod hosts "127.0.0.1 localhost"
```

### By AutoTask
```js
// Modfile
module.exports = {
    plugins: {
        hosts: "mod-hosts"
    },
    tasks: {
        hosts: {
            group1:{
                hosts: "127.0.0.1 localhost"
            },
            group2:{
                hosts: ["127.0.0.1 www.qq.com", "127.0.0.1 example.com"]
            }
        }
    },

    targets: {
        dist: "hosts"
    }
};
```