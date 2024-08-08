const AWS = require('aws-sdk');
const { v4: uuidv4 } = require('uuid');

// Create a DynamoDB service object
const dynamoDB = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event, context) => {
    console.log("Hello from lambda");

    const principalId = event.principalId;
    const content = event.content;

    console.log(`principalId: ${principalId}`);
    console.log(`content: ${JSON.stringify(content)}`);

    const createdAt = new Date().toISOString();
    const id = uuidv4();

    const params = {
        TableName: "cmtr-712a8896-Events-test",
        Item: {
            id: id,
            principalId: principalId,
            createdAt: createdAt,
            body: content
        }
    };

    try {
        // Save the item in DynamoDB
        await dynamoDB.put(params).promise();

        // Prepare the response
        const eventMap = {
            id: id,
            principalId: principalId,
            createdAt: createdAt,
            body: content
        };

        return {
            statusCode: 201,
            event: eventMap
        };
    } catch (error) {
        console.error("Error saving to DynamoDB", error);
        throw new Error("Error saving to DynamoDB");
    }
};
