import React, { useState, useRef, useEffect } from 'react';
import { X } from 'lucide-react';
import { DateTimePicker } from '../ui/DateTimePicker';
import TimeZoneDisplay from './schedule/TimeZoneDisplay';

interface RescheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onReschedule: (date: Date) => void;
  currentScheduledDate?: Date;
}

const timeZones = [
  { name: 'Honolulu', label: 'Honolulu', offset: -600 },
  { name: 'Los Angeles', label: 'Los Angeles', offset: -480 },
  { name: 'Denver', label: 'Denver', offset: -420 },
  { name: 'Chicago', label: 'Chicago', offset: -360 },
  { name: 'New York', label: 'New York', offset: -300 },
  { name: 'Berlin', label: 'Berlin', offset: 60 },
  { name: 'Beijing', label: 'Beijing', offset: 480 },
  { name: 'Shanghai', label: 'Shanghai', offset: 480 }
];

// Get user's timezone
const getUserTimeZone = () => {
  const timeZoneName = Intl.DateTimeFormat().resolvedOptions().timeZone;
  return timeZoneName.includes('/') ? timeZoneName.split('/')[1].replace('_', ' ') : timeZoneName;
};

const RescheduleModal: React.FC<RescheduleModalProps> = ({
  isOpen,
  onClose,
  onReschedule,
  currentScheduledDate
}) => {
  const [scheduledDate, setScheduledDate] = useState<Date>(
    currentScheduledDate || new Date(Date.now() + 30 * 60 * 1000) // Default to 30 minutes from now
  );
  const userTimeZone = getUserTimeZone();
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div
        ref={modalRef}
        className="bg-white rounded-lg max-w-md w-full overflow-hidden shadow-xl"
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Reschedule Broadcast</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-4 space-y-4">
          <p className="text-sm text-gray-600">
            Select a new date and time for your broadcast. The broadcast will begin processing at the scheduled time.
          </p>

          <div className="space-y-4">
            <div>
              <p className="text-xs text-gray-500 mb-2">Your time zone: {userTimeZone}</p>
              <DateTimePicker
                value={scheduledDate}
                onChange={setScheduledDate}
                minDate={new Date()}
                className="w-full"
              />
            </div>
            
            <TimeZoneDisplay 
              timeZones={timeZones}
              selectedDate={scheduledDate}
              className="mt-4"
            />
          </div>
        </div>

        <div className="p-4 border-t border-gray-200 flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              onReschedule(scheduledDate);
              onClose();
            }}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700"
          >
            Reschedule
          </button>
        </div>
      </div>
    </div>
  );
};

export default RescheduleModal;
