import { spawn }
    from 'child_process';

import path from 'path';
import { GENERATED_AGENTS_DIR } from '../utils/paths.js';

const TIMEOUT =
    parseInt(
        process.env.SANDBOX_TIMEOUT_MS
    ) || 5000;

export function runAgent(
    agentFilename,
    inputArgs
) {

    return new Promise(
        (resolve, reject) => {

            /*
              Convert input
              to JSON
            */

            const argsJson =
                JSON.stringify(
                    inputArgs
                );

            /*
              Full path
            */

            const agentPath =
                path.join(GENERATED_AGENTS_DIR, agentFilename);

            /*
              Spawn isolated process
            */

            const child =
                spawn(

                    'python3',

                    [
                        agentPath,
                        argsJson
                    ],

                    {

                        timeout:
                            TIMEOUT,

                        env: {

                            /*
                              Minimal env
                            */

                            PATH:
                                process.env.PATH,

                            HOME:
                                process.env.HOME,

                            /*
                              Runtime AI support
                            */

                            ...(process.env.OPENROUTER_API_KEY && {

                                OPENROUTER_API_KEY:
                                    process.env.OPENROUTER_API_KEY
                            }),

                            ...(process.env.OPENAI_API_KEY && {

                                OPENAI_API_KEY:
                                    process.env.OPENAI_API_KEY
                            })
                        }
                    }
                );

            let stdout = '';
            let stderr = '';

            /*
              Capture stdout
            */

            child.stdout.on(
                'data',
                data => {

                    stdout +=
                        data.toString();
                }
            );

            /*
              Capture stderr
            */

            child.stderr.on(
                'data',
                data => {

                    stderr +=
                        data.toString();
                }
            );

            /*
              Process closed
            */

            child.on(
                'close',

                exitCode => {

                    /*
                      Failure
                    */

                    if (
                        exitCode !== 0
                    ) {

                        resolve({

                            success: false,

                            exitCode,

                            stdout:
                                stdout.trim(),

                            stderr:
                                stderr.trim(),

                            output: null
                        });

                        return;
                    }

                    /*
                      Parse JSON output
                    */

                    let output;

                    try {

                        output =
                            JSON.parse(
                                stdout.trim()
                            );

                    } catch (_) {

                        output =
                            stdout.trim();
                    }

                    /*
                      Success
                    */

                    resolve({

                        success: true,

                        exitCode: 0,

                        stdout:
                            stdout.trim(),

                        stderr: '',

                        output
                    });
                }
            );

            /*
              Spawn errors
            */

            child.on(
                'error',

                err => {

                    reject(

                        new Error(

                            'Spawn error: ' +

                            err.message
                        )
                    );
                }
            );

            /*
              Force timeout kill
            */

            setTimeout(() => {

                child.kill(
                    'SIGKILL'
                );

                resolve({

                    success: false,

                    exitCode: -1,

                    stdout: '',

                    stderr:
                        'Timeout exceeded',

                    output: null
                });

            }, TIMEOUT + 500);
        }
    );
}