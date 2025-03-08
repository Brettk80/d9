import React, { useState, useEffect, useRef } from 'react';
import { format, addDays, isValid } from 'date-fns';
import { Calendar as CalendarIcon, Clock, ChevronDown } from 'lucide-react';

interface DateTimePickerProps {
  value: Date;
  onChange: (date: Date) => void;
  minDate?: Date;
  showTimeZone?: boolean;
  timeZone?: string;
  className?: string;
}

export const DateTimePicker: React.FC<DateTimePickerProps> = ({
  value,
  onChange,
  minDate = new Date(),
  showTimeZone = false,
  timeZone,
  className = ''
}) => {
  const [selectedDate, setSelectedDate] = useState<Date>(value);
  const [showCalendar, setShowCalendar] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const calendarRef = useRef<HTMLDivElement>(null);
  const timePickerRef = useRef<HTMLDivElement>(null);

  // Format the date for display
  const formattedDate = format(selectedDate, 'MMM d, yyyy');
  
  // Format the time for display and selection
  const hours = selectedDate.getHours();
  const minutes = selectedDate.getMinutes();
  const period = hours >= 12 ? 'PM' : 'AM';
  const hour12 = hours % 12 || 12;
  const formattedTime = `${hour12}:${minutes.toString().padStart(2, '0')} ${period}`;

  // Generate hours, minutes, and period options
  const hourOptions = Array.from({ length: 12 }, (_, i) => i + 1);
  const minuteOptions = Array.from({ length: 60 }, (_, i) => i);
  const periodOptions = ['AM', 'PM'];

  // Handle outside clicks to close dropdowns
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (calendarRef.current && !calendarRef.current.contains(event.target as Node)) {
        setShowCalendar(false);
      }
      if (timePickerRef.current && !timePickerRef.current.contains(event.target as Node)) {
        setShowTimePicker(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Handle date selection
  const handleDateSelect = (date: Date) => {
    const newDate = new Date(selectedDate);
    newDate.setFullYear(date.getFullYear(), date.getMonth(), date.getDate());
    
    if (isValid(newDate)) {
      setSelectedDate(newDate);
      onChange(newDate);
    }
    setShowCalendar(false);
  };

  // Handle time selection
  const handleTimeChange = (type: 'hour' | 'minute' | 'period', value: number | string) => {
    const newDate = new Date(selectedDate);
    
    if (type === 'hour') {
      let hour = Number(value);
      if (period === 'PM' && hour < 12) hour += 12;
      if (period === 'AM' && hour === 12) hour = 0;
      newDate.setHours(hour);
    } else if (type === 'minute') {
      newDate.setMinutes(Number(value));
    } else if (type === 'period') {
      const hour = hours % 12;
      newDate.setHours(value === 'PM' ? hour + 12 : hour);
    }

    if (isValid(newDate)) {
      setSelectedDate(newDate);
      onChange(newDate);
    }
  };

  // Generate calendar days
  const generateCalendarDays = () => {
    const today = new Date();
    const days = [];
    const currentMonth = selectedDate.getMonth();
    const currentYear = selectedDate.getFullYear();
    
    // Get the first day of the month
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
    const startingDayOfWeek = firstDayOfMonth.getDay();
    
    // Get the last day of the month
    const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0);
    const daysInMonth = lastDayOfMonth.getDate();
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(<div key={`empty-${i}`} className="h-8 w-8"></div>);
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentYear, currentMonth, day);
      const isToday = date.toDateString() === today.toDateString();
      const isSelected = date.toDateString() === selectedDate.toDateString();
      const isPast = date < minDate && date.toDateString() !== today.toDateString();
      
      days.push(
        <button
          key={day}
          type="button"
          onClick={() => handleDateSelect(date)}
          disabled={isPast}
          className={`h-8 w-8 rounded-full flex items-center justify-center text-sm ${
            isSelected 
              ? 'bg-blue-600 text-white' 
              : isToday 
                ? 'bg-blue-100 text-blue-700' 
                : isPast 
                  ? 'text-gray-300 cursor-not-allowed' 
                  : 'text-gray-700 hover:bg-gray-100'
          }`}
        >
          {day}
        </button>
      );
    }
    
    return days;
  };

  // Navigate to previous/next month
  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(selectedDate);
    if (direction === 'prev') {
      newDate.setMonth(newDate.getMonth() - 1);
    } else {
      newDate.setMonth(newDate.getMonth() + 1);
    }
    setSelectedDate(newDate);
  };

  // Custom time picker component to replace native select elements
  const CustomTimeSelect = ({ 
    options, 
    value, 
    onChange, 
    label 
  }: { 
    options: (number | string)[], 
    value: number | string, 
    onChange: (value: number | string) => void,
    label: string
  }) => {
    const [isOpen, setIsOpen] = useState(false);
    const selectRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
          setIsOpen(false);
        }
      };

      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }, []);

    return (
      <div className="flex-1" ref={selectRef}>
        <label className="block text-xs text-gray-500 mb-1">{label}</label>
        <div className="relative">
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="w-full flex items-center justify-between border border-gray-300 rounded-md shadow-sm py-1 px-2 text-sm bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          >
            <span>{typeof value === 'number' && label === 'Minute' ? value.toString().padStart(2, '0') : value}</span>
            <ChevronDown className="h-4 w-4 text-gray-400" />
          </button>
          
          {isOpen && (
            <div className="absolute z-20 mt-1 w-full max-h-40 overflow-y-auto bg-white border border-gray-200 rounded-md shadow-lg">
              {options.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => {
                    onChange(option);
                    setIsOpen(false);
                  }}
                  className={`w-full text-left px-2 py-1 text-sm ${
                    option === value ? 'bg-blue-100 text-blue-800' : 'hover:bg-gray-100'
                  }`}
                >
                  {typeof option === 'number' && label === 'Minute' ? option.toString().padStart(2, '0') : option}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className={`relative ${className}`}>
      <div className="flex items-center space-x-3">
        {/* Date Selector */}
        <div className="relative">
          <button
            type="button"
            onClick={() => {
              setShowCalendar(!showCalendar);
              setShowTimePicker(false);
            }}
            className="flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <CalendarIcon className="h-4 w-4 text-gray-500 mr-2" />
            <span className="text-gray-900">{formattedDate}</span>
          </button>
          
          {showCalendar && (
            <div
              ref={calendarRef}
              className="absolute z-10 mt-1 bg-white rounded-lg shadow-lg p-3 border border-gray-200 w-72 transition-opacity duration-200 opacity-100"
            >
              <div className="flex justify-between items-center mb-2">
                <button
                  type="button"
                  onClick={() => navigateMonth('prev')}
                  className="p-1 rounded-full hover:bg-gray-100"
                >
                  <svg className="h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <h3 className="text-sm font-medium text-gray-900">
                  {format(selectedDate, 'MMMM yyyy')}
                </h3>
                <button
                  type="button"
                  onClick={() => navigateMonth('next')}
                  className="p-1 rounded-full hover:bg-gray-100"
                >
                  <svg className="h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
              
              <div className="grid grid-cols-7 gap-1 mb-2">
                {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
                  <div key={day} className="h-8 w-8 flex items-center justify-center text-xs text-gray-500">
                    {day}
                  </div>
                ))}
              </div>
              
              <div className="grid grid-cols-7 gap-1">
                {generateCalendarDays()}
              </div>
              
              <div className="mt-3 pt-3 border-t border-gray-200">
                <div className="flex space-x-2">
                  <button
                    type="button"
                    onClick={() => handleDateSelect(new Date())}
                    className="text-xs text-blue-600 hover:text-blue-700"
                  >
                    Today
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDateSelect(addDays(new Date(), 1))}
                    className="text-xs text-blue-600 hover:text-blue-700"
                  >
                    Tomorrow
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
        
        {/* Time Selector */}
        <div className="relative">
          <button
            type="button"
            onClick={() => {
              setShowTimePicker(!showTimePicker);
              setShowCalendar(false);
            }}
            className="flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <Clock className="h-4 w-4 text-gray-500 mr-2" />
            <span className="text-gray-900">{formattedTime}</span>
            <ChevronDown className="h-4 w-4 text-gray-500 ml-2" />
          </button>
          
          {showTimePicker && (
            <div
              ref={timePickerRef}
              className="absolute z-10 mt-1 bg-white rounded-lg shadow-lg p-3 border border-gray-200 w-64 transition-opacity duration-200 opacity-100"
              style={{ minWidth: '280px' }}
            >
              <div className="flex items-center justify-between space-x-2">
                {/* Custom Time Selectors */}
                <CustomTimeSelect 
                  options={hourOptions} 
                  value={hour12} 
                  onChange={(value) => handleTimeChange('hour', Number(value))}
                  label="Hour"
                />
                
                <CustomTimeSelect 
                  options={minuteOptions} 
                  value={minutes} 
                  onChange={(value) => handleTimeChange('minute', Number(value))}
                  label="Minute"
                />
                
                <CustomTimeSelect 
                  options={periodOptions} 
                  value={period} 
                  onChange={(value) => handleTimeChange('period', String(value))}
                  label="AM/PM"
                />
              </div>
              
              <div className="mt-3 pt-3 border-t border-gray-200">
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { label: 'Morning', time: { hour: 9, minute: 0, period: 'AM' } },
                    { label: 'Noon', time: { hour: 12, minute: 0, period: 'PM' } },
                    { label: 'Afternoon', time: { hour: 3, minute: 0, period: 'PM' } },
                    { label: 'Evening', time: { hour: 6, minute: 0, period: 'PM' } }
                  ].map(preset => (
                    <button
                      key={preset.label}
                      type="button"
                      onClick={() => {
                        const newDate = new Date(selectedDate);
                        let hour = preset.time.hour;
                        if (preset.time.period === 'PM' && hour < 12) hour += 12;
                        if (preset.time.period === 'AM' && hour === 12) hour = 0;
                        newDate.setHours(hour, preset.time.minute);
                        setSelectedDate(newDate);
                        onChange(newDate);
                        setShowTimePicker(false);
                      }}
                      className="text-xs py-1 px-2 bg-gray-100 hover:bg-gray-200 rounded text-gray-700"
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Time Zone Display (optional) */}
      {showTimeZone && timeZone && (
        <div className="mt-1 text-xs text-gray-500">
          Your time zone: {timeZone}
        </div>
      )}
    </div>
  );
};

export default DateTimePicker;
