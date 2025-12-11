import { Server as NetServer } from 'http';
import { NextApiRequest, NextApiResponse } from 'next';
import { Server as ServerIO } from 'socket.io';
import { Socket as NetSocket } from 'net';
import { PrismaClient } from '@prisma/client';
import { sendTelegramNotification } from '@/features/workspaces/contracts/send-telegram-notification';

const prisma = new PrismaClient({
  log: ['query', 'error', 'warn'],
});

console.log(
  'Socket.io Handler - DATABASE_URL:',
  process.env.DATABASE_URL ? 'Defined' : 'Undefined',
);

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

    io.use(async (socket, next) => {
      const token = socket.handshake.auth.token;
      const workspaceId =
        socket.handshake.auth.workspaceId || socket.handshake.query.workspaceId;

      if (!token)
        return next(new Error('Authentication error: Missing session token'));
      if (!workspaceId)
        return next(new Error('Authentication error: Missing workspaceId'));

      try {
        const session = await prisma.session.findUnique({
          where: { token: token as string },
          include: { user: true },
        });

        if (!session || !session.user) {
          return next(
            new Error('Authentication error: Invalid or expired token'),
          );
        }

        const workspace = await prisma.workspace.findFirst({
          where: {
            id: workspaceId as string,
            OR: [
              { userId: session.user.id },
              { contributors: { some: { userId: session.user.id } } },
            ],
          },
          select: {
            id: true,
            slug: true,
            userId: true,
          },
        });

        if (!workspace)
          return next(new Error('Authorization error: No access'));

        socket.data.user = session.user;
        socket.data.workspace = workspace;
        next();
      } catch (error) {
        console.error('Socket auth error:', error);
        return next(new Error('Internal server error during authentication'));
      }
    });

    io.on('connection', (socket) => {
      const user = socket.data.user;
      const workspace = socket.data.workspace;

      console.log(
        `User ${user.username} (${user.id}) connected to workspace ${workspace.id}`,
      );

      socket.join(workspace.id);

      socket.on('cli:leak_detected', async (msg) => {
        console.log(
          `Leak reported by ${user.username} in workspace ${workspace.id}:`,
          msg,
        );

        // Save to Database
        try {
          await prisma.workspaceLeak.create({
            data: {
              workspaceId: workspace.id,
              severity: msg.severity,
              message: msg.message,
              snippet: msg.snippet,
              source: msg.source,
              username: msg.username,
              ruleId: msg.ruleId,
              sessionId: msg.sessionId,
              detectedAt: msg.timestamp ? new Date(msg.timestamp) : new Date(),
            },
          });
          console.log('✅ Leak saved to database');
        } catch (dbError) {
          console.error('❌ Failed to save leak to database:', dbError);
        }

        io.to(workspace.id).emit('dashboard:leak_alert', msg);

        try {
          await sendTelegramNotification({
            userId: workspace.userId,
            workspaceSlug: workspace.slug || workspace.id,
            event: msg,
          });
          console.log(
            'Telegram notification dispatched for workspace',
            workspace.id,
          );
        } catch (error) {
          console.error('Failed to send Telegram notification:', error);
        }
      });

      socket.on('disconnect', () => {
        console.log(`User ${user.username} disconnected`);
      });
    });

    res.socket.server.io = io;
  }

  res.end();
};

export default ioHandler;
