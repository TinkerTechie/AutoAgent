export default function PipelineStatus({
    events
}) {

    return (

        <div>

            <h2>
                Pipeline Status
            </h2>

            {events.map((event, index) => (

                <div
                    key={index}
                    style={{
                        padding: '12px',
                        marginBottom: '12px',
                        borderRadius: '8px',
                        background: '#111',
                        color: 'white'
                    }}
                >

                    <strong>
                        {event.type}
                    </strong>

                    <pre>
                        {
                            JSON.stringify(
                                event.data,
                                null,
                                2
                            )
                        }
                    </pre>

                </div>
            ))}

        </div>
    );
}