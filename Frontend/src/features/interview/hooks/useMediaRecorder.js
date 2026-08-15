import { useCallback, useEffect, useRef, useState } from 'react'

// ── WAV export ────────────────────────────────────────────────────────────────
// MediaRecorder gives us webm/opus; Gemini's audio input accepts WAV but not
// webm, so decode the recording and re-encode it as 16-bit PCM mono WAV.

const writeString = (view, offset, str) => {
    for (let i = 0; i < str.length; i += 1) view.setUint8(offset + i, str.charCodeAt(i))
}

const encodeWav = (samples, sampleRate) => {
    const buffer = new ArrayBuffer(44 + samples.length * 2)
    const view = new DataView(buffer)

    writeString(view, 0, 'RIFF')
    view.setUint32(4, 36 + samples.length * 2, true)
    writeString(view, 8, 'WAVE')
    writeString(view, 12, 'fmt ')
    view.setUint32(16, 16, true) // fmt chunk size
    view.setUint16(20, 1, true) // PCM (linear)
    view.setUint16(22, 1, true) // mono
    view.setUint32(24, sampleRate, true)
    view.setUint32(28, sampleRate * 2, true) // byte rate
    view.setUint16(32, 2, true) // block align
    view.setUint16(34, 16, true) // bits per sample
    writeString(view, 36, 'data')
    view.setUint32(40, samples.length * 2, true)

    let offset = 44
    for (let i = 0; i < samples.length; i += 1) {
        const s = Math.max(-1, Math.min(1, samples[i]))
        view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7fff, true)
        offset += 2
    }
    return new Blob([buffer], { type: 'audio/wav' })
}

const blobToWav = async (blob) => {
    const arrayBuffer = await blob.arrayBuffer()
    const AudioCtx = window.AudioContext || window.webkitAudioContext
    const audioCtx = new AudioCtx()
    try {
        const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer)
        const offlineCtx = new OfflineAudioContext(1, audioBuffer.length, audioBuffer.sampleRate)
        const source = offlineCtx.createBufferSource()
        source.buffer = audioBuffer
        source.connect(offlineCtx.destination)
        source.start(0)
        const rendered = await offlineCtx.startRendering()
        return encodeWav(rendered.getChannelData(0), rendered.sampleRate)
    } finally {
        audioCtx.close()
    }
}

/**
 * Mic recording with WAV output for Gemini transcription.
 *   start()        — request the mic, begin recording (webm internally)
 *   stop()         — stop the recorder; on stop the raw blob is decoded + re-encoded
 *                    as audio/wav and exposed as `blob`
 *   isRecording    — true while the recorder is active
 *   error          — mic-permission or conversion failure message (null when OK)
 *   reset()        — drop the current blob so the user can record again
 * Stream tracks + AudioContext are torn down on unmount.
 */
export const useMediaRecorder = () => {
    const [blob, setBlob] = useState(null)
    const [isRecording, setIsRecording] = useState(false)
    const [error, setError] = useState(null)

    const recorderRef = useRef(null)
    const streamRef = useRef(null)
    const chunksRef = useRef([])

    const cleanupStream = useCallback(() => {
        streamRef.current?.getTracks().forEach((t) => t.stop())
        streamRef.current = null
        recorderRef.current = null
    }, [])

    const start = useCallback(async () => {
        setError(null)
        setBlob(null)
        chunksRef.current = []
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
            streamRef.current = stream
            const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
                ? 'audio/webm;codecs=opus'
                : 'audio/webm'
            const recorder = new MediaRecorder(stream, { mimeType })
            recorder.ondataavailable = (e) => {
                if (e.data.size > 0) chunksRef.current.push(e.data)
            }
            recorder.onstop = async () => {
                const raw = new Blob(chunksRef.current, { type: mimeType })
                try {
                    setBlob(await blobToWav(raw))
                } catch {
                    setError('Could not process the recording. Please try again.')
                }
            }
            recorderRef.current = recorder
            recorder.start()
            setIsRecording(true)
        } catch (err) {
            if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
                setError('Microphone access was denied. Allow the mic in your browser and try again.')
            } else {
                setError('Could not access your microphone. Check it is connected and not in use.')
            }
        }
    }, [])

    const stop = useCallback(() => {
        if (recorderRef.current && isRecording) {
            recorderRef.current.stop()
            setIsRecording(false)
        }
    }, [isRecording])

    const reset = useCallback(() => setBlob(null), [])

    useEffect(() => cleanupStream, [cleanupStream])

    return { start, stop, reset, blob, isRecording, error }
}
