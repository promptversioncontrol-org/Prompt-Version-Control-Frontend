import { Server as NetServer } from 'http';
import { NextApiRequest, NextApiResponse } from 'next';
import { Server as ServerIO } from 'socket.io';
import { Socket as NetSocket } from 'net';
import { prisma } from '@/shared/lib/prisma';

export const config = {
  api: {
    bodyParser: false,
  },
};

export type NextApiResponseServerIO = NextApiResponse & {
  socket: NetSocket & {
    server: NetServer & {
      io: ServerIO;
    };
  };
};

const ioHandler = (req: NextApiRequest, res: NextApiResponseServerIO) => {
  if (!res.socket.server.io) {
    console.log('*Socket.io start*');
    const httpServer: NetServer = res.socket.server;
    const io = new ServerIO(httpServer, {
      path: '/api/socket/io',
      addTrailingSlash: false,
    });

    // 🔒 AUTHENTICATION MIDDLEWARE
    io.use(async (socket, next) => {
      const token = socket.handshake.auth.token;
      // Allow workspaceId from auth or query params
      const workspaceId =
        socket.handshake.auth.workspaceId || socket.handshake.query.workspaceId;

      if (!token) {
        return next(new Error('Authentication error: Missing session token'));
      }

      if (!workspaceId) {
        return next(new Error('Authentication error: Missing workspaceId'));
      }

      try {
        console.log(`🔍 Verifying token for workspace: ${workspaceId}`);

        // 1. Verify Session
        const session = await prisma.session.findUnique({
          where: { token: token as string },
          include: { user: true },
        });

        if (!session || !session.user) {
          return next(
            new Error('Authentication error: Invalid or expired token'),
          );
        }

        // 2. Verify Workspace Access
        // Check if user is owner OR contributor
        const hasAccess = await prisma.workspace.findFirst({
          where: {
            id: workspaceId as string,
            OR: [
              { userId: session.user.id }, // Owner
              { contributors: { some: { userId: session.user.id } } }, // Contributor
            ],
          },
        });

        if (!hasAccess) {
          return next(
            new Error(
              'Authorization error: User does not have access to this workspace',
            ),
          );
        }

        // Success! Attach user and workspace to socket
        socket.data.user = session.user;
        socket.data.workspaceId = workspaceId;
        next();
      } catch (error) {
        console.error('Socket auth error:', error);
        return next(new Error('Internal server error during authentication'));
      }
    });

    io.on('connection', (socket) => {
      const user = socket.data.user;
      const workspaceId = socket.data.workspaceId;

      console.log(
        `✅ User ${user.username} (${user.id}) connected to workspace ${workspaceId}`,
      );

      // Join the workspace room to receive updates for this workspace
      socket.join(workspaceId);

      socket.on('cli:leak_detected', (msg) => {
        console.log(
          `🚨 Leak reported by ${user.username} in workspace ${workspaceId}:`,
          msg,
        );

        // Broadcast to dashboard (frontend) in the same room
        // socket.to(workspaceId).emit('dashboard:leak_alert', msg);
      });

      socket.on('disconnect', () => {
        console.log(`❌ User ${user.username} disconnected`);
      });
    });

    res.socket.server.io = io;
  }
  res.end();
};

export default ioHandler;
