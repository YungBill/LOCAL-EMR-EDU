import json
import boto3
from boto3.dynamodb.conditions import Key, Attr

dynamodb = boto3.resource('dynamodb')
table = dynamodb.Table('EMR-Pipeline-Status')


def lambda_handler(event, context):
    dynamodb_response = table.scan()

    result = dynamodb_response["Items"]

    return {
        "statusCode": 200,
        "body": json.dumps(result)
    }
