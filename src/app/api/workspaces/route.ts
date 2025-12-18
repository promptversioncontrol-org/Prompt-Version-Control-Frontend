import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/shared/lib/auth';
import { prisma } from '@/shared/lib/prisma';
import { createNewWorkspace } from '@/features/workspaces/services/create-new-workspace';
import type { CreateWorkspaceInput } from '@/features/workspaces/types';
import { createWorkspaceFolder } from '@/features/workspaces/services/setup-folder-aws';
import { s3Client } from '@/shared/lib/s3-client';
import { GetObjectCommand, ListObjectsV2Command } from '@aws-sdk/client-s3';
import { getWorkspaceReport } from '@/features/workspaces/services/get-workspace-report';
import { listWorkspaceReportDates } from '@/features/workspaces/services/list-workspace-report-dates';

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

  // Find workspace to get ID and verify access
  const workspace = await prisma.workspace.findFirst({
    where: {
      slug: workspaceName,
      userId: session.user.id,
    },
    select: { id: true },
  });

  if (!workspace) {
    return NextResponse.json(
      { error: 'Workspace not found or access denied' },
      { status: 404 },
    );
  }

  const bucket = process.env.AWS_BUCKET_NAME;

  if (!bucket) {
    return NextResponse.json({ error: 'Missing bucket name' }, { status: 500 });
  }

  // New structure uses helpers that handle the prefix logic:
  // pvc/workspaces/{workspaceId}/{userId}/{date}/report.json

  try {
    if (date) {
      const report = await getWorkspaceReport(
        workspace.id,
        session.user.id,
        date,
      );

      return NextResponse.json({
        ok: true,
        userId: session.user.id,
        workspaceName,
        date,
        data: report,
      });
    }

    const dateFolders = await listWorkspaceReportDates(
      workspace.id,
      session.user.id,
    );

    const reports = await Promise.all(
      dateFolders.map(async (dateFolder) => {
        const report = await getWorkspaceReport(
          workspace.id,
          session.user.id,
          dateFolder,
        );
        return {
          date: dateFolder,
          data: report,
        };
      }),
    );

    return NextResponse.json({
      ok: true,
      userId: session.user.id,
      workspaceName,
      reports,
    });
  } catch (err) {
    console.error('Error fetching reports:', err);
    return NextResponse.json(
      { error: 'Failed to fetch reports' },
      { status: 500 },
    );
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
      image: body.image,
      userId: session.user.id,
      contributors: body.contributors,
    };

    const workspace = await createNewWorkspace(workspaceData);

    try {
      await createWorkspaceFolder(workspace.id);
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
