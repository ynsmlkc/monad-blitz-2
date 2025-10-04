import VoiceRecorder from "@/components/voice-recorder"

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6">
      <div className="w-full max-w-2xl space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold tracking-tight text-balance">Sesli Asistan</h1>
          <p className="text-lg text-muted-foreground text-pretty">Mikrofon butonuna basın ve konuşmaya başlayın</p>
        </div>

        <VoiceRecorder />
      </div>
    </main>
  )
}
