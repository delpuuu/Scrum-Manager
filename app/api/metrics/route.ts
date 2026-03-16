import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const metrics = await prisma.physicalMetric.findMany({ 
      orderBy: { name: 'asc' } 
    });
    // Si no hay métricas, devolvemos un array vacío pero en formato JSON
    return NextResponse.json(metrics || []);
  } catch (error) {
    console.error("Error al obtener métricas:", error);
    return NextResponse.json([], { status: 200 }); // Devolvemos vacío para no romper el front
  }
}

export async function POST(request: Request) {
  try {
    const { name } = await request.json();
    if (!name) return NextResponse.json({ error: 'Nombre requerido' }, { status: 400 });
    
    const newMetric = await prisma.physicalMetric.create({ 
      data: { name } 
    });
    return NextResponse.json(newMetric, { status: 201 });
  } catch (error) {
    console.error("Error al crear métrica:", error);
    return NextResponse.json({ error: 'Error al crear métrica' }, { status: 500 });
  }
}