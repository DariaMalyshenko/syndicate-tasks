const AWS = require('aws-sdk');
const dynamoDb = new AWS.DynamoDB.DocumentClient();
const cognito = new AWS.CognitoIdentityServiceProvider();
const { v4: uuidv4 } = require('uuid');

exports.handler = async (event) => {
    const path = event.rawPath;
    const method = event.requestContext?.http?.method || event.httpMethod;
    console.log(event);
    console.log(event.requestContext);
    console.log(event.requestContext.http);
    console.log(event.requestContext.http.method);
    console.log(event.httpMethod);

  try {
    switch (true) {
      case path === '/signup' && method === 'POST':
        return handleSignup(event);

      case path === '/signin' && method === 'POST':
        return handleSignin(event);

      case path === '/tables' && method === 'GET':
        return handleGetTables(event);

      case path === '/tables' && method === 'POST':
        return handleCreateTable(event);

      case /^\/tables\/\d+$/.test(path) && method === 'GET':
        return handleGetTableById(event);

      case path === '/reservations' && method === 'POST':
        return handleCreateReservation(event);

      case path === '/reservations' && method === 'GET':
        return handleGetReservations(event);

      default:
        throw new Error('Bad Request');
    }
  } catch (error) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: error.message })
    };
  }
};

const handleSignup = async (event) => {
  const { firstName, lastName, email, password } = JSON.parse(event.body);

  const createUserParams = {
    UserPoolId: process.env.cup_id,
    Username: email,
    UserAttributes: [
      { Name: 'email', Value: email },
      { Name: 'name', Value: `${firstName} ${lastName}` }
    ],
    MessageAction: 'SUPPRESS',
    TemporaryPassword: password
  };

  try {
    await cognito.adminCreateUser(createUserParams).promise();

    const setPasswordParams = {
      UserPoolId: process.env.cup_id,
      Username: email,
      Password: password,
      Permanent: true
    };

    await cognito.adminSetUserPassword(setPasswordParams).promise();

    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'User created successfully with a permanent password' })
    };
  } catch (error) {
    console.error('Signup error:', error);
    return {
      statusCode: 400,
      body: JSON.stringify({ error: error.message })
    };
  }
};

const handleSignin = async (event) => {
  const { email, password } = JSON.parse(event.body);

  const params = {
    AuthFlow: 'ADMIN_NO_SRP_AUTH',
    UserPoolId: process.env.cup_id,
    ClientId: process.env.cup_client_id,
    AuthParameters: {
      USERNAME: email,
      PASSWORD: password
    }
  };

  console.log("Params when sign in:", params);

  try {
    const authResult = await cognito.adminInitiateAuth(params).promise();

    return {
      statusCode: 200,
      body: JSON.stringify({ accessToken: authResult.AuthenticationResult.IdToken })
    };
  } catch (error) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: error.message })
    };
  }
};

const handleGetTables = async () => {
  const params = {
    TableName: 'cmtr-712a8896-Tables-test'
  };

  try {
    const data = await dynamoDb.scan(params).promise();
    return {
      statusCode: 200,
      body: JSON.stringify({ tables: data.Items })
    };
  } catch (error) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: error.message })
    };
  }
};

const handleCreateTable = async (event) => {
  const { number, places, isVip, minOrder } = JSON.parse(event.body);

  const id = uuidv4();

  const params = {
    TableName: 'cmtr-712a8896-Tables-test',
    Item: {
      id,
      number,
      places,
      isVip,
      minOrder
    }
  };

  try {
    await dynamoDb.put(params).promise();
    return {
      statusCode: 200,
      body: JSON.stringify({ id })
    };
  } catch (error) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: error.message })
    };
  }
};

const handleGetTableById = async (event) => {
  const tableId = parseInt(event.pathParameters.id, 10);
  console.log(event);
  console.log(event.pathParameters);
  console.log(event.pathParameters.id);

  const params = {
    TableName: 'cmtr-712a8896-Tables-test',
    Key: {
      id: tableId
    }
  };

  try {
    const data = await dynamoDb.get(params).promise();
    if (!data.Item) {
      return {
        statusCode: 404,
        body: JSON.stringify({ error: 'Table not found' })
      };
    }
    return {
      statusCode: 200,
      body: JSON.stringify(data.Item)
    };
  } catch (error) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: error.message })
    };
  }
};

const handleCreateReservation = async (event) => {
  const { tableNumber, clientName, phoneNumber, date, slotTimeStart, slotTimeEnd } = JSON.parse(event.body);


  const params = {
    TableName: 'cmtr-712a8896-Reservations-test',
    Item: {
      reservationId: id,
      tableNumber,
      clientName,
      phoneNumber,
      date,
      slotTimeStart,
      slotTimeEnd
    }
  };

  try {
    await dynamoDb.put(params).promise();
    return {
      statusCode: 200,
      body: JSON.stringify({ reservationId })
    };
  } catch (error) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: error.message })
    };
  }
};

const handleGetReservations = async () => {
  const params = {
    TableName: 'cmtr-712a8896-Reservations-test'
  };

  try {
    const data = await dynamoDb.scan(params).promise();
    return {
      statusCode: 200,
      body: JSON.stringify({ reservations: data.Items })
    };
  } catch (error) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: error.message })
    };
  }
};
