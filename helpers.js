const TEST_ACCESS_TOKEN = process.env.TEST_ACCESS_TOKEN;

// How long a stamped access token stays fresh, for the trigger_auth_expires
// fixture. Long enough to configure a step, short enough not to wait around.
const EXPIRING_TOKEN_WINDOW_MS = 60 * 1000;

// Access tokens come in two shapes. The bare TEST_ACCESS_TOKEN is what we
// issued before we started stamping, and existing connections still hold it.
// New ones get TEST_ACCESS_TOKEN.<epoch_ms>. Both are valid everywhere; only
// the *_expires fixtures look at the stamp.
function stampedIssuedAt(token) {
  const separator = token.lastIndexOf(".");
  if (separator === -1) return null;
  if (token.slice(0, separator) !== TEST_ACCESS_TOKEN) return null;

  const issuedAt = parseInt(token.slice(separator + 1), 10);
  return Number.isNaN(issuedAt) ? null : issuedAt;
}

function requestToken(req) {
  const authorization = req.get("Authorization");
  if (authorization) return authorization.replace(/^Bearer /, "");

  const apiKey = req.get("Api-Key");
  if (apiKey) return apiKey.replace(/^secret /, "");

  return "";
}

module.exports = {
  generateUniqueId: function () {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  },

  issueAccessToken: function () {
    return `${TEST_ACCESS_TOKEN}.${Date.now()}`;
  },

  isValidAccessToken: function (token) {
    return token === TEST_ACCESS_TOKEN || stampedIssuedAt(token) !== null;
  },

  // True only for a stamped token past the window. An unstamped token never
  // expires, so existing connections keep working.
  accessTokenExpired: function (req) {
    const issuedAt = stampedIssuedAt(requestToken(req));
    return issuedAt !== null && Date.now() - issuedAt > EXPIRING_TOKEN_WINDOW_MS;
  },
};
