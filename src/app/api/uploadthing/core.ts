import { createUploadthing, type FileRouter } from 'uploadthing/next';
import { UploadThingError } from 'uploadthing/server';
import { auth } from '@clerk/nextjs/server';
import FileModel from '@/model/File';
import dbConnect from '@/utils/dbConnect';
import { FileItem } from '@/types/FileItem';

const f = createUploadthing();

export const ourFileRouter = {
  imageUploader: f({
    image: { maxFileSize: '4MB' },
    pdf: { maxFileSize: '4MB' },
  })
    .middleware(async ({ req, res }) => {
      const user = auth();
      if (!user)
        throw new UploadThingError(
          'You must be logged in to upload a profile picture'
        );
      console.log(user);
      return { userId: user.userId };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      await dbConnect();
      console.log('reached');

      const newFile = new FileModel({
        userId: metadata.userId,
        fileKey: file.key,
        url: file.url,
        fileName: file.name,
        fileSize: file.size,
      });

      await newFile.save();

      const savedFile: FileItem = {
        _id: newFile._id,
        fileKey: file.key,
        url: file.url,
        fileName: file.name,
        fileSize: `${(file.size / 1024).toFixed(2)} KB`,
        createdAt: newFile.createdAt.toISOString(),
        isSelected: false,
      };

      return savedFile;
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
