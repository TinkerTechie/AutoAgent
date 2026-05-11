export default function TestResults({

    results

}) {

    if (
        results.length === 0
    ) {

        return null;
    }

    return (

        <div

            style={{

                border:
                    '1px solid #334155',

                borderRadius: 12,

                padding: 16,

                marginTop: 12,

                background:
                    '#111827'
            }}
        >

            <div

                style={{

                    fontSize: 12,

                    fontWeight: 700,

                    color: '#94a3b8',

                    marginBottom: 14,

                    letterSpacing: 1
                }}
            >

                TEST RESULTS

            </div>

            {
                results.map(

                    (
                        result,
                        i
                    ) => (

                        <div

                            key={i}

                            style={{

                                display: 'flex',

                                alignItems:
                                    'flex-start',

                                gap: 10,

                                padding:
                                    '12px 0',

                                borderBottom:
                                    '1px solid #1e293b',

                                opacity: 0,

                                animation:
                                    `fadeIn 0.35s ease forwards`,

                                animationDelay:
                                    `${i * 120}ms`
                            }}
                        >

                            {/* BADGE */}

                            <span

                                style={{

                                    background:

                                        result.passed

                                            ? '#052e16'

                                            : '#450a0a',

                                    color:

                                        result.passed

                                            ? '#4ade80'

                                            : '#f87171',

                                    padding:
                                        '4px 10px',

                                    borderRadius: 999,

                                    fontSize: 11,

                                    fontWeight: 700,

                                    flexShrink: 0,

                                    border:

                                        result.passed

                                            ? '1px solid #166534'

                                            : '1px solid #991b1b'
                                }}
                            >

                                {
                                    result.passed

                                        ? 'PASS'

                                        : 'FAIL'
                                }

                            </span>

                            {/* CONTENT */}

                            <div
                                style={{
                                    flex: 1
                                }}
                            >

                                <div

                                    style={{

                                        fontSize: 14,

                                        fontWeight: 600,

                                        color: 'white'
                                    }}
                                >

                                    {
                                        result.name
                                    }

                                </div>

                                {/* STDERR */}

                                {
                                    result.stderr && (

                                        <div

                                            style={{

                                                fontSize: 11,

                                                color: '#f87171',

                                                marginTop: 6,

                                                fontFamily:
                                                    'monospace',

                                                whiteSpace:
                                                    'pre-wrap'
                                            }}
                                        >

                                            {
                                                result.stderr.slice(
                                                    0,
                                                    160
                                                )
                                            }

                                        </div>
                                    )
                                }

                                {/* OUTPUT */}

                                {
                                    result.output && (

                                        <div

                                            style={{

                                                fontSize: 11,

                                                color: '#cbd5e1',

                                                marginTop: 6,

                                                fontFamily:
                                                    'monospace',

                                                background:
                                                    '#020617',

                                                padding: 10,

                                                borderRadius: 8,

                                                overflowX:
                                                    'auto'
                                            }}
                                        >

                                            →

                                            {' '}

                                            {
                                                JSON.stringify(

                                                    result.output,

                                                    null,

                                                    2
                                                ).slice(
                                                    0,
                                                    240
                                                )
                                            }

                                        </div>
                                    )
                                }
                            </div>
                        </div>
                    )
                )
            }

            {/* INLINE ANIMATION */}

            <style>

                {`
                    @keyframes fadeIn {
                        from {
                            opacity: 0;
                            transform: translateY(8px);
                        }
                        to {
                            opacity: 1;
                            transform: translateY(0);
                        }
                    }
                `}
            </style>
        </div>
    );
}