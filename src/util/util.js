export const chunkify = (full, chunkSize) => {
    let current = 0
    return () => {
        const chunk = full.slice(current, current+chunkSize)
        current += chunkSize
        return chunk.length ? chunk : null
    }
}

export const getRandomColor = () => {
    const letters = '0123456789ABCDEF'
    let color = '#'
    for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)]
    }
    return color
}