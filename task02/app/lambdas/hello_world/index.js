exports.handler = async (event) => {
    // TODO implement
    const path = event.path;
    const method = event.httpMethod;

    if (path === '/hello' && method === 'GET') {
        return {
            statusCode: 200,
            message: 'Hello from Lambda',
        };
    } else {
        return {
            statusCode: 400,
            message: `Bad request syntax or unsupported method. Request path: ${path}. HTTP method: ${method}`,
        };
    }
};