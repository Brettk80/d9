import React, { useState } from 'react';
import { Calendar, Clock, AlertCircle, CheckCircle } from 'lucide-react';
import ScheduleOption from '../reports/schedule/ScheduleOption';
import TimeZoneDisplay from '../reports/schedule/TimeZoneDisplay';
import { DateTimePicker } from '../ui/DateTimePicker';

interface ReviewStepProps {
  isTestFaxRequested: boolean;
  onBack: () => void;
  onStartOver: () => void;
  onNext: (scheduleData: ScheduleData) => void;
}

interface ScheduleData {
  sendImmediately: boolean;
  scheduledDate?: Date;
  scheduledTime?: string;
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

const ReviewStep: React.FC<ReviewStepProps> = ({
  isTestFaxRequested,
  onBack,
  onStartOver,
  onNext
}) => {
  const [sendOption, setSendOption] = useState<'now' | 'later'>('now');
  const [scheduledDate, setScheduledDate] = useState<Date>(new Date());
  const userTimeZone = getUserTimeZone();

  const handleContinue = () => {
    onNext({
      sendImmediately: sendOption === 'now',
      scheduledDate: sendOption === 'later' ? scheduledDate : undefined,
      scheduledTime: sendOption === 'later' ? scheduledDate.toISOString() : undefined
    });
  };

  return (
    <div className="space-y-6">
      {isTestFaxRequested && (
        <div className="bg-yellow-50 border border-yellow-100 rounded-lg p-4">
          <div className="flex">
            <AlertCircle className="h-5 w-5 text-yellow-400 mr-3 flex-shrink-0" />
            <div>
              <h3 className="text-sm font-medium text-yellow-800">Test Fax Requested</h3>
              <p className="mt-1 text-sm text-yellow-700">
                You've requested a test fax. After reviewing your order, we'll send a test fax to your specified number for approval.
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
          <h3 className="text-sm font-medium text-gray-900">Review & Schedule</h3>
        </div>
        
        <div className="p-4 space-y-6">
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-gray-900">When would you like to send this broadcast?</h4>
            
            <ScheduleOption
              selected={sendOption === 'now'}
              onClick={() => setSendOption('now')}
              title="Send immediately"
              description="Your broadcast will begin processing right away"
            >
              <div className="flex items-center text-sm text-green-600">
                <CheckCircle className="h-4 w-4 mr-1" />
                Ready to send
              </div>
            </ScheduleOption>
            
            <ScheduleOption
              selected={sendOption === 'later'}
              onClick={() => setSendOption('later')}
              title="Schedule for later"
              description="Broadcast will begin at your scheduled time"
            >
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
            </ScheduleOption>
          </div>
        </div>
      </div>

      <div className="flex justify-between pt-6 border-t border-gray-200">
        <div className="flex items-center space-x-4">
          <button
            onClick={onBack}
            className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            Back
          </button>
          <button
            onClick={onStartOver}
            className="text-sm text-red-600 hover:text-red-700"
          >
            Start Over
          </button>
        </div>
        <button
          onClick={handleContinue}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
        >
          Continue to Payment
        </button>
      </div>
    </div>
  );
};

export default ReviewStep;
