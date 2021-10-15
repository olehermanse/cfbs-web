document.querySelectorAll('[data-modal]').forEach(item => {
    item.onclick = () => {
        const modal = document.getElementById(item.dataset.modal);
        modal.style.display = 'block';
        modal.querySelector('.btn-primary').focus();
        const dc = item.closest('.dropdown-content');
        if (dc) { // if element is part of dropdown then close dropdown
            dc.classList.add('close');
            setTimeout(() => dc.classList.remove('close'), 100);
        }
    }
})

window.onclick = e => {
    if (e.target.classList.contains('modal')) {
        e.target.style.display = "none";
    }

    if (!e.target.closest('.dropdown-select') || e.target.parentElement.classList.contains('dropdown-select_options')) {
        document.querySelectorAll('.dropdown-select').forEach(item => item.classList.remove('opened'))
    }
}

document.onkeyup = e => {
    if (e.key == 'Escape') {
        document.querySelectorAll('.modal').forEach(item => item.style.display = 'none')
    }
}

const closeModal = (el) => el.closest('.modal').style.display = 'none';

const fakeLogin = (el) => {
    el.style.display = 'none';
    el.closest('li').querySelector('.logged').style.display = 'block';
}

document.querySelectorAll('.tabs div[data-tab]').forEach(item => {
    item.onclick = function () {
        document.querySelector('div[data-tab].active').classList.remove('active');
        item.classList.add('active');
        document.querySelector('.tabs-content.opened').classList.remove('opened');
        document.getElementById(`tab${item.dataset.tab}`).classList.add('opened');
    }
})


const collapse = document.querySelector('.collapse');

const dropDownHandler = function (element) {
    const openedClass = "opened";
    document.querySelector('li.dropdown.opened').classList.remove('opened');
    const li = element.closest('li');
    if (li.className.indexOf(openedClass) == -1) {
        li.className += ` ${openedClass}`;
    } else {
        li.className = li.className.replace(` ${openedClass}`, "");
    }
}

const openMenuHandler = function (collapseMenu) {
    const menu = document.querySelector('.main-menu .links');

    const openedClass = "opened";
    if (collapseMenu.className.indexOf(openedClass) == -1) {
        collapseMenu.className += ` ${openedClass}`;
        menu.className += ` d-b`;
    } else {
        collapseMenu.className = collapseMenu.className.replace(` ${openedClass}`, "");
        menu.className = menu.className.replace(` d-b`, "");
    }
}

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

let tm;
const cl = document.querySelector('.copy-link');
if (cl) {
    cl.addEventListener('click', function () {
        navigator.clipboard.writeText(window.location.href);
        const linkCopied = document.querySelector('.link-copied');
        linkCopied.style.display = 'block';
        clearTimeout(tm);
        tm = setTimeout(() => linkCopied.style.display = 'none', 2000);
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
    tm2 = setTimeout(() => target.className = 'bi bi-clipboard' , 2000);
}

document.querySelectorAll(".copy").forEach(el => el.addEventListener("click", copy));

String.prototype.capitalize = function() {
    return this.charAt(0).toUpperCase() + this.slice(1);
}
