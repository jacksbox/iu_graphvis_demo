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

const main = () => {
    const app = async (courseCode, graphRenderer) => {
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

        const highlightChildrenLevel = DEFAULT_HIGHLIGHT_LEVEL
        const availableRenderTypes = [...AVAILABLE_RENDER_TYPES, ...(videoData ? [NODE_TYPES.VIDEO] : [])]
        const renderTypes = availableRenderTypes

        const data = prepare(courseData, videoData)

        graphRenderer.update(courseCode, data, highlightChildrenLevel, renderTypes)


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

        const updateLegend = (activeRenderTypes) => {
            document.querySelectorAll('#legend .entry').forEach(element => {
                const type = element.getAttribute('data-type')
                /* @ts-ignore */
                element.querySelector(".circle").style.backgroundColor = activeRenderTypes.includes(type)
                    ? NODE_COLOR[type][NODE_STATE.ACTIVE][NODE_ELEMENT.NODE]
                    : NODE_COLOR[DEFAULT_NODE_TYPE][NODE_STATE.DEFAULT][NODE_ELEMENT.NODE]
            })

        }
        updateLegend(renderTypes)

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
                graphRenderer.update(courseCode, data, highlightChildrenLevel, updatedRenderTypes)
                updateLegend(updatedRenderTypes)
            })
        })
    }

    const container = document.getElementById("container");
    const graphRenderer = new GraphRenderer(container)

    const initialCourseCode = Object.values(AVAILABLE_COURSES)[0]

    document.querySelector("#courses").innerHTML = `
        <div class="header"><strong>Courses:</strong></div>
        ${Object.values(AVAILABLE_COURSES).map(course => `
            <div
                class="${ course === initialCourseCode ? 'entry active': 'entry'}"
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
        element.addEventListener("click", e => {
            document.querySelectorAll("#courses .entry").forEach(element => {
                element.classList.remove("active")
            })
            const target = e.target as HTMLElement;
            target.classList.add("active")

            const courseCode = target.getAttribute("data-course")
            app(courseCode, graphRenderer)
        })
    })

    app(initialCourseCode, graphRenderer)
}

/* @ts-ignore */
document.onload = main()
