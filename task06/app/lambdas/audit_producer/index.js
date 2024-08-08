const AWS = require('aws-sdk');
const { v4: uuidv4 } = require('uuid');
const dynamoDB = new AWS.DynamoDB.DocumentClient();
const tableName = 'cmtr-a8f1e17f-Audit-test';

exports.handler = async (event, context) => {
    const table = dynamoDB;

    for (const record of event.Records) {
        if (!record) continue;

        const eventName = record.eventName;
        const newImage = AWS.DynamoDB.Converter.unmarshall(record.dynamodb.NewImage);

        if (eventName === 'INSERT') {
            const itemKey = newImage.key || '';
            const itemValue = newImage.value || '';
            
            const itemMap = {
                key: itemKey,
                value: itemValue
            };

            context.log(itemKey);
            context.log(itemValue);

            const item = {
                id: uuidv4(),
                itemKey: itemKey,
                modificationTime: new Date().toISOString(),
                newValue: itemMap
            };

            await table.put({
                TableName: tableName,
                Item: item
            }).promise();

        } else if (eventName === 'MODIFY') {
            const oldImage = AWS.DynamoDB.Converter.unmarshall(record.dynamodb.OldImage);
            const newKey = newImage.key || '';
            const newValue = newImage.value || '';
            const oldValue = oldImage.value || '';

            const item = {
                id: uuidv4(),
                itemKey: newKey,
                modificationTime: new Date().toISOString(),
                updatedAttribute: 'value',
                oldValue: oldValue,
                newValue: newValue
            };

            await table.put({
                TableName: tableName,
                Item: item
            }).promise();
        }

        context.log(JSON.stringify(record));
    }

    return null;
};
