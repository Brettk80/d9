import React, { useState, useEffect } from 'react';
import { X, Loader2, FileText, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import GoogleDriveButton from './GoogleDriveButton';

interface GoogleDrivePickerProps {
  onFileSelected: (file: File) => void;
  onClose: () => void;
  allowedMimeTypes?: string[];
}

const GoogleDrivePicker: React.FC<GoogleDrivePickerProps> = ({
  onFileSelected,
  onClose,
  allowedMimeTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ]
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [files, setFiles] = useState<any[]>([]);
  const [selectedFileId, setSelectedFileId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Check if we're in development mode
  const isDevelopment = import.meta.env.DEV && !import.meta.env.VITE_GOOGLE_CLIENT_ID;

  const handleAuthSuccess = async (response: any) => {
    setIsLoading(true);
    setError(null);

    try {
      if (isDevelopment) {
        // Mock data for development
        await new Promise(resolve => setTimeout(resolve, 1000));
        setFiles([
          {
            id: '1',
            name: 'Contract.pdf',
            mimeType: 'application/pdf',
            iconLink: '',
            modifiedTime: new Date().toISOString(),
            size: '1.2 MB'
          },
          {
            id: '2',
            name: 'Proposal.docx',
            mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            iconLink: '',
            modifiedTime: new Date().toISOString(),
            size: '0.8 MB'
          },
          {
            id: '3',
            name: 'Agreement.doc',
            mimeType: 'application/msword',
            iconLink: '',
            modifiedTime: new Date().toISOString(),
            size: '0.5 MB'
          }
        ]);
        setIsAuthenticated(true);
        return;
      }

      const { credential } = response;
      if (!credential) {
        throw new Error('Authentication failed');
      }

      // Use fetch with credentials to maintain session cookies
      const apiResponse = await fetch('/api/google/files', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ credential }),
        credentials: 'include'
      });

      if (!apiResponse.ok) {
        throw new Error('Failed to fetch files from Google Drive');
      }

      const { files: driveFiles } = await apiResponse.json();
      
      // Filter to only include allowed file types
      const filteredFiles = driveFiles.filter((file: any) => 
        allowedMimeTypes.includes(file.mimeType)
      );
      
      setFiles(filteredFiles);
      setIsAuthenticated(true);

    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load files from Google Drive';
      setError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileSelect = async () => {
    if (!selectedFileId) return;

    setIsLoading(true);
    setError(null);
    
    try {
      const selectedFile = files.find(f => f.id === selectedFileId);
      if (!selectedFile) throw new Error('File not found');

      if (!allowedMimeTypes.includes(selectedFile.mimeType)) {
        throw new Error(`Invalid file type. Only ${allowedMimeTypes.map(type => type.split('/')[1].toUpperCase()).join(', ')} files are supported.`);
      }

      if (isDevelopment) {
        // Mock file download for development
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        let mockBlob;
        if (selectedFile.mimeType === 'application/pdf') {
          // Create a simple PDF-like blob
          mockBlob = new Blob(['%PDF-1.5\n1 0 obj\n<</Type/Catalog/Pages 2 0 R>>\nendobj\n2 0 obj\n<</Type/Pages/Kids[3 0 R]/Count 1>>\nendobj\n3 0 obj\n<</Type/Page/MediaBox[0 0 612 792]/Parent 2 0 R/Resources<<>>>>\nendobj\nxref\n0 4\n0000000000 65535 f\n0000000010 00000 n\n0000000053 00000 n\n0000000102 00000 n\n trailer\n<</Size 4/Root 1 0 R>>\nstartxref\n149\n%%EOF'], 
            { type: 'application/pdf' });
        } else {
          // Create a simple text blob for other document types
          mockBlob = new Blob(['This is a mock document content for ' + selectedFile.name], 
            { type: selectedFile.mimeType });
        }
        
        const file = new File([mockBlob], selectedFile.name, { type: selectedFile.mimeType });
        
        // Use a controlled closure to preserve authentication context
        const preserveAuth = () => {
          onFileSelected(file);
          onClose();
          toast.success(`${selectedFile.name} imported successfully`);
        };
        
        preserveAuth();
        return;
      }

      // Use fetch with credentials to maintain session cookies
      const response = await fetch(`/api/google/download?fileId=${selectedFileId}`, {
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error('Failed to download file');
      }

      const blob = await response.blob();
      const file = new File([blob], selectedFile.name, { type: selectedFile.mimeType });
      
      // Use a controlled closure to preserve authentication context
      const preserveAuth = () => {
        onFileSelected(file);
        onClose();
        toast.success(`${selectedFile.name} imported successfully`);
      };
      
      preserveAuth();

    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to import file';
      setError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredFiles = searchQuery
    ? files.filter(file => 
        file.name.toLowerCase().includes(searchQuery.toLowerCase()) && 
        allowedMimeTypes.includes(file.mimeType)
      )
    : files.filter(file => allowedMimeTypes.includes(file.mimeType));

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] flex flex-col"
      >
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-lg font-medium">Import from Google Drive</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {!isAuthenticated ? (
          <div className="flex-1 flex items-center justify-center p-8">
            <div className="text-center">
              {isDevelopment && (
                <div className="mb-4 p-4 bg-yellow-50 border border-yellow-100 rounded-lg">
                  <p className="text-sm text-yellow-700">
                    Development mode: Using mock Google Drive integration
                  </p>
                </div>
              )}
              <GoogleDriveButton 
                onSuccess={handleAuthSuccess}
                isDevelopment={isDevelopment}
              />
              <p className="mt-4 text-sm text-gray-500">
                Connect to Google Drive to import your documents
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Only PDF, DOC, and DOCX files will be shown
              </p>
            </div>
          </div>
        ) : (
          <>
            <div className="p-4 border-b">
              <input
                type="text"
                placeholder="Search files..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
              <p className="mt-2 text-xs text-gray-500">
                Showing only PDF, DOC, and DOCX files
              </p>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              {isLoading && !files.length ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="animate-spin h-8 w-8 text-blue-500" />
                  <p className="ml-2 text-gray-600">Loading files...</p>
                </div>
              ) : filteredFiles.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  {searchQuery ? 'No matching files found' : 'No files found'}
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredFiles.map(file => (
                    <div
                      key={file.id}
                      onClick={() => setSelectedFileId(file.id)}
                      className={`flex items-center p-3 rounded-lg cursor-pointer ${
                        selectedFileId === file.id
                          ? 'bg-blue-50 border border-blue-200'
                          : 'hover:bg-gray-50 border border-gray-200'
                      }`}
                    >
                      <FileText className="h-5 w-5 text-gray-400 mr-3" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{file.name}</p>
                        <p className="text-xs text-gray-500">
                          {file.size} • Modified {new Date(file.modifiedTime).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {error && (
              <div className="p-4 bg-red-50 border-t border-red-100">
                <div className="flex gap-3">
                  <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            )}

            <div className="p-4 border-t flex justify-end space-x-3">
              <button
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleFileSelect}
                disabled={!selectedFileId || isLoading}
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />
                    Importing...
                  </>
                ) : (
                  'Select'
                )}
              </button>
            </div>
          </>
        )}
      </motion.div>
    </div>
  );
};

export default GoogleDrivePicker;
