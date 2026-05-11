import fs from 'fs';

import path from 'path';

export function packageAgent(
    spec,
    code,
    filename
) {

    const folderName =
        filename.replace(
            '.py',
            ''
        );

    const packagePath =
        path.join(

            process.cwd(),

            'generated',

            'packages',

            folderName
        );

    /*
      CREATE FOLDER
    */

    fs.mkdirSync(
        packagePath,
        {
            recursive: true
        }
    );

    /*
      main.py
    */

    fs.writeFileSync(

        path.join(
            packagePath,
            'main.py'
        ),

        code
    );

    /*
      README.md
    */

    const readme = `
# ${spec.agent_name}

## Description

${spec.description}

## Language

${spec.language}

## Entry Point

${spec.entry_point}

## Dependencies

${(spec.dependencies || [])
            .join(', ')}

## Run

python main.py '{}'

## Example Input

See:
example_input.json
`;

    fs.writeFileSync(

        path.join(
            packagePath,
            'README.md'
        ),

        readme
    );

    /*
      example_input.json
    */

    const exampleInput = {};

    /*
      Find entry point tool
    */

    const entryTool =
        (spec.tools || [])
            .find(

                tool =>
                    tool.name ===
                    spec.entry_point
            );

    /*
      Build example input
    */

    if (
        entryTool &&
        entryTool.parameters
    ) {

        Object.entries(
            entryTool.parameters
        ).forEach(

            ([key, value]) => {

                const type =
                    value.type;

                if (
                    key.includes('csv')
                ) {

                    exampleInput[key] =
                        './sample.csv';
                }

                else if (
                    key.includes('theme')
                ) {

                    exampleInput[key] =
                        'love';
                }

                else if (
                    key.includes('genre')
                ) {

                    exampleInput[key] =
                        'pop';
                }

                else if (
                    key.includes('mood')
                ) {

                    exampleInput[key] =
                        'happy';
                }

                else if (
                    type === 'string'
                ) {

                    exampleInput[key] =
                        'example';
                }

                else if (
                    type === 'int'
                ) {

                    exampleInput[key] = 1;
                }

                else if (
                    type === 'float'
                ) {

                    exampleInput[key] = 1.5;
                }

                else if (
                    type === 'bool'
                ) {

                    exampleInput[key] = true;
                }

                else if (
                    type === 'list'
                ) {

                    exampleInput[key] = [];
                }
            }
        );
    }

    fs.writeFileSync(

        path.join(
            packagePath,
            'example_input.json'
        ),

        JSON.stringify(
            exampleInput,
            null,
            2
        )
    );

    /*
      requirements.txt
    */

    const requirements =
        (spec.dependencies || [])
            .join('\n');

    fs.writeFileSync(

        path.join(
            packagePath,
            'requirements.txt'
        ),

        requirements
    );

    return {

        folderName,

        packagePath
    };
}