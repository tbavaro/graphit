import * as SanitizeHtml from "sanitize-html";

const EXTRA_TAGS_ALLOWED = [
  "img"
];

const EXTRA_ATTRIBUTES_ALLOWED = {
  "img": [ "height", "width" ]
};

var _cachedOptions: SanitizeHtml.IOptions | undefined;

function objectMap<V, T extends { [key: string]: V}>(object: T, func: (key: string, value: V) => V | undefined): T {
  var result: any = {};
  Object.keys(object).forEach((key) => {
    var value = func(key, object[key]);
    if (value !== undefined) {
      result[key] = value;
    }
  });
  return result;
}

function options(): SanitizeHtml.IOptions {
  if (!_cachedOptions) {
    _cachedOptions = {};
    _cachedOptions.allowedTags = SanitizeHtml.defaults.allowedTags.concat(EXTRA_TAGS_ALLOWED);
    _cachedOptions.allowedAttributes =
      objectMap(SanitizeHtml.defaults.allowedAttributes, (tag, attribs: string[]) => {
        if (tag in EXTRA_ATTRIBUTES_ALLOWED) {
          return attribs.concat(EXTRA_ATTRIBUTES_ALLOWED[tag]);
        } else {
          return attribs;
        }
    });
  }
  return _cachedOptions;
}

export function sanitizeForDisplay(html: string) {
  return SanitizeHtml(html, options());
}
