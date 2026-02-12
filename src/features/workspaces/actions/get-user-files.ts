'use server';

import { s3Client } from '@/shared/lib/s3-client';
import { ListObjectsV2Command } from '@aws-sdk/client-s3';

export interface FileBrowserItem {
  id: string; // The full key or prefix
  name: string; // Display name
  type: 'folder' | 'file';
  size?: number;
  lastModified?: Date;
}

export async function getUserFiles({
  workspaceId,
  userId,
  prefix = '',
}: {
  workspaceId: string;
  userId: string;
  prefix?: string;
}) {
  const bucket = process.env.AWS_BUCKET_NAME;

  if (!bucket) {
    throw new Error('AWS_BUCKET_NAME is not configured');
  }

  // Base path: pvc/workspaces/{workspaceId}/{userId}/
  // Ensure trailing slash for root prefix
  const rootPath = `pvc/workspaces/${workspaceId}/${userId}/`;

  // Full prefix to search: rootPath + requested sub-path
  // If prefix is provided, it should correspond to relative path from rootPath
  // e.g. prefix="2025-12-08/" -> full search: pvc/workspaces/.../.../2025-12-08/
  const searchPrefix = prefix ? `${rootPath}${prefix}` : rootPath;

  try {
    const response = await s3Client.send(
      new ListObjectsV2Command({
        Bucket: bucket,
        Prefix: searchPrefix,
        Delimiter: '/',
      }),
    );

    const items: FileBrowserItem[] = [];

    // Process Folders (CommonPrefixes)
    if (response.CommonPrefixes) {
      response.CommonPrefixes.forEach((cp) => {
        if (cp.Prefix && cp.Prefix !== searchPrefix) {
          // Extract folder name from prefix
          // e.g. .../2025-12-08/ -> 2025-12-08
          const parts = cp.Prefix.split('/');
          // Last part is empty string due to trailing slash, so take second to last
          const folderName = parts[parts.length - 2];

          items.push({
            id: cp.Prefix,
            name: folderName,
            type: 'folder',
          });
        }
      });
    }

    // Process Files (Contents)
    if (response.Contents) {
      response.Contents.forEach((obj) => {
        if (obj.Key && obj.Key !== searchPrefix) {
          const parts = obj.Key.split('/');
          const fileName = parts[parts.length - 1];

          // Filter out "folder placeholder" objects (empty objects ending in /) if they slipped into Content
          if (fileName) {
            items.push({
              id: obj.Key,
              name: fileName,
              type: 'file',
              size: obj.Size,
              lastModified: obj.LastModified,
            });
          }
        }
      });
    }

    return { success: true, items };
  } catch (error) {
    console.error('Error fetching user files:', error);
    return { success: false, error: 'Failed to fetch files' };
  }
}
