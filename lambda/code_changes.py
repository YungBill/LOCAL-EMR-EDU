import json
import boto3

codecommit_client = boto3.client('codecommit')

dynamodb = boto3.resource('dynamodb')
table = dynamodb.Table('EMR-Pipeline-Table')


def lambda_handler(event, context):
    old_commit_id = event["detail"]["oldCommitId"]
    new_commit_id = event["detail"]["commitId"]

    changes = {}

    codecommit_response = codecommit_client.get_differences(
        repositoryName="EMR-REPO",
        beforeCommitSpecifier=str(old_commit_id),
        afterCommitSpecifier=str(new_commit_id)
    )

    for difference in codecommit_response["differences"]:
        try:
            file_name = difference["afterBlob"]["path"]
            changeType = difference["changeType"]

            print(f"{file_name} {changeType}")

            changes[file_name] = changeType

        except:
            pass

    changes = json.dumps(changes)

    response = table.put_item(
        Item={
            "commitId": f"{new_commit_id}",
            "changes": f"{changes}",
            "pipeline_action": f"none"
        }
    )

    print(response)
