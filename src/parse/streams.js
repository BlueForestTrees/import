import Stream from "stream"

export const streamIt = buffer => {
    let stream = new Stream.Readable()
    stream.push(buffer)
    stream.push(null)
    return stream
}