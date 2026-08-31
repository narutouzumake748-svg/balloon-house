const { checkAuth, getFile, putFile, deleteFile } = require("./utils");

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

  const { email, password, src } = body;

  if (!checkAuth(email, password)) {
    return { statusCode: 401, body: JSON.stringify({ error: "Invalid email or password" }) };
  }

  if (!src) {
    return { statusCode: 400, body: JSON.stringify({ error: "Missing photo reference" }) };
  }

  try {
    const { content, sha } = await getFile("data/gallery.json");
    const gallery = content ? JSON.parse(content) : { items: [] };
    gallery.items = gallery.items.filter((item) => item.src !== src);

    await putFile(
      "data/gallery.json",
      JSON.stringify(gallery, null, 2),
      `Remove gallery entry: ${src}`,
      sha,
      false
    );

    const imagePath = src.replace(/^\//, "");
    const imageFile = await getFile(imagePath);
    if (imageFile.sha) {
      await deleteFile(imagePath, `Remove image: ${imagePath}`, imageFile.sha);
    }

    return { statusCode: 200, body: JSON.stringify({ ok: true }) };
  } catch (e) {
    return { statusCode: 500, body: JSON.stringify({ error: e.message }) };
  }
};
