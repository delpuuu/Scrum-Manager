import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { metric, value, reps, date } = body;

    if (!metric || value === undefined || !date) {
      return NextResponse.json({ error: 'Métrica, valor y fecha son obligatorios' }, { status: 400 });
    }

    const newRecord = await prisma.physicalRecord.create({
      data: {
        playerId: id,
        metric,
        value: Number(value),
        reps: reps ? Number(reps) : 1, // Fallback de seguridad
        date: new Date(date),
      },
    });

    return NextResponse.json(newRecord, { status: 201 });
  } catch (error) {
    console.error("Error al guardar registro físico:", error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}