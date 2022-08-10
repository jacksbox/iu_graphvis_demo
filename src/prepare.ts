import { NODE_TYPES } from './consts'

type Video = {
    kalturaId: string
    dataUrl: string
    thumbnailUrl: string
    name: string
    contentId: string
}

const prepare = (course_data, video_data) => {
    if (!video_data) {
        return course_data
    }
    // add videos to the graph
    Object.entries(video_data).forEach(entry => {
        /* @ts-ignore */
        const [parent, video_entries]: [string, Video[]] = entry
        video_entries.forEach(video => {
            if (!course_data[video.contentId]) {
                course_data[video.contentId] = {
                    title: video.name,
                    type: NODE_TYPES.VIDEO,
                    link: video.dataUrl,
                    parents: [parent]
                }
            } else {
                course_data[video.contentId].parents.push(parent)
            }
        })
    })

    return course_data
}

export default prepare
