import urllib3
import boto3


def lambda_handler(event, context):
    client = boto3.client('codepipeline')

    ip = event["CodePipeline.job"]["data"]["actionConfiguration"]["configuration"]["UserParameters"]
    id = event["CodePipeline.job"]["id"]

    http = urllib3.HTTPSConnectionPool(ip, cert_reqs='CERT_NONE', assert_hostname=False, timeout=1)

    try:
        request = http.request("GET", "/")
        response = client.put_job_success_result(jobId=id)

    except:
        print("Not working")
        response = client.put_job_failure_result(
            jobId=id,
            failureDetails={
                'type': 'SystemUnavailable',
                'message': 'Deployment did not reply with a status code 200'
            }
        )
