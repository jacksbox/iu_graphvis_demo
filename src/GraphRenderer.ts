import Sigma from 'sigma';
import { NodeDisplayData, EdgeDisplayData } from "sigma/types";

import Graph from 'graphology';
import * as forceAtlas2 from 'graphology-layout-forceatlas2';
import * as layout from 'graphology-library/layout';

import drawHover from './hover'
import { NODE_TYPES } from './consts'
import { NODE_STATE, NODE_ELEMENT, NODE_COLOR, EDGE_STATE, EDGE_COLOR, SIZE } from './nodeStyle'

type CustomNode = {
    title: string
    type: string
    parents: string[]
    children?: string[]
    link?: string
}

type RawData = {
    [k: string]: CustomNode
}

interface CustomEdgeDisplayData extends EdgeDisplayData {}
interface CustomNodeDisplayData extends NodeDisplayData {
    nodeType: string,
    labelColor: string,
    labelBackgroundColor: string
}

type StateType = {
    hoveredNode: string | null
    activeNode: string | null
    activeNodeChildren: string[]
    hoveredNodeChildren: string[]
}

const initialState: StateType = {
    hoveredNode: null,
    activeNode: null,
    activeNodeChildren: [],
    hoveredNodeChildren: [],
}

let state: StateType = {
    ...initialState
}

const decodeTitle = title => {
    try {
        // If the string is UTF-8, this will work and not throw an error.
        return decodeURIComponent(escape(title));
    } catch(e) {
        // If it isn't, an error will be thrown, and we can assume that we have an ISO string.
        return title
    }
}

const generateLink = (node, nodeKey, courseCode) => {
    const link_base = `https://learn.iu.org/courses/${courseCode}/books/${courseCode}/version/newest`
    switch(node.type) {
        case [NODE_TYPES.COURSE]:
            return link_base;
            break;
        case [NODE_TYPES.SECTION]:
        case [NODE_TYPES.CYCLE]:
            return `${link_base}/${nodeKey}`;
            break;
        case [NODE_TYPES.VIDEO]:
            return node.link;
            break;
        default:
            return null
    }
}

const getNodeStyle = node => ({
    size: SIZE[node.type],
    color: NODE_COLOR[node.type].DEFAULT[NODE_ELEMENT.NODE]
})

const prepareGraph = (graph, courseCode: string, data: RawData) => {
    // add nodes
    Object.entries(data).forEach(([key, node]) => {
        const title = decodeTitle(node.title)
        const link = generateLink(node, key, courseCode)
        const style = getNodeStyle(node)

        graph.addNode(key, {
            label: title,
            nodeType: node.type,
            link: link,
            ...style
        });
    })

    // add edges
    Object.entries(data).forEach(([key, node]) => {
        if(node.parents) {
            node.parents.forEach(target => {
                graph.addEdge(
                key,
                target,
                { weight: 1, color:  EDGE_COLOR[EDGE_STATE.ACTIVE]}
                );
            })
        }
    })

    layout.circular.assign(graph)

    /* @ts-ignore */
    const settings = forceAtlas2.inferSettings(graph);
    /* @ts-ignore */
    forceAtlas2.assign(graph, { settings, iterations: 600 });
}

class GraphRenderer {
    graph: Graph
    renderer: Sigma = null
    container

    constructor(container) {
        this.graph = new Graph();
        this.container = container

        this.renderer = null
    }

    update = (
        courseCode,
        rawData: RawData,
        highlightLevel: number,
        renderTypes: string[]
    ) => {
        // reset state
        state = {...initialState}

        // reset graph
        this.graph.clear()

        // remodel data
        const dataCopy: RawData = JSON.parse(JSON.stringify(rawData))
        const filteredRawData: RawData = Object.fromEntries(
            Object.entries(dataCopy)
                .filter(([_ , value]) => renderTypes.includes(value["type"].toUpperCase()))
        )
        Object.entries(filteredRawData).forEach(([nodeKey, node]) => {
            node['type'] = node['type'].toUpperCase()
            if(!node.parents) {
                return
            }
            node.parents.forEach(parent => {
                if (filteredRawData[parent].children) {
                    filteredRawData[parent].children.push(nodeKey)
                } else {
                    filteredRawData[parent].children = [nodeKey]
                }
            })
        })
        prepareGraph(this.graph, courseCode, filteredRawData)

        // reset renderer
        if (this.renderer) {
            this.renderer.kill()
        }
        this.renderer = new Sigma(
            this.graph,
            this.container,
            {
                labelColor: { attribute: 'labelColor' },
                hoverRenderer: drawHover
            }
        );

        this.renderer.on('doubleClickNode', (params) => {
            const href = this.graph.getNodeAttribute(params.node, 'link')
            if (href) {
                window.open(href, '_blank')
            }
        })

        const rec_find_children = (node: string, left_recursions: number) => {
            if (left_recursions === 0) {
                return []
            }
            const nodes = []
            if (filteredRawData[node].children && filteredRawData[node].children.length > 0) {
                // for -1 we continue until we find no more
                if (left_recursions != -1) {
                    left_recursions -= 1
                }
                filteredRawData[node].children.forEach(child => {
                    nodes.push(child, ...rec_find_children(child, left_recursions))
                })
            }
            return nodes
        }

        // Bind graph interactions:
        this.renderer.on("clickNode", ({ node }) => {
            if (state.activeNode == node) {
                state = {...initialState}
            } else {
                state.activeNode = node
                const parents = highlightLevel > 0 && filteredRawData[node].parents ? filteredRawData[node].parents : []
                state.activeNodeChildren = [...parents, ...rec_find_children(node, highlightLevel)]
                state.hoveredNode = null
                state.hoveredNodeChildren = []
            }

            this.renderer.refresh();
        });

        this.renderer.on("enterNode", ({ node }) => {
            state.hoveredNode = node
            const parents = highlightLevel > 0 && filteredRawData[node].parents ? filteredRawData[node].parents : []
            state.hoveredNodeChildren = [...parents, ...rec_find_children(node, highlightLevel)]

            this.renderer.refresh();
        });

        this.renderer.on("leaveNode", ({ node }) => {
            state.hoveredNode = null
            state.hoveredNodeChildren = []

            this.renderer.refresh();
        });

        /* @ts-ignore */
        this.renderer.setSetting("nodeReducer", (node, data) => {
            const res: Partial<CustomNodeDisplayData> = { ...data };
            let nodeState = NODE_STATE.INACTIVE

            if (!state.hoveredNode && !state.activeNode) {
                nodeState = NODE_STATE.DEFAULT
            }

            if (state.activeNode) {
                // ACTIVE node
                if (state.activeNode === node) {
                    nodeState = NODE_STATE.ACTIVE
                // ACTIVE node child (CHILD)
                } else if (state.activeNodeChildren.includes(node)) {
                    nodeState = NODE_STATE.CHILD
                }
            }

            if (state.hoveredNode) {
                if (state.hoveredNode === node) {
                    nodeState = NODE_STATE.HOVER
                } else if (state.hoveredNodeChildren.includes(node)) {
                    nodeState = NODE_STATE.CHILD
                }
            }

            res.color = NODE_COLOR[res.nodeType][nodeState][NODE_ELEMENT.NODE];
            res.label = [NODE_STATE.INACTIVE].includes(nodeState) ? "" : res.label
            res.labelColor = NODE_COLOR[res.nodeType][nodeState][NODE_ELEMENT.LABEL];
            res.labelBackgroundColor = NODE_COLOR[res.nodeType][nodeState][NODE_ELEMENT.LABEL_BODY];
            res.forceLabel = [NODE_STATE.ACTIVE, NODE_STATE.CHILD, NODE_STATE.HOVER].includes(nodeState) ? true : false;
            res.highlighted = [NODE_STATE.ACTIVE].includes(nodeState) ? true : false;

            return res;
        })

        this.renderer.setSetting("edgeReducer", (edge, data) => {
            const res: Partial<CustomEdgeDisplayData> = { ...data };

            let nodes = []
            let edgeState = EDGE_STATE.INACTIVE

            const target = this.graph.target(edge)
            const source = this.graph.source(edge)

            if (state.activeNode) {
                nodes = [state.activeNode, ...state.activeNodeChildren]
            }

            if (state.hoveredNode) {
                nodes = [state.hoveredNode, ...state.hoveredNodeChildren]
            }

            if (nodes.includes(target) && nodes.includes(source)) {
                edgeState = EDGE_STATE.ACTIVE
            }

            res.color = EDGE_COLOR[edgeState]
            return res
        });

    }
}

export default GraphRenderer