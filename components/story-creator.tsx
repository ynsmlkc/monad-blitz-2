"use client"

import { useState, useRef, useEffect } from "react"
import { Mic, Square, Volume2, Pause, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import AudioVisualizer from "@/components/audio-visualizer"

type AppState = "idle" | "recording" | "generating" | "story-ready" | "playing"

export default function StoryCreator() {
  const [state, setState] = useState<AppState>("idle")
  const [audioLevel, setAudioLevel] = useState(0)
  const [recordedTopic, setRecordedTopic] = useState("")
  const [story, setStory] = useState("")

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const animationFrameRef = useRef<number | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const speechSynthesisRef = useRef<SpeechSynthesisUtterance | null>(null)

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = stream

      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder

      const audioContext = new AudioContext()
      audioContextRef.current = audioContext

      const analyser = audioContext.createAnalyser()
      analyser.fftSize = 256
      analyserRef.current = analyser

      const source = audioContext.createMediaStreamSource(stream)
      source.connect(analyser)

      mediaRecorder.start()
      setState("recording")

      const dataArray = new Uint8Array(analyser.frequencyBinCount)

      const updateAudioLevel = () => {
        if (!analyserRef.current) return

        analyserRef.current.getByteFrequencyData(dataArray)
        const average = dataArray.reduce((a, b) => a + b) / dataArray.length
        const normalizedLevel = Math.min(average / 128, 1)

        setAudioLevel(normalizedLevel)
        animationFrameRef.current = requestAnimationFrame(updateAudioLevel)
      }

      updateAudioLevel()
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

    setAudioLevel(0)

    // Simüle edilmiş konu (gerçek uygulamada Speech-to-Text API kullanılır)
    const mockTopic = "dinozorlar"
    setRecordedTopic(mockTopic)

    // Hikaye oluşturma simülasyonu
    setState("generating")
    setTimeout(() => {
      generateStory(mockTopic)
    }, 2000)
  }

  const generateStory = (topic: string) => {
    // Gerçek uygulamada AI API çağrısı yapılır
    const mockStory = `Bir zamanlar, çok uzak bir ormanda ${topic} yaşarmış. Bu ${topic} çok sevimli ve arkadaş canlısıymış. Her gün ormandaki diğer hayvanlarla oynarmış. Bir gün, ormanda kaybolmuş küçük bir tavşan bulmuş. ${topic}, tavşana yardım etmiş ve onu evine götürmüş. O günden sonra, ${topic} ve tavşan en iyi arkadaş olmuşlar. Birlikte çok güzel maceralar yaşamışlar ve hep mutlu olmuşlar.`

    setStory(mockStory)
    setState("story-ready")
  }

  const toggleRecording = () => {
    if (state === "recording") {
      stopRecording()
    } else {
      startRecording()
    }
  }

  const playStory = () => {
    if ("speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(story)
      utterance.lang = "tr-TR"
      utterance.rate = 0.9
      utterance.pitch = 1.1

      utterance.onstart = () => setState("playing")
      utterance.onend = () => setState("story-ready")

      speechSynthesisRef.current = utterance
      window.speechSynthesis.speak(utterance)
    }
  }

  const pauseStory = () => {
    if (window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel()
      setState("story-ready")
    }
  }

  const resetApp = () => {
    if (window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel()
    }
    setState("idle")
    setRecordedTopic("")
    setStory("")
  }

  useEffect(() => {
    return () => {
      if (state === "recording") {
        stopRecording()
      }
      if (window.speechSynthesis.speaking) {
        window.speechSynthesis.cancel()
      }
    }
  }, [])

  return (
    <div className="flex flex-col items-center gap-8">
      {/* Durum Göstergesi */}
      {state === "idle" && (
        <div className="text-center space-y-6">
          <div className="text-6xl">🎤</div>
          <p className="text-2xl font-semibold text-muted-foreground">Mikrofona bas ve bir konu söyle!</p>
        </div>
      )}

      {/* Ses Kaydı */}
      {state === "recording" && (
        <div className="w-full space-y-6">
          <div className="text-center">
            <p className="text-2xl font-bold text-primary animate-pulse">Dinliyorum... 👂</p>
          </div>
          <AudioVisualizer isActive={true} audioLevel={audioLevel} />
        </div>
      )}

      {/* Hikaye Oluşturma */}
      {state === "generating" && (
        <div className="text-center space-y-6 py-12">
          <Sparkles className="h-20 w-20 mx-auto text-primary animate-spin" />
          <p className="text-3xl font-bold text-primary animate-pulse">Hikayeni yazıyorum... ✨</p>
          <p className="text-xl text-muted-foreground">
            Konu: <span className="font-semibold text-foreground">{recordedTopic}</span>
          </p>
        </div>
      )}

      {/* Hikaye Gösterimi */}
      {(state === "story-ready" || state === "playing") && (
        <div className="w-full space-y-6">
          <div className="bg-card rounded-3xl p-8 shadow-lg border-4 border-primary/20">
            <div className="flex items-center gap-3 mb-6">
              <div className="text-4xl">📖</div>
              <h2 className="text-3xl font-bold text-primary">Senin Hikayene!</h2>
            </div>
            <p className="text-xl leading-relaxed text-foreground whitespace-pre-wrap">{story}</p>
          </div>

          {/* Sesli Okuma Kontrolü */}
          <div className="flex flex-col items-center gap-4">
            {state === "playing" && (
              <div className="flex gap-2">
                {[...Array(5)].map((_, i) => (
                  <div
                    key={i}
                    className="w-2 h-12 bg-secondary rounded-full animate-pulse"
                    style={{ animationDelay: `${i * 0.1}s` }}
                  />
                ))}
              </div>
            )}

            <div className="flex gap-4">
              {state === "story-ready" && (
                <Button
                  onClick={playStory}
                  size="lg"
                  className="h-16 px-8 text-xl rounded-full bg-secondary hover:bg-secondary/90"
                >
                  <Volume2 className="h-8 w-8 mr-3" />
                  Hikayeyi Dinle
                </Button>
              )}

              {state === "playing" && (
                <Button
                  onClick={pauseStory}
                  size="lg"
                  className="h-16 px-8 text-xl rounded-full bg-destructive hover:bg-destructive/90"
                >
                  <Pause className="h-8 w-8 mr-3" />
                  Durdur
                </Button>
              )}

              <Button
                onClick={resetApp}
                size="lg"
                variant="outline"
                className="h-16 px-8 text-xl rounded-full border-2 bg-transparent"
              >
                Yeni Hikaye
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Mikrofon Butonu */}
      {(state === "idle" || state === "recording") && (
        <div className="flex flex-col items-center gap-4">
          <Button
            onClick={toggleRecording}
            size="lg"
            className={`h-32 w-32 rounded-full transition-all duration-300 shadow-2xl ${
              state === "recording"
                ? "bg-destructive hover:bg-destructive/90 scale-110 animate-pulse"
                : "bg-primary hover:bg-primary/90 hover:scale-105"
            }`}
          >
            {state === "recording" ? (
              <Square className="h-16 w-16" fill="currentColor" />
            ) : (
              <Mic className="h-20 w-20" />
            )}
          </Button>

          <p className="text-lg font-semibold text-muted-foreground">
            {state === "recording" ? "Konuşmayı bitirmek için tıkla" : "Başlamak için tıkla"}
          </p>
        </div>
      )}
    </div>
  )
}
