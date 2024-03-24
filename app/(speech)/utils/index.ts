const formatTimestamp = (timestamp: number) => {
    // Format as MM:SS
    const minutes = Math.floor(timestamp / 60);
    const seconds = Math.floor(timestamp % 60);
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
}

export { formatTimestamp };