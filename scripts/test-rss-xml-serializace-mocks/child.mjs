import { GET } from "../../src/pages/rss.xml.js";

const response = await GET({ site: new URL("https://realtech.cz/") });
const xml = await response.text();

process.stdout.write(JSON.stringify({
  isResponse: response instanceof Response,
  contentType: response.headers.get("content-type"),
  xml,
}));
