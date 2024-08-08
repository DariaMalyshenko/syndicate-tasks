const AWS = require('aws-sdk');
const { v4: uuidv4 } = require('uuid');
const { formatISO } = require('date-fns');

// Create DynamoDB DocumentClient
const dynamoDB = new AWS.DynamoDB.DocumentClient();
const auditTableName = 'cmtr-a8f1e17f-Audit-test';

exports.handler = async (event, context) => {
    console.log('Received event:', JSON.stringify(event, null, 2));

    for (const record of event.Records) {
        if (!record) {
            continue;
        }

        if (record.eventName === 'INSERT') {
            const image = record.dynamodb.NewImage;
            const key = image.key ? image.key.S : '';
            const value = image.value ? image.value.S : '';

            console.log('Key:', key);
            console.log('Value:', value);

            const item = {
                TableName: auditTableName,
                Item: {
                    id: uuidv4(),
                    itemKey: key,
                    modificationTime: formatISO(new Date()),
                    newValue: {
                        key,
                        value
                    }
                }
            };

            await dynamoDB.put(item).promise();
        } else if (record.eventName === 'MODIFY') {
            const newImage = record.dynamodb.NewImage;
            const newKey = newImage.key ? newImage.key.S : '';
            const newValue = newImage.value ? newImage.value.S : '';

            const oldImage = record.dynamodb.OldImage;
            const oldValue = oldImage.value ? oldImage.value.S : '';

            const item = {
                TableName: auditTableName,
                Item: {
                    id: uuidv4(),
                    itemKey: newKey,
                    modificationTime: formatISO(new Date()),
                    updatedAttribute: 'value',
                    oldValue,
                    newValue
                }
            };

            await dynamoDB.put(item).promise();
        }

        console.log('Processed record:', JSON.stringify(record, null, 2));
    }

    return null;
};
