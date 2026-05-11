import fs from 'fs';
import path from 'path';
import { execSync }
    from 'child_process';

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

import { packageAgent }
    from './utils/packageAgent.js';

import { zipPackage }
    from './utils/zipPackage.js';

import {
    GENERATED_AGENTS_DIR,
    GENERATED_PACKAGES_DIR,
    CACHE_DIR
} from './utils/paths.js';

/*
  INSTALL DEPENDENCIES
*/

function installDeps(
    dependencies
) {

    if (
        !dependencies ||
        dependencies.length === 0
    ) {

        return;
    }

    /*
      Remove dangerous input
    */

    const safeDeps =
        dependencies.filter(

            dep =>

                typeof dep === 'string' &&

                !dep.includes('&') &&

                !dep.includes(';') &&

                !dep.includes('|')
        );

    if (
        safeDeps.length === 0
    ) {

        return;
    }

    const pkgs =
        safeDeps.join(' ');

    try {

        execSync(

            `python3 -m pip install ${pkgs} --quiet`,

            {
                timeout: 60000,
                stdio: 'ignore'
            }
        );

    } catch (err) {

        // On Render free tier pip install may fail due to sandbox restrictions.
        // Log a warning but let the pipeline continue — stdlib packages still work.
        console.warn(
            `[warn] Dependency install failed for: ${pkgs} — continuing anyway`
        );
    }
}

/*
  CREATE TEST CSV FILES
*/

function ensureTestFiles() {

    /*
      Happy path
    */

    if (
        !fs.existsSync(
            'example.csv'
        )
    ) {

        fs.writeFileSync(

            'example.csv',

            `name,age,salary
Alice,25,50000
Bob,30,60000
Charlie,28,55000`
        );
    }

    /*
      Empty CSV
    */

    if (
        !fs.existsSync(
            'empty.csv'
        )
    ) {

        fs.writeFileSync(

            'empty.csv',

            `name,age,salary`
        );
    }

    /*
      Edge case CSV
    */

    if (
        !fs.existsSync(
            'edge_case.csv'
        )
    ) {

        fs.writeFileSync(

            'edge_case.csv',

            `name,age,salary
Alice,,50000
Bob,30,
Charlie,28,55000`
        );
    }
}
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
  GENERATE CODE
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

    const codegenPrompt =
        loadPrompt(
            './prompts/codegen.txt'
        );

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
      Remove markdown
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
      Save file
    */

    const savedFile =
        saveAgent(
            generatedCode
        );

    emit('saved', savedFile);

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
  RUN TESTS
*/

async function runTests(
    blueprint,
    savedFile,
    emit
) {

    emit('status', {

        stage: 'testing',

        message:
            '🧪 Running test cases...'
    });

    /*
      Ensure CSV test files exist
    */

    ensureTestFiles();

    const results = [];

    for (
        const testCase of
        (blueprint.test_cases || [])
    ) {

        emit('test_start', {

            name:
                testCase.name
        });

        const result =
            await runAgent(

                savedFile.filename,

                testCase.input || {}
            );

        let passed = false;

        /*
          Expected success
        */

        if (
            result.success &&
            testCase.should_pass
        ) {

            const outputStr =
                JSON.stringify(
                    result.output
                );

            passed =
                outputStr.includes(
                    testCase.expected_output_contains
                );
        }

        /*
          Expected failure
        */

        else if (
            !testCase.should_pass
        ) {

            const outputStr =
                JSON.stringify(
                    result.output
                );

            passed =
                outputStr.includes(
                    testCase.expected_output_contains
                );
        }
        const testResult = {

            name:
                testCase.name,

            passed,

            output:
                result.output,

            stderr:
                result.stderr,

            exitCode:
                result.exitCode
        };

        results.push(
            testResult
        );

        emit(
            'test_result',
            testResult
        );
    }

    const allPassed =
        results.every(
            result =>
                result.passed
        );

    emit('tests_done', {

        allPassed,

        results
    });

    return {

        results,

        allPassed
    };
}

/*
  STEP 4
  SELF HEAL
*/

async function fixCode(
    code,
    blueprint,
    failedTests,
    savedFile,
    emit,
    iteration
) {

    const maxIter =
        parseInt(
            process.env.MAX_FIX_ITERATIONS
        ) || 3;

    if (
        iteration > maxIter
    ) {

        emit('fix_gave_up', {

            iteration,

            reason:
                'max iterations reached'
        });

        return {

            fixedCode: code,

            savedFile
        };
    }

    emit('status', {

        stage: 'fixing',

        message:
            `🔧 Fixing errors (${iteration}/${maxIter})...`
    });

    const errorContext =
        failedTests

            .map(test =>

                `
Test:
${test.name}

Exit Code:
${test.exitCode}

Stderr:
${test.stderr}

Output:
${JSON.stringify(
                    test.output,
                    null,
                    2
                )}
`
            )

            .join('\n---\n');

    const fixPrompt = `
This Python AI agent failed its tests.

CURRENT CODE:

${code}

FAILED TESTS:

${errorContext}

TASK:

Fix the code so the tests pass.

RULES:

- Output ONLY Python code
- No markdown
- No explanations
- Preserve the __main__ block
- Keep same function names
- Maintain compatibility
`;

    let fixedCode =
        await askLLM(
            fixPrompt,
            ''
        );

    fixedCode =
        fixedCode

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
      Overwrite file
    */

    const fullPath =
        path.join(GENERATED_AGENTS_DIR, savedFile.filename);

    fs.writeFileSync(
        fullPath,
        fixedCode
    );

    emit('fix_result', {

        iteration,

        code: fixedCode,

        preview:
            fixedCode.slice(0, 1000)
    });

    return {

        fixedCode,

        savedFile
    };
}

/*
  STEP 5
  PACKAGE
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
        path.join(GENERATED_PACKAGES_DIR, '..', 'packages', `${packaged.folderName}.zip`);

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

    /*
      CACHE SETUP — use absolute path
    */

    await fs.promises.mkdir(
        CACHE_DIR,
        {
            recursive: true
        }
    );

    const cacheKey =
        prompt

            .toLowerCase()

            .replace(/\s+/g, '_')

            .replace(/[^a-z0-9_]/g, '')

            .slice(0, 60);

    const cachePath =
        path.join(
            CACHE_DIR,
            `${cacheKey}.json`
        );

    try {

        /*
          RECORD EVENTS
        */

        const recordedEvents = [];

        const emitAndRecord =
            (
                type,
                data
            ) => {

                recordedEvents.push({
                    type,
                    data
                });

                emit(
                    type,
                    data
                );
            };

        /*
          USE CACHE
        */

        try {

            if (
                process.env.USE_CACHE === 'true'
            ) {

                const cached =
                    JSON.parse(

                        await fs.promises.readFile(
                            cachePath,
                            'utf8'
                        )
                    );

                if (
                    cached?.events
                ) {

                    for (
                        const ev of
                        cached.events
                    ) {

                        emit(
                            ev.type,
                            ev.data
                        );

                        await new Promise(

                            resolve =>
                                setTimeout(
                                    resolve,
                                    250
                                )
                        );
                    }

                    return;
                }
            }

        } catch (_) {

            /*
              No cache found
            */
        }

        /*
          STEP 1
          BLUEPRINT
        */

        const blueprint =
            await getBlueprint(
                prompt,
                emitAndRecord
            );

        /*
          STEP 2
          INSTALL DEPENDENCIES
        */

        emitAndRecord(

            'status',

            {

                stage: 'deps',

                message:
                    '📦 Installing dependencies...'
            }
        );

        installDeps(
            blueprint.dependencies
        );

        /*
          STEP 3
          GENERATE CODE
        */

        let {

            code,

            savedFile

        } = await generateCode(

            blueprint,

            emitAndRecord
        );

        /*
          STEP 4
          TESTS
        */

        let {

            results,

            allPassed

        } = await runTests(

            blueprint,

            savedFile,

            emitAndRecord
        );

        /*
          STEP 5
          SELF-HEAL LOOP
        */

        let iteration = 1;

        while (

            !allPassed &&

            iteration <= (
                parseInt(
                    process.env.MAX_FIX_ITERATIONS
                ) || 3
            )
        ) {

            const failed =
                results.filter(

                    result =>
                        !result.passed
                );

            const fix =
                await fixCode(

                    code,

                    blueprint,

                    failed,

                    savedFile,

                    emitAndRecord,

                    iteration
                );

            code =
                fix.fixedCode;

            ({
                results,
                allPassed

            } = await runTests(

                blueprint,

                savedFile,

                emitAndRecord
            ));

            iteration++;
        }

        /*
          STEP 6
          PACKAGE
        */

        try {

            await packageGeneratedAgent(

                blueprint,

                code,

                savedFile,

                emitAndRecord
            );

        } catch (err) {

            emitAndRecord(

                'error',

                {

                    message:
                        err.toString()
                }
            );

            emitAndRecord(

                'done',

                {

                    success: false
                }
            );

            return;
        }

        /*
          FINAL EVENT
        */

        emitAndRecord(

            'agent_ready',

            {

                agentName:
                    blueprint.agent_name,

                allPassed,

                finalResults:
                    results
            }
        );

        /*
          SAVE CACHE
        */

        await fs.promises.writeFile(

            cachePath,

            JSON.stringify(

                {

                    createdAt:
                        Date.now(),

                    prompt,

                    events:
                        recordedEvents

                },

                null,

                2
            )
        );

        /*
          DONE
        */

        emitAndRecord(

            'done',

            {

                success: true
            }
        );

    } catch (err) {

        console.log(err);

        emit(

            'error',

            {

                message:
                    err.toString()
            }
        );

        emit(

            'done',

            {

                success: false
            }
        );
    }
}