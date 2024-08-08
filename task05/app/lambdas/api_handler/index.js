const AWS = require('aws-sdk');
const { v4: uuidv4 } = require('uuid');

const dynamoDb = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event) => {
    console.log("Event:", event);
    console.log("Body:", event.body);
    const { principalId, content } = JSON.parse(event.body);
    
    const createdAt = new Date().toISOString();
    const id = uuidv4();

    const eventData = {
        id,
        principalId,
        createdAt,
        body: content,
    };

    const params = {
        TableName: 'cmtr-712a8896-Events',
        Item: eventData
    };

    try {
        await dynamoDb.put(params).promise();

        return {
            statusCode: 201,
            body: JSON.stringify({
                statusCode: 201,
                event: eventData
            }),
        };
    } catch (error) {
        console.log(error);
        return {
            statusCode: 500,
            body: JSON.stringify({ 
                statusCode: 500,
                error: 'Could not create event'
            }),
        };
    }
};
