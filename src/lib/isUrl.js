export const isUrl = (str) => /^https?:\/\//i.test((str || "").trim());
