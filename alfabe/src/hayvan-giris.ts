const atolye = new URL('../index.html', location.href);
atolye.search = location.search;
location.replace(atolye.href);
