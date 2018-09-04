const getId = id => document.getElementById(id);
const getChildrenOfId = id => Array.from(getId(id).children);

const toggleActive = (event, eles) => {
  eles.forEach(ele => ele.classList.remove('is-active'));
  event.currentTarget.classList.add('is-active');
};

const updateSelectionOpts = event => {
  const target = event.currentTarget.dataset.target;
  const targetId = `${target}-selections-container`;
  const eles = getChildrenOfId('select-opts-container');
  eles.forEach(ele => {
    if (ele.id === targetId) {
      ele.classList.remove('hidden');
    } else {
      ele.classList.add('hidden');
    }
  });
};

const getHtml = url => {
  return fetch(url, {
    method: 'GET',
    headers: {
      'Accept': 'text/html; charset=utf-8',
      'Content-Type': 'text/plain; charset=utf-8',
    },
  });
};

const replaceTable = (url, targetId = 'table-container') => {
  getHtml(url)
    .then(req => req.text())
    .then(html => {
      const container = getId(targetId);
      container.innerHTML = html;
    })
    .catch(console.error);
};

const attachSelectListeners = () => {
  const routePrefixes = {
    size: '/sizes',
    mlast: '/model-lasts',
  };

  const eles = Array.from(document.getElementsByClassName('panel-block'));
  eles.forEach(ele => {
    const routePrefix = routePrefixes[ele.dataset.target];
    const encodedValue = encodeURIComponent(ele.dataset.value);
    const route = `${routePrefix}/${encodedValue}`;
    if (!route) return;

    ele.addEventListener('click', (event) => toggleActive(event, eles));
    ele.addEventListener('click', () => replaceTable(route));
  });
};

const attachToggleListeners = () => {
  const eles = getChildrenOfId('search-tabs-container');
  eles.forEach(ele => {
    ele.addEventListener('click', (event) => toggleActive(event, eles));
    ele.addEventListener('click', updateSelectionOpts);
  });
};

document.addEventListener('DOMContentLoaded', () => { attachSelectListeners(); attachToggleListeners(); });
