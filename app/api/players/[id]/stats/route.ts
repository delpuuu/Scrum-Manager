import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const id = resolvedParams.id;
    const body = await request.json();
    const { 
      date, tackles, tries, minutes, conversions, 
      yellowCards, redCards, sensation, notes 
    } = body;

    if (tackles === undefined || tries === undefined || minutes === undefined || !date) {
      return NextResponse.json({ error: 'Fecha, minutos, tackles y tries son obligatorios' }, { status: 400 });
    }

    const newStat = await prisma.matchStat.create({
      data: {
        playerId: id,
        date: new Date(date),
        tackles: Number(tackles),
        tries: Number(tries),
        minutes: Number(minutes),
        conversions: Number(conversions || 0),
        yellowCards: Number(yellowCards || 0),
        redCards: Number(redCards || 0),
        sensation: sensation ? Number(sensation) : null, // NUEVO
        notes: notes || null, // NUEVO
      },
    });

    return NextResponse.json(newStat, { status: 201 });
  } catch (error) {
    console.error("Error al guardar estadística:", error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}