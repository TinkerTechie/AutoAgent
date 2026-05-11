import {
    useState,
    useRef,
    useCallback,
    useEffect
} from 'react';

import { API_BASE } from '../config.js';

export function useSSE() {

    const [events, setEvents] =
        useState([]);

    const [isRunning, setIsRunning] =
        useState(false);

    const [blueprint, setBlueprint] =
        useState(null);

    const [code, setCode] =
        useState('');

    const [testResults, setTestResults] =
        useState([]);

    const [isComplete, setIsComplete] =
        useState(false);

    const [downloadZip, setDownloadZip] =
        useState(null);

    const [agentReady, setAgentReady] =
        useState(null);

    const esRef =
        useRef(null);

    /*
      Cleanup
    */

    const closeConnection =
        () => {

            if (
                esRef.current
            ) {

                esRef.current.close();

                esRef.current = null;
            }
        };

    /*
      Add timeline event
    */

    const addEvent =
        (type, data) => {

            setEvents(prev => [

                ...prev,

                {
                    type,
                    data,
                    ts: Date.now()
                }
            ]);
        };

    /*
      Main build trigger
    */

    const startBuild =
        useCallback(

            prompt => {

                /*
                  Cleanup old connection
                */

                closeConnection();

                /*
                  Reset state
                */

                setEvents([]);

                setBlueprint(null);

                setCode('');

                setTestResults([]);

                setIsComplete(false);

                setDownloadZip(null);

                setAgentReady(null);

                setIsRunning(true);

                /*
                  SSE URL
                */

                const url =
                    `${API_BASE}/api/build?prompt=${encodeURIComponent(prompt)}`;

                const es =
                    new EventSource(url);

                esRef.current = es;

                /*
                  STATUS
                */

                es.addEventListener(

                    'status',

                    e => {

                        addEvent(
                            'status',
                            JSON.parse(e.data)
                        );
                    }
                );

                /*
                  BLUEPRINT
                */

                es.addEventListener(

                    'blueprint',

                    e => {

                        const {
                            blueprint
                        } = JSON.parse(e.data);

                        setBlueprint(
                            blueprint
                        );

                        addEvent(
                            'blueprint',
                            blueprint
                        );
                    }
                );

                /*
                  CODE
                */

                es.addEventListener(

                    'code_result',

                    e => {

                        const {
                            code
                        } = JSON.parse(e.data);

                        setCode(code);

                        addEvent(

                            'code',

                            {
                                preview:
                                    code.slice(0, 200) + '...'
                            }
                        );
                    }
                );

                /*
                  TEST START
                */

                es.addEventListener(

                    'test_start',

                    e => {

                        addEvent(
                            'test_start',
                            JSON.parse(e.data)
                        );
                    }
                );

                /*
                  TEST RESULT
                */

                es.addEventListener(

                    'test_result',

                    e => {

                        const result =
                            JSON.parse(e.data);

                        setTestResults(

                            prev => [

                                ...prev,

                                result
                            ]
                        );

                        addEvent(
                            'test_result',
                            result
                        );
                    }
                );

                /*
                  FIX LOOP
                */

                es.addEventListener(

                    'fix_result',

                    e => {

                        const data =
                            JSON.parse(e.data);

                        addEvent(
                            'fix_result',
                            data
                        );

                        /*
                          Update code with fixed version
                        */

                        if (
                            data.code
                        ) {

                            setCode(
                                data.code
                            );

                        } else if (
                            data.preview
                        ) {

                            setCode(
                                data.preview
                            );
                        }
                    }
                );

                /*
                  TESTS COMPLETE
                */

                es.addEventListener(

                    'tests_done',

                    e => {

                        addEvent(
                            'tests_done',
                            JSON.parse(e.data)
                        );
                    }
                );

                /*
                  PACKAGED
                */

                es.addEventListener(

                    'packaged',

                    e => {

                        const data =
                            JSON.parse(e.data);

                        setDownloadZip(
                            data.zip
                        );

                        addEvent(
                            'packaged',
                            data
                        );
                    }
                );

                /*
                  AGENT READY
                */

                es.addEventListener(

                    'agent_ready',

                    e => {

                        const data =
                            JSON.parse(e.data);

                        setAgentReady(
                            data
                        );

                        addEvent(
                            'agent_ready',
                            data
                        );

                        setIsComplete(true);

                        setIsRunning(false);
                    }
                );

                /*
                  ERROR
                */

                es.addEventListener(

                    'error',

                    e => {

                        let errorData = {

                            message:
                                'Connection error'
                        };

                        try {

                            if (
                                e.data
                            ) {

                                errorData =
                                    JSON.parse(
                                        e.data
                                    );
                            }

                        } catch (_) { }

                        addEvent(
                            'error',
                            errorData
                        );

                        setIsRunning(false);

                        closeConnection();
                    }
                );

                /*
                  DONE
                */

                es.addEventListener(

                    'done',

                    e => {

                        addEvent(
                            'done',
                            JSON.parse(e.data)
                        );

                        setIsRunning(false);

                        closeConnection();
                    }
                );
            },

            []
        );

    /*
      Cleanup on unmount
    */

    useEffect(() => {

        return () => {

            closeConnection();
        };

    }, []);

    return {

        /*
          Timeline
        */

        events,

        /*
          Runtime state
        */

        isRunning,

        isComplete,

        /*
          Core artifacts
        */

        blueprint,

        code,

        testResults,

        /*
          Final outputs
        */

        downloadZip,

        agentReady,

        /*
          Actions
        */

        startBuild
    };
}