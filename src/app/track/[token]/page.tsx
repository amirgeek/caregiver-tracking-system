import { supabase } from '../../../lib/supabase';

interface TrackingPageProps {
  params: { token: string };
}

export default async function TrackingPage({ params }: TrackingPageProps) {
  const { token } = params;

  const { data: guardia, error } = await supabase
    .from('guardias')
    .select('estado, latitud_inicio, longitud_inicio')
    .eq('link_seguimiento', token)
    .single();

  if (error) {
    console.error("Error fetching guardia:", error);
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center p-4">
        <div className="bg-gray-800 p-8 rounded-lg shadow-lg text-center max-w-md">
          <h1 className="text-3xl font-bold text-red-500 mb-4">Error de Seguimiento</h1>
          <p className="text-lg text-gray-300">No se pudo encontrar la guardia con el token proporcionado o hubo un error en la base de datos.</p>
          <p className="text-sm text-gray-500 mt-2">Detalles: {error.message}</p>
        </div>
      </div>
    );
  }

  if (!guardia) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center p-4">
        <div className="bg-gray-800 p-8 rounded-lg shadow-lg text-center max-w-md">
          <h1 className="text-3xl font-bold text-yellow-500 mb-4">Guardia No Encontrada</h1>
          <p className="text-lg text-gray-300">El link de seguimiento no es válido o la guardia no existe.</p>
        </div>
      </div>
    );
  }

  const googleMapsLink = `https://www.google.com/maps?q=${guardia.latitud_inicio},${guardia.longitud_inicio}`;

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-4">
      <h1 className="text-4xl font-bold mb-8 text-cyan-400">Seguimiento de Guardia</h1>

      <div className="bg-gray-800 p-8 rounded-lg shadow-lg max-w-md w-full text-left">
        <p className="text-xl mb-4">
          <span className="font-semibold">Estado de la Guardia: </span>
          <span className={`font-bold ${guardia.estado === 'activo' ? 'text-green-500' : 'text-red-500'}`}>{guardia.estado.toUpperCase()}</span>
        </p>
        <p className="text-lg mb-2">
          <span className="font-semibold">Latitud de Inicio: </span>{guardia.latitud_inicio}
        </p>
        <p className="text-lg mb-4">
          <span className="font-semibold">Longitud de Inicio: </span>{guardia.longitud_inicio}
        </p>
        <a
          href={googleMapsLink}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block mt-4 py-3 px-6 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-full transition-colors duration-300"
        >
          Ver en Google Maps
        </a>
      </div>
    </div>
  );
}
