hosts
======

enable remapping of requests for one host to a different IP, overriding DNS

## Usage

### By CLI
```sh
$ mod hosts "127.0.0.1 localhost"
```

### By Modfile
```js
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
            },
			group3:{
                hosts: "./path/to/my/hosts/file"
            }
        }
    },
    targets: {
        dist: "hosts"
    }
};
```