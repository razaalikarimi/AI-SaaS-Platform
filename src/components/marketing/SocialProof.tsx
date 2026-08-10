"use client"

export const SocialProof = () => {
  const logos = [
    { name: "Acme Corp", icon: "❖" },
    { name: "GlobalTech", icon: "✦" },
    { name: "Nexus", icon: "⎈" },
    { name: "Stark Ind", icon: "◭" },
    { name: "Umbrella", icon: "✜" }
  ]

  return (
    <section className="bg-white py-12 border-b border-slate-100">
      <div className="max-w-7xl mx-auto px-6">
        <p className="text-center text-sm font-semibold text-slate-400 mb-8 uppercase tracking-wider">
          Trusted by forward-thinking engineering teams
        </p>
        <div className="flex flex-wrap justify-center items-center gap-12 md:gap-24 opacity-60 grayscale">
          {logos.map((logo, i) => (
            <div key={i} className="flex items-center gap-2 text-slate-800 font-bold text-xl hover:opacity-100 transition-opacity cursor-default">
              <span className="text-2xl text-indigo-600">{logo.icon}</span>
              {logo.name}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
