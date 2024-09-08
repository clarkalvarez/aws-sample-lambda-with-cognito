const AWS = require("aws-sdk");
const dynamoDb = new AWS.DynamoDB.DocumentClient();
const { v4: uuidv4 } = require("uuid");
const TODO_APP_TABLE = process.env.DYNAMODB_TABLE;

module.exports.create = async (event) => {
  try {
    const data = JSON.parse(event.body);
    if (!data.taskName || !data.status) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Invalid input" }),
      };
    }

    const params = {
      TableName: TODO_APP_TABLE,
      Item: {
        id: uuidv4(),
        taskName: data.taskName,
        status: data.status,
      },
    };

    await dynamoDb.put(params).promise();
    return { statusCode: 201, body: JSON.stringify(params.Item) };
  } catch (error) {
    console.log(error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Could not create todo", error }),
    };
  }
};

module.exports.get = async () => {
  try {
    const params = { TableName: TODO_APP_TABLE };

    const result = await dynamoDb.scan(params).promise();

    return { statusCode: 200, body: JSON.stringify(result.Items) };
  } catch (error) {
    console.error("Error fetching todos:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Could not fetch todos", error }),
    };
  }
};
module.exports.update = async (event) => {
  try {
    const data = JSON.parse(event.body);

    if (!data.taskName && !data.status) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          error: "Invalid input: Provide taskName or status to update.",
        }),
      };
    }

    let updateExpression = "SET";
    let expressionAttributeNames = {};
    let expressionAttributeValues = {};

    if (data.taskName) {
      updateExpression += " #taskName = :taskName,";
      expressionAttributeNames["#taskName"] = "taskName";
      expressionAttributeValues[":taskName"] = data.taskName;
    }

    if (data.status) {
      updateExpression += " #status = :status,";
      expressionAttributeNames["#status"] = "status";
      expressionAttributeValues[":status"] = data.status;
    }

    updateExpression = updateExpression.slice(0, -1);

    const params = {
      TableName: TODO_APP_TABLE,
      Key: { id: event.pathParameters.id },
      UpdateExpression: updateExpression,
      ExpressionAttributeNames: expressionAttributeNames,
      ExpressionAttributeValues: expressionAttributeValues,
      ReturnValues: "ALL_NEW",
    };

    const result = await dynamoDb.update(params).promise();
    return { statusCode: 200, body: JSON.stringify(result.Attributes) };
  } catch (error) {
    console.error(error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Could not update todo", error }),
    };
  }
};

module.exports.delete = async (event) => {
  try {
    const params = {
      TableName: TODO_APP_TABLE,
      Key: { id: event.pathParameters.id },
    };

    await dynamoDb.delete(params).promise();
    return {
      statusCode: 200,
      body: JSON.stringify({ message: "Todo deleted" }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Could not delete todo", error }),
    };
  }
};

module.exports.login = async (event) => {
  try {
    const data = JSON.parse(event.body);
    if (!data.username || !data.password) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Invalid input" }),
      };
    }

    const result = await loginUser(data.username, data.password);

    if (result.ChallengeName === "NEW_PASSWORD_REQUIRED") {
      const resultWithNewPassword = await setNewPassword(
        data.username,
        data.password,
        result.Session
      );
      return {
        statusCode: 200,
        body: resultWithNewPassword.IdToken,
      };
    }

    return {
      statusCode: 200,
      body: result.IdToken,
    };
  } catch (error) {
    console.log(error);
    return {
      statusCode: 401,
      body: "Incorrect credentials",
    };
  }
};

async function loginUser(username, password) {
  const clientId = process.env.COGNITO_USER_POOL_CLIENT_ID;
  console.log("clientId", clientId);
  const params = {
    AuthFlow: "USER_PASSWORD_AUTH",
    ClientId: clientId,
    AuthParameters: {
      USERNAME: username,
      PASSWORD: password,
    },
  };

  try {
    const cognito = new AWS.CognitoIdentityServiceProvider({
      region: "us-east-1",
    });
    const result = await cognito.initiateAuth(params).promise();
    console.log("Login successful:", result);

    if (result?.ChallengeName === "NEW_PASSWORD_REQUIRED") {
      return {
        ChallengeName: result.ChallengeName,
        Session: result.Session,
      };
    }

    return {
      IdToken: result.AuthenticationResult.IdToken,
    };
  } catch (error) {
    console.error("Error logging in:", error);
    throw error;
  }
}

async function setNewPassword(username, newPassword, session) {
  const clientId = process.env.COGNITO_USER_POOL_CLIENT_ID;

  if (!username || !newPassword || !session) {
    throw new Error("Missing required parameters");
  }

  const params = {
    ChallengeName: "NEW_PASSWORD_REQUIRED",
    ClientId: clientId,
    ChallengeResponses: {
      USERNAME: username,
      NEW_PASSWORD: newPassword,
    },
    Session: session,
  };

  try {
    const cognito = new AWS.CognitoIdentityServiceProvider({
      region: "us-east-1",
    });
    const result = await cognito.respondToAuthChallenge(params).promise();
    console.log("Password reset successfully:", result);
    return result.AuthenticationResult;
  } catch (error) {
    console.error("Error setting new password:", error);
    throw error;
  }
}
