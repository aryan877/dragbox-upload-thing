'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { useUploadThing } from '@/utils/uploadthing';
import axios from 'axios';
import FileList from '@/components/FileList';
import { FileItem } from '@/types/FileItem';
import { UploadThingError } from 'uploadthing/server';
import Alert from '@/components/Alert';
import useFetchFiles from '@/hooks/useFetchFiles';

function Page() {
  const [uploadedFiles, setUploadedFiles] = useState<FileItem[]>([]);
  const [deleting, setDeleting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertType, setAlertType] = useState<
    'info' | 'error' | 'success' | 'warning' | ''
  >('');

  const showAlert = (
    message: string,
    type: 'info' | 'error' | 'success' | 'warning' | ''
  ) => {
    setAlertMessage(message);
    setAlertType(type);
    setTimeout(() => {
      setAlertMessage('');
      setAlertType('');
    }, 3000);
  };

  const { loading, files, error } = useFetchFiles();

  useEffect(() => {
    if (error) {
      setAlertMessage(error);
      setAlertType('error');
    }
  }, [error]);

  useEffect(() => {
    if (files.length > 0) {
      setUploadedFiles(files);
    }
  }, [files]);

  const { startUpload, isUploading } = useUploadThing('imageUploader', {
    onClientUploadComplete: (uploadedFileResponses) => {
      showAlert('Upload completed successfully!', 'success');
      const uploadedFile = uploadedFileResponses[0].serverData;
      setUploadedFiles((prevFiles) => [uploadedFile, ...prevFiles]);
      setUploadProgress(0);
    },
    onUploadError: (error) => {
      const err = error as UploadThingError;
      console.error('Failed to upload file:', error);
      showAlert(`Failed to upload file. ${err.code} ${err.message}`, 'error');
    },
    onUploadProgress: (progress) => {
      setUploadProgress(progress);
    },
    onUploadBegin: () => {
      showAlert('Upload has begun.', 'info');
    },
  });

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) {
        const file = acceptedFiles[0];
        startUpload([file]);
      }
    },
    [startUpload]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  const copyToClipboard = (url: string) => {
    navigator.clipboard.writeText(url);
    showAlert('URL copied to clipboard!', 'success');
  };

  const toggleSelection = (index: number) => {
    setUploadedFiles((prevFiles) =>
      prevFiles.map((file, i) =>
        i === index ? { ...file, isSelected: !file.isSelected } : file
      )
    );
  };

  const selectAllFiles = (isSelected: boolean) => {
    setUploadedFiles((prevFiles) =>
      prevFiles.map((file) => ({ ...file, isSelected }))
    );
  };

  const deleteSelectedFiles = async () => {
    const selectedFiles = uploadedFiles
      .filter((file) => file.isSelected)
      .map((file) => ({ _id: file._id, fileKey: file.fileKey }));

    if (selectedFiles.length === 0) {
      showAlert('No files selected for deletion.', 'warning');
      return;
    }

    try {
      setDeleting(true);
      await axios.delete('/api/delete-files', {
        data: { files: selectedFiles },
      });

      setUploadedFiles((prevFiles) =>
        prevFiles.filter(
          (file) =>
            !selectedFiles.some((selectedFile) => selectedFile._id === file._id)
        )
      );
      showAlert('Selected files deleted successfully.', 'success');
    } catch (error) {
      console.error('Failed to delete files:', error);
      showAlert('Failed to delete selected files.', 'error');
    } finally {
      setDeleting(false);
    }
  };

  const isAnyFileSelected = uploadedFiles.some((file) => file.isSelected);

  return (
    <div className="container mx-auto p-4 pb-16 mt-16 relative">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-2">Dragbox File Upload</h1>
        <p className="text-lg font-semibold text-gray-600">
          PDF & Images (up to 4 MB supported)
        </p>
      </div>

      <div
        {...getRootProps()}
        className={`p-10 border-2 border-dashed ${
          isDragActive ? 'border-primary' : 'border-base-content'
        } rounded-lg text-center`}
      >
        <input {...getInputProps()} />
        {isDragActive ? (
          <p className="text-primary">Drop the file here ...</p>
        ) : (
          <p>Drag and drop a file here, or click to select a file</p>
        )}
      </div>
      {alertMessage && alertType && (
        <Alert message={alertMessage} type={alertType} />
      )}
      <div className="mt-8">
        <h2 className="text-2xl font-semibold mb-2">Uploaded Files</h2>
        {isUploading && (
          <div className="flex justify-center items-center mb-4">
            <div
              className="radial-progress"
              //@ts-ignore
              style={{ '--value': uploadProgress }}
              role="progressbar"
            >
              {uploadProgress}%
            </div>
          </div>
        )}
        {isAnyFileSelected && (
          <div className="flex mb-2">
            <button
              className="btn btn-warning mr-2"
              onClick={() =>
                setUploadedFiles((prevFiles) =>
                  prevFiles.map((file) => ({ ...file, isSelected: false }))
                )
              }
            >
              Cancel
            </button>
            <button className="btn btn-error" onClick={deleteSelectedFiles}>
              Delete Selected Files
            </button>
          </div>
        )}

        <FileList
          loading={loading}
          selectAllFiles={selectAllFiles}
          files={uploadedFiles}
          toggleSelection={toggleSelection}
          copyToClipboard={copyToClipboard}
        />
      </div>
      {(loading || deleting) && (
        <div className="flex justify-center items-center mt-4">
          <div
            className="radial-progress animate-spin"
            //@ts-ignore
            style={{ '--size': '3rem' }}
          ></div>
        </div>
      )}
    </div>
  );
}

export default Page;
