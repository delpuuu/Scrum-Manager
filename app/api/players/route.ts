import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const players = await prisma.player.findMany({
      orderBy: { lastName: 'asc' },
      include: {
        matchStats: true,
      }
    });
    return NextResponse.json(players);
  } catch (error) {
    return NextResponse.json({ error: 'Error al obtener jugadores' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { firstName, lastName, position, division } = body;

    if (!firstName || !lastName) {
      return NextResponse.json({ error: 'Nombre y apellido son obligatorios' }, { status: 400 });
    }

    const newPlayer = await prisma.player.create({
      data: {
        firstName,
        lastName,
        position,
        division,
      },
    });

    return NextResponse.json(newPlayer, { status: 201 });
  } catch (error) {
    console.error("Error al crear jugador:", error);
    return NextResponse.json({ error: 'Error al crear el jugador' }, { status: 500 });
  }
}