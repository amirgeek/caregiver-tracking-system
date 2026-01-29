"use client";

import { useState } from "react";
import { supabase } from "../lib/supabase";
import { v4 as uuidv4 } from 'uuid';

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [guardiaId, setGuardiaId] = useState<string | null>(null);
  const [trackingLink, setTrackingLink] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const startGuardia = async () => {
    setLoading(true);
    setError(null);
    setStatusMessage(null);

    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser.");
      setLoading(false);
      return;
    }

    try {
      const position: GeolocationPosition = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, { enableHighAccuracy: true });
      });

      const { latitude, longitude } = position.coords;
      const cuidadorId = uuidv4(); // Placeholder for actual caregiver ID
      const pacienteId = uuidv4(); // Placeholder for actual patient ID
      const newTrackingLink = uuidv4();

      const { data, error: dbError } = await supabase
        .from('guardias')
        .insert([
          {
            cuidador_id: cuidadorId,
            paciente_id: pacienteId,
            latitud_inicio: latitude,
            longitud_inicio: longitude,
            link_seguimiento: newTrackingLink,
            estado: 'activo',
          },
        ])
        .select();

      if (dbError) {
        console.error("Error inserting data:", dbError);
        setError(`Failed to start guardia: ${dbError.message}`);
      } else if (data && data.length > 0) {
        setGuardiaId(data[0].id);
        setTrackingLink(`${window.location.origin}/track/${newTrackingLink}`); // Construct tracking URL
        setStatusMessage("Guardia iniciada con éxito!");
      } else {
        setError("Failed to start guardia: No data returned.");
      }
    } catch (geoError: any) {
      console.error("Geolocation error:", geoError);
      setError(`Geolocation failed: ${geoError.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-4">
      <h1 className="text-4xl font-bold mb-8 text-cyan-400">Caregiver Tracking System</h1>

      <div className="bg-gray-800 p-8 rounded-lg shadow-lg max-w-md w-full text-center">
        <button
          onClick={startGuardia}
          disabled={loading}
          className={`w-full py-3 px-6 rounded-full text-lg font-semibold transition-all duration-300
            ${loading ? 'bg-gray-600 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}
          `}
        >
          {loading ? 'Iniciando Guardia...' : 'Iniciar Guardia'}
        </button>

        {error && <p className="text-red-500 mt-4">Error: {error}</p>}
        {statusMessage && <p className="text-green-500 mt-4">{statusMessage}</p>}

        {trackingLink && (
          <div className="mt-6 p-4 bg-gray-700 rounded-md break-all">
            <p className="font-semibold mb-2">Link de Seguimiento:</p>
            <a href={trackingLink} target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:underline">
              {trackingLink}
            </a>
            <button
              onClick={() => navigator.clipboard.writeText(trackingLink)}
              className="mt-4 py-2 px-4 bg-gray-600 hover:bg-gray-700 rounded-full text-sm"
            >
              Copiar Link
            </button>
          </div>
        )}
        {guardiaId && (
          <p className="mt-4 text-sm text-gray-400">ID de Guardia: {guardiaId}</p>
        )}
      </div>
    </div>
  );
}
