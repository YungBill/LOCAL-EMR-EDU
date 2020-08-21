import json
import boto3

codecommit_client = boto3.client('codecommit')
codepipeline_client = boto3.client('codepipeline')

non_essential_files = [
    "readme.md",
    "emr-master/views/layouts/main.handlebars",
]


def lambda_handler(event, context):
    print(event)
    old_commit_id = event["detail"]["oldCommitId"]
    new_commit_id = event["detail"]["commitId"]

    codecommit_response = codecommit_client.get_differences(
        repositoryName="EMR-REPO",
        beforeCommitSpecifier=str(old_commit_id),
        afterCommitSpecifier=str(new_commit_id)
    )

    print(codecommit_response["differences"])

    changes = len(codecommit_response["differences"])
    non_essential_changes = 0

    for difference in codecommit_response["differences"]:
        try:
            file_name = difference["afterBlob"]["path"].lower()

            if file_name in non_essential_files:
                non_essential_changes += 1

        except:
            pass

    if changes != non_essential_changes:
        print("PERFORMING TESTS")
        response = codepipeline_client.start_pipeline_execution(name='EMR-PIPELINE-TESTS')
    else:
        print("SKIPPING TESTS")
        response = codepipeline_client.start_pipeline_execution(name='EMR-PIPELINE-SKIP-TESTS')