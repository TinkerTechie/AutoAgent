import { exec }
    from 'child_process';

export function runAgent(
    filename,
    inputData
) {

    return new Promise(
        (resolve, reject) => {

            /*
              Convert input object
              to JSON string
            */

            const args =
                JSON.stringify(
                    inputData
                ).replace(
                    /"/g,
                    '\\"'
                );

            /*
              Execute generated file
            */

            const command =
                `python3 generated/agents/${filename} "${args}"`;

            exec(

                command,

                {
                    cwd: process.cwd()
                },

                (
                    error,
                    stdout,
                    stderr
                ) => {

                    if (error) {

                        reject(
                            stderr || error.message
                        );

                        return;
                    }

                    resolve(
                        stdout.trim()
                    );
                }
            );
        }
    );
}