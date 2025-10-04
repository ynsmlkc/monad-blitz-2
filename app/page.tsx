import StoryCreator from "@/components/story-creator"

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 md:p-6">
      <div className="w-full max-w-4xl space-y-6">
        <div className="text-center space-y-3">
          <h1 className="text-5xl md:text-6xl font-bold tracking-tight text-balance bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
            Hikaye Zamanı! 📚
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground text-pretty font-medium">
            Bir konu söyle, sana özel bir hikaye yazayım! ✨
          </p>
        </div>

        <StoryCreator />
      </div>
    </main>
  )
}
