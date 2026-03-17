import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.physicalMetric.delete({
      where: { id: params.id },
    });
    return NextResponse.json({ message: "Métrica eliminada" });
  } catch (error) {
    console.error("Error al eliminar métrica:", error);
    return NextResponse.json({ error: "No se pudo eliminar la métrica" }, { status: 500 });
  }
}