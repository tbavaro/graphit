module.exports = function(url, file, done) {
  if (url.startsWith("@material") && !url.endsWith(".scss")) {
    url += ".scss";
  }
  return done({
    file: url
  });
};
