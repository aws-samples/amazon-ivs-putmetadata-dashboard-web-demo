# PutMetaData Dashboard Demo

## Prerequisites

* Access to AWS Account with permission to create IAM role, DynamoDB, Lambda, API Gateway, S3, and Cloudformation.
* [AWS CLI Version 2](https://docs.aws.amazon.com/cli/latest/userguide/install-cliv2.html)
* [AWS SAM CLI](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/what-is-sam.html)
* AWS-SDK-JS version [2.714.0](https://github.com/aws/aws-sdk-js/blob/master/CHANGELOG.md#27140) or greater for IVS support

## Deploy from your local machine

Before you start, run below command to make sure you're in the correct AWS account and configured.
```
aws configure
```
For additional help on configuring, please see https://docs.aws.amazon.com/cli/latest/userguide/cli-chap-configure.html

### 1. Create an S3 bucket

Navigate up two directories to `/serverless`. Run the following command to create an S3 bucket.

* Replace `<my-bucket-name>` with your bucket name.
* Replace `<my-region>` with your region name.

```
aws s3api create-bucket --bucket <my-bucket-name> --region <my-region> \
--create-bucket-configuration LocationConstraint=<my-region>
```

### 2. Pack template with SAM

```
sam package \
--template-file template.yaml \
--output-template-file packaged.yaml \
--s3-bucket <my-bucket-name>
```
DO NOT run the output from above command, and proceed to the next step.

### 3. Deploy Cloudformation with SAM

Replace `<my-stack-name>` with your stack name.

```
sam deploy \
--template-file packaged.yaml \
--stack-name <my-stack-name> \
--capabilities CAPABILITY_IAM
```
On completion, copy the value of `ApiURL` as you will need it later for your client.

ApiURL example: `https://xxxxxxxxxx.execute-api.us-west-2.amazonaws.com/Prod/`

If you need to retrieve the CloudFormation stack outputs again, run the following command:
```
aws cloudformation describe-stacks \
--stack-name <my-stack-name> --query 'Stacks[].Outputs'
```

### 4. Create an Amazon IVS Channel

Run the following command to create an Amazon IVS Channel for testing. You can skip this step if you already have one or more channels in your account.

Replace `<my-channel-name>` with a channel name.

```
aws ivs create-channel --name <my-channel-name>
```

### 5. Deploy the client app

Go to the [web-ui directory](../web-ui) for instructions on running the client application.

## Clean Up

1. Delete Cloudformation stack:
```
aws cloudformation delete-stack --stack-name <my-stack-name>
```

2. Remove files in S3 bucket
```
aws s3 rm s3://<my-bucket-name> --recursive
```

3. Delete S3 bucket
```
aws s3api delete-bucket --bucket <my-bucket-name> --region <my-region>
```

4. Delete Demo Channel
```
aws ivs delete-channel --name my-channel
```


## Rest API Endpoints

### Create a record

Endpoint: `<ApiURL>`<br />
Method: POST<br />
Content Type: JSON<br />
Payload:
```
{
  "Channel": "My-Channel",
  "Title": "My-Title",
  "Metadata": "My-Metadata"
}
```
Response Code: 200<br />
Response Body:
```
{}
```

### Update a record

Endpoint: `<ApiURL>`<br />
Method: PUT<br />
Content Type: JSON<br />
Payload:
```
{
  "Id": "Record-Id",
  "Channel": "My-Channel",
  "Title": "My-Title",
  "Metadata": "My-Metadata"
}
```
Response Code: 200<br />
Response Body:
```
{
  "Id": "Record-Id",
  "Channel": "My-Channel",
  "Title": "My-Title",
  "Metadata": "{...}",
  "Sent": "Yes/No"
}
```

### Send a record to IVS

Endpoint: `<ApiURL>send`<br />
Method: PUT<br />
Content Type: JSON<br />
Payload:
```
{
  "Id": "Record-Id",
  "Channel": "My-Channel",
  "Title": "My-Title",
  "Metadata": "My-Metadata"
}
```
Response Code: 200<br />
Response Body:
```
{}
```

### Get a List of records

Endpoint: `<ApiURL>`<br />
Method: GET<br />
Content Type: JSON<br />
Response Code: 200<br />
Response Body:
```
[
  {
    "Id": "Record-Id",
    "Channel": "My-Channel",
    "Title": "My-Title",
    "Metadata": "My-Metadata"
  },
  ...
]
```

### Get a List of IVS channels

Endpoint: `<ApiURL>/channels`<br />
Method: GET<br />
Content Type: JSON<br />
Response Code: 200<br />
Response Body:
```
[
  {
    "arn": "Channel-Arn",
    "name": "My-Channel",
    "latencyMode": "LOW",
    "tags": {...}
  },
  ...
]
```

### Get a record by Id

Endpoint: `<ApiURL>?id=xxxxxxxxxxxxxx`<br />
Method: GET<br />
Content Type: JSON<br />
Response: 200
Response Body:
```
[
  {
    "Id": "Record-Id",
    "Channel": "My-Channel",
    "Title": "My-Title",
    "Metadata": "{...}",
    "Sent": "Yes/No"
  }
]
```

### Delete a record

Endpoint: `<ApiURL>?id=xxxxxxxxxxxxxx`<br />
Method: DELETE<br />
Content Type: JSON<br />
Response: 200
Response Body:
```
{}
```
