import { DEFAULT_NODE_TYPE, NODE_TYPES } from './consts'

export const COLOR = {
    gray_ultralight: "#fcfcfc",
    gray: "#a1abcc",
    gray_light: "#eeeffc",
    gray_dark: "#303746",
    blue_light: "#547aff",
    blue_dark: "#413dff",
    green: "#25c26e",
    red: "#ff554a",
}

export const NODE_STATE = {
    INACTIVE: "INACTIVE",
    DEFAULT: "DEFAULT",
    ACTIVE: "ACTIVE",
    HOVER: "HOVER",
    CHILD: "CHILD",
}

export const NODE_ELEMENT = {
    NODE: "NODE",
    LABEL: "LABEL",
    LABEL_BODY: "LABEL_BODY",
}

export const NODE_COLOR = {
    [DEFAULT_NODE_TYPE]: {
        [NODE_STATE.INACTIVE]: {
            [NODE_ELEMENT.NODE]: COLOR.gray_dark,
            [NODE_ELEMENT.LABEL]: null,
            [NODE_ELEMENT.LABEL_BODY]: null,
        },
        [NODE_STATE.DEFAULT]: {
            [NODE_ELEMENT.NODE]: COLOR.gray_dark,
            [NODE_ELEMENT.LABEL]: COLOR.gray,
            [NODE_ELEMENT.LABEL_BODY]: null,
        },
        [NODE_STATE.ACTIVE]: {
            [NODE_ELEMENT.NODE]: COLOR.gray_dark,
            [NODE_ELEMENT.LABEL]: COLOR.gray,
            [NODE_ELEMENT.LABEL_BODY]: COLOR.gray_dark,
        },
        [NODE_STATE.HOVER]: {
            [NODE_ELEMENT.NODE]: COLOR.gray_dark,
            [NODE_ELEMENT.LABEL]: COLOR.gray,
            [NODE_ELEMENT.LABEL_BODY]: COLOR.gray_dark,
        },
        [NODE_STATE.CHILD]: {
            [NODE_ELEMENT.NODE]: COLOR.gray_dark,
            [NODE_ELEMENT.LABEL]: COLOR.gray,
            [NODE_ELEMENT.LABEL_BODY]: null,
        },
    },
    [NODE_TYPES.COURSE]: {
        [NODE_STATE.INACTIVE]: {
            [NODE_ELEMENT.NODE]: COLOR.gray_dark,
            [NODE_ELEMENT.LABEL]: null,
            [NODE_ELEMENT.LABEL_BODY]: null,
        },
        [NODE_STATE.DEFAULT]: {
            [NODE_ELEMENT.NODE]: COLOR.gray,
            [NODE_ELEMENT.LABEL]: COLOR.gray,
            [NODE_ELEMENT.LABEL_BODY]: null,
        },
        [NODE_STATE.ACTIVE]: {
            [NODE_ELEMENT.NODE]: COLOR.gray,
            [NODE_ELEMENT.LABEL]: COLOR.gray,
            [NODE_ELEMENT.LABEL_BODY]: COLOR.gray_dark,
        },
        [NODE_STATE.HOVER]: {
            [NODE_ELEMENT.NODE]: COLOR.gray,
            [NODE_ELEMENT.LABEL]: COLOR.gray,
            [NODE_ELEMENT.LABEL_BODY]: COLOR.gray_dark,
        },
        [NODE_STATE.CHILD]: {
            [NODE_ELEMENT.NODE]: COLOR.gray,
            [NODE_ELEMENT.LABEL]: COLOR.gray,
            [NODE_ELEMENT.LABEL_BODY]: null,
        },
    },
    [NODE_TYPES.SECTION]: {
        [NODE_STATE.INACTIVE]: {
            [NODE_ELEMENT.NODE]: COLOR.gray_dark,
            [NODE_ELEMENT.LABEL]: null,
            [NODE_ELEMENT.LABEL_BODY]: null,
        },
        [NODE_STATE.DEFAULT]: {
            [NODE_ELEMENT.NODE]: COLOR.gray,
            [NODE_ELEMENT.LABEL]: COLOR.gray,
            [NODE_ELEMENT.LABEL_BODY]: null,
        },
        [NODE_STATE.ACTIVE]: {
            [NODE_ELEMENT.NODE]: COLOR.blue_light,
            [NODE_ELEMENT.LABEL]: COLOR.gray,
            [NODE_ELEMENT.LABEL_BODY]: COLOR.gray_dark,
        },
        [NODE_STATE.HOVER]: {
            [NODE_ELEMENT.NODE]: COLOR.blue_light,
            [NODE_ELEMENT.LABEL]: COLOR.gray,
            [NODE_ELEMENT.LABEL_BODY]: COLOR.gray_dark,
        },
        [NODE_STATE.CHILD]: {
            [NODE_ELEMENT.NODE]: COLOR.blue_light,
            [NODE_ELEMENT.LABEL]: COLOR.gray,
            [NODE_ELEMENT.LABEL_BODY]: null,
        },
    },
    [NODE_TYPES.CYCLE]: {
        [NODE_STATE.INACTIVE]: {
            [NODE_ELEMENT.NODE]: COLOR.gray_dark,
            [NODE_ELEMENT.LABEL]: null,
            [NODE_ELEMENT.LABEL_BODY]: null,
        },
        [NODE_STATE.DEFAULT]: {
            [NODE_ELEMENT.NODE]: COLOR.gray,
            [NODE_ELEMENT.LABEL]: COLOR.gray,
            [NODE_ELEMENT.LABEL_BODY]: null,
        },
        [NODE_STATE.ACTIVE]: {
            [NODE_ELEMENT.NODE]: COLOR.blue_dark,
            [NODE_ELEMENT.LABEL]: COLOR.gray,
            [NODE_ELEMENT.LABEL_BODY]: COLOR.gray_dark,
        },
        [NODE_STATE.HOVER]: {
            [NODE_ELEMENT.NODE]: COLOR.blue_dark,
            [NODE_ELEMENT.LABEL]: COLOR.gray,
            [NODE_ELEMENT.LABEL_BODY]: COLOR.gray_dark,
        },
        [NODE_STATE.CHILD]: {
            [NODE_ELEMENT.NODE]: COLOR.blue_dark,
            [NODE_ELEMENT.LABEL]: COLOR.gray,
            [NODE_ELEMENT.LABEL_BODY]: null,
        },
    },
    [NODE_TYPES.GLOSSENTRY]: {
        [NODE_STATE.INACTIVE]: {
            [NODE_ELEMENT.NODE]: COLOR.gray_dark,
            [NODE_ELEMENT.LABEL]: null,
            [NODE_ELEMENT.LABEL_BODY]: null,
        },
        [NODE_STATE.DEFAULT]: {
            [NODE_ELEMENT.NODE]: COLOR.gray_dark,
            [NODE_ELEMENT.LABEL]: COLOR.gray,
            [NODE_ELEMENT.LABEL_BODY]: null,
        },
        [NODE_STATE.ACTIVE]: {
            [NODE_ELEMENT.NODE]: COLOR.green,
            [NODE_ELEMENT.LABEL]: COLOR.gray,
            [NODE_ELEMENT.LABEL_BODY]: COLOR.gray_dark,
        },
        [NODE_STATE.HOVER]: {
            [NODE_ELEMENT.NODE]: COLOR.green,
            [NODE_ELEMENT.LABEL]: COLOR.gray,
            [NODE_ELEMENT.LABEL_BODY]: COLOR.gray_dark,
        },
        [NODE_STATE.CHILD]: {
            [NODE_ELEMENT.NODE]: COLOR.green,
            [NODE_ELEMENT.LABEL]: COLOR.gray,
            [NODE_ELEMENT.LABEL_BODY]: null,
        },
    },
    [NODE_TYPES.VIDEO]: {
        [NODE_STATE.INACTIVE]: {
            [NODE_ELEMENT.NODE]: COLOR.gray_dark,
            [NODE_ELEMENT.LABEL]: null,
            [NODE_ELEMENT.LABEL_BODY]: null,
        },
        [NODE_STATE.DEFAULT]: {
            [NODE_ELEMENT.NODE]: COLOR.gray_dark,
            [NODE_ELEMENT.LABEL]: COLOR.gray,
            [NODE_ELEMENT.LABEL_BODY]: null,
        },
        [NODE_STATE.ACTIVE]: {
            [NODE_ELEMENT.NODE]: COLOR.red,
            [NODE_ELEMENT.LABEL]: COLOR.gray,
            [NODE_ELEMENT.LABEL_BODY]: COLOR.gray,
        },
        [NODE_STATE.HOVER]: {
            [NODE_ELEMENT.NODE]: COLOR.red,
            [NODE_ELEMENT.LABEL]: COLOR.gray,
            [NODE_ELEMENT.LABEL_BODY]: COLOR.gray,
        },
        [NODE_STATE.CHILD]: {
            [NODE_ELEMENT.NODE]: COLOR.red,
            [NODE_ELEMENT.LABEL]: COLOR.gray,
            [NODE_ELEMENT.LABEL_BODY]: null,
        },
    }
}

export const EDGE_STATE = {
    INACTIVE: "INACTIVE",
    ACTIVE: "ACTIVE",
}

export const EDGE_COLOR = {
    [EDGE_STATE.INACTIVE]: COLOR.gray_dark,
    [EDGE_STATE.ACTIVE]: COLOR.gray,
}

export const SIZE = {
    [NODE_TYPES.COURSE]: 14,
    [NODE_TYPES.SECTION]: 12,
    [NODE_TYPES.CYCLE]: 10,
    [NODE_TYPES.GLOSSENTRY]: 5,
    [NODE_TYPES.VIDEO]: 3,
}