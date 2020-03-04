import React, { Component } from "react";
import {
  Accordion,
  Button,
  Col,
  Container,
  FormControl,
  InputGroup,
  Row,
  Spinner
} from "react-bootstrap";
import CredentialsModal from "./CredentialsModal";
import SensorItem from "./SensorItem";

import {
  ApiHandler,
  getAuthToken,
  getEndPoint,
  getRealmName
} from "../apiHandler";

const apiHandler = new ApiHandler();
const _ = require("lodash");

class SensorViewer extends Component {
  state = {
    visible: false,
    deviceID: null,
    data: {},
    availableSensors: {},
    sensorValues: {},
    sensorSamplingRate: {},
    loading: false,
    fetched: false
  };

  isMissingCredentials() {
    return !(getEndPoint() && getAuthToken() && getRealmName());
  }

  componentDidMount() {
    if (this.isMissingCredentials()) this.setState({ visible: true });
  }

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

  handleError(err) {
    if (err.response.status === 403)
      this.setState({ visible: true, loading: false });
    if (err.response.status === 404) {
      this.setState({ loading: false });
      window.confirm("Device ID Invalid");
    }
  }

  handleSubmit = () => {
    const { deviceID } = this.state;
    if (deviceID) {
      this.setState({
        loading: true,
        fetched: false,
        notFound: false
      });
      apiHandler
        .getDevice(deviceID)
        .then(response => this.setInterfaces(response))
        .catch(error => this.handleError(error));
    }
  };

  setInterfaces = res => {
    const id = res.data.id;
    this.setState({
      data: res.data,
      loading: false,
      fetched: true
    });
    apiHandler.getInterfaceById(id, res.availableInterface).then(response => {
      this.setState({ availableSensors: response });
    });
    apiHandler.getInterfaceById(id, res.valueInterface).then(response => {
      this.setState({ sensorValues: response });
    });
    apiHandler
      .getInterfaceById(id, res.samplingRateInterface)
      .then(response => {
        this.setState({ sensorSamplingRate: response });
      });
  };

  render() {
    const {
      visible,
      data,
      availableSensors,
      sensorValues,
      sensorSamplingRate,
      loading,
      fetched
    } = this.state;
    return (
      <Container className="px-0 py-4" fluid>
        <Container>
          <Row>
            <Col xs={12} className="p-0">
              <h5
                className="sensor-main-div text-center text-uppercase
                                font-weight-bold text-white bg-sensor-theme mb-5 px-0 py-3"
              >
                Sensor Viewer
              </h5>
              <Col xs={12} className="sensor-id-search-div px-5 pt-5 pb-4">
                <Row className="main-row col-sm-7 align-items-center mx-auto">
                  <Col sm={2} xs={12} className={"p-0"}>
                    <span className="font-weight-normal">Device ID:</span>
                  </Col>
                  <Col sm={10} xs={12}>
                    <InputGroup>
                      <FormControl
                        placeholder="Enter ID Here"
                        aria-label="Enter ID Here"
                        aria-describedby="basic"
                        className="bg-white font-weight-normal rounded"
                        name="deviceID"
                        onChange={this.handleChange}
                      />
                      <InputGroup.Append className="ml-3">
                        <Button
                          onClick={this.handleSubmit}
                          disabled={loading}
                          className="bg-sensor-theme border-success
                                                        text-uppercase font-weight-normal px-4
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
                            "Submit"
                          )}
                        </Button>
                      </InputGroup.Append>
                    </InputGroup>
                  </Col>
                </Row>
                <Row className="card-main-row mt-5">
                  <Col xs={12} className="device-status-div px-3 pb-4">
                    {fetched ? (
                      <h6 className="m-0 font-weight-bold position-relative">
                        <span
                          className="status-tag rounded-circle d-inline-block mr-2"
                          style={{
                            backgroundColor: `${
                              data.connected ? "#008000" : "#ff0000"
                            }`
                          }}
                        />
                        Device {data.connected ? "Connected" : "Disconnected"}
                      </h6>
                    ) : (
                      ""
                    )}
                  </Col>
                  {!_.isEmpty(availableSensors) &&
                  !_.isEmpty(sensorValues) &&
                  !_.isEmpty(sensorSamplingRate) ? (
                    <Col xs={12}>
                      <Accordion>
                        <SensorItem
                          availableSensors={availableSensors}
                          sensorValues={sensorValues}
                          sensorSamplingRate={sensorSamplingRate}
                        />
                      </Accordion>
                    </Col>
                  ) : (
                    ""
                  )}
                </Row>
              </Col>
            </Col>
          </Row>
        </Container>
        <CredentialsModal
          handleCredentialModal={() => this.handleCredentialModal(false)}
          visible={visible}
        />
      </Container>
    );
  }
}

export default SensorViewer;
