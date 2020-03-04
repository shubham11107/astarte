import React, { Component } from "react";
import {
  Button,
  Col,
  Container,
  FormControl,
  InputGroup,
  Row,
  Spinner
} from "react-bootstrap";
import CredentialsModal from "./CredentialsModal";
import ApiHandler from "../apiHandler";
import SensorSamplingUpdate from "./SensorSamplingUpdate";

const _ = require("lodash");

class SensorViewer extends Component {
  state = {
    visible: false,
    device: null,
    sensorValues: {},
    sensorSamplingRate: {},
    loading: false,
    astarte: null,
    samplingRateInterface: null
  };

  handleChange = e => {
    e.preventDefault();
    this.setState({ [e.target.name]: e.target.value });
  };

  componentDidMount() {
    const config = localStorage.AstarteConfig;
    if (config) {
      const astarte = new ApiHandler(JSON.parse(config));
      this.setState({ astarte, visible: false });
    } else {
      this.setState({ visible: true });
    }
  }

  handleError(err) {
    if (err.message) {
      this.setState({ loading: false });
      window.confirm(err.message);
    } else if (err.response.status === 403) {
      this.setState({ visible: true, loading: false });
    } else if (err.response.status === 404) {
      this.setState({ loading: false });
      window.confirm("Device ID Invalid");
    }
  }

  handleSubmit = () => {
    const { device, astarte } = this.state;
    if (device) {
      this.setState({ loading: true });
      astarte
        .getDevice(device)
        .then(response => this.validateInterfaces(response))
        .then(response => this.setInterfaces(response))
        .catch(error => this.handleError(error));
    }
  };

  validateInterfaces = device => {
    const mapObject = new Map(Object.entries(device.data.get("introspection")));
    if (
      mapObject.has("org.astarte-platform.genericsensors.AvailableSensors") &&
      mapObject.has("org.astarte-platform.genericsensors.Values") &&
      mapObject.has("org.astarte-platform.genericsensors.SamplingRate")
    ) {
      return device;
    } else {
      return Promise.reject({ message: "Device doesn't have any sensor" });
    }
  };

  setInterfaces = device => {
    const { astarte } = this.state;
    const data = device.data;
    const id = data.get("id");
    const mapObject = new Map(Object.entries(data.get("introspection")));
    for (const [interfaceName] of mapObject) {
      if (interfaceName.search("SamplingRate") > 1) {
        astarte.getInterfaceById(id, interfaceName).then(response => {
          this.setState({
            loading: false,
            device: id,
            samplingRateInterface: interfaceName,
            sensorSamplingRate: response
          });
        });
      } else if (interfaceName.search("Values") > 1) {
        astarte.getInterfaceById(id, interfaceName).then(response => {
          this.setState({ sensorValues: response });
        });
      }
    }
  };

  refreshSamplingRate = (id, interfaces) => {
    const { astarte } = this.state;
    astarte.getInterfaceById(id, interfaces).then(response => {
      this.setState({ sensorSamplingRate: response });
    });
  };

  setCredentials = config => {
    const astarte = new ApiHandler(config);
    localStorage.AstarteConfig = JSON.stringify(config);
    this.setState({ astarte, visible: false });
  };

  render() {
    const {
      visible,
      device,
      sensorValues,
      sensorSamplingRate,
      loading,
      samplingRateInterface,
      astarte
    } = this.state;
    return (
      <Container className="px-0 py-4" fluid>
        <Container>
          <Row>
            <Col xs={12} className="p-0">
              <h5
                className="sensor-main-div text-center text-uppercase
                            text-white bg-sensor-theme mb-5 px-0 py-3"
              >
                <b>Sensor Sampling Viewer</b>
              </h5>
              <Col xs={12} className="sensor-id-search-div px-5 pt-5 pb-4">
                <Row className="main-row col-sm-9 align-items-center mx-auto mb-5">
                  <Col sm={3} xs={12} className={"p-0"}>
                    <label className="my-0">Device ID:</label>
                  </Col>
                  <Col sm={9} xs={12}>
                    <InputGroup>
                      <FormControl
                        placeholder="Enter ID Here"
                        aria-label="Enter ID Here"
                        aria-describedby="basic"
                        className="bg-white rounded"
                        name="device"
                        onChange={this.handleChange}
                      />
                      <InputGroup.Append className="ml-3">
                        <Button
                          onClick={this.handleSubmit}
                          disabled={loading}
                          className="bg-sensor-theme border-success
                                      text-uppercase px-4
                                       text-decoration-none rounded"
                        >
                          {loading ? (
                            <Spinner
                              as="span"
                              animation="border"
                              size="sm"
                              role="status"
                              aria-hidden="true"
                            />
                          ) : (
                            "Show"
                          )}
                        </Button>
                      </InputGroup.Append>
                    </InputGroup>
                  </Col>
                </Row>

                <Row className="card-main-row">
                  {!_.isEmpty(sensorValues) ? (
                    <SensorSamplingUpdate
                      device={device}
                      astarte={astarte}
                      sensorValues={sensorValues}
                      setCredentials={this.setCredentials}
                      samplingRateInterface={samplingRateInterface}
                      refreshSamplingRate={this.refreshSamplingRate}
                      sensorSamplingRate={sensorSamplingRate}
                    />
                  ) : (
                    ""
                  )}
                </Row>
              </Col>
            </Col>
          </Row>
        </Container>
        <CredentialsModal
          setCredentials={this.setCredentials}
          visible={visible}
        />
      </Container>
    );
  }
}

export default SensorViewer;
