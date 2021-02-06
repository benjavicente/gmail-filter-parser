// Code inspired by underscore.js
export function propertyGetter(key) {
  return (o) => o[key];
}

export function map(array, callable) {
  const length = array.length;
  const result = new Array(length);
  let i = -1;
  while (++i < length) {
    result[i] = callable(array[i]);
  }
  return result;
}

export function zip(...arrays) {
  const length = Math.min(...arrays.map((e) => e.length));
  const result = new Array(length);
  let i = -1;
  while (++i < length) {
    result[i] = map(arrays, propertyGetter(i));
  }
  return result;
}

// https://stackoverflow.com/a/15678733
export function getRequests() {
  var s1 = location.search.substring(1, location.search.length).split("&"),
    r = {},
    s2,
    i;
  for (i = 0; i < s1.length; i += 1) {
    s2 = s1[i].split("=");
    r[decodeURIComponent(s2[0]).toLowerCase()] = decodeURIComponent(s2[1]);
  }
  return r;
}
