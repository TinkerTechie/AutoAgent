export default function PromptInput({

    prompt,

    onPromptChange,

    onBuild,

    isRunning,

    demoPrompts,

    onDemoSelect

}) {

    return (

        <div>

            <textarea

                value={prompt}

                onChange={
                    e =>
                        onPromptChange(
                            e.target.value
                        )
                }

                placeholder="Describe the AI agent you want to build..."

                rows={4}

                style={{

                    width: '100%',

                    padding: 16,

                    fontSize: 14,

                    borderRadius: 12,

                    border:
                        '1px solid #334155',

                    resize: 'vertical',

                    background:
                        '#111827',

                    color: 'white',

                    outline: 'none',

                    lineHeight: 1.6
                }}
            />

            <div

                style={{

                    display: 'flex',

                    gap: 10,

                    marginTop: 12,

                    flexWrap: 'wrap',

                    alignItems: 'center'
                }}
            >

                <button

                    onClick={onBuild}

                    disabled={
                        isRunning ||
                        !prompt.trim()
                    }

                    style={{

                        padding:
                            '10px 22px',

                        background:
                            '#8b5cf6',

                        color: '#fff',

                        border: 'none',

                        borderRadius: 10,

                        cursor: 'pointer',

                        fontWeight: 600,

                        fontSize: 14
                    }}
                >

                    {
                        isRunning

                            ? '⏳ Building...'

                            : '⚡ Build Agent'
                    }

                </button>

                {
                    demoPrompts.map(

                        (
                            demo,
                            i
                        ) => (

                            <button

                                key={i}

                                onClick={() =>
                                    onDemoSelect(
                                        demo
                                    )
                                }

                                disabled={
                                    isRunning
                                }

                                style={{

                                    padding:
                                        '8px 14px',

                                    background:
                                        '#1e293b',

                                    border:
                                        '1px solid #334155',

                                    color:
                                        '#cbd5e1',

                                    borderRadius: 10,

                                    cursor: 'pointer',

                                    fontSize: 12
                                }}
                            >

                                {
                                    demo

                                        .replace(
                                            'Build a Python agent that ',
                                            ''
                                        )

                                        .slice(
                                            0,
                                            34
                                        )
                                }

                                ...

                            </button>
                        )
                    )
                }
            </div>
        </div>
    );
}