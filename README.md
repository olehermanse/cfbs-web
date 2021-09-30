# CFEngine Build System Website

The website lists available modules from the index and gives you easy commands to copy.

The CFEngine Build System (cfbs) comes with **no warranty** and is **not supported**.
This is a work in progress, everything will change.
Use at your own risk!

## Dependencies

[Hugo](https://gohugo.io/).
[Lunr](https://lunrjs.com/).
[Node.js](https://nodejs.dev/).


## Build

```
export GITHUB_USERNAME_TOKEN='place githubName@token here'
npm install
npm install -g grunt-cli
grunt modules-update
grunt lunr-index
grunt copy-lunr-src
npx -p less lessc --compress /cfbs-web/themes/cfbs-theme/styles/cfbs.less /cfbs-web/themes/cfbs-theme/static/css/style.min.css
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
export GITHUB_USERNAME_TOKEN='place githubName@token here'
docker build --build-arg GITHUB_USERNAME_TOKEN --tag cfbs-website -f Dockerfile .
docker run -p 80:80 --name cfbs-website --rm cfbs-website
```

## CFEngine Build System Repositories

* [modules](https://github.com/cfengine/modules) - Official modules provided by the CFEngine team
* [cfbs](https://github.com/cfengine/cfbs) - Command line client
* [cfbs-index](https://github.com/cfengine/cfbs-index) - Index of modules
* [cfbs-web](https://github.com/cfengine/cfbs-web) - Website
* [cfbs-example](https://github.com/cfengine/cfbs-example) - Example project using cfbs
