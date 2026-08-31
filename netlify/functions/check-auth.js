const { checkAuth } = require("./utils");

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

  if (checkAuth(body.email, body.password)) {
    return { statusCode: 200, body: JSON.stringify({ ok: true }) };
  }
  return { statusCode: 401, body: JSON.stringify({ error: "Invalid email or password" }) };
};
