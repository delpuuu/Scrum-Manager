import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> } // CAMBIO CLAVE: params es una Promesa
) {
  try {
    // En Next.js 15, DEBÉS esperar a que los params se resuelvan
    const { id } = await context.params;

    await prisma.physicalMetric.delete({
      where: { id: id },
    });

    return NextResponse.json({ message: "Métrica eliminada" });
  } catch (error) {
    console.error("Error al eliminar métrica:", error);
    return NextResponse.json({ error: "No se pudo eliminar la métrica" }, { status: 500 });
  }
}