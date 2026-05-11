export default function ExecutionConsole({
    output
}) {

    if (!output) return null;

    return (

        <div
            style={{
                marginTop: '30px',
                width: '100%'
            }}
        >

            <h2>
                Execution Result
            </h2>

            <div
                style={{
                    background: '#020617',
                    color: '#22c55e',
                    padding: '20px',
                    borderRadius: '12px',
                    fontFamily: 'monospace',
                    whiteSpace: 'pre-wrap',
                    overflowX: 'auto',
                    wordBreak: 'break-word'
                }}
            >

                {output}

            </div>

        </div>
    );
}