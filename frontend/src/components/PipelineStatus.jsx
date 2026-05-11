const ICONS = {

    status: '⚙️',

    blueprint: '🧩',

    code: '💻',

    test_start: '🧪',

    test_result: '🧪',

    fix_result: '🔧',

    packaged: '📦',

    agent_ready: '✅',

    error: '❌',

    fix_gave_up: '⚠️'
};

export default function PipelineStatus({

    events,

    isRunning

}) {

    return (

        <div

            style={{

                border:
                    '1px solid #334155',

                borderRadius: 12,

                padding: 16,

                background:
                    '#111827',

                maxHeight: 320,

                overflowY: 'auto'
            }}
        >

            <div

                style={{

                    fontSize: 12,

                    fontWeight: 700,

                    color: '#94a3b8',

                    marginBottom: 12,

                    letterSpacing: 1
                }}
            >

                PIPELINE LOG

            </div>

            {
                events.length === 0 && (

                    <div

                        style={{

                            color: '#64748b',

                            fontSize: 13
                        }}
                    >

                        Waiting for prompt...
                    </div>
                )
            }

            {
                events.map(

                    (
                        ev,
                        i
                    ) => (

                        <div

                            key={i}

                            style={{

                                display: 'flex',

                                gap: 10,

                                alignItems: 'flex-start',

                                padding: '8px 0',

                                borderBottom:
                                    '1px solid #1e293b',

                                fontSize: 13
                            }}
                        >

                            <span>

                                {
                                    ICONS[
                                    ev.type
                                    ] || '•'
                                }

                            </span>

                            <span

                                style={{

                                    color:
                                        '#cbd5e1',

                                    lineHeight: 1.5
                                }}
                            >

                                {
                                    ev.type === 'status'

                                        ? ev.data.message

                                        : ev.type === 'blueprint'

                                            ? `Blueprint generated: ${ev.data.agent_name}`

                                            : ev.type === 'test_result'

                                                ? `${ev.data.passed ? '✓' : '✗'} ${ev.data.name}`

                                                : ev.type === 'agent_ready'

                                                    ? `Agent ready (${ev.data.allPassed ? 'all tests passed' : 'partial pass'})`

                                                    : JSON.stringify(
                                                        ev.data
                                                    ).slice(
                                                        0,
                                                        80
                                                    )
                                }

                            </span>
                        </div>
                    )
                )
            }

            {
                isRunning && (

                    <div

                        style={{

                            color: '#8b5cf6',

                            fontSize: 12,

                            marginTop: 12
                        }}
                    >

                        ● Running...
                    </div>
                )
            }
        </div>
    );
}