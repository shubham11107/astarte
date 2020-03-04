import { reverse } from "named-urls";
import axios from "axios";

const ENDPOINT = {
  device_alias: "devices-by-alias/:device_alias/",
  device_id: "devices/:id?",
  interface_by_alias: "devices/:device_alias/interfaces/:interface/",
  interface_by_id: "devices/:device_id/interfaces/:interface/",
  interface_id_path: "devices/:device_id/interfaces/:interface/:sensor_id/:key",
  socket: "appengine/v1/socket"
};

const CONSTANT = {
  ID: "id",
  ALIAS: "alias",
  REALM: "realm",
  TOKEN: "token",
  ENDPOINT: "endpoint",
  WEB_SOCKET: "websocket",
  AVAILABLE_SENSORS: "AvailableSensors",
  VALUES: "Values",
  SAMPLING_RATE: "SamplingRate",
};

export class ApiHandler {
  getDevice(device) {
    const type = this.checkDeviceType(device);
    if (type === CONSTANT.ID) {
      return this.getDeviceDataById(device);
    } else {
      return this.getDeviceDataByAlias(device);
    }
  }

  getHeaders() {
    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getAuthToken()}`
    };
  }

  getAPIUrl(endPoint, params) {
    const path = reverse(ENDPOINT[endPoint], params);
    return getEndPoint() + "appengine/v1/" + getRealmName() + "/" + path;
  }

  getWSUrl() {
    return getWSEndPoint() + ENDPOINT["socket"];
  }

  GET(url, params) {
    return axios.get(url, { headers: this.getHeaders(), params: params });
  }

  PUT(url, params) {
    return axios.put(url, params, { headers: this.getHeaders() });
  }

  checkDeviceType(value) {
    const expression = new RegExp(/[a-z]?[A-Z]?[0-9]?-?_?/i);
    if (value.length === 22) if (expression.test(value)) return CONSTANT.ID;
    return CONSTANT.ALIAS;
  }

  getDeviceDataById(device, params = {}) {
    const URL = this.getAPIUrl("device_id", { id: device });
    return this.GET(URL, params)
      .then(response =>
        Promise.resolve(this.handleDeviceDataInterfaces(response.data.data))
      )
      .catch(err => Promise.reject(err));
  }

  getDeviceDataByAlias(alias, params = {}) {
    const URL = this.getAPIUrl("device_alias", { device_alias: alias });
    return this.GET(URL, params)
      .then(response =>
        Promise.resolve(this.handleDeviceDataInterfaces(response.data.data))
      )
      .catch(err => Promise.reject(err));
  }

  getSensorValueById(id, interfaces, sensor_id, key, params = {}) {
    const URL = this.getAPIUrl("interface_id_path", {
      device_id: id,
      interface: interfaces,
      sensor_id: sensor_id,
      key: key
    });
    return this.GET(URL, params);
  }

  setSensorSamplingById(id, interfaces, sensor_id, key, params = {}) {
    const URL = this.getAPIUrl("interface_id_path", {
      device_id: id,
      interface: interfaces,
      sensor_id: sensor_id,
      key: key
    });
    return this.PUT(URL, params);
  }

  handleDeviceDataInterfaces(data) {
    const interfaces = Object.keys(data.introspection);
    const availableIndex = interfaces.findIndex(
      key => key.search(CONSTANT.AVAILABLE_SENSORS) > -1
    );
    const availableInterface = interfaces[availableIndex];
    const valueIndex = interfaces.findIndex(
      key => key.search(CONSTANT.VALUES) > -1
    );
    const valueInterface = interfaces[valueIndex];
    const samplingRateIndex = interfaces.findIndex(
      key => key.search(CONSTANT.SAMPLING_RATE) > -1
    );
    const samplingRateInterface = interfaces[samplingRateIndex];
    return {
      interfaces,
      availableInterface,
      valueInterface,
      samplingRateInterface,
      data
    };
  }

  getInterfaceById(device_id, interface_id, params = {}) {
    const URL = this.getAPIUrl("interface_by_id", {
      device_id: device_id,
      interface: interface_id
    });
    return this.GET(URL, params).then(response => response.data.data);
  }

  getConnectionTriggerPayload(device) {
    return {
      name: `connectiontrigger-${device}`,
      device_id: device,
      simple_trigger: {
        type: "device_trigger",
        on: "device_connected",
        device_id: device
      }
    };
  }

  getDisconnectionTriggerPayment(device) {
    return {
      name: `disconnectiontrigger-${device}`,
      device_id: device,
      simple_trigger: {
        type: "device_trigger",
        on: "device_disconnected",
        device_id: device
      }
    };
  }

  getValueTriggerPayload(device, value_match_operator = "*", known_value = 0) {
    return {
      name: `valueTrigger-${device}`,
      device_id: device,
      simple_trigger: {
        type: "data_trigger",
        on: "incoming_data",
        interface_name: "org.astarte-platform.genericsensors.Values",
        interface_major: 0,
        match_path: "/*",
        known_value: known_value,
        value_match_operator: value_match_operator
      }
    };
  }
}

// LocalStorage Config

export function setAuthToken(token) {
  localStorage.setItem(CONSTANT.TOKEN, token);
}

export function getAuthToken() {
  return localStorage.getItem(CONSTANT.TOKEN) || undefined;
}

export function setRealmName(realm_name) {
  localStorage.setItem(CONSTANT.REALM, realm_name);
}

export function getRealmName() {
  return localStorage.getItem(CONSTANT.REALM) || undefined;
}

export function setEndPoint(endpoint) {
  localStorage.setItem(CONSTANT.ENDPOINT, endpoint);
}

export function getEndPoint() {
  return localStorage.getItem(CONSTANT.ENDPOINT) || undefined;
}

export function setWSEndPoint(endpoint) {
  localStorage.setItem(CONSTANT.WEB_SOCKET, endpoint);
}

export function getWSEndPoint() {
  return localStorage.getItem(CONSTANT.WEB_SOCKET) || undefined;
}

export function setDeviceID(endpoint) {
  localStorage.setItem(CONSTANT.WEB_SOCKET, endpoint);
}

export function getDeviceID() {
  return localStorage.getItem(CONSTANT.WEB_SOCKET) || undefined;
}
