exports.isExpired = (paste) => {
    const now = new Date();

    if (paste.expires_at && new Date(paste.expires_at) < now) {
        return true;
    }

    if (
        paste.max_views !== null &&
        paste.max_views !== undefined &&
        paste.views >= paste.max_views
    ) {
        return true;
    }

    return false;
};
