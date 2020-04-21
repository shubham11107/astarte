import { Accordion, Button, Card, ListGroup } from "react-bootstrap";
import { Images } from "../Images";
import React from "react";

const _ = require("lodash");

function getLocaleFormat(timestamp) {
  const event = new Date(timestamp);
  const locale = window.navigator.language;
  return event.toLocaleString(locale);
}

function listItem(item, index) {
  return (
    <ListGroup.Item
      key={index}
      className="border-0 px-0 py-2 font-weight-normal text-capitalize bg-transparent"
    >
      <span className="pr-2 text-dark font-weight-bold">{item.label}:</span>
      {item.value}
    </ListGroup.Item>
  );
}

function SensorListItem(props) {
  const sensor_items = [
    {
      label: "Sensor Name",
      value: _.get(props.available, "name", props.item)
    },
    {
      label: "Sensor ID",
      value: props.item
    },
    {
      label: "Sampling Period",
      value: _.get(props.sampling, "samplingPeriod", "N/A")
    },
    {
      label: "Last Update",
      value: getLocaleFormat(props.sensorValues[props.item].value.timestamp)
    }
  ];
  return (
    <Card className="main-card border-0 mb-4">
      <Card.Header className="px-3 py-0 bg-white">
        <Accordion.Toggle
          className="text-dark border-0 font-weight-bold text-uppercase w-100 text-left p-0 text-decoration-none"
          as={Button}
          variant="link"
          eventKey={props.item}
        >
          {_.get(props.available, "name", props.item)}
          <img src={Images.down_arrow} alt={"down-arrow"} />
        </Accordion.Toggle>
      </Card.Header>
      <Accordion.Collapse eventKey={props.item}>
        <Card.Body className="p-3">
          <ListGroup className="px-4 py-3 my-2 ">
            {sensor_items.map(listItem)}
            <ListGroup.Item className="temperature-list pt-4 border-0 pb-0 py-2 font-weight-normal bg-transparent text-uppercase">
              <h1>
                {props.sensorValues[props.item].value.value}
                <span className="text-dark">
                  {" "}
                  {_.get(props.available, "unit", "")}
                </span>
              </h1>
            </ListGroup.Item>
          </ListGroup>
        </Card.Body>
      </Accordion.Collapse>
    </Card>
  );
}

export default function SensorItems({
  availableSensors,
  sensorValues,
  sensorSamplingRate
}) {
  return Object.keys(sensorValues).map((item, index) => {
    return (
      <SensorListItem
        key={index}
        item={item}
        sensorValues={sensorValues}
        available={availableSensors[item]}
        sampling={sensorSamplingRate[item]}
      />
    );
  });
}
