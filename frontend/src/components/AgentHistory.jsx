export default function AgentHistory() {

    const history =
        JSON.parse(

            localStorage.getItem(
                'agent_history'
            ) || '[]'
        );

    if (
        history.length === 0
    ) {

        return null;
    }

    return (

        <div
            style={{
                marginTop: 28
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

                AGENT LIBRARY

                {' '}

                ({history.length} built)

            </div>

            <div

                style={{

                    display: 'grid',

                    gridTemplateColumns:
                        'repeat(auto-fill, minmax(220px, 1fr))',

                    gap: 12
                }}
            >

                {
                    history.map(

                        (
                            agent,
                            i
                        ) => (

                            <div

                                key={i}

                                style={{

                                    background:
                                        '#111827',

                                    border:
                                        '1px solid #334155',

                                    borderRadius: 12,

                                    padding: 14
                                }}
                            >

                                <div

                                    style={{

                                        fontWeight: 600,

                                        color: 'white',

                                        marginBottom: 8
                                    }}
                                >

                                    🤖 {agent.name}

                                </div>

                                <div

                                    style={{

                                        fontSize: 12,

                                        color: '#94a3b8',

                                        lineHeight: 1.5,

                                        minHeight: 38
                                    }}
                                >

                                    {agent.description}

                                </div>

                                <div

                                    style={{

                                        marginTop: 12,

                                        fontSize: 12,

                                        color:

                                            agent.testsPassed === agent.testsTotal

                                                ? '#4ade80'

                                                : '#facc15'
                                    }}
                                >

                                    {agent.testsPassed}

                                    /

                                    {agent.testsTotal}

                                    {' '}tests passed

                                </div>

                                <div

                                    style={{

                                        marginTop: 6,

                                        fontSize: 11,

                                        color: '#64748b'
                                    }}
                                >

                                    {
                                        new Date(
                                            agent.ts
                                        ).toLocaleString()
                                    }

                                </div>
                            </div>
                        )
                    )
                }
            </div>
        </div>
    );
}