import json
import boto3

dynamodb = boto3.resource('dynamodb')
table = dynamodb.Table('EMR-Pipeline-Table')

codepipeline_client = boto3.client('codepipeline')


def lambda_handler(event, context):
    body = json.loads(event["body"])
    commitId = body["commitId"]
    action = body["action"]

    print(f"{commitId}:{action}")

    response = table.update_item(
        Key={
            'commitId': f'{commitId}',
        },
        UpdateExpression='SET pipeline_action = :val1',
        ExpressionAttributeValues={
            ':val1': action
        }
    )

    if (response["ResponseMetadata"]["HTTPStatusCode"]):

        if (action == "test"):
            print("PERFORMING TESTS")
            response = codepipeline_client.start_pipeline_execution(name='EMR-PIPELINE-TESTS')
        else:
            print("SKIPPING TESTS")
            response = codepipeline_client.start_pipeline_execution(name='EMR-PIPELINE-SKIP-TESTS')

        return {
            "statusCode": 200
        }

    else:
        return {
            "statusCode": 500
        }
