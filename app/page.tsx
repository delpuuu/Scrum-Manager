import { redirect } from 'next/navigation';

export default function Home() {
  // BYPASS TEMPORAL: Mandamos directo al dashboard para el MVP
  redirect('/admin/dashboard');
}