import {
  DeleteObjectCommand,
  // ListBucketsCommand,
  // ListObjectsV2Command,
  GetObjectCommand,
  PutBucketCorsCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3"
import { getSignedUrl } from "@aws-sdk/s3-request-presigner"

// import { Upload } from "@aws-sdk/lib-storage";
// import fs from "fs";

// Lazy initialization to avoid errors when credentials are missing
let _s3Client: S3Client | null = null
const getS3Client = () => {
  if (!_s3Client) {
    const endpoint = process.env.AWS_ENDPOINT_URL_S3
    const accessKey = process.env.AWS_ACCESS_KEY_ID
    const secretKey = process.env.AWS_SECRET_ACCESS_KEY

    if (!endpoint || !accessKey || !secretKey) {
      throw new Error(
        `AWS config missing: endpoint=${!!endpoint}, key=${!!accessKey}, secret=${!!secretKey}`,
      )
    }
    _s3Client = new S3Client({
      region: process.env.AWS_REGION || "auto",
      endpoint,
      credentials: {
        accessKeyId: accessKey,
        secretAccessKey: secretKey,
      },
    })
  }
  return _s3Client
}

const BUCKET = process.env.AWS_BUCKET || "wild-bird-2039"

// @TODO: confirm production bucket/folder names
const setCors = async () => {
  // not sure if this worked XD
  const input = {
    // PutBucketCorsRequest
    Bucket: BUCKET, // required
    CORSConfiguration: {
      // CORSConfiguration
      CORSRules: [
        // CORSRules // required
        {
          // CORSRule
          // ID: "STRING_VALUE",
          AllowedHeaders: ["*"],
          AllowedMethods: [
            // AllowedMethods // required
            "PUT",
            "DELETE",
          ],
          AllowedOrigins: ["http://localhost:3000"],
          // ExposeHeaders: [ // ExposeHeaders
          //   "STRING_VALUE",
          // ],
          MaxAgeSeconds: 3600,
        },
      ],
    },
  }
  const command = new PutBucketCorsCommand(input)
  const response = await getS3Client().send(command)
  // console.log("SETCORS response: ", response);
  return response
}

export const getImageURL = async (key: string, expiresIn = 900) =>
  await getSignedUrl(
    getS3Client(),
    new GetObjectCommand({
      Bucket: BUCKET,
      Key: `denik/${key}`,
    }),
    { expiresIn },
  )

export const getPutFileUrl = async (key: string) => {
  await setCors()
  return await getSignedUrl(
    getS3Client(),
    new PutObjectCommand({
      Bucket: BUCKET,
      Key: `denik/${key}`,
    }),
    { expiresIn: 3600 },
  )
}

export const removeFileUrl = async (key: string) => {
  await setCors()
  return await getSignedUrl(
    getS3Client(),
    new DeleteObjectCommand({
      Bucket: BUCKET,
      Key: `denik/${key}`,
    }),
    { expiresIn: 3600 },
  )
}

export const getPutPair = async (key: string) => {
  return await Promise.all([getPutFileUrl(key), getImageURL(key)])
}

// Fetch the presigned URL to download an object.
// console.log(
//   await getSignedUrl(
//     S3,
//     new GetObjectCommand({ Bucket: "wild-bird-2039", Key: "bar.txt" }),
//     { expiresIn: 3600 }
//   )
// );

// Fetch the presigned URL to upload an object.
// console.log(
//   await getSignedUrl(
//     S3,
//     new PutObjectCommand({ Bucket: "wild-bird-2039", Key: "bar.txt" }),
//     { expiresIn: 3600 }
//   )
// );

// MULTIPART UPLOAD EXAMPLE:

// async uploadFile(file: Express.Multer.File) {
//   try {
//     const stream = new Readable();
//     stream.push(file.buffer);
//     stream.push(null); // Mark the end of the stream

//     const createMultipartUploadCommand = new CreateMultipartUploadCommand({
//       Bucket: bucketName,
//       Key: file.originalname,
//     });
//     const { UploadId } = await this.s3Client.send(
//       createMultipartUploadCommand,
//     );

//     const parts = [];
//     let partNumber = 0;

//     for await (const chunks of stream) {
//       partNumber++;
//       const uploadPartCommand = new UploadPartCommand({
//         Bucket: bucketName,
//         Key: file.originalname,
//         PartNumber: partNumber,
//         UploadId,
//         Body: String(chunks),
//       });

//       const { ETag } = await this.s3Client.send(uploadPartCommand);
//       console.log(ETag);
//       parts.push({ ETag, PartNumber: partNumber });
//     }
//     const completeMultipartUploadCommand = new CompleteMultipartUploadCommand(
//       {
//         Bucket: bucketName,
//         Key: file.originalname,
//         MultipartUpload: { Parts: parts },
//         UploadId,
//       },
//     );

//     const result = await this.s3Client.send(completeMultipartUploadCommand);
//     return { filename: file.originalname, location: result.Location };
//   } catch (err) {
//     console.log(err);
//     return { message: 'File upload failed' };
//   }
// }
