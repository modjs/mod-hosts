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

        }
    }
};
```