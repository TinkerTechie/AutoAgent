export function getTestInput(
    spec
) {

    const input = {};

    const entryTool =
        spec.tools.find(
            tool =>
                tool.name ===
                spec.entry_point
        );

    if (!entryTool) {
        return {};
    }

    const params =
        entryTool.parameters;

    for (const key in params) {

        const type =
            params[key].type;

        if (
            key.includes('theme')
        ) {

            input[key] =
                'love';
        }

        else if (
            key.includes('mood')
        ) {

            input[key] =
                'happy';
        }

        else if (
            key.includes('genre')
        ) {

            input[key] =
                'pop';
        }

        else if (
            key.includes('csv')
        ) {

            input[key] =
                './sample.csv';
        }

        else if (
            type === 'string'
        ) {

            input[key] =
                'example';
        }

        else if (
            type === 'int'
        ) {

            input[key] = 1;
        }

        else if (
            type === 'float'
        ) {

            input[key] = 1.5;
        }

        else if (
            type === 'bool'
        ) {

            input[key] = true;
        }

        else if (
            type === 'list'
        ) {

            input[key] = [];
        }
    }

    return input;
}