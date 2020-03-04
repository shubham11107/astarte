import React, { Component } from "react";
import {
  Col,
  Container,
  FormControl,
  InputGroup,
  Row,
  Spinner
} from "react-bootstrap";
import CredentialsModal from "./CredentialsModal";
import GraphComponent from "./GraphComponent";
import ApiHandler from "../apiHandler";

const CONSTANT = {
  AVAILABLE_SENSORS: "AvailableSensors",
  VALUES: "Values",
  SAMPLING_RATE: "SamplingRate"
};

class SensorPlotGraph extends Component {
  state = {
    loading: false,
    astarte: null,
    visible: true,
    device: null,
    valueInterfaces: null,
    availableSensors: null,
    sensorValues: null
  };

  componentDidMount() {
    const config = localStorage.AstarteConfig;
    if (config) {
      const astarte = new ApiHandler(JSON.parse(config));
      this.setState({ astarte, visible: false });
    }
  }

  setCredentials = config => {
    const astarte = new ApiHandler(config);
    localStorage.AstarteConfig = JSON.stringify(config);
    this.setState({ astarte, visible: false });
    this.handleCredentialModal(false);
  };

  handleChange = e => {
    e.preventDefault();
    this.setState({ [e.target.name]: e.target.value });
  };

  handleCredentialModal = visible => {
    this.setState({ visible });
    if (!visible) {
      this.handleSubmit();
    }
  };

  handleSubmit = () => {
    const { device, astarte } = this.state;
    if (device) {
      this.setState({ loading: true });
      astarte
        .getDevice(device)
        .then(response => this.setDeviceData(response))
        .catch(error => this.handleError(error));
    }
  };

  handleError = err => {
    if (err.response.status === 403)
      this.setState({ visible: true, loading: false });
    if (err.response.status === 404) {
      this.setState({ loading: false });
      window.confirm("Device ID Invalid");
    }
  };

  setDeviceData(res) {
    const { astarte } = this.state;
    const interfaces = Object.keys(res.introspection);
    const availableIndex = interfaces.findIndex(
      key => key.search(CONSTANT.AVAILABLE_SENSORS) > -1
    );
    const availableInterface = interfaces[availableIndex];
    const valueIndex = interfaces.findIndex(
      key => key.search(CONSTANT.VALUES) > -1
    );
    const valueInterface = interfaces[valueIndex];
    const id = res.id;
    this.setState({
      loading: false,
      valueInterfaces: valueInterface
    });
    astarte.getInterfaceById(id, availableInterface).then(response => {
      this.setState({ availableSensors: response });
    });
    astarte.getInterfaceById(id, valueInterface).then(response => {
      this.setState({ sensorValues: response });
    });
  }

  render() {
    const {
      visible,
      sensorValues,
      loading,
      device,
      availableSensors,
      valueInterfaces,
      astarte
    } = this.state;
    return (
      <Container className="px-0 py-4" fluid>
        <Container>
          <Row>
            <Col xs={12} className="p-0">
              <h5 className="sensor-main-div text-center text-uppercase font-weight-bold text-white bg-sensor-theme mb-5 px-0 py-3">
                Sensor Plot Example
              </h5>
              <Col xs={12} className="sensor-id-search-div px-5 py-5">
                <Row className="main-row col-sm-7 align-items-center mx-auto">
                  <Col sm={2} xs={12} className={"p-0"}>
                    <span className="font-weight-normal">Device ID:</span>
                  </Col>
                  <Col sm={10} xs={12}>
                    <InputGroup>
                      <FormControl
                        placeholder="Enter Device ID Here"
                        aria-label="Enter Device ID Here"
                        aria-describedby="basic"
                        className="bg-white font-weight-normal rounded"
                        name="device"
                        onChange={this.handleChange}
                      />
                      <InputGroup.Append className="ml-3">
                        <button
                          onClick={this.handleSubmit}
                          disabled={loading}
                          className="bg-sensor-theme text-white font-14 text-uppercase font-weight-normal px-4 text-decoration-none rounded"
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
                            "Submit"
                          )}
                        </button>
                      </InputGroup.Append>
                    </InputGroup>
                  </Col>
                </Row>
                <Row className="card-main-row mt-5">
                  <Col xs={12}>
                    {sensorValues
                      ? Object.keys(sensorValues).map((data, index) => (
                          <GraphComponent
                            key={index}
                            device={device}
                            astarte={astarte}
                            interfaces={valueInterfaces}
                            availableSensors={availableSensors[data]}
                            currentSensor={data}
                          />
                        ))
                      : ""}
                  </Col>
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

export default SensorPlotGraph;
