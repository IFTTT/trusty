// server.js

// init project
const express = require("express");
const url = require("url");
const bodyParser = require("body-parser");
const path = require("path");
const app = express();
const { faker } = require("@faker-js/faker");
const randomEmoji = require("random-emoji");

const middleware = require("./middleware");
const helpers = require("./helpers");

const IFTTT_KEY = process.env.IFTTT_KEY;
const TEST_ACCESS_TOKEN = process.env.TEST_ACCESS_TOKEN;

app.use(bodyParser.json());
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "/views"));

// The status
app.get("/ifttt/v1/status", middleware.serviceKeyCheck, (req, res) => {
  res.status(200).send();
});

// The test/setup endpoint
app.post("/ifttt/v1/test/setup", middleware.serviceKeyCheck, (req, res) => {
  res.status(200).send({
    data: {
      accessToken: "abc123",
      apiToken: "abc123",
      samples: {
        triggers: {
          trigger_fresh_with_field: {
            field: "abc",
          },
          trigger_fresh: {
            field: "abc",
          },
          trigger_with_checkbox_field: {
            which_colors: "blue",
            shape: "square",
          },
        },
        actions: {
          action_error: {
            errors: [
              {
                message: "Something went wrong!",
              },
            ],
          },
          action_skip: {
            errors: [
              {
                status: "SKIP",
                message: "Audio file size too big",
              },
            ],
          },
          action_rate_limit: {},
          action_error_01350b3: {
            test1: "abc",
          },
          action_skip_d958353: {},
          action_success: {
            text_field: "123",
          },
          with_dynamic_action_field_values: {
            nested_emojis: "abc",
            non_nested_emojis: "123",
          },
          with_erroring_dynamic_action_field_7d80490: {
            options: "error",
            title: "oops",
          },
          with_erroring_dynamic_action_field: {
            error_when_fetching_options: "error",
            options: "bad",
            timeout_when_fetching_options: "oops",
            options_returns_an_empty_array: "bummer",
            one_thousand_options: "1000",
          },
          action_with_static_fields: {
            static_field: "abc",
            static_dropdown_field: "123",
          },
          action_with_dynamic_checkbox_field: {
            which_box_updated: "abc123",
          },
          action_with_checkbox_field: {
            which_box: "xyz456",
          },
          action_sent_multi_checkbox: {
            static_checkbox: [
              { label: "a", value: "1" },
              { label: "b", value: "2" },
            ],
          },
        },
        queries: {
          random_number: {
            this_is_a_test_query_field: "123",
          },
        },
        actionRecordSkipping: {
          action_error: {},
          action_skip: {},
          action_rate_limit: {},
          action_error_01350b3: {
            test1: "",
          },
          action_skip_d958353: {},
          action_success: {
            text_field: "",
          },
          with_dynamic_action_field_values: {
            nested_emojis: "",
            non_nested_emojis: "",
          },
          with_erroring_dynamic_action_field_7d80490: {
            options: "",
            title: "",
          },
          with_erroring_dynamic_action_field: {
            error_when_fetching_options: "",
            options: "",
            timeout_when_fetching_options: "",
            options_returns_an_empty_array: "",
            one_thousand_options: "",
          },
          action_with_static_fields: {
            static_field: "",
            static_dropdown_field: "",
          },
          action_with_dynamic_checkbox_field: {
            which_box_updated: "",
          },
          action_with_checkbox_field: {
            which_box: "",
          },
          action_sent_multi_checkbox: {
            static_checkbox: "",
          },
        },
      },
    },
  });
});

// Handle trigger fired webhooks /ifttt/v1/webhooks/trigger_subscription/fired

app.post("/ifttt/v1/webhooks/trigger_subscription/fired", (req, res) => {
  res.status(204).send;
});

// Trigger field validations

// /ifttt/v1/triggers/{{trigger_slug}}/validate
app.post(
  "/ifttt/v1/triggers/with_contextual_validation/validate",
  middleware.accessTokenCheck,
  (req, res) => {
    console.log(req.body);

    const { values } = req.body;
    const number1 = parseInt(values.number1, 10);
    const number2 = parseInt(values.number2, 10);

    const isValid = number1 + number2 === 10;
    const message = isValid ? null : "Numbers must add up to 10";

    console.log({ isValid });

    res.status(200).send({
      data: {
        number1: {
          valid: isValid,
          message: message,
        },
        number2: {
          valid: isValid,
          message: message,
        },
      },
    });
  }
);

app.post(
  "/ifttt/v1/triggers/trigger_with_erroring_trigger_fields/fields/error_200/validate",
  middleware.accessTokenCheck,
  (req, res) => {
    // console.log("trigger_with_erroring_trigger_fields", req);

    res.status(200).send({
      data: {
        valid: false,
        message: "Dang!",
      },
    });
  }
);

app.post(
  "/ifttt/v1/triggers/trigger_with_erroring_trigger_fields/fields/text_input_no_validation_required/validate",
  middleware.accessTokenCheck,
  (req, res) => {
    console.log("text_input_no_validation_required", req);

    res.status(200).send({
      data: {
        valid: false,
        message: "Dang!!",
      },
    });
  }
);

// Query field options

// /ifttt/v1/queries/query_with_erroring_field/fields/error/options

app.post(
  "/ifttt/v1/queries/query_with_erroring_field/fields/error/options",
  middleware.accessTokenCheck,
  (req, res) => {
    console.log("query_with_erroring_field", req);

    res.status(200).send({
      data: {
        valid: false,
        message: "No query options here!",
      },
    });
  }
);

// Trigger endpoints
app.post(
  "/ifttt/v1/triggers/trigger_error",
  middleware.accessTokenCheck,
  (req, res) => {
    if (req.get("IFTTT-Test-Mode") == 1) {
      let data = [],
        numOfItems = req.body.limit;

      if (typeof numOfItems === "undefined") {
        // Setting the default if limit doesn't exist.
        numOfItems = 3;
      }

      if (numOfItems >= 1) {
        for (let i = 0; i < numOfItems; i += 1) {
          data.push({
            created_at: new Date().toISOString(), // Must be a valid ISOString
            meta: {
              id: helpers.generateUniqueId(),
              timestamp: Math.floor(Date.now() / 1000), // This returns a unix timestamp in seconds.
            },
          });
        }
      }
      res.status(200).send({
        data: data,
      });
    } else {
      res.status(418).send({
        errors: [{ message: "Error!" }],
      });
    }
  }
);

app.post(
  "/ifttt/v1/triggers/trigger_error_timeout",
  middleware.accessTokenCheck,
  (req, res) => {
    if (req.get("IFTTT-Test-Mode") == 1) {
      let data = [],
        numOfItems = req.body.limit;

      if (typeof numOfItems === "undefined") {
        // Setting the default if limit doesn't exist.
        numOfItems = 3;
      }

      if (numOfItems >= 1) {
        for (let i = 0; i < numOfItems; i += 1) {
          data.push({
            created_at: new Date().toISOString(), // Must be a valid ISOString
            meta: {
              id: helpers.generateUniqueId(),
              timestamp: Math.floor(Date.now() / 1000), // This returns a unix timestamp in seconds.
            },
          });
        }
      }
      res.status(200).send({
        data: data,
      });
    } else {
      // res.status(418).send({
      //   errors: [{ message: "Error!" }]
      // });
      function returnFresh() {
        let data = [],
          numOfItems = req.body.limit;

        if (typeof numOfItems === "undefined") {
          // Setting the default if limit doesn't exist.
          numOfItems = 3;
        }

        if (numOfItems >= 1) {
          for (let i = 0; i < numOfItems; i += 1) {
            data.push({
              created_at: new Date().toISOString(), // Must be a valid ISOString
              color: null,
              meta: {
                id: helpers.generateUniqueId(),
                timestamp: Math.floor(Date.now() / 1000), // This returns a unix timestamp in seconds.
              },
            });
          }
        }
        res.status(200).send({
          data: data,
        });

        setTimeout(returnFresh, 30000);
      }
    }
  }
);

app.post(
  "/ifttt/v1/triggers/trigger_fresh",
  middleware.accessTokenCheck,
  (req, res) => {
    let data = [],
      numOfItems = req.body.limit;

    console.log(req.body);

    if (typeof numOfItems === "undefined") {
      // Setting the default if limit doesn't exist.
      numOfItems = 1;
    }

    if (numOfItems >= 1) {
      for (let i = 0; i < numOfItems; i += 1) {
        data.push({
          created_at: new Date().toISOString(), // Must be a valid ISOString
          color: "red",
          hidden_ingredient: "shhh!",
          meta: {
            id: helpers.generateUniqueId(),
            timestamp: Math.floor(Date.now() / 1000), // This returns a unix timestamp in seconds.
          },
        });
      }
    }
    console.log(
      `Instant trigger check\n • Source URL: ${
        req.body.ifttt_source.url
      }\n • Trigger identity: ${
        req.body.trigger_identity
      }\n • Date/time: ${new Date().toUTCString()}`
    );
    res.status(200).send({
      data: data,
    });
  }
);

app.post(
  "/ifttt/v1/triggers/trigger_fresh_with_field",
  middleware.accessTokenCheck,
  (req, res) => {
    let data = [],
      numOfItems = req.body.limit;

    if (typeof numOfItems === "undefined") {
      // Setting the default if limit doesn't exist.
      numOfItems = 1;
    }

    if (numOfItems >= 1) {
      for (let i = 0; i < numOfItems; i += 1) {
        data.push({
          created_at: new Date().toISOString(), // Must be a valid ISOString
          color: "red",
          hidden_ingredient: "shhh!",
          meta: {
            id: helpers.generateUniqueId(),
            timestamp: Math.floor(Date.now() / 1000), // This returns a unix timestamp in seconds.
          },
        });
      }
    }
    console.log(
      `Instant trigger check\n • Source URL: ${
        req.body.ifttt_source.url
      }\n • Trigger identity: ${
        req.body.trigger_identity
      }\n • Date/time: ${new Date().toUTCString()}`
    );
    res.status(200).send({
      data: data,
    });
  }
);

app.post(
  "/ifttt/v1/triggers/trigger_fresh_polling",
  middleware.accessTokenCheck,
  (req, res) => {
    let data = [],
      numOfItems = req.body.limit;

    console.log(req.body);

    if (typeof numOfItems === "undefined") {
      // Setting the default if limit doesn't exist.
      numOfItems = 1;
    }

    if (numOfItems >= 1) {
      for (let i = 0; i < numOfItems; i += 1) {
        data.push({
          created_at: new Date().toISOString(), // Must be a valid ISOString
          color: "red",
          hidden_ingredient: "shhh!",
          meta: {
            id: helpers.generateUniqueId(),
            timestamp: Math.floor(Date.now() / 1000), // This returns a unix timestamp in seconds.
          },
        });
      }
    }
    //console.log(`Polling trigger check\n • Source URL: ${req.body.ifttt_source.url}\n • Trigger identity: ${req.body.trigger_identity}\n • Date/time: ${(new Date()).toUTCString()}`)
    res.status(200).send({
      data: data,
    });
  }
);

// Query endpoints

app.post(
  "/ifttt/v1/queries/bunch_of_things",
  middleware.accessTokenCheck,
  (req, res) => {
    let data = [],
      numOfItems = req.body.limit;

    if (typeof numOfItems === "undefined") {
      // Setting the default if limit doesn't exist.
      numOfItems = 30;
    }

    if (numOfItems >= 1) {
      for (let i = 0; i < numOfItems; i += 1) {
        data.push({
          created_at: new Date().toISOString(), // Must be a valid ISOString
          meta: {
            id: helpers.generateUniqueId(),
            timestamp: Math.floor(Date.now() / 1000), // This returns a unix timestamp in seconds.
          },
        });
      }
    }

    let cursor = null;

    if (req.body.limit == 1) {
      cursor = helpers.generateUniqueId();
    }

    res.status(200).send({
      data: data,
      cursor: cursor,
    });
  }
);

app.post(
  "/ifttt/v1/queries/empty_array",
  middleware.accessTokenCheck,
  (req, res) => {
    let data = [
      {
        dummy_ingredient: undefined,
      },
    ];

    let cursor = null;

    if (req.body.limit == 1) {
      cursor = helpers.generateUniqueId();
    }

    res.status(200).send({
      data: data,
      cursor: cursor,
    });
  }
);

app.post(
  "/ifttt/v1/queries/random_number",
  middleware.accessTokenCheck,
  (req, res) => {
    let data = [
      {
        random_number: Math.random() * 1000,
      },
    ];

    let cursor = null;

    if (req.body.limit == 1) {
      cursor = helpers.generateUniqueId();
    }

    res.status(200).send({
      data: data,
      cursor: cursor,
    });
  }
);

app.post(
  "/ifttt/v1/queries/channels_count",
  middleware.accessTokenCheck,
  (req, res) => {
    const https = require("https");

    https
      .get(
        "https://ifttt.com/api/v3/graph?query=%7Bchannels_count%7D",
        (resp) => {
          let data = "";

          // A chunk of data has been received.
          resp.on("data", (chunk) => {
            data += chunk;
          });

          // The whole response has been received.
          resp.on("end", () => {
            const response = JSON.parse(data);
            const channelsCount = response.data.channels_count;
            console.log(channelsCount);
          });
        }
      )
      .on("error", (err) => {
        console.log("Error: " + err.message);
      });

    let data = [
      {
        random_number: Math.random() * 1000,
      },
    ];

    let cursor = null;

    if (req.body.limit == 1) {
      cursor = helpers.generateUniqueId();
    }

    res.status(200).send({
      data: data,
      cursor: cursor,
    });
  }
);

app.post(
  "/ifttt/v1/queries/always_error",
  middleware.accessTokenCheck,
  (req, res) => {
    let data = [
      {
        color: "blue",
      },
    ];

    let cursor = null;

    if (req.body.limit == 1) {
      cursor = helpers.generateUniqueId();
    }

    const statusCode = 503;
    const error = `Error code: ${statusCode} | And a helpful error message`;

    res.status(statusCode).send({
      data: data,
      errors: [
        {
          message: error,
        },
      ],
      cursor: cursor,
    });
  }
);

app.post(
  "/ifttt/v1/queries/always_error_2",
  middleware.accessTokenCheck,
  (req, res) => {
    let data = [
      {
        color: "blue",
      },
    ];

    let cursor = null;

    if (req.body.limit == 1) {
      cursor = helpers.generateUniqueId();
    }

    const statusCode = 401;
    const error = `Error code: ${statusCode} | And a helpful SECOND error message`;

    res.status(statusCode).send({
      data: data,
      errors: [
        {
          message: error,
        },
      ],
      cursor: cursor,
    });
  }
);

app.post(
  "/ifttt/v1/queries/timeout",
  middleware.accessTokenCheck,
  (req, res) => {
    function returnData() {
      let data = [
        {
          random_number: Math.random() * 1000,
        },
      ];

      let cursor = null;

      if (req.body.limit == 1) {
        cursor = helpers.generateUniqueId();
      }

      res.status(200).send({
        data: data,
        cursor: cursor,
      });
    }

    setTimeout(returnData, 65000) // 65 seconds, matching https://github.com/IFTTT/shimmy/pull/925
  }
)

app.post(
  "/ifttt/v1/queries/always_skip",
  middleware.accessTokenCheck,
  (req, res) => {
    let data = [
      {
        color: "blue",
      },
    ];

    let cursor = null;

    if (req.body.limit == 1) {
      cursor = helpers.generateUniqueId();
    }

    const statusCode = 400;
    const error = `$Error code: {statusCode} | And a helpful error message`;
    res.status(400).send({
      errors: [
        {
          status: "SKIP",
          message:
            "This message is returned from the external service. (👋 from Trusty)",
        },
      ],
    });
  }
);

app.post(
  "/ifttt/v1/queries/query_missing_ingredient",
  middleware.accessTokenCheck,
  (req, res) => {
    let data = [
      {
        ing_one: 1,
        ing_two: 2,
        // missing_ingredient: null
      },
    ];

    let cursor = null;

    if (req.body.limit == 1) {
      cursor = helpers.generateUniqueId();
    }

    res.status(200).send({
      data: data,
      cursor: cursor,
    });
  }
);

app.post(
  "/ifttt/v1/queries/translate",
  middleware.accessTokenCheck,
  (req, res) => {
    let data = [],
      numOfItems = req.body.limit;

    if (!("queryFields" in req.body)) {
      res.status(400).send({
        errors: [
          {
            status: "Bleep",
            message: "Bloop",
          },
        ],
      });
    } else if (Object.keys(req.body["queryFields"]).length != 3) {
      res.status(400).send({
        errors: [
          {
            status: "Bleep",
            message: "Bloop",
          },
        ],
      });
    }

    if (typeof numOfItems === "undefined") {
      // Setting the default if limit doesn't exist.
      numOfItems = 30;
    }

    // begin translation

    const translate = require("@vitalets/google-translate-api");

    translate(req.body["queryFields"].text, {
      to: req.body["queryFields"].translate_to,
    })
      .then((res) => {
        global.translated_text_by_google = res.text;
      })
      .catch((err) => {
        console.error(err);
      });

    // end translation

    if (numOfItems >= 1) {
      for (let i = 0; i < numOfItems; i += 1) {
        data.push({
          translated_text: global.translated_text_by_google,
          meta: {
            id: helpers.generateUniqueId(),
            timestamp: Math.floor(Date.now() / 1000), // This returns a unix timestamp in seconds.
          },
        });
      }
    }

    let cursor = null;

    if (req.body.limit == 1) {
      cursor = helpers.generateUniqueId();
    }

    res.status(200).send({
      data: data,
      cursor: cursor,
    });
  }
);

// Action endpoints
app.post(
  "/ifttt/v1/actions/action_error",
  middleware.accessTokenCheck,
  (req, res) => {
    if (req.get("IFTTT-Test-Mode") == 1) {
      res.status(200).send({
        data: [
          {
            id: helpers.generateUniqueId(),
          },
        ],
      });
    } else {
      const statusCode = 503;
      res.status(statusCode).send({
        errors: [
          {
            message: `Status code: ${statusCode} | error!`,
          },
        ],
      });
    }
  }
);

app.post(
  "/ifttt/v1/actions/action_skip",
  middleware.accessTokenCheck,
  (req, res) => {
    if (req.get("IFTTT-Test-Mode") == 1) {
      res.status(200).send({
        data: [
          {
            id: helpers.generateUniqueId(),
          },
        ],
      });
    } else {
      res.status(400).send({
        errors: [
          {
            status: "SKIP",
            message:
              "This message is returned from the external service. (👋 from Trusty)",
          },
        ],
      });
    }
  }
);

app.post(
  "/ifttt/v1/actions/action_rate_limit",
  middleware.accessTokenCheck,
  (req, res) => {
    if (req.get("IFTTT-Test-Mode") == 1) {
      res.status(200).send({
        data: [
          {
            id: helpers.generateUniqueId(),
          },
        ],
      });
    } else {
      res.status(429).send({
        errors: [
          {
            // status: "SKIP",
            message: "Rate limited!",
          },
        ],
      });
    }
  }
);

app.post(
  "/ifttt/v1/actions/with_dynamic_action_field_values",
  middleware.accessTokenCheck,
  (req, res) => {
    if (!("actionFields" in req.body)) {
      res.status(400).send({
        errors: [
          {
            status: "SKIP",
            message: "Action skip!",
          },
        ],
      });
    } else if (
      Object.keys(req.body["actionFields"]).length == 0 ||
      Object.keys(req.body["actionFields"]["options"]).length == 0
    ) {
      res.status(400).send({
        errors: [
          {
            status: "SKIP",
            message: "Action skip!",
          },
        ],
      });
    } else {
      res.status(200).send({
        data: [
          {
            id: req.body,
          },
        ],
      });
    }
  }
);

// BEGIN HUSQ SC-103145 stuff

app.post("/ifttt/v1/actions/husq", middleware.accessTokenCheck, (req, res) => {
  console.log("action_success", req.body);
  res.status(200).send({
    data: [
      {
        id: helpers.generateUniqueId(),
      },
    ],
  });
});

app.post(
  "/ifttt/v1/actions/husq/fields/trustymower/options",
  middleware.accessTokenCheck,
  (req, res) => {
    function returnOptions() {
      res.status(200).send({
        data: [
          {
            label: "label1",
            value: "value1",
          },
          {
            label: "label2",
            value: "value2",
          },
        ],
      });
    }

    setTimeout(returnOptions, 1);
  }
);

// END HUSQ SC-103145 stuff

// /ifttt/v1/actions/multi_select_checkbox_dynamic/fields/multi_select_checkbox_dynamic/options

app.post(
  "/ifttt/v1/actions/multi_select_checkbox_dynamic/fields/multi_select_checkbox_dynamic/options",
  middleware.accessTokenCheck,
  (req, res) => {
    function returnOptions() {
      res.status(200).send({
        data: [
          {
            label: "dynamic-label1",
            value: "dynamic-value1",
          },
          {
            label: "dynamic-label2",
            value: "dynamic-value2",
          },
        ],
      });
    }

    setTimeout(returnOptions, 1);
  }
);

app.post(
  "/ifttt/v1/actions/with_dynamic_action_field_values/fields/nested_emojis/options",
  middleware.accessTokenCheck,
  (req, res) => {
    function returnOptions() {
      res.status(200).send({
        data: [
          {
            label: randomEmoji.random({ count: 1 })[0]["character"],
            values: [
              {
                label: randomEmoji.random({ count: 1 })[0]["character"],
                value: randomEmoji.random({ count: 1 })[0]["character"],
              },
              {
                label: randomEmoji.random({ count: 1 })[0]["character"],
                value: randomEmoji.random({ count: 1 })[0]["character"],
              },
              {
                label: randomEmoji.random({ count: 1 })[0]["character"],
                value: randomEmoji.random({ count: 1 })[0]["character"],
              },
              {
                label: randomEmoji.random({ count: 1 })[0]["character"],
                value: randomEmoji.random({ count: 1 })[0]["character"],
              },
              {
                label: randomEmoji.random({ count: 1 })[0]["character"],
                value: randomEmoji.random({ count: 1 })[0]["character"],
              },
              {
                label: randomEmoji.random({ count: 1 })[0]["character"],
                value: randomEmoji.random({ count: 1 })[0]["character"],
              },
              {
                label: randomEmoji.random({ count: 1 })[0]["character"],
                value: randomEmoji.random({ count: 1 })[0]["character"],
              },
              {
                label: randomEmoji.random({ count: 1 })[0]["character"],
                value: randomEmoji.random({ count: 1 })[0]["character"],
              },
            ],
          },
          {
            label: randomEmoji.random({ count: 1 })[0]["character"],
            values: [
              {
                label: randomEmoji.random({ count: 1 })[0]["character"],
                value: randomEmoji.random({ count: 1 })[0]["character"],
              },
              {
                label: randomEmoji.random({ count: 1 })[0]["character"],
                value: randomEmoji.random({ count: 1 })[0]["character"],
              },
              {
                label: randomEmoji.random({ count: 1 })[0]["character"],
                value: randomEmoji.random({ count: 1 })[0]["character"],
              },
              {
                label: randomEmoji.random({ count: 1 })[0]["character"],
                value: randomEmoji.random({ count: 1 })[0]["character"],
              },
              {
                label: randomEmoji.random({ count: 1 })[0]["character"],
                value: randomEmoji.random({ count: 1 })[0]["character"],
              },
              {
                label: randomEmoji.random({ count: 1 })[0]["character"],
                value: randomEmoji.random({ count: 1 })[0]["character"],
              },
              {
                label: randomEmoji.random({ count: 1 })[0]["character"],
                value: randomEmoji.random({ count: 1 })[0]["character"],
              },
              {
                label: randomEmoji.random({ count: 1 })[0]["character"],
                value: randomEmoji.random({ count: 1 })[0]["character"],
              },
            ],
          },
          {
            label: randomEmoji.random({ count: 1 })[0]["character"],
            values: [
              {
                label: randomEmoji.random({ count: 1 })[0]["character"],
                value: randomEmoji.random({ count: 1 })[0]["character"],
              },
              {
                label: randomEmoji.random({ count: 1 })[0]["character"],
                value: randomEmoji.random({ count: 1 })[0]["character"],
              },
              {
                label: randomEmoji.random({ count: 1 })[0]["character"],
                value: randomEmoji.random({ count: 1 })[0]["character"],
              },
              {
                label: randomEmoji.random({ count: 1 })[0]["character"],
                value: randomEmoji.random({ count: 1 })[0]["character"],
              },
              {
                label: randomEmoji.random({ count: 1 })[0]["character"],
                value: randomEmoji.random({ count: 1 })[0]["character"],
              },
              {
                label: randomEmoji.random({ count: 1 })[0]["character"],
                value: randomEmoji.random({ count: 1 })[0]["character"],
              },
              {
                label: randomEmoji.random({ count: 1 })[0]["character"],
                value: randomEmoji.random({ count: 1 })[0]["character"],
              },
              {
                label: randomEmoji.random({ count: 1 })[0]["character"],
                value: randomEmoji.random({ count: 1 })[0]["character"],
              },
            ],
          },
          {
            label: randomEmoji.random({ count: 1 })[0]["character"],
            values: [
              {
                label: randomEmoji.random({ count: 1 })[0]["character"],
                value: randomEmoji.random({ count: 1 })[0]["character"],
              },
              {
                label: randomEmoji.random({ count: 1 })[0]["character"],
                value: randomEmoji.random({ count: 1 })[0]["character"],
              },
              {
                label: randomEmoji.random({ count: 1 })[0]["character"],
                value: randomEmoji.random({ count: 1 })[0]["character"],
              },
              {
                label: randomEmoji.random({ count: 1 })[0]["character"],
                value: randomEmoji.random({ count: 1 })[0]["character"],
              },
              {
                label: randomEmoji.random({ count: 1 })[0]["character"],
                value: randomEmoji.random({ count: 1 })[0]["character"],
              },
              {
                label: randomEmoji.random({ count: 1 })[0]["character"],
                value: randomEmoji.random({ count: 1 })[0]["character"],
              },
              {
                label: randomEmoji.random({ count: 1 })[0]["character"],
                value: randomEmoji.random({ count: 1 })[0]["character"],
              },
              {
                label: randomEmoji.random({ count: 1 })[0]["character"],
                value: randomEmoji.random({ count: 1 })[0]["character"],
              },
            ],
          },
        ],
      });
    }

    setTimeout(returnOptions, 1);
  }
);

app.post(
  "/ifttt/v1/actions/with_dynamic_action_field_values/fields/non_nested_emojis/options",
  middleware.accessTokenCheck,
  (req, res) => {
    function returnOptions() {
      res.status(200).send({
        data: [
          {
            label: randomEmoji.random({ count: 1 })[0]["character"],
            value: randomEmoji.random({ count: 1 })[0]["character"],
          },
          {
            label: randomEmoji.random({ count: 1 })[0]["character"],
            value: randomEmoji.random({ count: 1 })[0]["character"],
          },
          {
            label: randomEmoji.random({ count: 1 })[0]["character"],
            values: [
              {
                label: randomEmoji.random({ count: 1 })[0]["character"],
                value: randomEmoji.random({ count: 1 })[0]["character"],
              },
              {
                label: randomEmoji.random({ count: 1 })[0]["character"],
                value: randomEmoji.random({ count: 1 })[0]["character"],
              },
            ],
          },
        ],
      });
    }

    setTimeout(returnOptions, 1);
  }
);

// ifttt/v1/actions/action_with_dynamic_checkbox_field/fields/which_box/options
app.post(
  "/ifttt/v1/actions/action_with_dynamic_checkbox_field/fields/which_box/options",
  middleware.accessTokenCheck,
  (req, res) => {
    function returnOptions() {
      res.status(200).send({
        data: [
          {
            label: "label1",
            value: "value1",
          },
          {
            label: "label2",
            value: "value2",
          },
        ],
      });
    }

    setTimeout(returnOptions, 1);
  }
);

// ifttt/v1/actions/action_with_dynamic_checkbox_field/fields/nested_dropdown/options
app.post(
  "/ifttt/v1/actions/action_with_dynamic_checkbox_field/fields/nested_dropdown/options",
  middleware.accessTokenCheck,
  (req, res) => {
    function returnOptions() {
      res.status(200).send({
        data: [
          {
            label: "Empty 1",
            value: "value1",
          },
          {
            label: "Empty 2",
            value: "value2",
          },
          {
            label: "Sub-category",
            values: [
              {
                label: "label3",
                value: "value3",
              },
              {
                label: "label4",
                value: "value4",
              },
              // {
              //   label: "Sub-sub-category",
              //   values: [
              //     {
              //       label: "label5",
              //       value: "value5"
              //     },
              //     {
              //       label: "label6",
              //       value: "value6"
              //     }
              //   ]
              // }
            ],
          },
        ],
      });
    }

    setTimeout(returnOptions, 1);
  }
);

app.post(
  "/ifttt/v1/actions/with_erroring_dynamic_action_field/fields/options/options",
  middleware.accessTokenCheck,
  (req, res) => {
    function returnOptions() {
      res.status(500).send({
        error: "OAuth",
      });
    }

    setTimeout(returnOptions, 1);
  }
);

app.post(
  "/ifttt/v1/actions/with_erroring_dynamic_action_field_7d80490/fields/options/options",
  middleware.accessTokenCheck,
  (req, res) => {
    function returnOptions() {
      res.status(200).send({
        data: ["this", "is", "invalid"],
      });
    }

    setTimeout(returnOptions, 1);
  }
);

app.post(
  "/ifttt/v1/actions/with_erroring_dynamic_action_field/fields/timeout_when_fetching_options/options",
  middleware.accessTokenCheck,
  (req, res) => {
    function returnOptions() {
      res.status(200).send({
        data: [
          "this",
          "is",
          "invalid",
          "but should timeout before reaching this array anyway",
        ],
      });
    }

    setTimeout(returnOptions, 20000);
  }
);

app.post(
  "/ifttt/v1/actions/with_erroring_dynamic_action_field/fields/error_when_fetching_options/options",
  middleware.accessTokenCheck,
  (req, res) => {
    function returnOptions() {
      res.status(404).send({
        errors: [
          {
            status: "Bleep",
            message: "Bloop",
          },
        ],
      });
    }

    setTimeout(returnOptions, 1);
  }
);

app.post(
  "/ifttt/v1/actions/with_erroring_dynamic_action_field/fields/options_returns_an_empty_array/options",
  middleware.accessTokenCheck,
  (req, res) => {
    function returnOptions() {
      res.status(200).send({
        data: [],
      });
    }

    setTimeout(returnOptions, 1);
  }
);

app.post(
  "/ifttt/v1/actions/with_erroring_dynamic_action_field/fields/one_thousand_options/options",
  middleware.accessTokenCheck,
  (req, res) => {
    function returnOptions() {
      res.status(200).send({
        data: [
          { label: "b0dd", value: "7c78" },
          { label: "4d11", value: "83ab" },
          { label: "b39c", value: "8702" },
          { label: "2a79", value: "f9b0" },
          { label: "69b0", value: "8e08" },
          { label: "3c06", value: "e2c3" },
          { label: "39da", value: "a2f8" },
          { label: "1ebf", value: "19d6" },
          { label: "75c3", value: "46bb" },
          { label: "c57b", value: "a134" },
          { label: "900a", value: "b3c2" },
          { label: "1276", value: "e99c" },
          { label: "8b5e", value: "2dc8" },
          { label: "3754", value: "f4f8" },
          { label: "fd8a", value: "14d9" },
          { label: "ad7a", value: "6d24" },
          { label: "f4cc", value: "2ade" },
          { label: "c6ed", value: "681a" },
          { label: "c3a4", value: "ed78" },
          { label: "c50b", value: "cfc8" },
          { label: "9acf", value: "2e54" },
          { label: "80bf", value: "6d6e" },
          { label: "6b3f", value: "bd71" },
          { label: "8b8f", value: "8d2b" },
          { label: "7769", value: "a8db" },
          { label: "55fb", value: "9475" },
          { label: "7a15", value: "1761" },
          { label: "7dd1", value: "b7f2" },
          { label: "c3fb", value: "1ff4" },
          { label: "26db", value: "925d" },
          { label: "02a9", value: "77fe" },
          { label: "4c58", value: "9abd" },
          { label: "6e94", value: "63f1" },
          { label: "a86d", value: "b298" },
          { label: "afeb", value: "55f3" },
          { label: "25f0", value: "fdcc" },
          { label: "a462", value: "9835" },
          { label: "227e", value: "3b55" },
          { label: "fe0c", value: "2301" },
          { label: "4ccc", value: "d167" },
          { label: "b8ac", value: "c3d6" },
          { label: "5255", value: "b391" },
          { label: "3092", value: "68ba" },
          { label: "6538", value: "f4d4" },
          { label: "4eca", value: "755a" },
          { label: "10a4", value: "4eb7" },
          { label: "92cc", value: "3405" },
          { label: "c876", value: "c9d2" },
          { label: "df2a", value: "6503" },
          { label: "e084", value: "8d33" },
          { label: "ddc2", value: "3618" },
          { label: "e456", value: "969d" },
          { label: "4c4e", value: "2543" },
          { label: "9b94", value: "eaea" },
          { label: "2e4a", value: "7c60" },
          { label: "99c9", value: "712f" },
          { label: "8ddf", value: "bd2a" },
          { label: "0d79", value: "b515" },
          { label: "a084", value: "65aa" },
          { label: "485c", value: "586b" },
          { label: "a18c", value: "6844" },
          { label: "8970", value: "1c47" },
          { label: "2413", value: "ce21" },
          { label: "796a", value: "c6bd" },
          { label: "152f", value: "43be" },
          { label: "99e9", value: "1a24" },
          { label: "108f", value: "e795" },
          { label: "821d", value: "d6cf" },
          { label: "3c14", value: "6214" },
          { label: "1ca7", value: "55b6" },
          { label: "cd19", value: "e262" },
          { label: "d5c2", value: "4aa0" },
          { label: "dcc8", value: "d5f8" },
          { label: "d1f6", value: "c5c5" },
          { label: "2e11", value: "abe2" },
          { label: "3054", value: "642f" },
          { label: "d319", value: "2e84" },
          { label: "7997", value: "9863" },
          { label: "88bf", value: "a473" },
          { label: "d876", value: "8f58" },
          { label: "4e9f", value: "2953" },
          { label: "fafa", value: "4e77" },
          { label: "a753", value: "c916" },
          { label: "e0a5", value: "6ca9" },
          { label: "dbeb", value: "9bd2" },
          { label: "c169", value: "2975" },
          { label: "9ea6", value: "47f7" },
          { label: "29b5", value: "ba52" },
          { label: "e40b", value: "8372" },
          { label: "979a", value: "de65" },
          { label: "8b4f", value: "588d" },
          { label: "c294", value: "12fb" },
          { label: "d81e", value: "5640" },
          { label: "eb1f", value: "e23d" },
          { label: "6c84", value: "9e88" },
          { label: "040e", value: "0f4a" },
          { label: "fe68", value: "197b" },
          { label: "f285", value: "9bff" },
          { label: "2ca3", value: "3f57" },
          { label: "7cb3", value: "e951" },
          { label: "0cdc", value: "b30a" },
          { label: "fe7b", value: "8f02" },
          { label: "1db3", value: "5843" },
          { label: "8522", value: "76c1" },
          { label: "15cc", value: "bbd0" },
          { label: "875c", value: "9fdb" },
          { label: "08d0", value: "7292" },
          { label: "ae9d", value: "445d" },
          { label: "514e", value: "c700" },
          { label: "54c3", value: "6524" },
          { label: "75b0", value: "5281" },
          { label: "76c6", value: "ac54" },
          { label: "20db", value: "4fed" },
          { label: "80c1", value: "b710" },
          { label: "b32c", value: "0aef" },
          { label: "0a5e", value: "5633" },
          { label: "f1c9", value: "4bad" },
          { label: "fd0d", value: "de36" },
          { label: "56aa", value: "ee8f" },
          { label: "5c91", value: "bf49" },
          { label: "d22a", value: "e5a5" },
          { label: "af03", value: "f1c5" },
          { label: "9e2f", value: "2580" },
          { label: "221b", value: "cac5" },
          { label: "9fd4", value: "bc07" },
          { label: "7f9a", value: "59c9" },
          { label: "6880", value: "b123" },
          { label: "00d5", value: "cc29" },
          { label: "572b", value: "69fc" },
          { label: "75da", value: "e8e4" },
          { label: "1b39", value: "c185" },
          { label: "843a", value: "da6f" },
          { label: "39c3", value: "5a10" },
          { label: "5a11", value: "525b" },
          { label: "60fa", value: "520b" },
          { label: "de56", value: "dcc4" },
          { label: "18f4", value: "725d" },
          { label: "05ad", value: "464e" },
          { label: "b8ef", value: "ad25" },
          { label: "0c07", value: "9f5b" },
          { label: "166a", value: "4753" },
          { label: "7ffc", value: "a633" },
          { label: "995c", value: "529e" },
          { label: "d950", value: "7966" },
          { label: "afe4", value: "bcdc" },
          { label: "8711", value: "7842" },
          { label: "8a1f", value: "e741" },
          { label: "a06d", value: "9367" },
          { label: "fd4f", value: "b45c" },
          { label: "6b83", value: "41a5" },
          { label: "0e61", value: "60a5" },
          { label: "5c80", value: "01ad" },
          { label: "c924", value: "ace9" },
          { label: "f34c", value: "e31b" },
          { label: "fb6c", value: "a3a2" },
          { label: "79cc", value: "fb0a" },
          { label: "9472", value: "482d" },
          { label: "c9d5", value: "716f" },
          { label: "fad3", value: "e258" },
          { label: "8d15", value: "b35a" },
          { label: "9085", value: "52e7" },
          { label: "5894", value: "8276" },
          { label: "2293", value: "3af8" },
          { label: "da14", value: "d2a5" },
          { label: "5dfe", value: "4b93" },
          { label: "797e", value: "10ed" },
          { label: "f494", value: "e89e" },
          { label: "292b", value: "f3fe" },
          { label: "d960", value: "24bf" },
          { label: "d534", value: "35f2" },
          { label: "3a81", value: "80af" },
          { label: "f041", value: "2776" },
          { label: "d41c", value: "2141" },
          { label: "1687", value: "1db4" },
          { label: "d24a", value: "60bd" },
          { label: "9b48", value: "fdf4" },
          { label: "7888", value: "4327" },
          { label: "1bba", value: "ff46" },
          { label: "f2e2", value: "8946" },
          { label: "2511", value: "eeda" },
          { label: "a753", value: "5d45" },
          { label: "829c", value: "8969" },
          { label: "4d9d", value: "819a" },
          { label: "2118", value: "7c2e" },
          { label: "a0bc", value: "09b2" },
          { label: "0f7f", value: "3eb4" },
          { label: "aedd", value: "fc8a" },
          { label: "5636", value: "76ac" },
          { label: "8ca8", value: "1581" },
          { label: "c8b2", value: "218b" },
          { label: "d2c0", value: "381f" },
          { label: "3e07", value: "463d" },
          { label: "87d6", value: "bfd8" },
          { label: "0608", value: "ca56" },
          { label: "b31b", value: "d80f" },
          { label: "203b", value: "72d0" },
          { label: "f85a", value: "e02f" },
          { label: "8b7c", value: "a407" },
          { label: "08cd", value: "34b8" },
          { label: "0e15", value: "921a" },
          { label: "a605", value: "4114" },
          { label: "9357", value: "f633" },
          { label: "3027", value: "73ed" },
          { label: "2d51", value: "121c" },
          { label: "68d2", value: "83b2" },
          { label: "12f5", value: "4b0b" },
          { label: "3b5c", value: "5536" },
          { label: "b2fb", value: "ebc0" },
          { label: "ff93", value: "d3c4" },
          { label: "2aec", value: "16d3" },
          { label: "8065", value: "6a41" },
          { label: "66de", value: "7009" },
          { label: "d58b", value: "6980" },
          { label: "6bb0", value: "c6be" },
          { label: "f126", value: "f966" },
          { label: "94ce", value: "604c" },
          { label: "6146", value: "1399" },
          { label: "12a8", value: "c802" },
          { label: "f820", value: "9ffd" },
          { label: "87e4", value: "e25b" },
          { label: "aa95", value: "2a13" },
          { label: "af8c", value: "e17f" },
          { label: "5eed", value: "fa0b" },
          { label: "a16c", value: "33fd" },
          { label: "a94b", value: "3e5f" },
          { label: "e62e", value: "e579" },
          { label: "c59f", value: "46cf" },
          { label: "7710", value: "c4b5" },
          { label: "78de", value: "bf2d" },
          { label: "8a00", value: "1fed" },
          { label: "dd51", value: "bae8" },
          { label: "7947", value: "899f" },
          { label: "c6a8", value: "51b2" },
          { label: "cb7a", value: "484d" },
          { label: "4b14", value: "1cbe" },
          { label: "de6a", value: "2ab7" },
          { label: "bd55", value: "f925" },
          { label: "2fa6", value: "f1ca" },
          { label: "2912", value: "ce2e" },
          { label: "0a39", value: "a58b" },
          { label: "6a6d", value: "df38" },
          { label: "5e0a", value: "515f" },
          { label: "eed5", value: "8a18" },
          { label: "634d", value: "afb4" },
          { label: "c385", value: "d02d" },
          { label: "96fe", value: "27ac" },
          { label: "ec1f", value: "29cf" },
          { label: "af4f", value: "5dc3" },
          { label: "86e4", value: "cbcc" },
          { label: "2228", value: "1ffb" },
          { label: "3a93", value: "45ad" },
          { label: "4658", value: "802c" },
          { label: "e617", value: "d7aa" },
          { label: "1978", value: "0dd6" },
          { label: "6311", value: "6e51" },
          { label: "30cc", value: "89d0" },
          { label: "f056", value: "fcb8" },
          { label: "acff", value: "8bd5" },
          { label: "033e", value: "c3f4" },
          { label: "ce8f", value: "4590" },
          { label: "28e2", value: "2aaa" },
          { label: "ac9c", value: "5119" },
          { label: "35d7", value: "9f4a" },
          { label: "c990", value: "c4ba" },
          { label: "92a3", value: "f80d" },
          { label: "402c", value: "dce9" },
          { label: "5588", value: "6763" },
          { label: "26b5", value: "fa3f" },
          { label: "925b", value: "da7d" },
          { label: "38ca", value: "21e7" },
          { label: "a82e", value: "265e" },
          { label: "fcfb", value: "8dca" },
          { label: "e214", value: "e14a" },
          { label: "8fe0", value: "bd50" },
          { label: "721b", value: "0b7c" },
          { label: "9e1b", value: "e3a9" },
          { label: "d160", value: "65d6" },
          { label: "5a16", value: "5f72" },
          { label: "0039", value: "46fd" },
          { label: "2cc2", value: "f7e8" },
          { label: "a894", value: "02fe" },
          { label: "bd00", value: "4339" },
          { label: "6723", value: "202a" },
          { label: "e473", value: "2d96" },
          { label: "5f61", value: "bc6a" },
          { label: "cdb8", value: "1b5a" },
          { label: "46ae", value: "be5b" },
          { label: "8e81", value: "6489" },
          { label: "be04", value: "7903" },
          { label: "d1f6", value: "e5aa" },
          { label: "d8a6", value: "cc76" },
          { label: "ca62", value: "034f" },
          { label: "86de", value: "4048" },
          { label: "a86b", value: "72ad" },
          { label: "7116", value: "a4ae" },
          { label: "9508", value: "5388" },
          { label: "f8b6", value: "6bf8" },
          { label: "bb9b", value: "fcfd" },
          { label: "2552", value: "9039" },
          { label: "3fee", value: "9385" },
          { label: "d825", value: "d055" },
          { label: "b8f7", value: "da59" },
          { label: "30f9", value: "b89e" },
          { label: "b617", value: "c402" },
          { label: "22a0", value: "d622" },
          { label: "99b6", value: "4e26" },
          { label: "b6ee", value: "f1e3" },
          { label: "2a66", value: "666a" },
          { label: "3f42", value: "7b7d" },
          { label: "8d4e", value: "2221" },
          { label: "0314", value: "93c8" },
          { label: "c7bc", value: "4b0b" },
          { label: "10f3", value: "c70c" },
          { label: "1db7", value: "fc91" },
          { label: "9b8e", value: "5051" },
          { label: "715a", value: "feae" },
          { label: "93c1", value: "d60a" },
          { label: "9a22", value: "0dea" },
          { label: "77d2", value: "69db" },
          { label: "0f5b", value: "e0b9" },
          { label: "0318", value: "7762" },
          { label: "519f", value: "da21" },
          { label: "0ac9", value: "a2fb" },
          { label: "da0e", value: "86de" },
          { label: "d1dc", value: "736a" },
          { label: "84e0", value: "ad43" },
          { label: "794a", value: "2a2a" },
          { label: "2d8e", value: "f8f5" },
          { label: "cca5", value: "e7bb" },
          { label: "6862", value: "e516" },
          { label: "da04", value: "6419" },
          { label: "e5f0", value: "7939" },
          { label: "a6a6", value: "752c" },
          { label: "a118", value: "6d74" },
          { label: "c3cb", value: "cb18" },
          { label: "531f", value: "bdfc" },
          { label: "716f", value: "bec8" },
          { label: "ecc7", value: "092f" },
          { label: "3fb8", value: "5626" },
          { label: "5a05", value: "1c4b" },
          { label: "4479", value: "43fb" },
          { label: "c877", value: "b4b4" },
          { label: "b9de", value: "69dc" },
          { label: "d835", value: "eb70" },
          { label: "ba50", value: "ec00" },
          { label: "87a9", value: "a885" },
          { label: "161d", value: "8ad6" },
          { label: "e244", value: "30fd" },
          { label: "f0c8", value: "f0db" },
          { label: "5989", value: "7479" },
          { label: "4101", value: "02df" },
          { label: "938d", value: "3b71" },
          { label: "d6b5", value: "607b" },
          { label: "8c23", value: "327b" },
          { label: "52fd", value: "22c7" },
          { label: "a88f", value: "cdbb" },
          { label: "aca5", value: "b49d" },
          { label: "4853", value: "50f0" },
          { label: "7730", value: "0091" },
          { label: "e49d", value: "ca65" },
          { label: "3dd3", value: "bfec" },
          { label: "6bee", value: "66d1" },
          { label: "9f8e", value: "235d" },
          { label: "2ea2", value: "ff54" },
          { label: "73e1", value: "1998" },
          { label: "945a", value: "03c7" },
          { label: "7851", value: "79e8" },
          { label: "f191", value: "31c9" },
          { label: "83b2", value: "22e8" },
          { label: "8e2b", value: "2547" },
          { label: "13c9", value: "d0e2" },
          { label: "18ec", value: "1b73" },
          { label: "98bc", value: "dca4" },
          { label: "fc68", value: "d9dd" },
          { label: "6cac", value: "5c01" },
          { label: "0bbd", value: "5c13" },
          { label: "7ae0", value: "b330" },
          { label: "85ec", value: "2ca7" },
          { label: "4beb", value: "696f" },
          { label: "0ce5", value: "0635" },
          { label: "80c2", value: "023e" },
          { label: "7fae", value: "3eaf" },
          { label: "e4b7", value: "e6d7" },
          { label: "b41c", value: "455a" },
          { label: "5eba", value: "4ffc" },
          { label: "fe60", value: "68e9" },
          { label: "08bc", value: "716b" },
          { label: "8898", value: "2b9b" },
          { label: "7f64", value: "e212" },
          { label: "3c73", value: "012f" },
          { label: "d440", value: "3f5c" },
          { label: "c8a3", value: "f2db" },
          { label: "21f3", value: "06c8" },
          { label: "f644", value: "33e7" },
          { label: "88a2", value: "e6c3" },
          { label: "07a2", value: "622a" },
          { label: "f507", value: "9d6a" },
          { label: "32bc", value: "7cc1" },
          { label: "5739", value: "d6b8" },
          { label: "1e99", value: "ddd1" },
          { label: "da51", value: "bcd5" },
          { label: "d05a", value: "98c4" },
          { label: "a127", value: "7543" },
          { label: "7e0e", value: "c983" },
          { label: "78e1", value: "72c1" },
          { label: "6688", value: "dac8" },
          { label: "eba5", value: "b26e" },
          { label: "22fe", value: "4c83" },
          { label: "1fcc", value: "9398" },
          { label: "dbec", value: "9063" },
          { label: "aa66", value: "9067" },
          { label: "8cca", value: "cca9" },
          { label: "6e55", value: "f4ce" },
          { label: "455e", value: "fb9d" },
          { label: "5f54", value: "766b" },
          { label: "7e44", value: "d252" },
          { label: "9a5c", value: "a761" },
          { label: "6be8", value: "0caf" },
          { label: "a157", value: "c369" },
          { label: "2c13", value: "ef1d" },
          { label: "6fc7", value: "182d" },
          { label: "8877", value: "1174" },
          { label: "a8b4", value: "6b98" },
          { label: "c9c6", value: "b077" },
          { label: "a1d5", value: "20b4" },
          { label: "fc66", value: "3fba" },
          { label: "a138", value: "9193" },
          { label: "968d", value: "2766" },
          { label: "14ac", value: "48a7" },
          { label: "79e4", value: "58d1" },
          { label: "30d8", value: "5f79" },
          { label: "8e82", value: "8c57" },
          { label: "cc00", value: "8de6" },
          { label: "1e7a", value: "1148" },
          { label: "583f", value: "07d0" },
          { label: "1212", value: "9f52" },
          { label: "ce6b", value: "2b5b" },
          { label: "7f4b", value: "e723" },
          { label: "11c8", value: "3551" },
          { label: "76ec", value: "d42a" },
          { label: "5aea", value: "202b" },
          { label: "36da", value: "b93c" },
          { label: "f922", value: "f485" },
          { label: "d2d9", value: "2b23" },
          { label: "c15e", value: "d73b" },
          { label: "2680", value: "8c67" },
          { label: "8dad", value: "0068" },
          { label: "7c01", value: "c621" },
          { label: "c658", value: "7550" },
          { label: "9625", value: "8302" },
          { label: "adee", value: "2d58" },
          { label: "57a2", value: "89d0" },
          { label: "712e", value: "c837" },
          { label: "5dd5", value: "a021" },
          { label: "2f1f", value: "1df0" },
          { label: "47e9", value: "1a3c" },
          { label: "370f", value: "499b" },
          { label: "3bf8", value: "4be9" },
          { label: "d4fc", value: "e2a3" },
          { label: "8eee", value: "ac0b" },
          { label: "ad07", value: "0d87" },
          { label: "7b50", value: "84b0" },
          { label: "409b", value: "33e5" },
          { label: "a671", value: "9861" },
          { label: "1bc1", value: "4ad1" },
          { label: "d471", value: "c4c4" },
          { label: "f838", value: "f38d" },
          { label: "83ec", value: "6e48" },
          { label: "ea7e", value: "3e4c" },
          { label: "7363", value: "6250" },
          { label: "900a", value: "bc90" },
          { label: "34ed", value: "2dbe" },
          { label: "b73a", value: "a291" },
          { label: "7e72", value: "9fb7" },
          { label: "15f6", value: "e02a" },
          { label: "01db", value: "de53" },
          { label: "92a9", value: "0670" },
          { label: "8050", value: "0b8a" },
          { label: "066c", value: "99d8" },
          { label: "01e4", value: "6bdd" },
          { label: "e43b", value: "a915" },
          { label: "790f", value: "c3e7" },
          { label: "f510", value: "3b6e" },
          { label: "17fe", value: "d6a5" },
          { label: "23cd", value: "03a4" },
          { label: "1e17", value: "f8b2" },
          { label: "1f67", value: "f48d" },
          { label: "cbe0", value: "a0bf" },
          { label: "f6e7", value: "da07" },
          { label: "2123", value: "b5e6" },
          { label: "63dd", value: "b040" },
          { label: "2acd", value: "9852" },
          { label: "a730", value: "25cc" },
          { label: "2241", value: "5238" },
          { label: "c5ad", value: "d257" },
          { label: "d009", value: "88fb" },
          { label: "87ac", value: "b746" },
          { label: "614c", value: "f38b" },
          { label: "90a2", value: "5adf" },
          { label: "f483", value: "80d2" },
          { label: "ffdd", value: "8d18" },
          { label: "e3f3", value: "6004" },
          { label: "8c12", value: "2e78" },
          { label: "d36a", value: "776a" },
          { label: "e23d", value: "a011" },
          { label: "7484", value: "5288" },
          { label: "1d70", value: "6831" },
          { label: "5858", value: "ea2b" },
          { label: "dc42", value: "dee2" },
          { label: "6283", value: "10e3" },
          { label: "3fe8", value: "59a4" },
          { label: "cff2", value: "312c" },
          { label: "2770", value: "eb02" },
          { label: "28d0", value: "bf3e" },
          { label: "bce4", value: "8c71" },
          { label: "e81b", value: "67f2" },
          { label: "d561", value: "b6f4" },
          { label: "4073", value: "138d" },
          { label: "3b3e", value: "e37b" },
          { label: "bb77", value: "e816" },
          { label: "ca8d", value: "64c5" },
          { label: "e5fa", value: "dcab" },
          { label: "7b55", value: "ef9f" },
          { label: "788a", value: "f017" },
          { label: "10f1", value: "0c27" },
          { label: "cfdd", value: "3109" },
          { label: "52e6", value: "5173" },
          { label: "67a9", value: "4be8" },
          { label: "26f1", value: "8700" },
          { label: "fc93", value: "e731" },
          { label: "ead5", value: "7424" },
          { label: "5167", value: "7c81" },
          { label: "d8bc", value: "c0aa" },
          { label: "0cef", value: "b101" },
          { label: "5549", value: "f07d" },
          { label: "11d2", value: "e609" },
          { label: "70e6", value: "6274" },
          { label: "c669", value: "5154" },
          { label: "4e03", value: "5758" },
          { label: "f9f7", value: "c99a" },
          { label: "0896", value: "18c8" },
          { label: "9e77", value: "beb2" },
          { label: "a411", value: "75eb" },
          { label: "2632", value: "7454" },
          { label: "fcfd", value: "6af1" },
          { label: "b987", value: "a132" },
          { label: "8905", value: "2b9a" },
          { label: "69f8", value: "4a77" },
          { label: "ab5c", value: "c90d" },
          { label: "333d", value: "a0b5" },
          { label: "3080", value: "7df9" },
          { label: "431b", value: "89b8" },
          { label: "65af", value: "95c0" },
          { label: "7b8e", value: "064e" },
          { label: "4880", value: "2e30" },
          { label: "8a69", value: "5415" },
          { label: "efdc", value: "1edb" },
          { label: "2a0f", value: "75be" },
          { label: "a97f", value: "abc5" },
          { label: "87a8", value: "b958" },
          { label: "e418", value: "cb13" },
          { label: "91c3", value: "d5bf" },
          { label: "4483", value: "3304" },
          { label: "573f", value: "4871" },
          { label: "5af0", value: "ffee" },
          { label: "ca1c", value: "d4dc" },
          { label: "d012", value: "d801" },
          { label: "9dad", value: "ddf0" },
          { label: "dd89", value: "4caa" },
          { label: "1dcd", value: "886c" },
          { label: "b40a", value: "cdfc" },
          { label: "6737", value: "0465" },
          { label: "df28", value: "f2a0" },
          { label: "5734", value: "0793" },
          { label: "f068", value: "4b9a" },
          { label: "64af", value: "1021" },
          { label: "00c7", value: "90b2" },
          { label: "c0a7", value: "e435" },
          { label: "9abe", value: "cb61" },
          { label: "483c", value: "93de" },
          { label: "8e40", value: "1dc0" },
          { label: "f78c", value: "4829" },
          { label: "02a5", value: "416b" },
          { label: "1109", value: "2ecc" },
          { label: "951e", value: "0db4" },
          { label: "de30", value: "2ee6" },
          { label: "e6ba", value: "4529" },
          { label: "bd39", value: "0156" },
          { label: "7979", value: "d9ab" },
          { label: "7ff4", value: "e675" },
          { label: "8d00", value: "ebe0" },
          { label: "41a9", value: "f82d" },
          { label: "9afb", value: "fda5" },
          { label: "9452", value: "23d2" },
          { label: "59a6", value: "48f3" },
          { label: "2c94", value: "ea5d" },
          { label: "51ce", value: "73eb" },
          { label: "9e7c", value: "3df1" },
          { label: "165c", value: "717d" },
          { label: "e943", value: "7af0" },
          { label: "fe97", value: "9743" },
          { label: "cfd8", value: "c4dc" },
          { label: "1032", value: "079e" },
          { label: "9ea5", value: "7ec4" },
          { label: "2966", value: "8c5f" },
          { label: "d8d1", value: "4530" },
          { label: "7f0a", value: "5065" },
          { label: "424e", value: "58c1" },
          { label: "13f3", value: "06ee" },
          { label: "cdc6", value: "8a56" },
          { label: "c675", value: "7440" },
          { label: "c807", value: "a9a4" },
          { label: "227f", value: "10c6" },
          { label: "b452", value: "25fe" },
          { label: "d1d9", value: "1a74" },
          { label: "d486", value: "0192" },
          { label: "7ada", value: "c92a" },
          { label: "9976", value: "c7da" },
          { label: "e8dd", value: "04e0" },
          { label: "6786", value: "6ea8" },
          { label: "a773", value: "29b8" },
          { label: "4d66", value: "5a5e" },
          { label: "c1f9", value: "5abd" },
          { label: "6f4a", value: "5836" },
          { label: "639f", value: "eb72" },
          { label: "8342", value: "1262" },
          { label: "751e", value: "c9f4" },
          { label: "8d0f", value: "60c2" },
          { label: "812c", value: "d5a5" },
          { label: "1d84", value: "ee2b" },
          { label: "75fc", value: "6ca7" },
          { label: "8729", value: "68c9" },
          { label: "e686", value: "bf27" },
          { label: "850b", value: "cabe" },
          { label: "d07e", value: "9cff" },
          { label: "4dc5", value: "0aac" },
          { label: "a856", value: "d06c" },
          { label: "a20c", value: "1811" },
          { label: "0b40", value: "409e" },
          { label: "1460", value: "284f" },
          { label: "dc76", value: "3fe2" },
          { label: "b8b9", value: "697c" },
          { label: "e717", value: "eb76" },
          { label: "a269", value: "63aa" },
          { label: "ba5c", value: "1d5b" },
          { label: "d684", value: "ebe0" },
          { label: "a73e", value: "935b" },
          { label: "9d9f", value: "1d6e" },
          { label: "4547", value: "15f2" },
          { label: "d011", value: "3b9c" },
          { label: "532d", value: "f843" },
          { label: "4be0", value: "dacf" },
          { label: "7f85", value: "5a3d" },
          { label: "bad2", value: "ebdf" },
          { label: "4c0e", value: "6b58" },
          { label: "77ab", value: "0a28" },
          { label: "00c9", value: "bcc1" },
          { label: "7568", value: "fb27" },
          { label: "89d1", value: "12b8" },
          { label: "655b", value: "9dfe" },
          { label: "6cc7", value: "b19e" },
          { label: "da4c", value: "6dd5" },
          { label: "5424", value: "8071" },
          { label: "7cd8", value: "ed18" },
          { label: "21ec", value: "8d34" },
          { label: "cc1c", value: "2433" },
          { label: "c470", value: "b7b0" },
          { label: "d8ee", value: "80f2" },
          { label: "f3e3", value: "848e" },
          { label: "4e1e", value: "359a" },
          { label: "1fd8", value: "a379" },
          { label: "b161", value: "6e26" },
          { label: "779e", value: "7c66" },
          { label: "af85", value: "3af7" },
          { label: "b01b", value: "4780" },
          { label: "7926", value: "e495" },
          { label: "66c3", value: "0a19" },
          { label: "de39", value: "082d" },
          { label: "6bdc", value: "5e63" },
          { label: "1ed4", value: "10c4" },
          { label: "152a", value: "82f7" },
          { label: "3dbd", value: "c3a3" },
          { label: "24eb", value: "3291" },
          { label: "f2ff", value: "8e57" },
          { label: "d935", value: "8a42" },
          { label: "abe0", value: "6d94" },
          { label: "0d7b", value: "1262" },
          { label: "de89", value: "6e9b" },
          { label: "09a9", value: "c982" },
          { label: "e3a4", value: "7ebe" },
          { label: "71c1", value: "7824" },
          { label: "be31", value: "c711" },
          { label: "4d7b", value: "0377" },
          { label: "78e6", value: "120e" },
          { label: "ea16", value: "6626" },
          { label: "8f18", value: "f529" },
          { label: "9252", value: "8949" },
          { label: "2c47", value: "3cbd" },
          { label: "76f6", value: "6946" },
          { label: "62ee", value: "867d" },
          { label: "ae72", value: "4023" },
          { label: "59fd", value: "d55c" },
          { label: "a644", value: "495f" },
          { label: "b9bc", value: "73c2" },
          { label: "42c8", value: "d949" },
          { label: "5039", value: "0913" },
          { label: "53e1", value: "7b46" },
          { label: "a347", value: "4664" },
          { label: "9c84", value: "9291" },
          { label: "aa25", value: "5a8b" },
          { label: "f700", value: "4382" },
          { label: "eb4b", value: "3ed8" },
          { label: "6ec9", value: "bc68" },
          { label: "feb8", value: "642b" },
          { label: "9e0f", value: "9056" },
          { label: "e3ea", value: "19f2" },
          { label: "73de", value: "c890" },
          { label: "4aec", value: "3c7f" },
          { label: "9a10", value: "7171" },
          { label: "ea67", value: "20b3" },
          { label: "4305", value: "8391" },
          { label: "dd74", value: "0cc0" },
          { label: "d2d1", value: "e33a" },
          { label: "54eb", value: "9ab0" },
          { label: "8807", value: "45bc" },
          { label: "5ac0", value: "d171" },
          { label: "47f5", value: "deb7" },
          { label: "66c1", value: "a991" },
          { label: "b3bc", value: "8da8" },
          { label: "8f74", value: "18b3" },
          { label: "89d1", value: "1b95" },
          { label: "fb72", value: "6936" },
          { label: "20d9", value: "e053" },
          { label: "03b0", value: "9c71" },
          { label: "de68", value: "a034" },
          { label: "6856", value: "5014" },
          { label: "f3f5", value: "1bdc" },
          { label: "502d", value: "3ab1" },
          { label: "c98a", value: "a1dc" },
          { label: "482e", value: "3610" },
          { label: "f93c", value: "8037" },
          { label: "4219", value: "03a9" },
          { label: "f471", value: "ae5b" },
          { label: "b8e4", value: "65e2" },
          { label: "75ff", value: "952c" },
          { label: "f2f7", value: "e120" },
          { label: "4849", value: "6846" },
          { label: "56ac", value: "222e" },
          { label: "b292", value: "69ff" },
          { label: "4092", value: "5e5c" },
          { label: "9f2a", value: "3122" },
          { label: "1069", value: "2b8d" },
          { label: "a319", value: "40cc" },
          { label: "c90d", value: "eb46" },
          { label: "22b5", value: "a933" },
          { label: "9d3e", value: "fd1e" },
          { label: "fd2b", value: "e507" },
          { label: "b873", value: "fd6c" },
          { label: "881d", value: "b43b" },
          { label: "a43c", value: "b773" },
          { label: "85e7", value: "f384" },
          { label: "fac5", value: "f292" },
          { label: "c01a", value: "736c" },
          { label: "d200", value: "b9b6" },
          { label: "be9c", value: "d5eb" },
          { label: "f1df", value: "70f8" },
          { label: "61a8", value: "0f63" },
          { label: "69ab", value: "725b" },
          { label: "8204", value: "3f9f" },
          { label: "cd57", value: "f043" },
          { label: "28a2", value: "3cb5" },
          { label: "7963", value: "384f" },
          { label: "9da1", value: "ff0f" },
          { label: "8b91", value: "317a" },
          { label: "5a6e", value: "6a75" },
          { label: "f4af", value: "eb50" },
          { label: "b9ef", value: "0020" },
          { label: "0084", value: "93ca" },
          { label: "28a2", value: "f2e3" },
          { label: "eed0", value: "876d" },
          { label: "7bfa", value: "18a1" },
          { label: "41ac", value: "32ec" },
          { label: "625e", value: "1fd9" },
          { label: "d422", value: "ef1d" },
          { label: "20c3", value: "c37c" },
          { label: "39de", value: "fa16" },
          { label: "6daa", value: "d2ad" },
          { label: "1b23", value: "718f" },
          { label: "424e", value: "8079" },
          { label: "6ec1", value: "9d79" },
          { label: "8c81", value: "349f" },
          { label: "d771", value: "80d5" },
          { label: "4ef0", value: "39cd" },
          { label: "d4b5", value: "0879" },
          { label: "d239", value: "d611" },
          { label: "8146", value: "8bc6" },
          { label: "c695", value: "6f94" },
          { label: "9f6b", value: "21e8" },
          { label: "f0e0", value: "cdd1" },
          { label: "a00a", value: "315f" },
          { label: "0f78", value: "f8f3" },
          { label: "b92d", value: "50da" },
          { label: "25c2", value: "4450" },
          { label: "c5de", value: "c46e" },
          { label: "5788", value: "7ace" },
          { label: "605a", value: "0670" },
          { label: "fa87", value: "a01c" },
          { label: "ca3e", value: "15a5" },
          { label: "0c4e", value: "332a" },
          { label: "cf41", value: "e48c" },
          { label: "3d79", value: "2944" },
          { label: "99c7", value: "83ef" },
          { label: "8f96", value: "79f9" },
          { label: "69d2", value: "64f3" },
          { label: "55d8", value: "3859" },
          { label: "1863", value: "7f2a" },
          { label: "575c", value: "dabd" },
          { label: "1d6a", value: "5ac5" },
          { label: "b718", value: "9be8" },
          { label: "4931", value: "7da7" },
          { label: "93e0", value: "7527" },
          { label: "0ca6", value: "dee9" },
          { label: "aa5c", value: "e5d6" },
          { label: "0d53", value: "5b63" },
          { label: "0d31", value: "391d" },
          { label: "0491", value: "c554" },
          { label: "7df3", value: "6a25" },
          { label: "8cca", value: "cc06" },
          { label: "2ded", value: "e41b" },
          { label: "2b2b", value: "466b" },
          { label: "c767", value: "65f0" },
          { label: "ae8b", value: "da61" },
          { label: "2ad9", value: "1eae" },
          { label: "b30f", value: "4dc2" },
          { label: "8e10", value: "52f7" },
          { label: "b079", value: "a503" },
          { label: "f8d4", value: "396e" },
          { label: "2daf", value: "6eb8" },
          { label: "1821", value: "81b7" },
          { label: "fc16", value: "5f17" },
          { label: "e0c7", value: "5071" },
          { label: "449b", value: "f3f3" },
          { label: "bf64", value: "1048" },
          { label: "c43b", value: "5678" },
          { label: "7905", value: "7ced" },
          { label: "d7a2", value: "255f" },
          { label: "0add", value: "3e61" },
          { label: "dcf2", value: "b724" },
          { label: "f715", value: "a20f" },
          { label: "d86e", value: "38bf" },
          { label: "e83a", value: "3c06" },
          { label: "c830", value: "b789" },
          { label: "a24b", value: "f24d" },
          { label: "5ab9", value: "0976" },
          { label: "93be", value: "04d1" },
          { label: "ea0a", value: "cbe3" },
          { label: "5f34", value: "4267" },
          { label: "91f8", value: "9d5d" },
          { label: "e77b", value: "2656" },
          { label: "6615", value: "b122" },
          { label: "59b1", value: "49cd" },
          { label: "c5eb", value: "47e9" },
          { label: "0061", value: "a9cb" },
          { label: "0f3a", value: "417e" },
          { label: "4845", value: "0969" },
          { label: "f7c6", value: "5090" },
          { label: "dbbb", value: "9e8b" },
          { label: "c7ff", value: "ae0b" },
          { label: "e1d5", value: "b22c" },
          { label: "b119", value: "7a45" },
          { label: "fd0c", value: "291b" },
          { label: "d270", value: "4c35" },
          { label: "a4c5", value: "bd54" },
          { label: "b2fe", value: "f450" },
          { label: "e219", value: "856a" },
          { label: "d2ab", value: "aa1f" },
          { label: "c1f1", value: "abae" },
          { label: "9257", value: "7322" },
          { label: "2690", value: "d384" },
          { label: "233d", value: "0eb8" },
          { label: "ddd4", value: "ad6d" },
          { label: "15c6", value: "7b40" },
          { label: "a0f1", value: "6595" },
          { label: "47b0", value: "1530" },
          { label: "82cc", value: "8c5f" },
          { label: "d459", value: "f8ae" },
          { label: "d06f", value: "5cac" },
          { label: "1420", value: "92d0" },
          { label: "b100", value: "f9dc" },
          { label: "a049", value: "d2ce" },
          { label: "0b98", value: "848c" },
          { label: "6123", value: "64fa" },
          { label: "9b99", value: "3847" },
          { label: "6d52", value: "45ae" },
          { label: "bee7", value: "7465" },
          { label: "d7c6", value: "d580" },
          { label: "f7a7", value: "d43c" },
          { label: "de77", value: "ad02" },
          { label: "bc8d", value: "13c1" },
          { label: "f478", value: "44a2" },
          { label: "e56f", value: "293d" },
          { label: "12d9", value: "a2d7" },
          { label: "1566", value: "cf0d" },
          { label: "88b4", value: "5ef1" },
          { label: "40c1", value: "d015" },
          { label: "b716", value: "e178" },
          { label: "1d4b", value: "586f" },
          { label: "c958", value: "102c" },
          { label: "7781", value: "6a4d" },
          { label: "b887", value: "5a9f" },
          { label: "99ad", value: "f49b" },
          { label: "1746", value: "3996" },
          { label: "0c80", value: "7d91" },
          { label: "ffdc", value: "3dff" },
          { label: "eebe", value: "911e" },
          { label: "3510", value: "7f94" },
          { label: "b7c2", value: "9e50" },
          { label: "abd1", value: "8c35" },
          { label: "2d27", value: "830b" },
          { label: "3349", value: "a83a" },
          { label: "54a2", value: "eb8e" },
          { label: "dc33", value: "1ae0" },
          { label: "7399", value: "a4f2" },
          { label: "edc4", value: "8b1f" },
          { label: "aa7f", value: "7b4b" },
          { label: "7f96", value: "f757" },
          { label: "edf9", value: "6f1f" },
          { label: "f752", value: "0918" },
          { label: "72a5", value: "1fe8" },
          { label: "7dd2", value: "b372" },
          { label: "33d7", value: "efae" },
          { label: "6a86", value: "fe37" },
          { label: "2aff", value: "1924" },
          { label: "2a3d", value: "1c12" },
          { label: "09b1", value: "9e12" },
          { label: "15cd", value: "f5af" },
          { label: "8a3a", value: "ba2d" },
          { label: "e964", value: "cf1e" },
          { label: "617b", value: "da20" },
          { label: "8e4e", value: "d676" },
          { label: "4cca", value: "e88c" },
          { label: "76d6", value: "2634" },
          { label: "5365", value: "dee7" },
          { label: "606e", value: "e8db" },
          { label: "4751", value: "1de6" },
          { label: "e1f2", value: "c210" },
          { label: "5d03", value: "400a" },
          { label: "1875", value: "fe83" },
          { label: "5ea0", value: "ed51" },
          { label: "523c", value: "06d8" },
          { label: "c459", value: "fa51" },
          { label: "c06b", value: "e9e5" },
          { label: "e085", value: "583d" },
          { label: "e1cd", value: "d2e6" },
          { label: "1213", value: "a5e7" },
          { label: "b17b", value: "9cf4" },
          { label: "a4cd", value: "3d00" },
          { label: "d8fe", value: "2c29" },
          { label: "9fc5", value: "966c" },
          { label: "5e6e", value: "a285" },
          { label: "e22a", value: "a084" },
          { label: "b665", value: "9e8a" },
          { label: "1f8f", value: "90ce" },
          { label: "c7a6", value: "8f24" },
          { label: "5ead", value: "455c" },
          { label: "aa78", value: "8293" },
          { label: "3f10", value: "d56f" },
          { label: "e398", value: "cdd0" },
          { label: "5813", value: "bb49" },
          { label: "8252", value: "8ea7" },
          { label: "e45e", value: "1f0b" },
          { label: "8daf", value: "8480" },
          { label: "4c0a", value: "af0a" },
          { label: "3973", value: "649d" },
          { label: "ee96", value: "6967" },
          { label: "e726", value: "4df1" },
          { label: "38d1", value: "8d50" },
          { label: "ed76", value: "e521" },
          { label: "a25b", value: "435c" },
          { label: "dbb9", value: "cac9" },
          { label: "0d42", value: "4fc4" },
          { label: "e877", value: "9a49" },
          { label: "35dd", value: "8a2e" },
          { label: "703f", value: "fab7" },
          { label: "80ea", value: "0500" },
          { label: "5040", value: "4d35" },
          { label: "08c6", value: "4e42" },
          { label: "dce0", value: "77b8" },
          { label: "125a", value: "b652" },
          { label: "c32e", value: "50a7" },
          { label: "6ec2", value: "9cc7" },
          { label: "4afb", value: "1192" },
          { label: "290f", value: "d558" },
          { label: "1da8", value: "94fd" },
          { label: "0834", value: "8fb9" },
          { label: "760f", value: "2100" },
          { label: "7aac", value: "cc93" },
          { label: "92bf", value: "0f4b" },
          { label: "91e2", value: "2bda" },
          { label: "7104", value: "3f95" },
        ],
      });
    }

    setTimeout(returnOptions, 1);
  }
);

app.post(
  "/ifttt/v1/actions/action_success",
  middleware.accessTokenCheck,
  (req, res) => {
    console.log("action_success", req.body);
    res.status(200).send({
      data: [
        {
          id: helpers.generateUniqueId(),
        },
      ],
    });
  }
);

app.post(
  "/ifttt/v1/actions/action_sent_multi_checkbox",
  middleware.accessTokenCheck,
  (req, res) => {
    //console.log("action_sent_multi_checkbox", JSON.stringify(req.body));
    res.status(200).send({
      data: [
        {
          id: helpers.generateUniqueId(),
        },
      ],
    });
  }
);

app.post(
  "/ifttt/v1/actions/action_with_static_fields",
  middleware.accessTokenCheck,
  (req, res) => {
    //console.log("action_with_static_fields", JSON.stringify(req.body));
    res.status(200).send({
      data: [
        {
          id: helpers.generateUniqueId(),
        },
      ],
    });
  }
);

app.post(
  "/ifttt/v1/actions/action_with_dynamic_checkbox_field",
  middleware.accessTokenCheck,
  (req, res) => {
    console.log("action_with_dynamic_checkbox_field", JSON.stringify(req.body));
    res.status(200).send({
      data: [
        {
          id: helpers.generateUniqueId(),
        },
      ],
    });
  }
);

app.post(
  "/ifttt/v1/actions/action_with_checkbox_field",
  middleware.accessTokenCheck,
  (req, res) => {
    res.status(200).send({
      data: [
        {
          id: helpers.generateUniqueId(),
        },
      ],
    });
  }
);

app.post(
  "/ifttt/v1/actions/action_success2",
  middleware.accessTokenCheck,
  (req, res) => {
    res.status(200).send({
      data: [
        {
          id: helpers.generateUniqueId(),
        },
      ],
    });
  }
);

let supported_languages_to = [
  {
    label: "Afrikaans",
    value: "af",
  },
  {
    label: "Albanian",
    value: "sq",
  },
  {
    label: "Amharic",
    value: "am",
  },
  {
    label: "Arabic",
    value: "ar",
  },
  {
    label: "Armenian",
    value: "hy",
  },
  {
    label: "Azerbaijani",
    value: "az",
  },
  {
    label: "Basque",
    value: "eu",
  },
  {
    label: "Belarusian",
    value: "be",
  },
  {
    label: "Bengali",
    value: "bn",
  },
  {
    label: "Bosnian",
    value: "bs",
  },
  {
    label: "Bulgarian",
    value: "bg",
  },
  {
    label: "Catalan",
    value: "ca",
  },
  {
    label: "Cebuano",
    value: "ceb",
  },
  {
    label: "Chinese (Simplified)",
    value: "zh-CN",
  },
  {
    label: "Chinese (Traditional)",
    value: "zh-TW",
  },
  {
    label: "Corsican",
    value: "co",
  },
  {
    label: "Croatian",
    value: "hr",
  },
  {
    label: "Czech",
    value: "cs",
  },
  {
    label: "Danish",
    value: "da",
  },
  {
    label: "Dutch",
    value: "nl",
  },
  {
    label: "English",
    value: "en",
  },
  {
    label: "Esperanto",
    value: "eo",
  },
  {
    label: "Estonian",
    value: "et",
  },
  {
    label: "Finnish",
    value: "fi",
  },
  {
    label: "French",
    value: "fr",
  },
  {
    label: "Frisian",
    value: "fy",
  },
  {
    label: "Galician",
    value: "gl",
  },
  {
    label: "Georgian",
    value: "ka",
  },
  {
    label: "German",
    value: "de",
  },
  {
    label: "Greek",
    value: "el",
  },
  {
    label: "Gujarati",
    value: "gu",
  },
  {
    label: "Haitian Creole",
    value: "ht",
  },
  {
    label: "Hausa",
    value: "ha",
  },
  {
    label: "Hawaiian",
    value: "haw",
  },
  {
    label: "Hebrew",
    value: "he",
  },
  {
    label: "Hindi",
    value: "hi",
  },
  {
    label: "Hmong",
    value: "hmn",
  },
  {
    label: "Hungarian",
    value: "hu",
  },
  {
    label: "Icelandic",
    value: "is",
  },
  {
    label: "Igbo",
    value: "ig",
  },
  {
    label: "Indonesian",
    value: "id",
  },
  {
    label: "Irish",
    value: "ga",
  },
  {
    label: "Italian",
    value: "it",
  },
  {
    label: "Japanese",
    value: "ja",
  },
  {
    label: "Javanese",
    value: "jv",
  },
  {
    label: "Kannada",
    value: "kn",
  },
  {
    label: "Kazakh",
    value: "kk",
  },
  {
    label: "Khmer",
    value: "km",
  },
  {
    label: "Kinyarwanda",
    value: "rw",
  },
  {
    label: "Korean",
    value: "ko",
  },
  {
    label: "Kurdish",
    value: "ku",
  },
  {
    label: "Kyrgyz",
    value: "ky",
  },
  {
    label: "Lao",
    value: "lo",
  },
  {
    label: "Latin",
    value: "la",
  },
  {
    label: "Latvian",
    value: "lv",
  },
  {
    label: "Lithuanian",
    value: "lt",
  },
  {
    label: "Luxembourgish",
    value: "lb",
  },
  {
    label: "Macedonian",
    value: "mk",
  },
  {
    label: "Malagasy",
    value: "mg",
  },
  {
    label: "Malay",
    value: "ms",
  },
  {
    label: "Malayalam",
    value: "ml",
  },
  {
    label: "Maltese",
    value: "mt",
  },
  {
    label: "Maori",
    value: "mi",
  },
  {
    label: "Marathi",
    value: "mr",
  },
  {
    label: "Mongolian",
    value: "mn",
  },
  {
    label: "Myanmar (Burmese)",
    value: "my",
  },
  {
    label: "Nepali",
    value: "ne",
  },
  {
    label: "Norwegian",
    value: "no",
  },
  {
    label: "Nyanja (Chichewa)",
    value: "ny",
  },
  {
    label: "Odia (Oriya)",
    value: "or",
  },
  {
    label: "Pashto",
    value: "ps",
  },
  {
    label: "Persian",
    value: "fa",
  },
  {
    label: "Polish",
    value: "pl",
  },
  {
    label: "Portuguese (Portugal, Brazil)",
    value: "pt",
  },
  {
    label: "Punjabi",
    value: "pa",
  },
  {
    label: "Romanian",
    value: "ro",
  },
  {
    label: "Russian",
    value: "ru",
  },
  {
    label: "Samoan",
    value: "sm",
  },
  {
    label: "Scots Gaelic",
    value: "gd",
  },
  {
    label: "Serbian",
    value: "sr",
  },
  {
    label: "Sesotho",
    value: "st",
  },
  {
    label: "Shona",
    value: "sn",
  },
  {
    label: "Sindhi",
    value: "sd",
  },
  {
    label: "Sinhala (Sinhalese)",
    value: "si",
  },
  {
    label: "Slovak",
    value: "sk",
  },
  {
    label: "Slovenian",
    value: "sl",
  },
  {
    label: "Somali",
    value: "so",
  },
  {
    label: "Spanish",
    value: "es",
  },
  {
    label: "Sundanese",
    value: "su",
  },
  {
    label: "Swahili",
    value: "sw",
  },
  {
    label: "Swedish",
    value: "sv",
  },
  {
    label: "Tagalog (Filipino)",
    value: "tl",
  },
  {
    label: "Tajik",
    value: "tg",
  },
  {
    label: "Tamil",
    value: "ta",
  },
  {
    label: "Tatar",
    value: "tt",
  },
  {
    label: "Telugu",
    value: "te",
  },
  {
    label: "Thai",
    value: "th",
  },
  {
    label: "Turkish",
    value: "tr",
  },
  {
    label: "Turkmen",
    value: "tk",
  },
  {
    label: "Ukrainian",
    value: "uk",
  },
  {
    label: "Urdu",
    value: "ur",
  },
  {
    label: "Uyghur",
    value: "ug",
  },
  {
    label: "Uzbek",
    value: "uz",
  },
  {
    label: "Vietnamese",
    value: "vi",
  },
  {
    label: "Welsh",
    value: "cy",
  },
  {
    label: "Xhosa",
    value: "xh",
  },
  {
    label: "Yiddish",
    value: "yi",
  },
  {
    label: "Yoruba",
    value: "yo",
  },
  {
    label: "Zulu",
    value: "zu",
  },
];

let supported_languages_from = [
  { label: "Automatically detect", value: "auto" },
].concat(supported_languages_to);

app.post(
  "/ifttt/v1/queries/translate/fields/translate_from/options",
  middleware.accessTokenCheck,
  (req, res) => {
    res.status(200).send({
      data: supported_languages_from,
    });
  }
);

app.post(
  "/ifttt/v1/queries/translate/fields/translate_to/options",
  middleware.accessTokenCheck,
  (req, res) => {
    res.status(200).send({
      data: supported_languages_to,
    });
  }
);

// Begin OAuth endpoints (https://ift.tt/3f7p7N2)

// GET /authorize

app.get("/authorize", function (req, res) {
  // Uncomment the next line to reproduce sc-120114 https://app.shortcut.com/ifttt/story/120114
  res.setHeader("Cross-Origin-Opener-Policy", "same-origin");

  if (
    req.query.redirect_uri ==
    "https://ifttt.com/channels/trusty_auth_always_fails/authorize"
  ) {
    res.redirect(
      url.format({
        pathname: req.query.redirect_uri,
        query: {
          client_id: 123, // In production, this should be validated as the Client ID here: https://ift.tt/2zKIiw5
          client_secret: "abc", // In production, this should be validated as the Client Secret here: https://ift.tt/2zKIiw5
          // code: helpers.generateUniqueId(), // An authorization code which IFTTT can exchange for a bearer token (https://ift.tt/2Soss0q)
          state: req.query.state,
        },
      })
    );
  } else if (
    req.query.redirect_uri == "http://ife.ifttt.me/channels/trusty/authorize"
  ) {
    res.redirect(
      url.format({
        pathname: "http://ife.ifttt.me/channels/trusty/authorize",
        query: {
          client_id: 123, // In production, this should be validated as the Client ID here: https://ift.tt/2zKIiw5
          client_secret: "abc", // In production, this should be validated as the Client Secret here: https://ift.tt/2zKIiw5
          code: helpers.generateUniqueId(), // An authorization code which IFTTT can exchange for a bearer token (https://ift.tt/2Soss0q)
          state: req.query.state,
        },
      })
    );
  } else
    res.redirect(
      url.format({
        pathname: req.query.redirect_uri, // Set in the 🔑.env file in this Glitch app.
        query: {
          client_id: 123, // In production, this should be validated as the Client ID here: https://ift.tt/2zKIiw5
          client_secret: "abc", // In production, this should be validated as the Client Secret here: https://ift.tt/2zKIiw5
          code: helpers.generateUniqueId(), // An authorization code which IFTTT can exchange for a bearer token (https://ift.tt/2Soss0q)
          state: req.query.state,
        },
      })
    );
});

// POST /token

app.post("/token", function (req, res) {
  console.log("Token check");

  //   Uncomment below to test authentication failing
  // res.status(401).send({
  //   errors: [
  //     {
  //       message: "Something went wrong!",
  //     },
  //   ],
  // });
  //   Uncomment above to test authentication failing

  if (
    req.query.redirect_uri ==
    "https://ifttt.com/channels/trusty_auth_always_fails/authorize"
  ) {
    res.status(200).send({
      token_type: "Bearer",
      access_token: TEST_ACCESS_TOKEN, // A unique access code for the user (https://ift.tt/2Soss0q)
      refresh_token: helpers.generateUniqueId(), // A refresh token to retrieve a new access token in the future (https://ift.tt/2VNXCAG)
    });
  } else if (
    req.query.redirect_uri == "http://ife.ifttt.me/channels/trusty/authorize"
  ) {
    res.status(200).send({
      token_type: "Bearer",
      access_token: TEST_ACCESS_TOKEN, // A unique access code for the user (https://ift.tt/2Soss0q)
      refresh_token: helpers.generateUniqueId(), // A refresh token to retrieve a new access token in the future (https://ift.tt/2VNXCAG)
    });
  } else {
    res.status(200).send({
      token_type: "Bearer",
      access_token: TEST_ACCESS_TOKEN, // A unique access code for the user (https://ift.tt/2Soss0q)
      refresh_token: helpers.generateUniqueId(), // A refresh token to retrieve a new access token in the future (https://ift.tt/2VNXCAG)
    });
  }
});

// GET //user/info

app.get(
  "/ifttt/v1/user/info",
  middleware.accessTokenCheck,
  function (req, res) {
    const userId = Math.floor(Math.random() * 10000000);
    res.status(200).send({
      data: {
        name: `${faker.person.fullName()} ${
          randomEmoji.random({ count: 1 })[0]["character"]
        }`, // A username, documented here: https://ift.tt/2Sp0SQV
        // id: faker.internet.email(), // A user's ID, documented here: https://ift.tt/2Sp0SQV
        id: `${userId}`,
        url: `https://ifttt.com/${userId}`, // An optional URL where a user's dashboard or where they can configure their account.
      },
    });
  }
);

// End OAuth endpoints

// Begin connection event endpoints (https://ift.tt/3aXacly)

// Enabled webhook (POST /ifttt/v1/webhooks/connection/enabled)

app.post("/ifttt/v1/webhooks/connection/enabled", function (req, res) {
  console.log("/ifttt/v1/webhooks/connection/enabled", req.body);
  res.status(200); // Based on this webhook, you'll know that a specific user has enabled this connection.
});

// Disabled webhook (POST /ifttt/v1/webhooks/connection/disabled)

app.post("/ifttt/v1/webhooks/connection/disabled", function (req, res) {
  console.log("/ifttt/v1/webhooks/connection/disabled", req.body);
  res.status(200); // Based on this webhook, you'll know that a specific user has disabled this connection.
});

// Updated webhook (POST /ifttt/v1/webhooks/connection/updated)

app.post("/ifttt/v1/webhooks/connection/updated", function (req, res) {
  console.log("/ifttt/v1/webhooks/connection/updated", req.body);
  res.status(200); // Based on this webhook, you'll know that a specific user has updated this connection.
});

// End connection event endpoints (https://ift.tt/3aXacly)

// trigger_identity delete endpoint https://platform.ifttt.com/docs/api_reference#trigger-identity
// /ifttt/v1/triggers/{{trigger_slug}}/trigger_identity/{{trigger_identity}}

app.delete("/*", function (req, res) {
  console.log(`Incoming DELETE request to ${req.originalUrl}`);
  res.status(204);
});

// listen for requests :)

app.get("/", (req, res) => {
  res.render("index.ejs");
});

const listener = app.listen(process.env.PORT, function () {});
