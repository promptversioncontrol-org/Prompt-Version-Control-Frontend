import { GetObjectCommand } from '@aws-sdk/client-s3';
import { s3Client } from '@/shared/lib/s3-client';

export async function getWorkspaceReport(
  userId: string,
  workspaceSlug: string,
  date: string,
) {
  const bucket = process.env.AWS_BUCKET_NAME;

  if (!bucket) {
    throw new Error('Missing bucket name');
  }

  const key = `pvc/users/${userId}/workspaces/${workspaceSlug}/${date}/report.json`;
  const response = await s3Client.send(
    new GetObjectCommand({
      Bucket: bucket,
      Key: key,
    }),
  );

  const body = await response.Body?.transformToString();
  return body ? JSON.parse(body) : null;
}
