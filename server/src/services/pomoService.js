const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.startPomodoro = async (userId, duration) => {
  return await prisma.pomodoroSession.create({
    data: {
      userId,
      startTime: new Date(),
      status: 'started',
      duration,
    }
  });
};

exports.pausePomodoro = async (userId) => {
  const session = await getActiveSession(userId);
  if (!session || session.status !== 'started') throw new Error("No active session to pause");

  return await prisma.pomodoroSession.update({
    where: { id: session.id },
    data: {
      status: 'paused',
      endTime: new Date()
    }
  });
};

exports.resumePomodoro = async (userId) => {
  const session = await getActiveSession(userId);
  if (!session || session.status !== 'paused') throw new Error("No paused session to resume");

  return await prisma.pomodoroSession.update({
    where: { id: session.id },
    data: {
      status: 'started',
      endTime: null
    }
  });
};

exports.resetPomodoro = async (userId) => {
  const session = await getActiveSession(userId);
  if (!session) throw new Error("No active session to reset");

  return await prisma.pomodoroSession.delete({ where: { id: session.id } });
};

exports.getPomodoroStatus = async (userId) => {
  return await getActiveSession(userId);
};

exports.getPomodoroHistory = async (userId) => {
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  return await prisma.pomodoroSession.findMany({
    where: {
      userId,
      createdAt: {
        gte: todayStart
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  });
};

async function getActiveSession(userId) {
  return await prisma.pomodoroSession.findFirst({
    where: {
      userId,
      status: {
        in: ['started', 'paused']
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  });
}
