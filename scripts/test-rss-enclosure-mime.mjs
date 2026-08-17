import test, { beforeEach } from "node:test";
import assert from "node:assert/strict";

import {
  getMockState,
  resetRssMocks,
  setCollection,
  setExistingFiles,
} from "./test-rss-mocks/state.mjs";
import { GET } from "../src/pages/rss.xml.js";
import { mimeTypeProEnclosure } from "../src/lib/rss-enclosure-mime.js";

const site = new URL("https://realtech.cz/");
const publishedAt = new Date("2025-04-05T06:07:08.000Z");

function article(image, id = "cover") {
  return {
    id,
    body: "",
    data: {
      title: id,
      description: `Popis ${id}`,
      date: publishedAt,
      category: "Testy",
      draft: false,
      image,
    },
  };
}

beforeEach(() => {
  resetRssMocks();
});

test("helper odvodí MIME z přípony a neznámou vynechá [Z1065]", () => {
  assert.equal(mimeTypeProEnclosure("/images/clanky/cover.jpg"), "image/jpeg");
  assert.equal(mimeTypeProEnclosure("/images/clanky/cover.jpeg"), "image/jpeg");
  assert.equal(mimeTypeProEnclosure("/images/clanky/cover.JPG"), "image/jpeg");
  assert.equal(mimeTypeProEnclosure("/images/clanky/cover.png"), "image/png");
  assert.equal(mimeTypeProEnclosure("/images/clanky/cover.webp"), "image/webp");
  assert.equal(mimeTypeProEnclosure("/images/clanky/cover.gif"), undefined);
  assert.equal(mimeTypeProEnclosure("/images/clanky/cover"), undefined);
});

test("GET dá PNG a WebP enclosure pravdivý MIME, JPEG nechá [Z1065 / RSS-MIME-005]", async () => {
  setExistingFiles([
    ["public/images/clanky/zz-pngcover.png", 13807],
    ["public/images/clanky/zz-webpcover.webp", 2048],
    ["public/images/clanky/zz-jpgcover.jpg", 4096],
    ["public/images/clanky/zz-gifcover.gif", 512],
  ]);
  setCollection([
    article("/images/clanky/zz-pngcover.png", "png"),
    article("/images/clanky/zz-webpcover.webp", "webp"),
    article("/images/clanky/zz-jpgcover.jpg", "jpg"),
    article("/images/clanky/zz-gifcover.gif", "gif"),
  ]);

  await GET({ site });

  const [png, webp, jpg, gif] = getMockState().rssCalls[0].items;
  assert.deepEqual(png.enclosure, {
    url: "https://realtech.cz/images/clanky/zz-pngcover.png",
    type: "image/png",
    length: 13807,
  });
  assert.deepEqual(webp.enclosure, {
    url: "https://realtech.cz/images/clanky/zz-webpcover.webp",
    type: "image/webp",
    length: 2048,
  });
  assert.deepEqual(jpg.enclosure, {
    url: "https://realtech.cz/images/clanky/zz-jpgcover.jpg",
    type: "image/jpeg",
    length: 4096,
  });
  assert.equal(gif.enclosure, undefined);
});
