exports.handler = async (event) => {
    // TODO implement
    for (const record of event.Records) {
        console.log('Message Body:', record.body);
    }

    const response = {
        statusCode: 200,
        message: 'Hello from Lambda',
    };
    return response;
};
