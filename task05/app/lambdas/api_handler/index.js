const AWS = require('aws-sdk');
const { v4: uuidv4 } = require('uuid');

const dynamoDb = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event) => {
        console.log("Event:", JSON.stringify(event, null, 2));
        
        let body;
        if (event.body) {
            body = JSON.parse(event.body);
        } else {
            body = {
                principalId: "10",
                content: { param1: 'value1', param2: 'value2' }
            };
        }
    
        // const { principalId, content } = body;
    
        // const createdAt = new Date().toISOString();
        // const id = uuidv4();

        // const principalIdInt = parseInt(principalId, 10);

    const defaultBody = {
        param1: 'value1', 
        param2: 'value2'
    };
    const defaultPrincipalIdInt = 10;

    // Assign values, using defaults if necessary
    const id = body.id || uuidv4(); // Use a new UUID if not provided
    const principalIdInt = body.principalIdInt !== undefined ? parseInt(body.principalIdInt, 10) : defaultPrincipalIdInt;
    const createdAt = body.createdAt || new Date().toISOString();
    const content = body.body || defaultBody;
    
        const eventData = {
            id,
            principalIdInt,
            createdAt,
            body: content,
        };
    
        const params = {
            TableName: 'cmtr-712a8896-Events',
            Item: eventData
        };
    
        try {
            await dynamoDb.put(params).promise();

            console.log(dynamoDb);
    
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
