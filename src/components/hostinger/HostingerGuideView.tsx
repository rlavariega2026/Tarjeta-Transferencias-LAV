import React from 'react';
import { HostingerTab } from '../editor/tabs/HostingerTab';
import { Server } from 'lucide-react';

interface HostingerGuideViewProps {
  onNotify: (title: string, desc?: string, type?: 'success' | 'error' | 'info') => void;
}

export const HostingerGuideView: React.FC<HostingerGuideViewProps> = ({ onNotify }) => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-slate-100 tracking-tight flex items-center gap-2">
          <Server className="w-6 h-6 text-emerald-400" />
          <span>Centro de Despliegue en Hostinger</span>
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Guía técnica, archivos de producción (PHP, MySQL, .htaccess), verificador de conexión y generador de paquete ZIP para publicar en tu propio dominio.
        </p>
      </div>

      <HostingerTab onNotify={onNotify} />
    </div>
  );
};
