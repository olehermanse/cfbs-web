let lunrIndex, pagesIndex, allModules, modules, tags, query, searchParts = {tags: [], query: ""},
    pagination = {perPage: 10, page: 1, total: 0, maxPage: 0}, sort;

const resultsWrapper = document.querySelector('div.modules-list');
const searchfor = document.getElementById('searchfor');
document.addEventListener('QUERY_CHANGED', () => {
    if (query) {
        searchfor.style.display = 'block';
        searchfor.querySelector('b').innerText = query;
        sort = 'relevance';
    } else {
        searchfor.style.display = 'none';
    }
})

fetch('/js/lunr/PagesIndex.json')
    .then(response => response.json())
    .then(index => {
        pagesIndex = index;
        lunrIndex = lunr(function () {
            this.field("title", {boost: 50});
            this.field("description", {boost: 25});
            this.field("tags", {boost: 5});
            this.field("content");
            this.ref("href");
            index.map(page => this.add(page));
        });
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

const getSearchParam = name => (new URLSearchParams(location.search)).get(name);

const sortBy = document.querySelector('.sort-by');
const orderChanged = (e) => {
    const searchParams = new URLSearchParams(location.search);
    searchParams.set('sort', e.target.dataset.value);
    location.search = searchParams.toString();
}

document.querySelectorAll('.sort-by .dropdown-select_options div').forEach(item => item.addEventListener('click', orderChanged))

document.addEventListener('TAGS_LOADED', function (e) {
    const selectedTags = getTags();
    let tagsHtml = '';
    tags.forEach(tag => tagsHtml += tag == 'Supported' ? '' : `<li><a onclick="selectTag('${tag}')" href="#">${tag}</a></li>`);
    document.querySelector('ul.tags').innerHTML = tagsHtml;
    if (selectedTags.length) {
        document.querySelector('.modules-applied-tags').style.display = 'block';
        searchParts.tags.push(...selectedTags.map(item => '+tags:' + item.replaceAll(' ', '\\ ').replaceAll('-', '\\-')));
        document.dispatchEvent(new Event('RENDER'))
        document.querySelector('.modules-applied-tags ul').innerHTML = selectedTags.map(item => `<li>${item} <a onclick="removeTag('${item}')" href="#"><i class="bi bi-x"></i></a></li>`).join('');
    } else {
        document.querySelector('.modules-applied-tags').style.display = 'none';
    }
})

let renderTimeout;
document.addEventListener('RENDER', function () {
    clearTimeout(renderTimeout);
    renderTimeout = setTimeout(() => {
        renderModules(paginate(sorting(modulesList(`${searchParts.tags.join(' ')} ${searchParts.query}`)), pagination.perPage, pagination.page));
    }, 200);
})

document.querySelector('input[name="query"]').onkeyup = (e) => {
    searchParts.query = '+' + e.target.value.replaceAll(' ', '\\ ') + '*';
    query = e.target.value;
    const url = new URL(window.location);
    url.searchParams.set('query', e.target.value);
    window.history.pushState({}, '', url);
    sort = 'relevance';
    document.dispatchEvent(new Event('RENDER'));
    document.dispatchEvent(new Event('QUERY_CHANGED'));
}

document.addEventListener("modules_loaded", () => {
    if (getSearchParam('query')) {
        document.querySelector('input[name="query"]').value = getSearchParam('query');
        searchParts.query = '+' + getSearchParam('query') + '*';
        query = getSearchParam('query');
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

    if (getSearchParam('sort')) {
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

const getTags = () => (new URLSearchParams(location.search)).getAll('tag');


const modulesList = function (query) {
    modules = lunrIndex.search(query).map((result) =>
        pagesIndex.filter(function (page) {
            return page.href === result.ref;
        })[0]
    );
    return modules;
}

function renderModules(results) {
    pagination.maxPage = Math.ceil(modules.length / pagination.perPage);
    resultsWrapper.innerHTML = '';
    document.querySelectorAll('.pagesCount').forEach(item => item.innerHTML = modules.length);
    initPaginationHtml();
    if (!results.length || !resultsWrapper) {
        return;
    }

    resultsWrapper.innerHTML = '';
    let modulesHTML = '';
    results.forEach(function (result) {
        modulesHTML += `
            <article class="modules-item">
   <div class="flex flex-space-between">
      <div>
         <div class="modules-item_name flex-grow">
            <div class="flex flex--align_center">
               <div class="modules-item_avatar">
                  <img width="32" height="32" src="${result.author.image}">
               </div>
               <div>
                  <a href="${result.href}" class="modules-item_title">${result.title}</a>
                  <div class="modules-item_author">by ${result.author.name}</div>
               </div>
            </div>
         </div>
         <p class="modules-item_description">
            ${result.description}
         </p>
      </div>
      <div class="right-info">
         <div>${result.version ? 'Version:' + result.version : ''}</div>
         <div>Updated: ${result.updated}</div>
         <div>Total downloads: ${result.downloads}</div>
      </div>
   </div>
   <div class="modules-item_tags tags">
      <ul>
          ${result.tags.map(tag => ` <li class="${tag.toLowerCase()}">
            <a onclick="selectTag('${tag}')" href="#">${tag}</a>
         </li>`).join('')}
      </ul>
   </div>
</article>`
    });
    resultsWrapper.innerHTML = modulesHTML;
}

document.querySelectorAll('.dropdown-select span').forEach(item => item.onclick = () => {
    item.closest('.dropdown-select').classList.add('opened')
});

const paginate = (items, perPage, page) => items.slice((page - 1) * perPage, page * perPage);
const sorting = (items) => {
    switch (sort) {
        case 'alphabetically':
            items = items.sort((a, b) => a.title.localeCompare(b.title))
            break;
        case 'most-download':
            items = items.sort((a, b) => b.downloads - a.downloads)
            break;
        case 'most-recent':
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
    searchParams.delete('tag')
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
}
