
import React from 'react';
import { AuditLog } from '../../../shared/types';
import { Badge } from '../../../shared/ui';
import { DataTable, Column } from '../../../shared/ui/DataTable';

interface AuditLogsProps {
  logs: AuditLog[];
}

const AuditLogs: React.FC<AuditLogsProps> = ({ logs }) => {
  const columns: Column<AuditLog>[] = [
    {
      header: 'Timestamp',
      accessor: (log) => (
        <span className="font-mono text-xs text-slate-400">
          {new Date(log.timestamp).toLocaleString()}
        </span>
      )
    },
    {
      header: 'Aksi',
      accessor: (log) => (
        <Badge variant={log.action.includes('OVERRIDE') || log.action.includes('FINALIZE') ? 'warning' : 'neutral'}>
          {log.action}
        </Badge>
      )
    },
    {
      header: 'User',
      accessor: 'user',
      className: 'font-bold text-slate-700'
    },
    {
      header: 'Detail Kejadian',
      accessor: (log) => <span className="text-slate-600 italic">"{log.details}"</span>
    }
  ];

  return (
    <div className="space-y-4">
      <DataTable 
        data={logs} 
        columns={columns} 
        searchPlaceholder="Cari berdasarkan aksi, user, atau detail..." 
      />
    </div>
  );
};

export default AuditLogs;
