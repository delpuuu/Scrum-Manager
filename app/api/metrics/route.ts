import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> } // Cambio clave: Definimos params como Promise
) {
  try {
    // En Next.js 15 es obligatorio hacer await de los params
    const resolvedParams = await params;
    const id = resolvedParams.id;

    await prisma.physicalMetric.delete({
      where: { id: id },
    });

    return NextResponse.json({ message: "Métrica eliminada" });
  } catch (error) {
    console.error("Error al eliminar métrica:", error);
    return NextResponse.json({ error: "No se pudo eliminar la métrica" }, { status: 500 });
  }
}