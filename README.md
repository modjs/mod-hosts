hosts
======

enable remapping of requests for one host to a different IP, overriding DNS

## Examples


### By CLI
```sh
$ mod hosts 
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
                hosts: "127.0.0.1 foo.com"
            },
            group2:{
                hosts: ["127.0.0.1 foo.com", "127.0.0.1 example.com"]
            }
        }
    },

    targets: {
        dist: "hosts"
    }
};
```