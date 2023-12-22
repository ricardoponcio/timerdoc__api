import { AppMimeType, BufferedFile } from '@storage/storage.interfaces';

export class AttachedFileEntity implements BufferedFile {

    fieldname: string;
    originalname: string;
    encoding: string;
    mimetype: AppMimeType;
    size: number;
    buffer: string | Buffer;

    encodedName: string;
    reference: string;
    path: string;
    bucket: string;

}
