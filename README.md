# Todo Service

## Description

This project provides a serverless API for managing "Todo" tasks using AWS Lambda, API Gateway, and DynamoDB. It supports CRUD operations and uses AWS Cognito for authentication.

## Getting Started

### Prerequisites

- AWS Account
- Serverless Account
- Node.js and npm
- serverless package (npm install -g serverless)
- AWS CLI

## Deployment

1. Install aws-cli https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html
2. Install the serverless package globally

```
npm install -g serverless
```

3. Add the necessary keys locally using #aws configure command
4. Get the access key id and access key in the aws

- Before doing this steps, make sure the user's role has an Admin Access to avoid some problems in deploying and testing the project
- Go to Aws Dashboard
- Click the dropdown at the top-right of the screen
- Select Security Credentials
- Under #Access keys tab, click Create Access Key
- For the use case, select Local Code
- Tag is optional and can just leave blank
- Download the .csv in case that it will be needed
- Open the csv file and get the Access Key ID and Secret Access Key
- Add the secrets locally by running this command

```
aws configure
```

- Set the Access key id
- Set the Secret access key
- Set the region name in us-east-1
- Set the output format to None

3. Deploy the project

```
serverless deploy
```

4. After the deployment, it will show the routes of the lambda

## Creating Cognito Users

1. Go to the created Cognito User Pool
2. Under User tab, Click create User
3. Select these ff:

- Invitation Message: Don't send an invitation
- User Name: <your_username>
- Email Address: optional
- Phone Number: optional
- Temporary password: Set Password

### APi Documentation

1.Create Todo

Endpoint: /todos
Method: POST
Description: Creates a new todo item.
Bearer: {idToken}
Request Body:

```
{
  "taskName": "Your Task Name",
  "status": "pending"
}
```

Responses:

```
201 Created: Returns the created todo item.
400 Bad Request: If required fields are missing.
500 Internal Server Error: If an error occurs while creating the todo.
```

2.Get Todos

Endpoint: /todos
Method: GET
Bearer: {idToken}
Description: Retrieves all todo items.

Responses:

```
200 OK: Returns all todo items.
500 Internal Server Error: If an error occurs while fetching todos.
```

Note: Make sure the body is empty to avoid errors

3.Update Todo

Endpoint: /todos/{id}
Method: PUT
Bearer: {idToken}
Description: Updates an existing todo item.

Path Parameters:

```
id: The ID of the todo item to be updated.
Request Body:
```

```
{
"taskName": "Updated Task Name",
"status": "Completed"
}
```

Responses:

```
200 OK: Returns the updated todo item.
400 Bad Request: If required fields are missing.
500 Internal Server Error: If an error occurs while updating the todo.
```

4.Delete Todo

Endpoint: /todos/{id}
Method: DELETE
Bearer: {idToken}
Description: Deletes a todo item.

Path Parameters:

```
id: The ID of the todo item to be deleted.
```

Responses:

```
200 OK: If the todo item is successfully deleted.
500 Internal Server Error: If an error occurs while deleting the todo.
```

5.Login

Endpoint: /todos/login
Method: POST
Description: Logs in a user using AWS Cognito and returns token.
Request Body:

```
{
"username": "your_username",
"password": "your_password"
}
```

Note: Create a user in cognito user pool to get in order to have the user's account that will be used in generating token

Responses:

```
200 OK: Returns the token from Cognito.
400 Bad Request: If required fields are missing.
401 Unauthorized: If login credentials are incorrect
```
