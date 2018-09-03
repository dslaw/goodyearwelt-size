const sendSizeRequest = function(size) {
  const route = `/sizes/${size}`;
  return fetch(route, {
    method: 'GET',
    headers: {
      'Accept': 'text/html; charset=utf-8',
      'Content-Type': 'text/plain; charset=utf-8',
    },
  });
};

const replaceTable = function(event, targetId = 'table-container') {
  const size = event.currentTarget.dataset.size;
  sendSizeRequest(size)
    .then(req => req.text())
    .then(html => {
      const container = document.getElementById(targetId);
      container.innerHTML = html;
    })
    .catch(console.error);
};

const getSelectElements = function() {
  const eles = document.getElementsByClassName('panel-block');
  return Array.from(eles);
};

const toggleActive = function(event, eles) {
  const targetEle = event.currentTarget;
  eles.forEach(ele => ele.classList.remove('is-active'));
  targetEle.classList.add('is-active');
};

const attachSelectListeners = function() {
  const eles = getSelectElements();
  eles.forEach(ele => {
    ele.addEventListener('click', (event) => toggleActive(event, eles));
    ele.addEventListener('click', replaceTable);
  });
};


attachSelectListeners();
