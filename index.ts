import Graph from 'graphology';
import * as forceAtlas2 from 'graphology-layout-forceatlas2';
import * as layout from 'graphology-library/layout';
import Sigma from 'sigma';
import { NodeDisplayData, EdgeDisplayData } from "sigma/types";
import course_data_bbwl01_01 from './BBWL01-01.js';
import video_data_bbwl01_01 from './BBWL01-01_videos.js';
import course_data_bbwl02_01 from './BBWL02-01.js';
import video_data_bbwl02_01 from './BBWL02-01_videos.js';
import course_data_dlbsaesa01 from './DLBSAESA01.js';
import video_data_dlbsaesa01 from './DLBSAESA01_videos.js';
import drawHover from './hover.js';

const link_base = {
    "BBWL01-01": "https://learn.iu.org/courses/BBWL01-01/books/BBWL01-01/version/001-2022-0321",
    "BBWL02-01": "https://learn.iu.org/courses/BBWL02-01/books/BBWL02-01/version/newest",
    "DLBSAESA01": "https://learn.iu.org/courses/DLBSAESA01/books/DLBSAESA01/version/newest"
}

type Video = {
    kalturaId: string
    dataUrl: string
    thumbnailUrl: string
    name: string
    contentId: string
}

type CustomNode = {
    title: string
    type: string
    parents: string[]
    link?: string
}


const default_render_types = [
    "course",
    "section",
    "cycle",
    "glossentry",
    "video",
]

type State = {
    hoveredNode: string | null
    activeNode: string | null
    activeNodeChildren: string[]
    hoveredNodeChildren: string[]
}

const state: State = {
    hoveredNode: null,
    activeNode: null,
    activeNodeChildren: [],
    hoveredNodeChildren: [],
}

const ACTIVE_CHILDREN = -1

const colors = {
    gray_ultralight: "#fcfcfc",
    gray: "#a1abcc",
    gray_light: "#eeeffc",
    gray_dark: "#303746",
    blue_light: "#547aff",
    blue_dark: "#413dff",
    green: "#25c26e",
    red: "#ff554a",
}

const nodeType2color = {
    "course": colors.gray,
    "section": colors.blue_light,
    "cycle": colors.blue_dark,
    "glossentry": colors.green,
    "video": colors.red
}

const edgeColors = {
    "inactive": "#33363e",
    "active": colors.gray,
    "glossentry": "#2A8153",
    "video": "#A6423E",
}

const sizes = {
    "course": 14,
    "section": 12,
    "cycle": 10,
    "glossentry": 5,
    "video": 3
}

const create_graph = (course_code, input_data: {
  str: CustomNode
}, highlight_children: number, render_types = default_render_types) => {
    const container = document.getElementById("container");

    const graph = new Graph();

    Object.entries(input_data).forEach(([key, node]) => {
        let title = ""
        try {
            // If the string is UTF-8, this will work and not throw an error.
            title = decodeURIComponent(escape(node.title));
        } catch(e) {
            // If it isn't, an error will be thrown, and we can assume that we have an ISO string.
            title = node.title
        }
        let link = ""
        switch(node.type) {
            case "course":
                link = link_base[course_code];
                break;
            case "section":
            case "cycle":
                link = `${link_base[course_code]}/${key}`;
                break;
            case "video":
                link = node.link;
                break;
            default:
                link = null
        }
        graph.addNode(key, {
            label: title,
            nodeType: node.type,
            size: sizes[node.type],
            link: link,
            color: nodeType2color[node.type],
            typeColor: nodeType2color[node.type],
            hoverBackgroundColor: colors.gray_dark,
            labelColor: colors.gray_ultralight,
            hoverLabelColor: colors.gray_ultralight,
            hoverColor: nodeType2color[node.type]
        });
    })

    Object.entries(input_data).forEach(([key, node]) => {
        if(node.parents) {
            node.parents.forEach(target => {
                const color = input_data[key].type === 'video' || input_data[target].type === 'video'
                    ? edgeColors.inactive
                    : edgeColors.active
                graph.addEdge(
                  key,
                  target,
                  { weight: 1, color:  color}
                );
            })
        }
    })

    layout.circular.assign(graph)

    /* @ts-ignore */
    const settings = forceAtlas2.inferSettings(graph);
    /* @ts-ignore */
    forceAtlas2.assign(graph, { settings, iterations: 600 });

    const renderer = new Sigma(
        graph,
        container,
        {
            labelColor: { attribute: 'labelColor' },
            hoverRenderer: drawHover
        }
    );

    renderer.on('doubleClickNode', (params) => {
        const href = graph.getNodeAttribute(params.node, 'link')
        if (href) {
            window.open(href, '_blank')
        }
    })

    const rec_find_children = (node: string, left_recursions: number) => {
        if (left_recursions === 0) {
            return []
        }
        const nodes = []
        if (input_data[node].children && input_data[node].children.length > 0) {
            // for -1 we continue until we find no more
            if (left_recursions != -1) {
                left_recursions -= 1
            }
            input_data[node].children.forEach(child => {
                nodes.push(child, ...rec_find_children(child, left_recursions))
            })
        }
        return nodes
    }

    // Bind graph interactions:
    renderer.on("clickNode", ({ node }) => {
        if (state.activeNode == node) {
            state.activeNode = null
            state.activeNodeChildren = []
            state.hoveredNode = null
            state.hoveredNodeChildren = []
        } else {
            state.activeNode = node
            const parents = highlight_children > 0 && input_data[node].parents ? input_data[node].parents : []
            state.activeNodeChildren = [...parents, ...rec_find_children(node, highlight_children)]
            state.hoveredNode = null
            state.hoveredNodeChildren = []
        }

        renderer.refresh();
    });
    renderer.on("enterNode", ({ node }) => {
        state.hoveredNode = node
        const parents = highlight_children > 0 && input_data[node].parents ? input_data[node].parents : []
        state.hoveredNodeChildren = [...parents, ...rec_find_children(node, highlight_children)]

        renderer.refresh();
    });
    renderer.on("leaveNode", ({ node }) => {
        state.hoveredNode = null
        state.hoveredNodeChildren = []

        renderer.refresh();
    });
    /* @ts-ignore */
    renderer.setSetting("nodeReducer", (node, data) => {
        const res: Partial<NodeDisplayData> = { ...data };
        if (!state.hoveredNode && !state.activeNode) {
            return res
        }

        if (state.activeNode) {

            if (state.activeNode === node) {
                /* @ts-ignore */
                res.color = res.typeColor;
                /* @ts-ignore */
                res.labelColor = res.hoverLabelColor;
                res.highlighted = true;
            } else if (state.activeNodeChildren.includes(node)) {
                /* @ts-ignore */
                res.color = res.typeColor;
                /* @ts-ignore */
                res.labelColor = res.hoverLabelColor;
                res.forceLabel = true;
            } else if (state.hoveredNode === node) {
                /* @ts-ignore */
                res.color = res.typeColor;
                /* @ts-ignore */
                res.labelColor = res.hoverLabelColor;
                res.forceLabel = true;
            } else {
                res.label = ""
                res.color = colors.gray_dark
            }

            return res
        }

        if (state.hoveredNode) {
            if (
                state.hoveredNode === node || state.hoveredNodeChildren.includes(node)
            )
            {
                /* @ts-ignore */
                res.color = res.typeColor;
                /* @ts-ignore */
                res.labelColor = res.hoverLabelColor;
                res.forceLabel = true;
            } else {
                res.label = ""
                res.color = colors.gray_dark
            }
            return res;
        }

        return res;
    })
    renderer.setSetting("edgeReducer", (edge, data) => {
        const res: Partial<EdgeDisplayData> = { ...data };

        const target = graph.target(edge)
        const source = graph.source(edge)

        if (state.activeNode) {
            const nodes = [state.activeNode, ...state.activeNodeChildren]
            if (
                nodes.includes(target) &&
                nodes.includes(source)
            ) {
                if (graph.getNodeAttribute(target, 'nodeType') === 'video' || graph.getNodeAttribute(source, 'nodeType') === 'video') {
                  res.color = edgeColors["video"]
                } else if (graph.getNodeAttribute(target, 'nodeType') === 'glossentry' || graph.getNodeAttribute(source, 'nodeType') === 'glossentry') {
                  res.color = edgeColors["glossentry"]
                } else {
                  res.color = edgeColors.active
                }
            } else {
                res.color = edgeColors.inactive
            }

            return res
        }

        if (state.hoveredNode) {
            const nodes = [state.hoveredNode, ...state.hoveredNodeChildren]
            if (nodes.includes(target) && nodes.includes(source))
            {
                if (graph.getNodeAttribute(target, 'nodeType') === 'video' || graph.getNodeAttribute(source, 'nodeType') === 'video') {
                    res.color = edgeColors["video"]
                } else if (graph.getNodeAttribute(target, 'nodeType') === 'glossentry' || graph.getNodeAttribute(source, 'nodeType') === 'glossentry') {
                    res.color = edgeColors["glossentry"]
                } else {
                    res.color = edgeColors.active
                }
            } else {
                res.color = edgeColors.inactive
            }

            return res;
        }

        res.color = edgeColors.inactive
        return res
    });

}

const prepare = (course_data, video_data) => {
    // add videos to the graph
    Object.entries(video_data).forEach(entry => {
        /* @ts-ignore */
        const [parent, video_entries]: [string, Video[]] = entry
        video_entries.forEach(video => {
            if (!course_data[video.contentId]) {
                course_data[video.contentId] = {
                    title: video.name,
                    type: "video",
                    link: video.dataUrl,
                    parents: [parent]
                }
            } else {
                course_data[video.contentId].parents.push(parent)
            }
        })
    })

    // add children info to the graph
    Object.keys(course_data).forEach(key => {
        if(!course_data[key].parents) {
            return
        }
        course_data[key].parents.forEach(parent => {
            if (course_data[parent].children) {
                course_data[parent].children.push(key)
            } else {
                course_data[parent].children = [key]
            }
        })
    })

    return course_data
}

const prepared_data = [
    ["BBWL01-01", course_data_bbwl01_01, video_data_bbwl01_01],
    ["BBWL02-01", course_data_bbwl02_01, video_data_bbwl02_01],
    ["DLBSAESA01", course_data_dlbsaesa01, video_data_dlbsaesa01]
].reduce(
    (acc, [course_code, course_data, video_data]) => {
        acc[course_code] = prepare(course_data, video_data)
        return acc
    } , {}
)

const select_and_create = (input) => {
    const urlSearchParams = new URLSearchParams(window.location.search)
    const params = Object.fromEntries(urlSearchParams.entries());

    if (!params["course_code"] || params["course_code"].length <= 1) {
        alert("No course specified")
    }

    const c = parseInt(params["c"])
    const highlight_children = c === undefined ? ACTIVE_CHILDREN : c

    create_graph(params["course_code"], input[params["course_code"]], highlight_children)
}

/* @ts-ignore */
document.onload = select_and_create(prepared_data)

// create legend
document.querySelector("#legend").innerHTML = `
    <div class="entry"><strong>Legend:</strong></div>
    ${default_render_types.map(type => `
        <div class="entry">
            <div class="circle" style="background-color: ${nodeType2color[type]}"></div>
            ${type}
        </div>
    `).join('')}
`
