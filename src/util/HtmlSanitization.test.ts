import { sanitizeForDisplay } from "./HtmlSanitization";

it("test sanitizeForDisplay", () => {
  const test = (input, output) => {
    expect(sanitizeForDisplay(input)).toBe(output);
  };

  // test valid things
  test("", "");
  test("hello", "hello");
  test("<b>hello</b>", "<b>hello</b>");
  test("<p>hello</p>", "<p>hello</p>");
  test("<a>hello</a>", "<a>hello</a>");
  test("<a href='google.com'>hello</a>", "<a href=\"google.com\">hello</a>");
  test("<img src='foo'/>", "<img src=\"foo\" />");
  test("<img src='foo' height=20 width='30'/>", "<img src=\"foo\" height=\"20\" width=\"30\" />");

  // test invalid tags
  test("<script>bad</script>hello", "hello");

  // test tricky ways to get javascript in there
  test("<a href='javascript:bad'>hello</a>", "<a>hello</a>");
  test("<a onclick='bad'>hello</a>", "<a>hello</a>");
  test("<a onmouseover='bad'>hello</a>", "<a>hello</a>");
  test("<img onclick='bad' />", "<img />");
});
