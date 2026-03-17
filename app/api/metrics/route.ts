import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// LISTAR EJERCICIOS
export async function GET() {
  try {
    const metrics = await prisma.physicalMetric.findMany({ 
      orderBy: { name: 'asc' } 
    });
    return NextResponse.json(metrics || []);
  } catch (error) {
    console.error("ERROR GET METRICS:", error);
    return NextResponse.json([], { status: 200 }); 
  }
}

// CREAR EJERCICIO
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, unit } = body;
    
    if (!name || !unit) {
      return NextResponse.json({ error: 'Faltan campos' }, { status: 400 });
    }
    
    // Forzamos la creación en la DB
    const newMetric = await prisma.physicalMetric.create({ 
      data: { 
        name: name.trim(), 
        unit: unit.trim() 
      } 
    });
    
    return NextResponse.json(newMetric, { status: 201 });
  } catch (error: any) {
    console.error("ERROR POST METRICS:", error);
    // Error 409 si el nombre ya existe (P2002 es el código de Prisma para Unique constraint)
    if (error.code === 'P2002') {
      return NextResponse.json({ error: 'Ese ejercicio ya existe' }, { status: 409 });
    }
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}