const IFTTT_KEY = process.env.IFTTT_KEY;
const IFTTT_STAGING_KEY = process.env.IFTTT_STAGING_KEY;
const IFTTT_API_TOKEN_AUTH_KEY = process.env.IFTTT_API_TOKEN_AUTH_KEY;
const TEST_ACCESS_TOKEN = process.env.TEST_ACCESS_TOKEN;
const FULLSTACK_KEY = process.env.FULLSTACK_KEY;
const AUTH_ALWAYS_FAILS_KEY = process.env.AUTH_ALWAYS_FAILS_KEY;

module.exports = {
  serviceKeyCheck: function (req, res, next) {
    const key = req.get("IFTTT-Service-Key");

    if ([IFTTT_KEY, IFTTT_STAGING_KEY, FULLSTACK_KEY, IFTTT_API_TOKEN_AUTH_KEY].includes(key)) {
      next();
    } else {
      res.status(401).send({
        errors: [
          {
            message: "Unauthorized",
          },
        ],
      });
    }
  },
  accessTokenCheck: function (req, res, next) {
    console.log('req.get("Authorization")', req.get("Authorization"));
    console.log('req.get("Api-Key")', req.get("Api-Key"));
    if (req.get("Authorization")) {
      if (req.get("Authorization") == "Bearer") {
        res.status(401).send({
          errors: [{ message: "🔏 Empty token header" }],
        });
      } else if (req.get("Authorization") !== `Bearer ${TEST_ACCESS_TOKEN}`) {
        res.status(401).send({
          errors: [{ message: "🔒 Incorrect bearer token" }],
        });
      }
    } else if (req.get("Api-Key")) {
      if (!req.get("Api-Key").startsWith(`secret ${TEST_ACCESS_TOKEN}`)) {
        res.status(401).send({
          errors: [{ message: "🔒 Incorrect API key" }],
        });
      }
    } else {
      res.status(401).send({
        errors: [{ message: "🔒 Missing authorization header" }],
      });
    }
    next();
  },
};
