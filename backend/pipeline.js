import { askLLM }
    from './services/llmService.js';

import { loadPrompt }
    from './utils/loadPrompt.js';

import { safeJsonParse }
    from './utils/parser.js';

import { saveAgent }
    from './utils/saveAgent.js';

import { runAgent }
    from './sandbox/runner.js';

import { getTestInput }
    from './utils/testInputs.js';

import { packageAgent }
    from './utils/packageAgent.js';

import { zipPackage }
    from './utils/zipPackage.js';

/*
  STEP 1
  BLUEPRINT GENERATION
*/

async function getBlueprint(
    userPrompt,
    emit
) {

    emit('status', {

        stage: 'blueprint',

        message:
            '🧠 Analysing intent...'
    });

    const orchestratorPrompt =
        loadPrompt(
            './prompts/orchestrator.txt'
        );

    const rawSpec =
        await askLLM(
            orchestratorPrompt,
            userPrompt
        );

    let blueprint;

    try {

        blueprint =
            safeJsonParse(rawSpec);

    } catch (err) {

        console.log(
            'BLUEPRINT PARSE ERROR'
        );

        console.log(rawSpec);

        throw new Error(
            'Blueprint parse failed'
        );
    }

    emit('blueprint', {
        blueprint
    });

    return blueprint;
}

/*
  STEP 2
  CODE GENERATION
*/

async function generateCode(
    blueprint,
    emit
) {

    emit('status', {

        stage: 'codegen',

        message:
            '💻 Writing agent code...'
    });

    /*
      LOAD CODEGEN PROMPT
    */

    const codegenPrompt =
        loadPrompt(
            './prompts/codegen.txt'
        );

    /*
      GENERATE CODE
    */

    let generatedCode =
        await askLLM(

            codegenPrompt

                .replace(
                    '{{BLUEPRINT}}',

                    JSON.stringify(
                        blueprint,
                        null,
                        2
                    )
                )

                .replace(
                    '{{ENTRY_POINT}}',
                    blueprint.entry_point
                ),

            ''
        );

    /*
      CLEAN MARKDOWN
    */

    generatedCode =
        generatedCode

            .replace(
                /^```python\n?/,
                ''
            )

            .replace(
                /^```\n?/,
                ''
            )

            .replace(
                /\n?```$/,
                ''
            )

            .trim();

    /*
      SAVE GENERATED FILE
    */

    const savedFile =
        saveAgent(
            generatedCode
        );

    emit('saved', savedFile);

    /*
      PREVIEW
    */

    emit('code_result', {

        code:
            generatedCode,

        preview:
            generatedCode.slice(0, 1200),

        filename:
            savedFile.filename
    });

    return {

        code:
            generatedCode,

        savedFile
    };
}

/*
  STEP 3
  EXECUTE AGENT
*/

async function executeAgent(
    blueprint,
    savedFile,
    emit
) {

    emit('status', {

        stage: 'execution',

        message:
            '🚀 Running generated agent...'
    });

    const testInput =
        getTestInput(
            blueprint
        );

    const output =
        await runAgent(
            savedFile.filename,
            testInput
        );

    emit('execution_result', {
        output
    });

    return output;
}

/*
  STEP 4
  PACKAGE AGENT
*/

async function packageGeneratedAgent(
    blueprint,
    code,
    savedFile,
    emit
) {

    emit('status', {

        stage: 'packaging',

        message:
            '📦 Packaging agent...'
    });

    const packaged =
        packageAgent(
            blueprint,
            code,
            savedFile.filename
        );

    const zipPath =
        `./generated/packages/${packaged.folderName}.zip`;

    await zipPackage(
        packaged.packagePath,
        zipPath
    );

    emit('packaged', {

        zip:
            `${packaged.folderName}.zip`
    });

    return packaged;
}

/*
  MAIN PIPELINE
*/

export async function runPipeline(
    prompt,
    emit
) {

    try {

        /*
          STEP 1
          BLUEPRINT
        */

        const blueprint =
            await getBlueprint(
                prompt,
                emit
            );

        /*
          STEP 2
          CODE GENERATION
        */

        const {
            code,
            savedFile
        } = await generateCode(
            blueprint,
            emit
        );

        /*
          STEP 3
          EXECUTION
        */

        try {

            await executeAgent(
                blueprint,
                savedFile,
                emit
            );

        } catch (err) {

            emit('error', {

                message:
                    err.toString()
            });

            emit('done', {

                success: false
            });

            return;
        }

        /*
          STEP 4
          PACKAGING
        */

        try {

            await packageGeneratedAgent(

                blueprint,

                code,

                savedFile,

                emit
            );

        } catch (err) {

            emit('error', {

                message:
                    err.toString()
            });

            emit('done', {

                success: false
            });

            return;
        }

        /*
          DONE
        */

        emit('done', {

            success: true
        });

    } catch (err) {

        console.log(err);

        emit('error', {

            message:
                err.toString()
        });

        emit('done', {

            success: false
        });
    }
}