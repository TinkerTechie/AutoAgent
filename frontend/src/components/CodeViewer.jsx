import {
    useEffect,
    useRef
}
    from 'react';

import Prism
    from 'prismjs';

import 'prismjs/components/prism-python';

import 'prismjs/themes/prism-tomorrow.css';

export default function CodeViewer({

    code,

    agentName

}) {

    const codeRef =
        useRef(null);

    /*
      Highlight code
    */

    useEffect(() => {

        if (
            codeRef.current
        ) {

            Prism.highlightElement(
                codeRef.current
            );
        }

    }, [code]);

    /*
      Empty state
    */

    if (!code) {

        return (

            <div

                style={{

                    border:
                        '1px solid #334155',

                    borderRadius: 12,

                    minHeight: 500,

                    display: 'flex',

                    alignItems: 'center',

                    justifyContent: 'center',

                    background:
                        '#020617',

                    color: '#64748b',

                    fontSize: 14
                }}
            >

                Generated Python code will appear here

            </div>
        );
    }

    return (

        <div

            style={{

                border:
                    '1px solid #334155',

                borderRadius: 12,

                overflow: 'hidden',

                background:
                    '#020617'
            }}
        >

            {/* HEADER */}

            <div

                style={{

                    background:
                        '#111827',

                    padding:
                        '10px 16px',

                    fontSize: 12,

                    color: '#94a3b8',

                    borderBottom:
                        '1px solid #1e293b',

                    display: 'flex',

                    justifyContent:
                        'space-between',

                    alignItems: 'center'
                }}
            >

                <span>

                    🐍

                    {' '}

                    {
                        agentName ||
                        'generated_agent'
                    }

                    .py

                </span>

                <span>

                    {
                        code
                            .split('\n')
                            .length
                    }

                    {' '}lines

                </span>
            </div>

            {/* CODE */}

            <pre

                style={{

                    margin: 0,

                    padding: 20,

                    overflowX: 'auto',

                    overflowY: 'auto',

                    maxHeight: 700,

                    fontSize: 13,

                    lineHeight: 1.6,

                    fontFamily:
                        'Fira Code, monospace',

                    background:
                        '#020617'
                }}
            >

                <code

                    ref={codeRef}

                    className="language-python"
                >

                    {code}

                </code>
            </pre>
        </div>
    );
}