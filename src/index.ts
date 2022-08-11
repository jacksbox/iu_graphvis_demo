import prepare from './prepare'
import GraphRenderer from './GraphRenderer'
import { NODE_COLOR, NODE_STATE, NODE_ELEMENT } from './nodeStyle'

import './style.css'

import {
    DEFAULT_NODE_TYPE,
    DEFAULT_HIGHLIGHT_LEVEL,
    NODE_TYPES,
    AVAILABLE_RENDER_TYPES,
    AVAILABLE_COURSES
} from './consts'
import axios from 'axios'


class AppState {
    state
    constructor(initialState) {
        this.state = {...initialState}
    }

    set = (key, value) => {
        this.state[key] = value
    }

    get = (key) => {
        return this.state[key]
    }
}

const main = () => {
    const state = new AppState({
        courseCode: Object.values(AVAILABLE_COURSES)[0],
        graphData: null,
        highlightChildrenLevel: DEFAULT_HIGHLIGHT_LEVEL,
        renderTypes: null,
        quizResult: [],
    })

    const container = document.getElementById("container");
    const graphRenderer = new GraphRenderer(container)

    const loadCourse = async () => {
        const courseCode = state.get("courseCode")

        let courseData
        try {
            const response = await axios.get(`data/${courseCode}.json`)
            courseData = response.data
        } catch(error) {
            console.error('Error loading course document', error)
            document.getElementById("container").innerHTML = "Error loading course document"
            return
        }

        let videoData
        try {
            const response = await axios.get(`data/${courseCode}_videos.json`)
            videoData = response.data
        } catch {
            videoData = null
            console.warn('No video data found')
        }

        state.set("courseData", courseData)
        state.set("videoData", videoData)

        const graphData = prepare(courseData, videoData)
        state.set("graphData", graphData)

        resetRenderTypes()
    }

    const renderGraph = () => {
        const courseCode = state.get("courseCode")
        const graphData = state.get("graphData")
        const highlightChildrenLevel = state.get("highlightChildrenLevel")
        const renderTypes = state.get("renderTypes")
        const quizResult = state.get("quizResult")

        graphRenderer.update(courseCode, graphData, highlightChildrenLevel, renderTypes, quizResult)

        updateLegend()
    }

    const updateLegend = () => {
        const renderTypes = state.get("renderTypes")
        document.querySelectorAll('#legend .entry').forEach(element => {
            const type = element.getAttribute('data-type')
            /* @ts-ignore */
            element.querySelector(".circle").style.backgroundColor = renderTypes.includes(type)
                ? NODE_COLOR[type][NODE_STATE.ACTIVE][NODE_ELEMENT.NODE]
                : NODE_COLOR[DEFAULT_NODE_TYPE][NODE_STATE.DEFAULT][NODE_ELEMENT.NODE]
        })
    }

    const renderLegend = () => {
        const availableRenderTypes = state.get("availableRenderTypes")

        document.querySelector("#legend").innerHTML = `
            <div class="header"><strong>Legend:</strong></div>
            ${availableRenderTypes.map(type => `
                <div
                    class="entry type"
                    data-type="${type}"
                >
                    <div
                        class="circle"
                        style="background-color: ${NODE_COLOR[type][NODE_STATE.ACTIVE][NODE_ELEMENT.NODE]}
                    "></div>
                    ${type}
                </div>
            `).join('')}
        `

        document.querySelectorAll("#legend .entry").forEach(element => {
            element.addEventListener("click", e => {
                const target = e.target as HTMLElement;

                const selectedType = target.getAttribute("data-type")
                const updatedRenderTypes: string[] = []
                for (let index in AVAILABLE_RENDER_TYPES) {
                    updatedRenderTypes.push(AVAILABLE_RENDER_TYPES[index])
                    if (AVAILABLE_RENDER_TYPES[index] == selectedType) {
                        break;
                    }
                }
                state.set('renderTypes', updatedRenderTypes)
                renderGraph()
            })
        })
    }

    const resetRenderTypes = () => {
        const videoData = state.get("videoData")

        const availableRenderTypes = [...AVAILABLE_RENDER_TYPES, ...(videoData ? [NODE_TYPES.VIDEO] : [])]
        state.set("availableRenderTypes", availableRenderTypes)

        const renderTypes = availableRenderTypes
        state.set("renderTypes", renderTypes)
    }

    const app = async () => {
        const courseCode = state.get("courseCode")

        await loadCourse()

        renderLegend()
        renderGraph()

        const button = document.querySelector("#quiz button")
        const buttonClone = button.cloneNode(true);
        buttonClone.addEventListener('click', async e => {
            e.preventDefault()
            // TODO: switch to load from instance id?
            /* @ts-ignore */
            // const instance_id = document.querySelector("#quiz input").value
            let quizResult = null
            try {
                const response = await axios.get(`https://quizservice-dev.iu.de/v1/experimental/results/${state.get('courseCode')}/latest`)
                quizResult = response.data.results
                /* @ts-ignore */
                e.target.parentNode.parentNode.querySelector(".notification").innerHTML = 'Results loaded'
            } catch(Error) {
                console.error(Error)
                /* @ts-ignore */
                e.target.parentNode.parentNode.querySelector(".notification").innerHTML = 'No results found'
            }
            state.set('quizResult', quizResult)
            renderGraph()
        })
        button.parentNode.replaceChild(buttonClone, button);
    }

    document.querySelector("#courses").innerHTML = `
        <div class="header"><strong>Courses:</strong></div>
        ${Object.values(AVAILABLE_COURSES).map(course => `
            <div
                class="${ course === state.get("courseCode") ? 'entry active': 'entry'}"
                data-course="${course}"
            >
                <div
                    class="circle"
                    style="background-color: ${NODE_COLOR[DEFAULT_NODE_TYPE][NODE_STATE.ACTIVE][NODE_ELEMENT.NODE]}
                "></div>
                ${course}
            </div>
        `).join('')}
    `

    document.querySelectorAll("#courses .entry").forEach(element => {
        element.addEventListener("click", async e => {
            document.querySelectorAll("#courses .entry").forEach(element => {
                element.classList.remove("active")
            })
            const target = e.target as HTMLElement;
            target.classList.add("active")

            const courseCode = target.getAttribute("data-course")
            state.set("courseCode", courseCode)

            await loadCourse()
            renderGraph()
        })
    })

    app()
}

/* @ts-ignore */
document.onload = main()
