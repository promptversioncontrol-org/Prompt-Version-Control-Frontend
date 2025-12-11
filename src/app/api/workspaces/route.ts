import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/shared/lib/auth';
import { prisma } from '@/shared/lib/prisma';
import { createNewWorkspace } from '@/features/workspaces/services/create-new-workspace';
import type { CreateWorkspaceInput } from '@/features/workspaces/types';
import { createWorkspaceFolder } from '@/features/workspaces/services/setup-folder-aws';
import { s3Client } from '@/shared/lib/s3-client';
import { GetObjectCommand, ListObjectsV2Command } from '@aws-sdk/client-s3';

// nie pamietam do czego to było ale skoro tu jest to mozliwe że jakas funckja jej używa nie dotykać

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;

  const session = await auth.api.getSession({
    headers: request.headers,
  });

  if (!session?.user) {
    return NextResponse.json(
      { error: 'Unauthorized - Please sign in' },
      { status: 401 },
    );
  }

  const workspaceName =
    searchParams.get('workspaceName') ?? searchParams.get('workspacename');
  const date = searchParams.get('date');

  if (!workspaceName) {
    return NextResponse.json(
      { error: 'Missing required query param: workspaceName' },
      { status: 400 },
    );
  }

  const bucket = process.env.AWS_BUCKET_NAME;

  if (!bucket) {
    return NextResponse.json({ error: 'Missing bucket name' }, { status: 500 });
  }

  const basePrefix = `pvc/users/${session.user.id}/workspaces/${workspaceName}/`;

  try {
    if (date) {
      const key = `${basePrefix}${date}/report.json`;
      const response = await s3Client.send(
        new GetObjectCommand({
          Bucket: bucket,
          Key: key,
        }),
      );

      const body = await response.Body?.transformToString();

      return NextResponse.json({
        ok: true,
        userId: session.user.id,
        workspaceName,
        date,
        data: body ? JSON.parse(body) : null,
      });
    }

    const listResponse = await s3Client.send(
      new ListObjectsV2Command({
        Bucket: bucket,
        Prefix: basePrefix,
        Delimiter: '/',
      }),
    );

    const dateFolders =
      listResponse.CommonPrefixes?.map((prefix) =>
        prefix.Prefix?.slice(basePrefix.length).replace(/\/$/, ''),
      ).filter(Boolean) ?? [];

    const reports = await Promise.all(
      dateFolders.map(async (dateFolder) => {
        const key = `${basePrefix}${dateFolder}/report.json`;
        try {
          const response = await s3Client.send(
            new GetObjectCommand({
              Bucket: bucket,
              Key: key,
            }),
          );
          const body = await response.Body?.transformToString();
          return {
            date: dateFolder,
            data: body ? JSON.parse(body) : null,
          };
        } catch (err) {
          const errorMessage =
            err instanceof Error ? err.message : 'Failed to fetch report';
          return {
            date: dateFolder,
            error: errorMessage,
          };
        }
      }),
    );

    return NextResponse.json({
      ok: true,
      userId: session.user.id,
      workspaceName,
      reports,
    });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Failed to fetch workspace json';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized - Please sign in' },
        { status: 401 },
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { username: true },
    });

    if (!user?.username) {
      return NextResponse.json(
        { error: 'Please set your username first' },
        { status: 400 },
      );
    }

    const body = await request.json();

    const workspaceData: CreateWorkspaceInput = {
      name: body.name,
      description: body.description,
      userId: session.user.id,
      contributors: body.contributors,
    };

    const workspace = await createNewWorkspace(workspaceData);

    try {
      await createWorkspaceFolder(session.user.id, workspace.slug);
      console.log('✅ S3 folder created for workspace:', workspace.slug);
    } catch (s3Error) {
      console.error('⚠️ Failed to create S3 folder:', s3Error);
    }

    return NextResponse.json(
      {
        ...workspace,
        username: user.username,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error('❌ Error creating workspace:', error);
    return NextResponse.json(
      { error: 'Failed to create workspace' },
      { status: 500 },
    );
  }
}
