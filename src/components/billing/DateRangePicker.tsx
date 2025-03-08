import React, { useState } from 'react';
import { Calendar } from 'lucide-react';
import { format, isValid, isAfter, isBefore, startOfDay, endOfDay } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';

interface DateRangePickerProps {
  value: [Date | null, Date | null];
  onChange: (range: [Date | null, Date | null]) => void;
  maxDate?: Date;
  minDate?: Date;
  className?: string;
}

const DateRangePicker: React.FC<DateRangePickerProps> = ({ 
  value, 
  onChange,
  maxDate = new Date(),
  minDate,
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [startDate, endDate] = value;
  const [hoverDate, setHoverDate] = useState<Date | null>(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectionStep, setSelectionStep] = useState<'start' | 'end'>(startDate ? 'end' : 'start');

  // Handle date selection
  const handleDateClick = (date: Date) => {
    if (selectionStep === 'start' || !startDate || (startDate && endDate)) {
      // Start new selection
      onChange([date, null]);
      setSelectionStep('end');
    } else {
      // Complete selection
      if (isBefore(date, startDate)) {
        // If clicked date is before start date, swap them
        onChange([date, startDate]);
      } else {
        onChange([startDate, date]);
      }
      setSelectionStep('start');
      setIsOpen(false);
    }
  };

  // Generate calendar days
  const generateCalendarDays = () => {
    const days = [];
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    
    // Get the first day of the month
    const firstDayOfMonth = new Date(year, month, 1);
    const startingDayOfWeek = firstDayOfMonth.getDay();
    
    // Get the last day of the month
    const lastDayOfMonth = new Date(year, month + 1, 0);
    const daysInMonth = lastDayOfMonth.getDate();
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(<div key={`empty-${i}`} className="h-8 w-8"></div>);
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const isToday = date.toDateString() === new Date().toDateString();
      const isStartDate = startDate && date.toDateString() === startDate.toDateString();
      const isEndDate = endDate && date.toDateString() === endDate.toDateString();
      const isInRange = startDate && hoverDate && 
        (isAfter(date, startDate) && isBefore(date, hoverDate)) || 
        (startDate && endDate && isAfter(date, startDate) && isBefore(date, endDate));
      const isDisabled = (minDate && isBefore(date, minDate)) || 
                         (maxDate && isAfter(date, maxDate));
      
      days.push(
        <button
          key={day}
          type="button"
          onClick={() => !isDisabled && handleDateClick(date)}
          onMouseEnter={() => selectionStep === 'end' && startDate && setHoverDate(date)}
          disabled={isDisabled}
          className={`h-8 w-8 rounded-full flex items-center justify-center text-sm relative ${
            isStartDate || isEndDate
              ? 'bg-blue-600 text-white z-10'
              : isInRange
                ? 'bg-blue-100 text-blue-800'
                : isToday
                  ? 'bg-gray-100 text-gray-900'
                  : isDisabled
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
    const newDate = new Date(currentMonth);
    if (direction === 'prev') {
      newDate.setMonth(newDate.getMonth() - 1);
    } else {
      newDate.setMonth(newDate.getMonth() + 1);
    }
    setCurrentMonth(newDate);
  };

  // Predefined date ranges
  const dateRanges = [
    { label: 'Today', getRange: () => [startOfDay(new Date()), endOfDay(new Date())] },
    { label: 'Yesterday', getRange: () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      return [startOfDay(yesterday), endOfDay(yesterday)];
    }},
    { label: 'Last 7 days', getRange: () => {
      const end = new Date();
      const start = new Date();
      start.setDate(start.getDate() - 6);
      return [startOfDay(start), endOfDay(end)];
    }},
    { label: 'Last 30 days', getRange: () => {
      const end = new Date();
      const start = new Date();
      start.setDate(start.getDate() - 29);
      return [startOfDay(start), endOfDay(end)];
    }},
    { label: 'This month', getRange: () => {
      const now = new Date();
      const start = new Date(now.getFullYear(), now.getMonth(), 1);
      const end = new Date();
      return [startOfDay(start), endOfDay(end)];
    }},
    { label: 'Last month', getRange: () => {
      const now = new Date();
      const start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const end = new Date(now.getFullYear(), now.getMonth(), 0);
      return [startOfDay(start), endOfDay(end)];
    }}
  ];

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
      >
        <Calendar className="h-4 w-4 mr-2 text-gray-400" />
        {startDate && endDate ? (
          `${format(startDate, 'MMM d')} - ${format(endDate, 'MMM d')}`
        ) : (
          'Select dates'
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.2 }}
            className="absolute z-10 mt-1 bg-white rounded-lg shadow-lg p-4 border border-gray-200 w-72"
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
                {format(currentMonth, 'MMMM yyyy')}
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
            
            <div className="grid grid-cols-7 gap-1 mb-4">
              {generateCalendarDays()}
            </div>
            
            <div className="border-t border-gray-200 pt-3">
              <h4 className="text-xs font-medium text-gray-700 mb-2">Quick select</h4>
              <div className="grid grid-cols-2 gap-2">
                {dateRanges.map(range => (
                  <button
                    key={range.label}
                    type="button"
                    onClick={() => {
                      const [start, end] = range.getRange();
                      onChange([start, end]);
                      setIsOpen(false);
                    }}
                    className="text-xs py-1 px-2 bg-gray-100 hover:bg-gray-200 rounded text-gray-700 text-left"
                  >
                    {range.label}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="flex justify-between mt-4 pt-3 border-t border-gray-200">
              <button
                type="button"
                onClick={() => {
                  onChange([null, null]);
                  setSelectionStep('start');
                }}
                className="text-xs text-gray-600 hover:text-gray-800"
              >
                Clear
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="text-xs bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
              >
                Apply
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default DateRangePicker;
