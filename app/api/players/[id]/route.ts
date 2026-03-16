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
    console.error("Error en GET player:", error);
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

    // Actualizamos solo los campos que vienen en el body
    const updated = await prisma.player.update({
      where: { id },
      data: { 
        firstName, 
        lastName, 
        position: position || null, 
        division: division || null 
      }
    });
    return NextResponse.json(updated);
  } catch (error) {
    console.error("Error en PATCH player:", error); // Esto nos dirá el error real en tu terminal
    return NextResponse.json({ error: 'Error al actualizar el jugador' }, { status: 500 });
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
    console.error("Error en DELETE player:", error);
    return NextResponse.json({ error: 'Error al eliminar el jugador' }, { status: 500 });
  }
}