import json
import boto3
from boto3.dynamodb.conditions import Key, Attr

dynamodb = boto3.resource('dynamodb')
table = dynamodb.Table('EMR-Pipeline-Table')


def lambda_handler(event, context):
    dynamodb_response = table.scan(
        FilterExpression=Attr('pipeline_action').eq('none')
    )

    result = dynamodb_response["Items"][0]

    return {
        "statusCode": 200,
        "body": json.dumps(result)
    }
