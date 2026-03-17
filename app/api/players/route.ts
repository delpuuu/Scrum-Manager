import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const player = await prisma.player.findUnique({
      where: { id },
      include: {
        matchStats: { orderBy: { date: 'desc' } },
        physicalRecords: { orderBy: { date: 'desc' } },
      },
    });
    return NextResponse.json(player);
  } catch (error) {
    return NextResponse.json({ error: 'Error al obtener jugador' }, { status: 500 });
  }
}