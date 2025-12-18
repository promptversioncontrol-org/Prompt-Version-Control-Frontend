import { s3Client } from '../src/shared/lib/s3-client';
import { ListObjectsV2Command } from '@aws-sdk/client-s3';
import dotenv from 'dotenv';

dotenv.config({ path: '.env' });

async function listS3Structure() {
  const bucket = process.env.AWS_BUCKET_NAME;
  if (!bucket) {
    console.error('AWS_BUCKET_NAME not found');
    return;
  }

  console.log(`Listing bucket: ${bucket}`);
  console.log('Prefix: pvc/workspaces/');

  try {
    const command = new ListObjectsV2Command({
      Bucket: bucket,
      Prefix: 'pvc/workspaces/',
      MaxKeys: 20,
    });

    const response = await s3Client.send(command);

    console.log('\n--- Objects Found ---');
    response.Contents?.forEach((obj) => {
      console.log(`[FILE] ${obj.Key} (${obj.Size} bytes)`);
    });

    console.log('\n--- Common Prefixes (Folders) ---');
    response.CommonPrefixes?.forEach((prefix) => {
      console.log(`[DIR]  ${prefix.Prefix}`);
    });
  } catch (error) {
    console.error('Error listing S3:', error);
  }
}

listS3Structure();
