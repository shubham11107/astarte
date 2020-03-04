import React, { Component } from "react";

import { SensorData } from "./SensorData";

function getLocaleFormat(timestamp) {
  const event = new Date(timestamp);
  const locale = window.navigator.language;
  return event.toLocaleString(locale);
}

class SensorDataHandler extends Component {
  state = {
    sensors: {},
    device: {
      connection_type: false
    },
    connected: false,
    alerts: []
  };

  setDeviceStatus = () => {
    const { device, astarte } = this.props;
    astarte.getDeviceDataById(device).then(response => {
      this.setState({ device: { connection_type: response.connected } });
    });
  };

  onInComingData = response => {
    if (response.event === "new_event") {
      const { sensors } = this.state;
      const time = response.payload.timestamp;
      const event = response.payload.event;
      if (event.path) {
        sensors[event.path] = {
          value: event.value,
          // event.path => '/${device_name}/value'
          // name = event.path.split("/")[1]
          name: event.path.split("/")[1],
          timestamp: getLocaleFormat(time)
        };
      }
      this.setState({ sensors });
    }
  };

  onSocketError = () => {
    const { alerts } = this.state;
    alerts.unshift({ type: "info", msg: "An error occurred" });
    this.setState({ alert });
  };

  onSocketClose = () => {
    const { socket, alerts } = this.state;
    socket.disconnect();
    alerts.unshift({ type: "info", msg: "Closed connection to Astarte." });
    this.setState({ alert });
  };

  onSocketOpen = () => {
    const { alerts } = this.state;
    alerts.unshift({ type: "success", msg: "Open connection to Astarte." });
    this.setState({ alert });
  };

  setConnected(value) {
    const { device, astarte } = this.props;
    if (value) {
      astarte.connectSocket({
        device,
        interfaceName: "org.astarte-platform.genericsensors.Values",
        onInComingData: this.onInComingData,
        onOpenConnection: this.onSocketOpen,
        onCloseConnection: this.onSocketClose,
        onErrorConnection: this.onSocketError
      });
    } else {
      astarte.disconnectSocket();
    }
  }

  onConnectHandler() {
    this.setConnected(true);
  }

  onDisconnectHandler() {
    this.setConnected(false);
  }

  componentDidMount() {
    this.onConnectHandler();
    this.setDeviceStatus();
  }

  componentWillUnmount() {
    this.onDisconnectHandler();
  }

  render() {
    const { sensors, device, alerts } = this.state;
    return <SensorData sensors={sensors} device={device} alerts={alerts} />;
  }
}

export default SensorDataHandler;
