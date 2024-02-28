import { Upload } from 'lucide-react';

export default function Home() {
  return (
    <>
      {/* Main content */}
      <main className="flex-grow flex flex-col items-center justify-center px-4 md:px-24 py-12 bg-base-200">
        <section className="text-center mb-8 md:mb-12">
          <h1 className="text-3xl md:text-5xl font-bold">Welcome to Dragbox</h1>
          <p className="mt-3 md:mt-4 text-base md:text-lg">
            The simplest way to upload and share your files.
          </p>
          <p className="mt-3 md:mt-4 text-sm md:text-base">
            Powered by{' '}
            <a
              href="https://uploadthing.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary"
            >
              UploadThing
            </a>{' '}
            by Theo
          </p>
        </section>

        {/* Upload section */}
        <div className="card w-full max-w-md bg-base-100 shadow-xl">
          <div className="card-body">
            <div className="flex flex-col items-center justify-center">
              <Upload className="w-12 h-12 mb-4" />
              <p className="mb-4">Drag and drop your files here</p>
              <p className="mb-4">or</p>
              <button className="btn btn-primary">Browse files</button>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center p-4 md:p-6 bg-base-300">
        © 2023 Dragbox. All rights reserved.
      </footer>
    </>
  );
}
