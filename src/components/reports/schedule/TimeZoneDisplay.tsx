import React from 'react';
import { format, addMinutes } from 'date-fns';

interface TimeZone {
  name: string;
  offset: number;
  label?: string;
}

interface TimeZoneDisplayProps {
  timeZones: TimeZone[];
  selectedDate: Date;
  className?: string;
}

export default function TimeZoneDisplay({ 
  timeZones, 
  selectedDate,
  className = ''
}: TimeZoneDisplayProps) {
  if (!selectedDate) return null;

  const getTimeForZone = (offset: number) => {
    const zoneTime = addMinutes(selectedDate, offset);
    return format(zoneTime, "h:mm a");
  };

  return (
    <div className={`bg-gray-50 rounded-lg p-3 ${className}`}>
      <h5 className="text-xs font-medium text-gray-900 mb-2">Broadcast Times</h5>
      <div className="grid grid-cols-2 gap-2">
        {timeZones.map((zone) => (
          <div key={zone.name} className="flex justify-between text-xs">
            <span className="text-gray-600">{zone.label || zone.name}</span>
            <span className="text-gray-900 font-medium">{getTimeForZone(zone.offset)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
