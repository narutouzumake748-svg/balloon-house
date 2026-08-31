const { checkAuth, getFile, putFile } = require("./utils");

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  let body;
  try {
    body = JSON.parse(event.body);
  } catch (e) {
    return { statusCode: 400, body: JSON.stringify({ error: "Invalid request" }) };
  }

  const { email, password, imageBase64, filename, alt, category } = body;

  if (!checkAuth(email, password)) {
    return { statusCode: 401, body: JSON.stringify({ error: "Invalid email or password" }) };
  }

  if (!imageBase64 || !filename || !category) {
    return { statusCode: 400, body: JSON.stringify({ error: "Missing required fields" }) };
  }

  try {
    const imagePath = `images/gallery/${filename}`;
    await putFile(imagePath, imageBase64, `Add gallery photo: ${filename}`, null, true);

    const { content, sha } = await getFile("data/gallery.json");
    const gallery = content ? JSON.parse(content) : { items: [] };
    gallery.items.push({ src: `/${imagePath}`, alt: alt || "", category });

    await putFile(
      "data/gallery.json",
      JSON.stringify(gallery, null, 2),
      `Add gallery entry: ${filename}`,
      sha,
      false
    );

    return { statusCode: 200, body: JSON.stringify({ ok: true }) };
  } catch (e) {
    return { statusCode: 500, body: JSON.stringify({ error: e.message }) };
  }
};
