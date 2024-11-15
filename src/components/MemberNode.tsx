import React from 'react';
import { Handle, Position } from 'reactflow';
import { User } from 'lucide-react';

export default function MemberNode({ data }: { data: any }) {
  return (
    <div className="px-4 py-2 shadow-lg rounded-lg bg-white border-2 border-emerald-500">
      <Handle type="target" position={Position.Top} className="w-2 h-2" />
      <div className="flex items-center space-x-2">
        {data.photo_url ? (
          <img
            src={data.photo_url}
            alt={`${data.first_name} ${data.last_name}`}
            className="w-8 h-8 rounded-full object-cover"
          />
        ) : (
          <User className="w-8 h-8 text-emerald-600" />
        )}
        <div>
          <p className="text-sm font-medium">{`${data.first_name} ${data.last_name}`}</p>
          {data.birth_date && (
            <p className="text-xs text-gray-500">
              {new Date(data.birth_date).getFullYear()}
              {data.death_date && ` - ${new Date(data.death_date).getFullYear()}`}
            </p>
          )}
        </div>
      </div>
      <Handle type="source" position={Position.Bottom} className="w-2 h-2" />
    </div>
  );
}