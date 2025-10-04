"use client"

import { useState, useRef, useEffect } from "react"
import { Mic, Square } from "lucide-react"
import { Button } from "@/components/ui/button"
import AudioVisualizer from "@/components/audio-visualizer"

export default function VoiceRecorder() {
  const [isRecording, setIsRecording] = useState(false)
  const [audioLevel, setAudioLevel] = useState(0)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const animationFrameRef = useRef<number | null>(null)
  const streamRef = useRef<MediaStream | null>(null)

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = stream

      // MediaRecorder setup
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder

      // Audio analysis setup
      const audioContext = new AudioContext()
      audioContextRef.current = audioContext

      const analyser = audioContext.createAnalyser()
      analyser.fftSize = 256
      analyserRef.current = analyser

      const source = audioContext.createMediaStreamSource(stream)
      source.connect(analyser)

      // Start recording
      mediaRecorder.start()
      setIsRecording(true)

      // Analyze audio levels
      const dataArray = new Uint8Array(analyser.frequencyBinCount)

      const updateAudioLevel = () => {
        if (!analyserRef.current) return

        analyserRef.current.getByteFrequencyData(dataArray)

        // Calculate average volume
        const average = dataArray.reduce((a, b) => a + b) / dataArray.length
        const normalizedLevel = Math.min(average / 128, 1)

        setAudioLevel(normalizedLevel)
        animationFrameRef.current = requestAnimationFrame(updateAudioLevel)
      }

      updateAudioLevel()

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          console.log("[v0] Audio data recorded:", event.data.size, "bytes")
        }
      }

      mediaRecorder.onstop = () => {
        console.log("[v0] Recording stopped")
      }
    } catch (error) {
      console.error("[v0] Error accessing microphone:", error)
      alert("Mikrofona erişim izni gerekli")
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop()
    }

    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current)
    }

    if (audioContextRef.current) {
      audioContextRef.current.close()
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop())
    }

    setIsRecording(false)
    setAudioLevel(0)
  }

  const toggleRecording = () => {
    if (isRecording) {
      stopRecording()
    } else {
      startRecording()
    }
  }

  useEffect(() => {
    return () => {
      if (isRecording) {
        stopRecording()
      }
    }
  }, [])

  return (
    <div className="flex flex-col items-center gap-12">
      {/* Audio Visualizer */}
      <div className="w-full flex items-center justify-center min-h-[200px]">
        <AudioVisualizer isActive={isRecording} audioLevel={audioLevel} />
      </div>

      {/* Microphone Button */}
      <div className="flex flex-col items-center gap-4">
        <Button
          onClick={toggleRecording}
          size="lg"
          className={`h-28 w-28 rounded-full transition-all duration-300 ${
            isRecording ? "bg-destructive hover:bg-destructive/90 scale-110" : "bg-primary hover:bg-primary/90"
          }`}
        >
          {isRecording ? <Square className="h-20 w-20" fill="currentColor" /> : <Mic className="h-20 w-20" />}
        </Button>

        <p className="text-sm text-muted-foreground font-medium">
          {isRecording ? "Kayıt ediliyor..." : "Kayda başlamak için tıklayın"}
        </p>
      </div>
    </div>
  )
}
