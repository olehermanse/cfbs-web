const CONTENT_PATH_PREFIX = "./content/modules";
module.exports = function (grunt) {
    require('jit-grunt')(grunt);
    grunt.initConfig({
        less: {
            development: {
                options: {
                    compress: true,
                    yuicompress: true,
                    optimization: 2
                },
                files: {
                    "./themes/cfbs-theme/static/css/style.min.css": "./themes/cfbs-theme/styles/cfbs.less"
                }
            }
        },
        uglify: {
            options: {
                sourceMap: false
            },
            build: {
                files: {
                    './static/js/bundles/main.js': ['./static/js/main.js'],
                    './static/js/bundles/modules-page.js': ['./node_modules/lunr/lunr.js', './static/js/modules-list.js'],
                }
            }
        },
    });

    grunt.registerTask("lunr-index", function () {
        let indexPages = function () {
            let pagesIndex = [];
            grunt.file.recurse(CONTENT_PATH_PREFIX, function (abspath, rootdir, subdir, filename) {
                grunt.verbose.writeln("Parse file:", abspath);
                if (filename.includes('.html') && filename != '_index.html') {
                    pagesIndex.push(processFile(abspath, filename));
                }
                return;
            });
            return pagesIndex;
        };

        let processFile = function (abspath, filename) {
            let content = grunt.file.read(abspath);
            let pageIndex;
            // First separate the Front Matter from the content and parse it
            content = content.split("}     \n");
            let frontMatter;
            try {
                frontMatter = JSON.parse(content[0].trim() + '}');
            } catch (e) {
                console.error(e.message);
            }

            let href = abspath.replace(/^(\.\/content\/modules)/,"").replace(/(\.html$)/, "").replace('content/', '/');

            // Build Lunr index for this page
            pageIndex = {
                ...frontMatter,
                href: href
            };

            return pageIndex;
        };
        grunt.file.write("./static/js/lunr/PagesIndex.json", JSON.stringify(indexPages()));
        grunt.log.ok("Index built");
    });

    const got = require('got')
    grunt.registerTask("modules-update", async function () {
        const done = this.async();
        if (!process.env.hasOwnProperty('GITHUB_USERNAME_TOKEN')) {
            grunt.log.error('GITHUB_USERNAME_TOKEN env variable is not set. Format is: username@token')
            return;
        }
        const headers = {
            "Authorization": "Basic " + Buffer.from(process.env.GITHUB_USERNAME_TOKEN).toString("base64")
        };
        const response = await got('https://raw.githubusercontent.com/cfengine/cfbs-index/master/index.json', {headers}).json();

        const limit = await got('https://api.github.com/rate_limit', {headers}).json();
        console.log(`Remainig limit: ${limit.resources.core.remaining}`)

        const modules = response.modules;
        let authors = grunt.file.readJSON('./static/js/authors.json');
        let authorsChanged = false;

        let i = 0;
        for (const index in modules) {
            i++;
            const module = modules[index];

            if (!module.hasOwnProperty('alias')) {

                const authorRepo = module.repo.replace(/^(https\:\/\/github\.com\/)/, "").toString();

                const repoInfo = await got('https://api.github.com/repos/' + authorRepo, {headers}).json();

                const revision = module.commit || 'master';

                // author
                const owner = module.by.replace(/^(https\:\/\/github\.com\/)/, "").toString();

                if (!authors.hasOwnProperty(owner)) { // if no author -> write
                    const authorResponse = await got('https://api.github.com/users/' + owner, {headers}).json();
                    authors[owner] = authorResponse;
                    authorsChanged = true;
                }
                // author end

                // content
                let content = '';
                let extension = '.html';

                try {
                    content = await got(`https://api.github.com/repos/${authorRepo}/readme/${module.subdirectory || ''}`, {headers: {...headers, ...{"Accept": 'application/vnd.github.v3.html'}}}).text();

                    // replace src and links from relative to absolute
                    let srcReg = /src="(?!(http|file:).*)/gi
                    let hrefReg = reg = /href="(?!(http|file:).*)/gi
                    content = content
                        .replaceAll(srcReg, `src="https://raw.githubusercontent.com/${authorRepo}/${revision}/`)
                        .replaceAll(hrefReg, `href="https://github.com/${authorRepo}/blob/${revision}/`);
                } catch (e) {
                    content = 'Readme not found'
                }
                // content end


                // frontmatters
                let frontmatter = {
                    "title": index,
                    "date": repoInfo.updated_at,
                    "id": index,
                    "description": module.description || '',
                    "author": {
                        "image": authors[owner].avatar_url,
                        "name": authors[owner].name,
                        "url": module.by
                    },
                    "versions": {},
                    "updated": (new Date(repoInfo.updated_at)).toLocaleDateString('en-us', {
                        year: "numeric",
                        month: "short",
                        day: "numeric"
                    }),
                    "downloads": Math.floor(Math.random() * 10000),
                    "repo": module.repo,
                    "documentation": module.documentation || null,
                    "website": module.website || null,
                    "subdirectory": module.subdirectory,
                    "commit": module.commit,
                    "dependencies": module.dependencies || [],
                    "tags": module.tags || []
                }

                if (module.hasOwnProperty('version')) {
                    frontmatter.version = module.version;
                    // @todo versions should be fetched from backend/db/s3, not implemented yet
                    frontmatter.versions[module.version] = frontmatter.updated;
                }
                // frontmatters end
                grunt.file.write(`./content/modules/${index}${extension}`, `${JSON.stringify(frontmatter, null, 2)}     \n${content}`);

                grunt.log.ok(`${index} page created`);
            }
        }
        if (authorsChanged) {
            grunt.file.write('./static/js/authors.json', JSON.stringify(authors, null, 2));
        }
        done();
    });

    grunt.registerTask('build', ['modules-update', 'lunr-index', 'uglify', 'less']);
};
