const Ajv = require("ajv");

const ajv = new Ajv({ removeAdditional: true, format: "fast" });

export default class Device {
  data = {};
  schema = {
    additionalProperties: false,
    type: "object",
    properties: {
      aliases: { type: "object" },
      connected: { type: "boolean" },
      credentials_inhibited: { type: "boolean" },
      first_credentials_request: { type: "string", format: "date-time" },
      first_registration: { type: "string", format: "date-time" },
      groups: { type: "array" },
      id: { type: "string" },
      introspection: { type: "object" },
      last_connection: { type: "string", format: "date-time" },
      last_credentials_request_ip: { type: "string", format: "ipv4" },
      last_disconnection: { type: "string", format: "date-time" },
      last_seen_ip: { type: "string", format: "ipv4" },
      previous_interfaces: { type: "array" },
      total_received_bytes: { type: "number" },
      total_received_msgs: { type: "number" }
    }
  };

  validate(data) {
    const test = ajv.compile(this.schema);
    return test(data);
  }

  parse(data) {
    const status = this.validate(data);
    if (status) {
      this.data = new Map(Object.entries(data));
      return this;
    }
  }
}
