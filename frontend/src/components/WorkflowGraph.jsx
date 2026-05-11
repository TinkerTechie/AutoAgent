import ReactFlow, {
    Background,
    Controls
} from 'reactflow';

import 'reactflow/dist/style.css';

export default function WorkflowGraph({
    events
}) {

    /*
      Determine active stages
    */

    const completedStages =
        events.map(e => e.type);

    function nodeColor(stage) {

        return completedStages.includes(stage)
            ? '#22c55e'
            : '#334155';
    }

    const nodes = [

        {
            id: '1',
            position: { x: 0, y: 100 },
            data: {
                label: 'Prompt'
            },
            style: {
                background: '#3b82f6',
                color: 'white',
                borderRadius: '12px',
                padding: '10px'
            }
        },

        {
            id: '2',
            position: { x: 250, y: 100 },
            data: {
                label: 'Planner'
            },
            style: {
                background:
                    nodeColor('planner'),
                color: 'white',
                borderRadius: '12px',
                padding: '10px'
            }
        },

        {
            id: '3',
            position: { x: 500, y: 100 },
            data: {
                label: 'Code Generator'
            },
            style: {
                background:
                    nodeColor('codegen'),
                color: 'white',
                borderRadius: '12px',
                padding: '10px'
            }
        },

        {
            id: '4',
            position: { x: 750, y: 100 },
            data: {
                label: 'Execution'
            },
            style: {
                background:
                    nodeColor('execution'),
                color: 'white',
                borderRadius: '12px',
                padding: '10px'
            }
        },

        {
            id: '5',
            position: { x: 1000, y: 100 },
            data: {
                label: 'Result'
            },
            style: {
                background:
                    nodeColor(
                        'execution_result'
                    ),
                color: 'white',
                borderRadius: '12px',
                padding: '10px'
            }
        }
    ];

    const edges = [

        {
            id: 'e1-2',
            source: '1',
            target: '2',
            animated: true
        },

        {
            id: 'e2-3',
            source: '2',
            target: '3',
            animated: true
        },

        {
            id: 'e3-4',
            source: '3',
            target: '4',
            animated: true
        },

        {
            id: 'e4-5',
            source: '4',
            target: '5',
            animated: true
        }
    ];

    return (

        <div
            style={{
                height: '260px',
                background: '#020617',
                borderRadius: '16px',
                marginBottom: '40px'
            }}
        >

            <ReactFlow
                nodes={nodes}
                edges={edges}
                fitView
            >

                <Background />
                <Controls />

            </ReactFlow>

        </div>
    );
}