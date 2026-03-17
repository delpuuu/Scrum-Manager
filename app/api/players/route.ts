import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Listar todos los jugadores
export async function GET() {
  try {
    const players = await prisma.player.findMany({
      orderBy: { lastName: 'asc' }
    });
    return NextResponse.json(players);
  } catch (error) {
    return NextResponse.json({ error: 'Error al listar' }, { status: 500 });
  }
}

// Crear un jugador nuevo
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { firstName, lastName, position, division } = body;
    
    const newPlayer = await prisma.player.create({
      data: { firstName, lastName, position, division }
    });
    return NextResponse.json(newPlayer, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Error al crear' }, { status: 500 });
  }
}