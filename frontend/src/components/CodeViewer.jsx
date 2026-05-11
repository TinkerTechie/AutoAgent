import { Prism as SyntaxHighlighter }
    from 'react-syntax-highlighter';

import { oneDark }
    from 'react-syntax-highlighter/dist/esm/styles/prism';

export default function CodeViewer({
    code
}) {

    if (!code) return null;

    return (

        <div
            style={{
                marginTop: '30px',
                width: '100%'
            }}
        >

            <h2>
                Generated Python Code
            </h2>

            <div
                style={{
                    overflowX: 'auto',
                    borderRadius: '12px'
                }}
            >

                <SyntaxHighlighter
                    language="python"
                    style={oneDark}
                    customStyle={{
                        padding: '20px',
                        fontSize: '14px',
                        borderRadius: '12px',
                        maxWidth: '100%'
                    }}
                    wrapLongLines={true}
                >
                    {code}
                </SyntaxHighlighter>

            </div>

        </div>
    );
}