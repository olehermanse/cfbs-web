document.querySelectorAll('[data-modal]').forEach(item => {
    item.addEventListener('click', () => {
        const modal = document.getElementById(item.dataset.modal);
        modal.style.display = 'block';
        modal.querySelector('.btn-primary').focus();
        const dc = item.closest('.dropdown-content');
        if (dc) { // if element is part of dropdown then close dropdown
            dc.classList.add('close');
            setTimeout(() => dc.classList.remove('close'), 100);
        }
    })
})

window.addEventListener('click', (e)=>{
    const {target} = e;
    if (target.classList.contains('modal')) {
        target.style.display = "none";
    }

    if (!target.closest('.dropdown-select') || target.parentElement.classList.contains('dropdown-select_options')) {
        document.querySelectorAll('.dropdown-select').forEach(item => item.classList.remove('opened'))
    }
})

document.querySelectorAll('.dropdown-select span').forEach(item => item.addEventListener('click', () => {
    item.closest('.dropdown-select').classList.toggle('opened')
}));

const versionsDropdown = document.querySelector('.dropdown-select.versions');
if (versionsDropdown) {
    versionsDropdown.querySelectorAll('.dropdown-select_options > div').forEach(item => item.addEventListener('click', e => {
        const {version, module} = e.target.dataset
        window.location.href = `/modules/${module}/${version}/`;
    }))
}

document.onkeyup = e => {
    if (e.key == 'Escape') {
        document.querySelectorAll('.modal').forEach(item => item.style.display = 'none')
    }
}


const fakeLogin = (el) => {
    el.style.display = 'none';
    el.closest('li').querySelector('.logged').style.display = 'block';
}

document.querySelectorAll('.tabs div[data-tab]').forEach(item => {
    item.addEventListener('click', () => {
        document.querySelector('div[data-tab].active').classList.remove('active');
        item.classList.add('active');
        document.querySelector('.tabs-content.opened').classList.remove('opened');
        document.getElementById(`tab${item.dataset.tab}`).classList.add('opened');
    })
})


const collapse = document.querySelector('.collapse');

const dropDownHandler = function (element) {
    document.querySelectorAll('.dropdown-item-onclick.opened').forEach((el)=> el !== element &&  el.classList.toggle('opened') );

    if(window.matchMedia("(pointer: coarse)").matches) {
        element.classList.toggle('opened');
    }
}
document.querySelectorAll('.dropdown-item-onclick').forEach(element=>{
    element.addEventListener('click', (e)=>dropDownHandler(e.target));
})

const openMenuHandler = function () {
    const collapseMenu = document.getElementById('openMenuToggle');
    const menu = document.querySelector('.main-menu .links');

    const openedClass = "opened";
    document.querySelectorAll('.dropdown-item-onclick.opened').forEach((element)=>element.classList.toggle('opened'));
    if (collapseMenu.className.indexOf(openedClass) == -1) {
        collapseMenu.className += ` ${openedClass}`;
        menu.className += ` d-b`;
    } else {
        collapseMenu.className = collapseMenu.className.replace(` ${openedClass}`, "");
        menu.className = menu.className.replace(` d-b`, "");
    }
}
document.getElementById('openMenuToggle').addEventListener('click', () => openMenuHandler());

const allTags = el => {
    const tags = document.querySelector('.modules-right-tags_list');
    if(el.classList.contains('opened'))  {
        el.classList.remove('opened');
        tags.classList.remove('opened');
    } else {
        el.classList.add('opened');
        tags.classList.add('opened');
    }
}
const allTagsElement = document.getElementById('all-tags');
allTagsElement?.addEventListener('click',(e)=>{
    allTags(e.target);
})

let tm;
const cl = document.querySelector('.copy-link.bi-link-45deg');
if (cl) {
    cl.addEventListener('click', function () {
        const target = event.target;
        navigator.clipboard.writeText(window.location.href);
        target.classList.remove('bi-link-45deg');
        target.className += ' bi-check2 blue-600 ';
        clearTimeout(tm2);
        tm = setTimeout(() => target.classList = 'bi bi-link-45deg copy-link copy-to-clipboard' , 2000);
    })
}

let tm2;
function copy(event) {
    const target = event.target;
    const copyText = target.closest(event.target.dataset.closest).querySelector(event.target.dataset.copyfrom).innerText;
    navigator.clipboard.writeText(copyText);
    target.classList.remove('bi-clipboard');
    target.className += ' bi-check2 blue-600 ';
    clearTimeout(tm2);
    tm2 = setTimeout(() => target.className = 'bi bi-clipboard copy copy-to-clipboard' , 2000);
}

document.querySelectorAll(".copy.bi-clipboard").forEach(el => el.addEventListener("click", copy));

String.prototype.capitalize = function() {
    return this.charAt(0).toUpperCase() + this.slice(1);
}

// remove all chars except alphanumeric, spaces and . , _ -
const sanitizeString = str => str !== null ? str.replace(/[^a-z0-9\.\s,_-]/gim,"") : null;

const publishModalElement = document.querySelector('[data-modal="publishModal"]');
publishModalElement.addEventListener('click', ()=>{
    const closeModal = (el) => el.closest('.modal').style.display = 'none';
    document.querySelectorAll('.close-modal-click').forEach(element => {
        element.addEventListener('click', e=> closeModal(e.target));
    })
    document.querySelectorAll('.opened').forEach(element=>element.classList.toggle('opened'))
    const menu = document.querySelector('.links.d-b');
    if (menu){
        menu.classList.toggle('d-b');
    }
})