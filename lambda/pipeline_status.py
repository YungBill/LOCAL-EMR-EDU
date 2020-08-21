import json
import boto3
import uuid

dynamodb = boto3.resource('dynamodb')
table = dynamodb.Table('EMR-Pipeline-Status')


def lambda_handler(event, context):
    # TODO implement

    pipeline = event["detail"]["pipeline"]
    executionId = event["detail"]["execution-id"]
    stage = event["detail"]["stage"]
    action = event["detail"]["action"]
    state = event["detail"]["state"]
    time = event["time"]

    response = table.put_item(
        Item={
            "uuid": f"{uuid.uuid4()}",
            "executionId": f"{executionId}",
            "pipeline": f"{pipeline}",
            "stage": f"{stage}",
            "action": f"{action}",
            "state": f"{state}",
            "time": f"{time}"
        }
    )

    print(response)
