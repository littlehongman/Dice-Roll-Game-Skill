import * as AWS from 'aws-sdk';
import { DB_NAME } from './util/secret';

// Set the region 
AWS.config.update({ region: 'us-east-1' });

const docClient = new AWS.DynamoDB.DocumentClient();

export const createRecord = async(gameTitle: string, name: string, score: number): Promise<void> => {
  const params: any = {
    TableName: DB_NAME,
    Item: {
      'GameTitle':  gameTitle,
      'Player': name,
      'Score':  score
    }
  };
  
  try {
    await docClient.put(params).promise();
  } catch (err) {
    console.error(err);
    throw err;
  }
}

export const getTopRecords = async() => {

  const params = {
    TableName: DB_NAME,
    IndexName: "GameTitle-Score-index",  // Use Global Secondary Index to get the top 10 scores
    KeyConditionExpression: "GameTitle = :v_title",
    ExpressionAttributeValues: {
      ":v_title": "RollDice"
    },
    ProjectionExpression: "Player, Score",
    ScanIndexForward: false, // true for ascending, false for descending
    Limit: 10
  };

  try {
    const data = await docClient.query(params).promise();
    return data.Items;
  } catch (err) {
    console.error(err);
    throw err;
  }
}