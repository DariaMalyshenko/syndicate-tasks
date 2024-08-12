const AWS = require('aws-sdk');
const { v4: uuidv4 } = require('uuid');

exports.handler = async (event) => {
    console.log('Hello from Lambda');

    const ids = [];
    for (let i = 0; i < 10; i++) {
        ids.push(uuidv4());
    }

    const resultMap = { ids };

    const resultJson = JSON.stringify(resultMap);

    const s3 = new AWS.S3();

    const S3_OBJECT_KEY = new Date().toISOString();

    const inputStream = Buffer.from(resultJson);

    const params = {
        Bucket: 'cmtr-712a8896-uuid-storage-test',
        Key: S3_OBJECT_KEY,
        Body: inputStream,
        Metadata: {
            'ContentLength': Buffer.byteLength(resultJson).toString()
        }
    };

    try {
        await s3.putObject(params).promise();
    } catch (error) {
        console.error('Error uploading to S3:', error);
    }

    return ids;
};
