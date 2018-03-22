import { sanitizeForDisplay } from "./HtmlSanitization";

it("test sanitizeForDisplay", () => {
  // test valid things
  expect(sanitizeForDisplay("")).toBe("");
  expect(sanitizeForDisplay("hello")).toBe("hello");
  expect(sanitizeForDisplay("<b>hello</b>")).toBe("<b>hello</b>");
  expect(sanitizeForDisplay("<p>hello</p>")).toBe("<p>hello</p>");
  expect(sanitizeForDisplay("<a>hello</a>")).toBe("<a>hello</a>");
  expect(sanitizeForDisplay("<a href='google.com'>hello</a>")).toBe("<a href=\"google.com\">hello</a>");

  // test invalid tags
  expect(sanitizeForDisplay("<script>bad</script>hello")).toBe("hello");

  // test tricky ways to get javascript in there
  expect(sanitizeForDisplay("<a onclick='bad'>hello</a>")).toBe("<a>hello</a>");
  expect(sanitizeForDisplay("<a onmouseover='bad'>hello</a>")).toBe("<a>hello</a>");
});
