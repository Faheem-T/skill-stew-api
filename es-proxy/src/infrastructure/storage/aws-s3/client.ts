import { S3Client } from "@aws-sdk/client-s3";

// region and credentials configured through env
// variables
const client = new S3Client({});

export default client;
