import { useEffect, useState }
    from 'react';

export function useSSE(url) {

    const [events, setEvents] =
        useState([]);

    useEffect(() => {

        if (!url) return;

        setEvents([]);

        const source =
            new EventSource(url);

        const eventTypes = [

            'status',
            'planner',
            'planner_result',
            'codegen',
            'code_result',
            'saving',
            'saved',
            'execution',
            'execution_result',
            'packaging',
            'packaged',
            'error',
            'done'
        ];

        function handleEvent(type) {

            return event => {

                const parsed =
                    JSON.parse(event.data);

                setEvents(prev => [
                    ...prev,
                    {
                        type,
                        data: parsed
                    }
                ]);

                /*
                  CLOSE ON:
                  done OR error
                */

                if (
                    type === 'done' ||
                    type === 'error'
                ) {

                    source.close();
                }
            };
        }

        eventTypes.forEach(type => {

            source.addEventListener(
                type,
                handleEvent(type)
            );
        });

        return () => {
            source.close();
        };

    }, [url]);

    return events;
}