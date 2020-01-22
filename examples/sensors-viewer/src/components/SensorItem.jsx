import {Accordion, Button, Card, ListGroup} from "react-bootstrap";
import {Images} from "../Images";
import React from "react";

const _ = require('lodash');
const moment = require('moment');

export default function SensorItem({availableSensors, sensorValues, sensorSamplingRate}) {
    return (
        Object.keys(sensorValues).map((item, index) => {
            const available = availableSensors[item];
            const sampling = sensorSamplingRate[item];
            return <Card key={index} className="main-card border-0 mb-4">
                <Card.Header className="p-3 bg-white">
                    <Accordion.Toggle
                        className="text-dark border-0 font-weight-bold text-uppercase w-100 text-left p-0 text-decoration-none"
                        as={Button} variant="link" eventKey={index}>
                        {_.get(available, 'name', item)}
                        <img src={Images.down_arrow} alt={"down-arrow"}/>
                    </Accordion.Toggle>
                </Card.Header>
                <Accordion.Collapse eventKey={index}>
                    <Card.Body className="p-3">
                        <ListGroup className="px-4 py-3 my-2 ">
                            {available ? <ListGroup.Item
                                className="border-0 px-0 py-2 font-weight-normal text-capitalize bg-transparent ">
                                <span className="pr-2 text-dark font-weight-bold">Sensor Name:</span>
                                {available.name}
                            </ListGroup.Item> : ""}
                            <ListGroup.Item
                                className="border-0 px-0 py-2 font-weight-normal text-capitalize bg-transparent ">
                                <span className="pr-2 text-dark font-weight-bold">Sensor Id:</span>
                                {item}
                            </ListGroup.Item>
                            {sampling ? <ListGroup.Item
                                className="border-0 px-0 py-2 font-weight-normal text-capitalize bg-transparent ">
                                <span className="pr-2 text-dark font-weight-bold">Sampling Period:</span>
                                {`${_.get(sampling, 'samplingPeriod', 'N/A')}`}
                            </ListGroup.Item> : ""}
                            <ListGroup.Item
                                className="border-0 px-0 py-2 font-weight-normal text-capitalize bg-transparent ">
                                <span className="pr-2 text-dark font-weight-bold">Last Update:</span>
                                {moment(sensorValues[item].value.timestamp).format('DD-MM-YYYY, h:mm:ss A')}
                            </ListGroup.Item>
                            <ListGroup.Item
                                className="temperature-list pt-4 border-0 pb-0 py-2 font-weight-normal bg-transparent text-uppercase">
                                <h1>{sensorValues[item].value.value}
                                <span className="text-dark"> {_.get(available, "unit", '')}</span>
                                </h1>
                            </ListGroup.Item>
                        </ListGroup>
                    </Card.Body>
                </Accordion.Collapse>
            </Card>
        })
    );
}
