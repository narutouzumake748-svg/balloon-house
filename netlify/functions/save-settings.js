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

  const { email, password, settings } = body;

  if (!checkAuth(email, password)) {
    return { statusCode: 401, body: JSON.stringify({ error: "Invalid email or password" }) };
  }

  if (!settings) {
    return { statusCode: 400, body: JSON.stringify({ error: "Missing settings" }) };
  }

  try {
    const { sha } = await getFile("data/settings.json");
    await putFile(
      "data/settings.json",
      JSON.stringify(settings, null, 2),
      "Update site settings",
      sha,
      false
    );
    return { statusCode: 200, body: JSON.stringify({ ok: true }) };
  } catch (e) {
    return { statusCode: 500, body: JSON.stringify({ error: e.message }) };
  }
};
