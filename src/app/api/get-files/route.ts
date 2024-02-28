import dbConnect from '@/utils/dbConnect';
import FileModel from '@/model/File';
import { auth } from '@clerk/nextjs/server';
import { FileItem } from '@/types/FileItem';

export async function GET(request: Request) {
  await dbConnect();
  const user = auth();

  if (!user) {
    return Response.json(
      { success: false, message: 'Not authenticated' },
      { status: 401 }
    );
  }

  try {
    const files = await FileModel.find({ userId: user.userId }).exec();
    const filteredFiles: FileItem[] = files.map((file) => {
      return {
        _id: file._id,
        fileName: file.fileName,
        fileSize: `${(Number(file.fileSize) / 1024).toFixed(2)} KB`,
        url: file.url,
        createdAt: file.createdAt.toISOString(),
        isSelected: false,
        fileKey: file.fileKey,
      };
    });

    return Response.json({ files: filteredFiles }, { status: 200 });
  } catch (error) {
    console.error('An unexpected error occurred:', error);
    return Response.json(
      { message: 'Internal server error', success: false },
      { status: 500 }
    );
  }
}
