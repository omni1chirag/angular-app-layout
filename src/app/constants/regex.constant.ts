export const REGEX = {
    ALPHA_NUMERIC: new RegExp(/^[a-zA-Z0-9 ]+$/),
    ALPHA_NUMERIC_SPACE: new RegExp(/^[A-Za-z0-9][A-Za-z0-9\s&()./-]*[A-Za-z0-9)]$/),
    NUMERIC : new RegExp(/^\d+$/),
    ADDRESS_LINE_REGEX: new RegExp(/^[A-Za-z0-9][A-Za-z0-9\s,.\-/#()]*[A-Za-z0-9)]$/),
    MIDDLE_NAME_REGEX: new RegExp(/^[A-Za-z]+\.?$/),

} as const;
