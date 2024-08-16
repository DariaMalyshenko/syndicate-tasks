const AWS = require('aws-sdk');
const dynamoDb = new AWS.DynamoDB.DocumentClient();
const cognito = new AWS.CognitoIdentityServiceProvider();
const { v4: uuidv4 } = require('uuid');

const TABLE_TABLE = process.env.table_table;
const RESERVATION_TABLE = process.env.reservation_table;
const CUP_ID = process.env.cup_id;
const CUP_CLIENT_ID = process.env.cup_client_id;

exports.handler = async (event) => {
    console.log("event: ",event);

    const {httpMethod, path} = event;
    console.log("httpMethod:", httpMethod);
    console.log("path: ", path);

  try {
    switch (true) {
      case path === '/signup' && httpMethod === 'POST':
        return handleSignup(event);

      case path === '/signin' && httpMethod === 'POST':
        return handleSignin(event);

      case path === '/tables' && httpMethod === 'GET':
        return handleGetTables(event);

      case path === '/tables' && httpMethod === 'POST':
        return handleCreateTable(event);

      case /^\/tables\/\d+$/.test(path) && httpMethod === 'GET':
        return handleGetTableById(event);

      case path === '/reservations' && httpMethod === 'POST':
        return handleCreateReservation(event);

      case path === '/reservations' && httpMethod === 'GET':
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
    UserPoolId: CUP_ID,
    Username: email,
    UserAttributes: [
      { Name: 'email', Value: email },
      { Name: 'name', Value: `${firstName} ${lastName}` }
    ],
    MessageAction: 'SUPPRESS',
    TemporaryPassword: password
  };

  console.log("event: ", event);


  try {
    await cognito.adminCreateUser(createUserParams).promise();

    const setPasswordParams = {
      UserPoolId: CUP_ID,
      Username: email,
      Password: password,
      Permanent: true
    };

    await cognito.adminSetUserPassword(setPasswordParams).promise();

    console.log("cognito:", cognito);

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
    AuthFlow: 'USER_PASSWORD_AUTH',
    ClientId: CUP_CLIENT_ID,
    AuthParameters: {
      USERNAME: email,
      PASSWORD: password
    }
  };

  console.log("Params when sign in:", params);

  try {
    const authResult = await cognito.initiateAuth(params).promise();

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
    TableName: TABLE_TABLE
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
  const { id, number, places, isVip, minOrder } = JSON.parse(event.body);

  // const id = uuidv4();

  const params = {
    TableName: TABLE_TABLE,
    Item: {
      id: id,
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
  console.log("event:",event);
  console.log("event.pathParameters:", event.pathParameters);
  console.log("event.pathParameters.id:", event.pathParameters.id);

  const params = {
    TableName: TABLE_TABLE,
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

  const reservationId = uuidv4();

  const params = {
    TableName: RESERVATION_TABLE,
    Item: {
      reservationId,
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
    TableName: RESERVATION_TABLE
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
