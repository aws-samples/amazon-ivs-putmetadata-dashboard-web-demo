const AWS = require('aws-sdk');
const ddb = new AWS.DynamoDB();
const ivs = new AWS.IVS({
  apiVersion: '2020-07-14',
  region: 'us-west-2' // Must be in one of the supported regions
});
const { METADATAS_TABLE_NAME } = process.env;

const response = {
  "statusCode": 200,
  "headers": {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "OPTIONS,GET,PUT,POST,DELETE",
    "Content-Type": "application/json"
  },
  "body": '',
  "isBase64Encoded": false
};

function uuid() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

exports.create = async(event, context, callback) => {
  console.log("create event:", JSON.stringify(event, null, 2));

  let payload;
  try {
    payload = JSON.parse(event.body);
  } catch (err) {
    console.log("create event > parse payload:", JSON.stringify(err, null, 2));
    response.statusCode = 500;
    response.body = JSON.stringify(err);
    callback(null, response);
    return;
  }

  if (!payload || !payload.channel || !payload.title) {
    console.log("create event > missing required field(s): Must provide channel and title");
    response.statusCode = 400;
    response.body = "Must provide channel and title";
    callback(null, response);
    return;
  }

  try {
    const result = await ddb.putItem({
      TableName: METADATAS_TABLE_NAME,
      Item: {
        'Id': { S: uuid() },
        'Channel': { S: payload.channel },
        'Title': { S: payload.title },
        'Metadata': { S: payload.metadata },
        'CreatedDate': { S: `${Date.now()}` }
      }
    }).promise();

    console.info("create event > result:", result);

    response.statusCode = 201;
    response.body = JSON.stringify(result, '', 2);

    console.info("create event > response:", JSON.stringify(response, null, 2));

    callback(null, response);
  } catch(err) {
    console.info("create event > err:", err, err.stack);
    response.statusCode = 500;
    response.body = err.stack;
    callback(null, response);
    return;
  }
};

exports.update = async(event, context, callback) => {
  console.log("update event:", JSON.stringify(event, null, 2));

  let payload;

  try {
    payload = JSON.parse(event.body);
  } catch (err) {
    console.log("update event > parse payload:", JSON.stringify(err, null, 2));
    response.statusCode = 500;
    response.body = JSON.stringify(err);
    callback(null, response);
    return;
  }

  if (!payload || !payload.id || !payload.channel || !payload.title) {
    console.log("update > missing required fields: Must provide id, channel and title");
    response.statusCode = 400;
    response.body = "Must provide id, channel and title";
    callback(null, response);
    return;
  }

  const params = {
    TableName: METADATAS_TABLE_NAME,
    Key: {
      'Id': {
        S: payload.id
      },
    },
    ExpressionAttributeNames: {
      '#Title': 'Title',
      '#Channel': 'Channel',
      '#Metadata': 'Metadata'
     },
     ExpressionAttributeValues: {
      ':title': {
        S: payload.title
      },
      ':channel': {
        S: payload.channel
      },
      ':metadata': {
        S: payload.metadata
      }
    },
    UpdateExpression: 'SET #Title = :title, #Channel = :channel, #Metadata = :metadata',
    ReturnValues: "ALL_NEW"
  };

  console.info("update event > params:", JSON.stringify(params, null, 2));

  const result = await ddb.updateItem(params).promise();

  console.info("update event > result:", JSON.stringify(result, null, 2));

  const filtered = {
    Id: result.Attributes.Id.S,
    Channel: result.Attributes.Channel.S,
    Title: result.Attributes.Title.S,
    Metadata: result.Attributes.Metadata.S,
    Sent: result.Attributes.Sent ? 'Yes' : 'No'
  };

  response.statusCode = 200;
  response.body = JSON.stringify(filtered, '', 2);

  console.info("update event > response:", JSON.stringify(response, null, 2));

  callback(null, response);
};

exports.get = async(event, context, callback) => {
  console.log("get event:", JSON.stringify(event, null, 2));

  try {

    const params = {
      TableName: METADATAS_TABLE_NAME
    };

    if (event.queryStringParameters && event.queryStringParameters.id) {
      console.log("get event > by Id");

      params.Key = {
        'Id': {
          S: event.queryStringParameters.id
        }
      };

      console.info("get event > by Id > params:", JSON.stringify(params, null, 2));

      const result = await ddb.getItem(params).promise();

      console.info("get event > by Id > result:", JSON.stringify(result, null, 2));

      if (!result.Item) {
        response.statusCode = 200;
        response.body = JSON.stringify({});
        callback(null, response);
        return;
      }

      const filtered = {
        Id: result.Item.Id.S,
        Channel: result.Item.Channel.S,
        Title: result.Item.Title.S,
        Metadata: result.Item.Metadata.S,
        CreatedDate: result.Item.CreatedDate ? result.Item.CreatedDate.S : '',
        Sent: result.Item.Sent ? 'Yes' : 'No'
      };

      response.statusCode = 200;
      response.body = JSON.stringify(filtered, '', 2);

      console.info("get event > by Id > response:", JSON.stringify(response, null, 2));

      callback(null, response);

      return;
    }

    console.log("get event > list");

    console.info("get event > list > params:", JSON.stringify(params, null, 2));

    const result = await ddb.scan(params).promise();

    console.info("get event > list > result:", JSON.stringify(result, null, 2));

    if (!result.Items) {
      response.statusCode = 200;
      response.body = JSON.stringify([]);
      callback(null, response);
      return;
    }

    let filteredItems = [];
    let prop;
    for (prop in result.Items){
      filteredItems.push({
        Id: result.Items[prop].Id.S,
        Channel: result.Items[prop].Channel.S,
        Title: result.Items[prop].Title.S,
        Metadata: result.Items[prop].Metadata.S,
        CreatedDate: result.Items[prop].CreatedDate ? result.Items[prop].CreatedDate.S : '',
        Sent: result.Items[prop].Sent ? 'Yes' : 'No'
      });
    }

    response.statusCode = 200;
    response.body = JSON.stringify(filteredItems, '', 2);

    console.info("get event > list > response:", JSON.stringify(response, null, 2));

    callback(null, response);

  } catch(err) {
    console.info("get event > err:", err, err.stack);
    response.statusCode = 500;
    response.body = err.stack;
    callback(null, response);
  }
};

exports.getChannels = async(event, context, callback) => {
  console.log("getChannels event:", JSON.stringify(event, null, 2));

  const params = {};

  try {
    const result = await ivs.listChannels(params).promise();
    console.info("getChannels event > result:", result);
    response.statusCode = 200;
    response.body = JSON.stringify(result);

    callback(null, response);
  } catch(err) {
    console.info("getChannels event > err:", err, err.stack);
    response.statusCode = 500;
    response.body = err.stack;
    callback(null, response);
  }
};

exports.send = async(event, context, callback) => {
  console.log("send event:", JSON.stringify(event, null, 2));

  let payload;
  try {
    payload = JSON.parse(event.body);
  } catch (err) {
    console.log("send event > parse payload:", JSON.stringify(err, null, 2));
    response.statusCode = 500;
    response.body = JSON.stringify(err);
    callback(null, response);
    return;

  }

  if (!payload || !payload.id || !payload.channelArn || !payload.metadata) {
    console.log("send event > missing required fields: Must provide id, channelArn and metadata");
    response.statusCode = 400;
    response.body = "Must provide id, channelArn and metadata";
    callback(null, response);
    return;
  }

  // Removed whitespaces and line breaks
  let metadata = payload.metadata.replace(/^\s+|\s+$/gm, "") // Trim beginning and ending whitespaces
                                 .replace(/(\r\n|\n|\r)/gm, "") // Removed line breaks
                                 .replace(/\s+/g, " "); // Removes double whitespaces

  // Check size
  let byteLength = Buffer.byteLength(metadata, 'utf8');
  if (byteLength > 1024) {
    console.log("send event > Too big. Must be less than or equal to 1K");
    response.statusCode = 400;
    response.body = "Too big. Must be less than or equal to 1K";
    callback(null, response);
    return;
  }

  let params = {
    channelArn: payload.channelArn,
    metadata: payload.metadata
  };

  try {
    const ivsResult = await ivs.putMetadata(params).promise();
    console.info("send event > ivs putmetadata response:", JSON.stringify(ivsResult, null, 2));

    // Update record - Set Send=Yes
    params = {
      TableName: METADATAS_TABLE_NAME,
      Key: {
        'Id': {
          S: payload.id
        },
      },
      ExpressionAttributeNames: {
        "#Sent": "Sent"
      },
       ExpressionAttributeValues: {
        ":sent": {
          S: 'Yes'
        }
      },
      UpdateExpression: 'SET #Sent = :sent',
      ReturnValues: "ALL_NEW"
    };
    console.info("send event > params:", JSON.stringify(params, null, 2));

    const ddbResult = await ddb.updateItem(params).promise();
    console.info("send event > ddbResult:", JSON.stringify(ddbResult, null, 2));

    response.statusCode = 200;
    response.body = JSON.stringify(ivsResult, '', 2);
    console.info("send event > response:", JSON.stringify(ivsResult, null, 2));

    callback(null, response);

  } catch(err) {
    console.info("send event > err:", err, err.stack);
    response.statusCode = 500;
    response.body = err.stack;
    callback(null, response);
    return;
  }
};

exports.delete = async(event, context, callback) => {
  console.log("delete event:", JSON.stringify(event, null, 2));

  if (!event.queryStringParameters.id) {
    console.log("delete event > missing required fields: Must provide id");
    response.statusCode = 400;
    response.body = "Must provide id";
    callback(null, response);
    return;
  }

  const params = {
    TableName: METADATAS_TABLE_NAME,
    Key: {
      'Id': {
        S: event.queryStringParameters.id
      },
    },
  };
  console.info("delete event > params:", JSON.stringify(params, null, 2));

  const result = await ddb.deleteItem(params).promise();
  console.info("delete event > result:", JSON.stringify(result, null, 2));

  response.statusCode = 200;
  response.body = JSON.stringify(result);
  console.info("delete event > response:", JSON.stringify(response, null, 2));

  callback(null, response);
};
