import { GetObjectCommand } from '@aws-sdk/client-s3';
import { s3Client } from '@/shared/lib/s3-client';

export async function getWorkspaceReport(
  workspaceId: string,
  userId: string,
  date: string,
) {
  const bucket = process.env.AWS_BUCKET_NAME;

  if (!bucket) {
    throw new Error('Missing bucket name');
  }

  // New structure: pvc/workspaces/{workspaceId}/{userId}/{date}/report.json
  const key = `pvc/workspaces/${workspaceId}/${userId}/${date}/report.json`;

  try {
    const response = await s3Client.send(
      new GetObjectCommand({
        Bucket: bucket,
        Key: key,
      }),
    );

    const body = await response.Body?.transformToString();
    return body ? JSON.parse(body) : null;
  } catch (error) {
    console.error(`Failed to fetch report at ${key}:`, error);
    return null;
  }
}
