# CFEngine Build Website Repository

The website lists available modules from the index and gives you easy commands to copy.

The CFEngine Build System (cfbs) comes with **no warranty** and is **not supported**.
This is a work in progress, everything will change.
Use at your own risk!

## Deployment workflow

1. Create your own branch / fork based on master branch.
2. Make changes locally and preview with docker / hugo.
3. Submit a PR to `cfengine:master` - once reviewed and merged see results here: https://staging.build.cfengine.com/
4. Create a new PR from `cfengine:master` to `cfengine:production` - merge to deploy (after seeing it working on staging site).


## Dependencies

[Hugo](https://gohugo.io/).
[Lunr](https://lunrjs.com/).
[Node.js](https://nodejs.dev/).


## Build

```
export GITHUB_USERNAME_TOKEN='place githubName:token here'
npm install
npm install -g grunt-cli
grunt build
hugo
```

## Serve

```
cd public
python3 -m http.server

or

hugo serve
```

## Container

Using docker / podman to build and serve is fairly straight forward:

```
export GITHUB_USERNAME_TOKEN='place githubName:token here'
docker build --build-arg GITHUB_USERNAME_TOKEN --tag cfbs-website -f Dockerfile .
docker run -p 80:80 -p 81:81 --volume /path/to/volume:/home/proxy --name cfbs-website --rm cfbs-website
```

## CFEngine Build Repositories

* [build-index](https://github.com/cfengine/build-index) - Index of modules
* [build-website](https://github.com/cfengine/build-website) - Website
* [cfbs](https://github.com/cfengine/cfbs) - Command line client
* [modules](https://github.com/cfengine/modules) - Official modules provided by the CFEngine team
* [module-template](https://github.com/cfengine/build-example) - Template for creating new modules
