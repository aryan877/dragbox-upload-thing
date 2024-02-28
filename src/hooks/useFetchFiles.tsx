// useFetchFiles.js
import { useState, useEffect } from 'react';
import axios from 'axios';
import { FileItem } from '@/types/FileItem';

const useFetchFiles = () => {
  const [loading, setLoading] = useState(true);
  const [files, setFiles] = useState<FileItem[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFiles = async () => {
      setLoading(true);
      try {
        const response = await axios.get<{ files: FileItem[] }>(
          '/api/get-files'
        );
        setFiles(response.data.files);
        setError(null);
      } catch (error) {
        console.error('Failed to fetch files:', error);
        setError('Failed to fetch files.');
      } finally {
        setLoading(false);
      }
    };

    fetchFiles();
  }, []);

  return { loading, files, error };
};

export default useFetchFiles;
