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
        physicalRecords: { orderBy: { date: 'desc' } }
      }
    });
    if (!player) return NextResponse.json({ error: 'Jugador no encontrado' }, { status: 404 });
    return NextResponse.json(player);
  } catch (error) {
    return NextResponse.json({ error: 'Error al obtener el jugador' }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { firstName, lastName, position, division } = body;
    const updated = await prisma.player.update({
      where: { id },
      data: { firstName, lastName, position: position || null, division: division || null }
    });
    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ error: 'Error al actualizar' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.matchStat.deleteMany({ where: { playerId: id } });
    await prisma.physicalRecord.deleteMany({ where: { playerId: id } });
    await prisma.player.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Error al eliminar' }, { status: 500 });
  }
}