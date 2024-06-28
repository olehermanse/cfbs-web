let pagesIndex, allModules, modules, tags, query, searchParts = {tags: [], query: ""},
    pagination = {perPage: 10, page: 1, total: 0, maxPage: 0};

const sortOptions = {
    alphabetic: 'alphabetically',
    relevance: 'relevance',
    mostDownloads: 'most-downloads',
    mostRecent: 'most-recent'
};

let sort = sortOptions.alphabetic;
const modulesList = function (query, tags = []) {
    let ids = [];
    modules = [];
    if (query.length > 0) {
        flexSearchIndex.search(query).forEach(item => ids.push(...item.result));
        [...new Set(ids)].map(key => {
            modules.push(pagesIndex[key])
        });
    } else {
        modules = Object.keys(pagesIndex).map(key => pagesIndex[key]);
    }

    if (tags.length > 0) {
        // if we merge module tags and tags from the filter and unique array length will be the same as module tags length,
        // then all filtered tags intersect with module tags
        modules = modules.filter(item =>  [...new Set([...item.tags, ...tags])].length == (item.tags.length ))
    }
    return modules;
}

// if sorting is selected from the dropdown then do not change it automatically
const changeDefaultSorting = newSortOption => (getSearchParam('sort') == null) && (sort = newSortOption)

const resultsWrapper = document.querySelector('div.modules-list');
const searchfor = document.getElementById('searchfor');
document.addEventListener('QUERY_CHANGED', () => {
    if (query & query.length > 0) {
        searchfor.style.display = 'block';
        searchfor.querySelector('b').innerText = query;
        changeDefaultSorting(sortOptions.relevance);
    } else {
        searchfor.style.display = 'none';
    }
})

let flexSearchIndex = new FlexSearch.Document({
    document: {
        id: 'id',
        index: ['title', 'description']
    },
    charset: "latin",
    tokenize: "full",
    matcher: "simple",
    cache: true
});

fetch('/js/lunr/PagesIndex.json')
    .then(response => response.json())
    .then(index => {
        pagesIndex = index;

        for (const id in index) {
            const page = index[id];
            flexSearchIndex.add({
                id: page.id,
                description: page.description,
                title: page.title
            })
        }

        allModules = modules = modulesList('');
        document.dispatchEvent(new Event('RENDER'))
        document.dispatchEvent(new Event('modules_loaded'))
    });

document.addEventListener('modules_loaded', function (e) {
    tags = [];
    allModules.forEach(module => {
        tags.push(...module.tags)
    })
    tags = new Set(tags);
    document.dispatchEvent(new Event('TAGS_LOADED'))
})

const getSearchParam = name => sanitizeString((new URLSearchParams(location.search)).get(name));

const sortBy = document.querySelector('.sort-by');
const orderChanged = (e) => {
    const searchParams = new URLSearchParams(location.search);
    searchParams.set('sort', e.target.dataset.value);
    location.search = searchParams.toString();
}

document.querySelectorAll('.sort-by .dropdown-select_options div').forEach(item => item.addEventListener('click', orderChanged))

const createTagElement = (tag, remove = false)=>{
    const li = document.createElement('li');
    const a = document.createElement('a');
    a.textContent = tag;
    a.addEventListener('click',()=>remove ? removeTag(tag) : selectTag(tag));
    li.appendChild(a);
    if (remove){
        const i = document.createElement('i');
        i.className = 'bi bi-x';
        li.appendChild(i);
    }
    return li;
}

document.addEventListener('TAGS_LOADED', function (e) {
    const selectedTags = getTags();
    const tagElements = [...tags].map(tag =>  tag === 'Supported' ? null : createTagElement(sanitizeString(tag))).filter(Boolean);
    document.querySelector('ul.tags').append(...tagElements);
    const appliedTagsElement = document.querySelector('.modules-applied-tags')
    if (appliedTagsElement && selectedTags.length) {
        appliedTagsElement.style.display = 'block';
        searchParts.tags.push(...selectedTags);
        document.dispatchEvent(new Event('RENDER'))
        document.querySelector('.modules-applied-tags ul').append(...selectedTags.map(item => createTagElement(sanitizeString(item, true))));
    } else if (appliedTagsElement) {
        appliedTagsElement.style.display = 'none';
    }
})

let renderTimeout;
document.addEventListener('RENDER', function () {
    clearTimeout(renderTimeout);
    renderTimeout = setTimeout(() => {
        renderModules(paginate(sorting(modulesList(searchParts.query, searchParts.tags)), pagination.perPage, pagination.page));
    }, 200);
})

document.querySelector('input[name="query"]').onkeyup = (e) => {
    searchParts.query = e.target.value;
    query = e.target.value;
    const url = new URL(window.location);
    url.searchParams.set('query', e.target.value);
    window.history.pushState({}, '', url);
    changeDefaultSorting((query.length > 0 ? sortOptions.relevance : sortOptions.alphabetic));
    document.dispatchEvent(new Event('RENDER'));
    document.dispatchEvent(new Event('QUERY_CHANGED'));
}

document.addEventListener("modules_loaded", () => {
    if (getSearchParam('query')) {
        document.querySelector('input[name="query"]').value = getSearchParam('query');
        searchParts.query = getSearchParam('query').trim();
        query = getSearchParam('query').trim();
        document.dispatchEvent(new Event('RENDER'));
        document.dispatchEvent(new Event('QUERY_CHANGED'));
    }

    if (getSearchParam('page')) {
        pagination.page = parseInt(getSearchParam('page'));
        document.dispatchEvent(new Event('RENDER'))
    }

    if (getSearchParam('perPage')) {
        pagination.perPage = parseInt(getSearchParam('perPage'));
        document.dispatchEvent(new Event('RENDER'))
    }

    if (getSearchParam('sort') && Object.values(sortOptions).includes(getSearchParam('sort'))) {
        sort = getSearchParam('sort');
        document.dispatchEvent(new Event('RENDER'))
    }
});


const selectTag = function (tag) {
    const searchParams = new URLSearchParams(location.search);
    searchParams.set('page', '1');
    let tags = new Set(searchParams.getAll('tag').map(item => item.toLowerCase()));
    tags.add(tag);
    searchParams.delete('tag')
    tags.forEach(item => searchParams.append('tag', item))
    location.search = searchParams.toString();
}
document.getElementById('supported-tag').addEventListener('click',(e)=>{
    selectTag('supported');
})

const removeTag = function (tag) {
    const searchParams = new URLSearchParams(location.search);
    searchParams.set('page', '1');
    let tags = new Set(searchParams.getAll('tag').map(item => item.toLowerCase()));
    tags.delete(tag);
    searchParams.delete('tag')
    tags.forEach(item => searchParams.append('tag', item))
    location.search = searchParams.toString();
}

const removeAllTags = function () {
    const searchParams = new URLSearchParams(location.search);
    searchParams.delete('tag')
    location.search = searchParams.toString();
}
document.getElementById('removeAllTags').addEventListener('click', removeAllTags)

const getTags = () => (new URLSearchParams(location.search)).getAll('tag');




function renderModules(results) {
    pagination.maxPage = Math.ceil(modules.length / pagination.perPage);
    resultsWrapper.replaceChildren();
    document.querySelectorAll('.pagesCount').forEach(item => item.textContent = modules.length);
    initPaginationHtml();
    if (!results.length || !resultsWrapper) {
        return;
    }

    resultsWrapper.replaceChildren();
    let modulesHTML = '';
    results.forEach(function(result) {
        const article = document.createElement('article');
        article.className = 'modules-item';

        const flexDiv = document.createElement('div');
        flexDiv.className = 'flex flex-space-between';

        const leftDiv = document.createElement('div');

        const itemNameDiv = document.createElement('div');
        itemNameDiv.className = 'modules-item_name flex-grow';

        const flexAlignDiv = document.createElement('div');
        flexAlignDiv.className = 'flex flex--align_center';

        const avatarDiv = document.createElement('div');
        avatarDiv.className = 'modules-item_avatar';

        const avatarImg = document.createElement('img');
        avatarImg.width = 32;
        avatarImg.height = 32;
        avatarImg.src = result.author.image;
        avatarDiv.appendChild(avatarImg);

        const infoDiv = document.createElement('div');

        const titleLink = document.createElement('a');
        titleLink.href = result.href;
        titleLink.className = 'modules-item_title';
        titleLink.textContent = result.title;

        const authorDiv = document.createElement('div');
        authorDiv.className = 'modules-item_author';
        authorDiv.textContent = `by ${result.author.name}`;

        infoDiv.appendChild(titleLink);
        infoDiv.appendChild(authorDiv);

        flexAlignDiv.appendChild(avatarDiv);
        flexAlignDiv.appendChild(infoDiv);
        itemNameDiv.appendChild(flexAlignDiv);

        const descriptionP = document.createElement('p');
        descriptionP.className = 'modules-item_description';
        descriptionP.textContent = result.description;

        const tagsDiv = document.createElement('div');
        tagsDiv.className = 'modules-item_tags tags';

        const tagsUl = document.createElement('ul');
        result.tags.forEach(tag => {
            const tagLi = document.createElement('li');
            tagLi.className = tag.toLowerCase();

            const tagA = document.createElement('a');
            tagA.href = '#';
            tagA.addEventListener('click', ()=> selectTag(tag));
            tagA.textContent = tag;
            tagLi.appendChild(tagA);
            tagsUl.appendChild(tagLi);
        });
        tagsDiv.appendChild(tagsUl);

        leftDiv.appendChild(itemNameDiv);
        leftDiv.appendChild(descriptionP);
        leftDiv.appendChild(tagsDiv);

        const rightDiv = document.createElement('div');
        rightDiv.className = 'right-info';

        if (result.version) {
            const versionDiv = document.createElement('div');
            versionDiv.textContent = `Version: ${result.version}`;
            rightDiv.appendChild(versionDiv);
        }

        const updatedDiv = document.createElement('div');
        updatedDiv.textContent = `Updated: ${result.updated}`;
        rightDiv.appendChild(updatedDiv);

        const downloadsDiv = document.createElement('div');
        downloadsDiv.textContent = `Total downloads: ${result.downloads}`;
        rightDiv.appendChild(downloadsDiv);

        flexDiv.appendChild(leftDiv);
        flexDiv.appendChild(rightDiv);

        article.appendChild(flexDiv);

        resultsWrapper.appendChild(article);
    });
}

const paginate = (items, perPage, page) => items.slice((page - 1) * perPage, page * perPage);
const sorting = (items) => {
    switch (sort) {
        case sortOptions.alphabetic:
            items = items.sort((a, b) => a.title.localeCompare(b.title))
            break;
        case sortOptions.mostDownloads:
            items = items.sort((a, b) => b.downloads - a.downloads)
            break;
        case sortOptions.mostRecent:
            items = items.sort((a, b) => (new Date(b.updated)).getTime() - (new Date(a.updated)).getTime())
            break;
        default:
            break;
    }
    return items;
}

const perPageDropdown = document.querySelector('.perPage');
if (perPageDropdown) {
    perPageDropdown.querySelectorAll('.dropdown-select_options > div').forEach(item => item.addEventListener('click', e => {
        pagination.perPage = parseInt(e.target.dataset.value);
        pagination.page = 1;
        perPageDropdown.querySelector('span > div').innerText = e.target.dataset.value;
        document.dispatchEvent(new Event('paginated'));
    }))
}

const next_page = document.getElementById('next_page');
next_page.addEventListener('click', () => {
    if (next_page.classList.contains('disabled')) return;
    pagination.page = pagination.page >= pagination.maxPage ? pagination.maxPage : pagination.page + 1;
    document.dispatchEvent(new Event('paginated'))
})

const prev_page = document.getElementById('prev_page');
prev_page.addEventListener('click', () => {
    if (prev_page.classList.contains('disabled')) return;
    pagination.page = pagination.page <= 1 ? 1 : pagination.page - 1;
    document.dispatchEvent(new Event('paginated'))
})

const last_page = document.getElementById('last_page');
last_page.addEventListener('click', () => {
    if (last_page.classList.contains('disabled')) return;
    pagination.page = pagination.maxPage;
    document.dispatchEvent(new Event('paginated'))
})

const first_page = document.getElementById('first_page');
first_page.addEventListener('click', () => {
    if (first_page.classList.contains('disabled')) return;
    pagination.page = 1;
    document.dispatchEvent(new Event('paginated'))
})

document.addEventListener('paginated', () => {
    const searchParams = new URLSearchParams(location.search);
    searchParams.set('page', pagination.page)
    searchParams.set('perPage', pagination.perPage)
    location.search = searchParams.toString();
})

const initPaginationHtml = () => {
    if (pagination.page == pagination.maxPage) {
        last_page.classList.add('disabled');
        next_page.classList.add('disabled');
    } else {
        last_page.classList.remove('disabled');
        next_page.classList.remove('disabled');
    }

    if (pagination.page == 1) {
        first_page.classList.add('disabled');
        prev_page.classList.add('disabled');
    } else {
        first_page.classList.remove('disabled');
        prev_page.classList.remove('disabled');
    }

    pagination.total = modules.length;
    let endPage = pagination.page * pagination.perPage;
    endPage = endPage > pagination.total ? pagination.total : endPage;
    document.getElementById('startPage').innerText = ((pagination.page - 1) * pagination.perPage + 1).toString();
    document.getElementById('endPage').innerText = endPage.toString();

    if (sort) {
        sortBy.querySelector('span > div').innerText = sort.capitalize().replace('-', ' ');
    }

    perPageDropdown.querySelector('span > div').textContent = pagination.perPage;
}
