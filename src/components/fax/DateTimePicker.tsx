import React from 'react';
import { DateTimePicker as UIDateTimePicker } from '../ui/DateTimePicker';

interface DateTimePickerProps {
  value: Date;
  onChange: (date: Date) => void;
  minDate?: Date;
  showTimeZone?: boolean;
  timeZone?: string;
  className?: string;
}

// This is a wrapper component that uses the UI DateTimePicker
// It's kept for backward compatibility
export const DateTimePicker: React.FC<DateTimePickerProps> = (props) => {
  return <UIDateTimePicker {...props} />;
};

export default DateTimePicker;
