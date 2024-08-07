exports.handler = async (event) => {
    // TODO implement
    try {
        event.Records.forEach((record) => {
            const snsMessage = record.Sns.Message;
            console.log('SNS Message:', snsMessage);
        });

        return {
            statusCode: 200,
            body: JSON.stringify('Hello Lambda'),
        };
    } catch (error) {
        console.error('Error logging SNS message:', error);
        return {
            statusCode: 400,
            body: JSON.stringify('Error logging SNS message'),
        };
    }
};
