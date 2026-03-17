import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const metrics = await prisma.physicalMetric.findMany({ 
      orderBy: { name: 'asc' } 
    });
    return NextResponse.json(metrics || []);
  } catch (error) {
    console.error("Error al obtener métricas:", error);
    return NextResponse.json([], { status: 200 }); 
  }
}

export async function POST(request: Request) {
  try {
    const { name, unit } = await request.json();
    
    if (!name || !unit) {
      return NextResponse.json({ error: 'Nombre y unidad requeridos' }, { status: 400 });
    }
    
    const newMetric = await prisma.physicalMetric.create({ 
      data: { name, unit } 
    });
    
    return NextResponse.json(newMetric, { status: 201 });
  } catch (error) {
    console.error("Error al crear métrica:", error);
    return NextResponse.json({ error: 'Error al crear métrica' }, { status: 500 });
  }
}