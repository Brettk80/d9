import * as XLSX from 'xlsx';

export const validateFileType = (file: File): boolean => {
  const validTypes = [
    'text/csv',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/plain'
  ];
  return validTypes.includes(file.type) || 
    /\.(csv|xls|xlsx|txt)$/i.test(file.name);
};

export const validateFileSize = (file: File, maxSizeMB: number): boolean => {
  return file.size <= maxSizeMB * 1024 * 1024;
};

export const readFileHeaders = async (file: File): Promise<string[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        if (!data) {
          reject(new Error('Failed to read file'));
          return;
        }

        // For CSV and TXT files
        if (file.type === 'text/csv' || file.type === 'text/plain' || file.name.endsWith('.csv') || file.name.endsWith('.txt')) {
          const text = data as string;
          const firstLine = text.split('\n')[0];
          const headers = firstLine.split(',').map(h => h.trim().replace(/^"|"$/g, ''));
          resolve(headers);
          return;
        }

        // For Excel files
        const workbook = XLSX.read(data, { type: 'binary' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        
        if (jsonData.length === 0) {
          reject(new Error('No data found in file'));
          return;
        }

        const headers = jsonData[0] as string[];
        resolve(headers);
      } catch (error) {
        reject(error);
      }
    };

    reader.onerror = () => {
      reject(new Error('Error reading file'));
    };

    // For Excel files
    if (file.type === 'application/vnd.ms-excel' || 
        file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
        file.name.endsWith('.xls') || 
        file.name.endsWith('.xlsx')) {
      reader.readAsBinaryString(file);
    } else {
      // For CSV and TXT files
      reader.readAsText(file);
    }
  });
};

// Mock implementation for development
export const mockReadFileHeaders = (fileName: string): string[] => {
  if (fileName.endsWith('.csv') || fileName.endsWith('.txt')) {
    return ['faxNumber', 'name', 'company', 'notes'];
  } else {
    return ['faxNumber', 'to', 'company', 'address', 'city', 'state', 'zip'];
  }
};
