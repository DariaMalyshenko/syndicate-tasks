const AWS = require('aws-sdk');
const { v4: uuidv4 } = require('uuid');

const dynamoDB = new AWS.DynamoDB.DocumentClient();
const EVENTS_TABLE = 'Events';

exports.handler = async (event) => {
    try {
        const { principalId, content } = JSON.parse(event.body);
        const createdEvent = {
            id: uuidv4(),
            principalId,
            createdAt: new Date().toISOString(),
            body: content
        };
        await dynamoDB.put({
            TableName: EVENTS_TABLE,
            Item: createdEvent
        }).promise();
        return {
            statusCode: 201,
            body: JSON.stringify({
                statusCode: 201,
                event: createdEvent
            })
        };
    } catch (error) {
        console.error('Error saving event to DynamoDB', error);
        return {
            statusCode: 500, 
            body: JSON.stringify({
                statusCode: 500,
                message: 'Internal Server Error',
                error: error.message
            })
        };
    }
};
