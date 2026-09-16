import React from 'react';
import { Database, Hospital, Server } from 'lucide-react';

export const HospitalHeader: React.FC = () => {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-700 text-white flex items-center justify-center shadow-sm">
              <Hospital className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                  IT Asset Mini Tracker
                </h1>
                <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                  SIMRS Backoffice
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden sm:block">
                Sistem Inventaris Perangkat IT Rumah Sakit
              </p>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-2 px-2.5 py-1 rounded-md bg-slate-50 border border-slate-200 text-xs text-slate-600">
            <Server className="w-3.5 h-3.5 text-slate-500" />
            <span>Express API</span>
            <span className="text-slate-300">•</span>
            <Database className="w-3.5 h-3.5 text-slate-500" />
            <span>MySQL + Prisma</span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default HospitalHeader;
