import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> } // Aquí sí van los params
) {
  try {
    const { id } = await params; // Await obligatorio en Next 15

    await prisma.physicalMetric.delete({
      where: { id: id },
    });

    return NextResponse.json({ message: "Métrica eliminada" });
  } catch (error) {
    console.error("Error al eliminar métrica:", error);
    return NextResponse.json({ error: "No se pudo eliminar" }, { status: 500 });
  }
}