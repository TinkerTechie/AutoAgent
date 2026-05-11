import fs from 'fs';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);

const archiver = require('archiver');

export function zipPackage(
    sourceFolder,
    outputZip
) {

    return new Promise(
        (resolve, reject) => {

            const output =
                fs.createWriteStream(outputZip);

            const archive =
                archiver('zip', {
                    zlib: { level: 9 }
                });

            output.on(
                'close',
                () => resolve()
            );

            archive.on(
                'error',
                err => reject(err)
            );

            archive.pipe(output);

            archive.directory(
                sourceFolder,
                false
            );

            archive.finalize();
        }
    );
}