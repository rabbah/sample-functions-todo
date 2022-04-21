const { StatusCodes, getReasonPhrase } = require('http-status-codes');
const ObjectId = require('mongodb').ObjectID;
const connect = require('./mongodb-client');

async function main(args) {
  try {
    const userId = args.__ow_headers['x-user-id'];
    if (!userId) {
      return {
        error: {
          statusCode: StatusCodes.UNAUTHORIZED,
          body: {
            message: 'user id header required'
          }
        }
      }
    }

    if (!args.id) {
      return {
        error: {
          statusCode: StatusCodes.BAD_REQUEST,
          body: {
            message: 'item id is required'
          }
        }
      }
    }

    const client = await connect();
    const db = await client.db(process.env.DB_DATABASE);
    const tasksCollection = await db.collection('todotasks');

    const res = await tasksCollection.findOneAndUpdate(
      {
        '_id': ObjectId(args.id),
        'user_id': userId,
      },
      {
        $set: {
          content: args.content,
          done: args.done,
        }
      },
      {
        returnNewDocument: true
      }
    );

    const updateItem = res.value;

    return {
      body: {
        task: updateItem
      }
    }
  } catch (error) {
    console.error(error)
    return {
      error: {
        statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
        body: {
          message: getReasonPhrase(StatusCodes.INTERNAL_SERVER_ERROR)
        }
      }
    }
  }
}

exports.main = main;