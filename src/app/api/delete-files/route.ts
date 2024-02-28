import FileModel from '@/model/File';
import dbConnect from '@/utils/dbConnect';
import { auth } from '@clerk/nextjs/server';
import { UTApi } from 'uploadthing/server';

export const utapi = new UTApi();

export async function DELETE(request: Request) {
  await dbConnect();
  const user = auth();

  if (!user) {
    return Response.json(
      { success: false, message: 'Not authenticated' },
      { status: 401 }
    );
  }
  const { files } = await request.json();

  type FileType = {
    _id: string;
    fileKey: string;
  };

  const fileIds = files.map((file: FileType) => file._id);

  const fileKeys = files.map((file: FileType) => file.fileKey);

  try {
    const deleteResult = await FileModel.deleteMany({
      _id: { $in: fileIds },
      userId: user.userId,
    });

    if (deleteResult.deletedCount === 0) {
      return Response.json(
        {
          message: 'Files not found or already deleted',
          success: false,
        },
        { status: 404 }
      );
    }

    await utapi.deleteFiles(fileKeys);

    return Response.json(
      { message: 'Files deleted', success: true },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting files:', error);
    return Response.json(
      { message: 'Error deleting files', success: false },
      { status: 500 }
    );
  }
}
