import fs from 'fs';

import * as archiverModule
    from 'archiver';

const archiver =
    archiverModule.default ||
    archiverModule;

export function zipPackage(
    sourceDir,
    outPath
) {

    return new Promise(

        (
            resolve,
            reject
        ) => {

            const output =
                fs.createWriteStream(
                    outPath
                );

            const archive =
                archiver(
                    'zip',
                    {
                        zlib: {
                            level: 9
                        }
                    }
                );

            output.on(
                'close',

                () => {

                    resolve();
                }
            );

            archive.on(
                'error',

                err => {

                    reject(err);
                }
            );

            archive.pipe(
                output
            );

            archive.directory(
                sourceDir,
                false
            );

            archive.finalize();
        }
    );
}