const formatBrannockSize = function(brannockSize) {
  return brannockSize.toString();
};

const formatManufacturerSize = function(size, width) {
  const widthText = width || '';
  return `${size}${widthText}`;
};

const formatThreadUrl = function(threadUrl, id) {
  const url = threadUrl.endsWith('/')
    ? threadUrl
    : threadUrl.slice(0, -1);
  return url + id;
};


module.exports = {
  formatBrannockSize,
  formatManufacturerSize,
  formatThreadUrl,
};
