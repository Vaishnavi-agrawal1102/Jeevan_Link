
import { Link } from "react-router-dom";

const highlights = [
  { label: "EMERGENCY SUPPORT", value: "Request Assistance", icon: "✚" },
  { label: "RESPONSE NETWORK", value: "Volunteers & NGOs", icon: "♧" },
  { label: "RELIEF COORDINATION", value: "Connected Support", icon: "⌂" },
];

const roles = [
  {
    title: "I need emergency help",
    desc: "Request rescue, medical assistance, food, water or shelter. Submit your emergency so responders can review your needs.",
    to: "/register",
    cta: "Request Assistance",
    icon: "✚",
    label: "FOR CITIZENS",
  },
  {
    title: "I am a rescue volunteer",
    desc: "Join the response network, view eligible emergency requests and coordinate assistance for affected communities.",
    to: "/register",
    cta: "Join as Volunteer",
    icon: "♧",
    label: "FOR VOLUNTEERS",
  },
  {
    title: "I represent an NGO",
    desc: "Coordinate relief supplies, manage response activities and connect available resources with people who need assistance.",
    to: "/register",
    cta: "Register Organization",
    icon: "♡",
    label: "FOR ORGANIZATIONS",
  },
];

const Home = () => {
  return (
    <main className="bg-white text-slate-900">

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-[#082F38] text-white">

        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(13,148,136,0.25),transparent_55%)]" />

        <div className="pointer-events-none absolute -right-32 bottom-0 h-96 w-96 rounded-full bg-teal-500/10 blur-3xl" />

        <div className="relative mx-auto grid max-w-7xl items-center gap-14 px-5 py-20 sm:px-8 lg:grid-cols-2 lg:py-28">

          {/* Hero Content */}
          <div>

            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-teal-400/30 bg-teal-400/10 px-4 py-2 text-xs font-bold uppercase tracking-wider text-teal-300">
              <span className="h-2 w-2 rounded-full bg-teal-400" />
              Emergency Response & Relief Coordination
            </div>

            <h1 className="max-w-2xl font-display text-4xl font-extrabold leading-tight tracking-tight text-white sm:text-5xl lg:text-6xl">
  Connecting people with help when it matters{" "}
  <span className="text-[#5EEAD4]">most.</span>
</h1>

            <p className="mt-7 max-w-xl text-base leading-8 text-slate-300 sm:text-lg">
              Jeevan Link is an integrated platform that connects affected
              people, rescue volunteers and NGOs to coordinate emergency
              requests, relief resources and disaster response activities.
            </p>

            {/* Action Buttons */}
            <div className="mt-9 flex flex-wrap gap-3">

              <Link
                to="/sos"
                className="inline-flex items-center gap-3 rounded-xl bg-red-600 px-6 py-4 text-sm font-bold text-white shadow-lg shadow-red-950/30 transition hover:-translate-y-1 hover:bg-red-700"
              >
                <span className="text-lg">🆘</span>
                SOS Without Login
                <span>→</span>
              </Link>

              <Link
                to="/register"
                className="inline-flex items-center gap-2 rounded-xl bg-teal-600 px-6 py-4 text-sm font-bold text-white shadow-lg shadow-teal-950/20 transition hover:-translate-y-1 hover:bg-teal-700"
              >
                Request Assistance
                <span>→</span>
              </Link>

              <Link
                to="/relief-camps"
                className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/5 px-5 py-4 text-sm font-semibold text-white transition hover:bg-white/10"
              >
                Find Relief Camps
              </Link>

            </div>

            <div className="mt-7 flex items-start gap-3 text-xs leading-6 text-slate-400">
              <span className="mt-0.5 text-teal-400">ⓘ</span>
              <p>
                For immediate life-threatening emergencies, contact your
                local emergency services as well.
              </p>
            </div>

          </div>

          {/* Response Overview Panel */}
          <div className="relative mx-auto w-full max-w-lg">

            <div className="absolute -inset-5 rounded-3xl bg-teal-400/10 blur-2xl" />

            <div className="relative rounded-3xl border border-white/10 bg-[#103E47]/90 p-5 shadow-2xl sm:p-7">

              <div className="flex items-center justify-between gap-3">

                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-teal-300">
                    Jeevan Link Network
                  </p>

                  <h2 className="mt-2 text-xl font-bold text-white">
                    Coordinated Response
                  </h2>
                </div>

                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-teal-500/15 text-2xl text-teal-300">
                  ✚
                </div>

              </div>

              {/* Network Illustration */}
              <div className="relative mt-7 overflow-hidden rounded-2xl border border-white/10 bg-[#0B303B] p-5">

                <div className="absolute inset-0 opacity-30">
                  <svg
                    viewBox="0 0 400 260"
                    className="h-full w-full"
                    preserveAspectRatio="xMidYMid slice"
                    aria-hidden="true"
                  >
                    <g
                      fill="none"
                      stroke="#5EEAD4"
                      strokeOpacity=".35"
                      strokeWidth="1.5"
                    >
                      <path d="M-10 40 L90 70 L140 25 L210 65 L300 20 L420 65" />
                      <path d="M-20 100 L80 130 L145 90 L230 130 L310 85 L420 120" />
                      <path d="M-10 170 L80 145 L160 195 L250 155 L340 200 L420 170" />
                      <path d="M50 -10 L75 60 L55 130 L100 270" />
                      <path d="M155 -10 L180 60 L160 125 L210 270" />
                      <path d="M265 -10 L245 65 L300 130 L280 270" />
                      <path d="M355 -10 L325 60 L370 125 L350 270" />
                    </g>

                    <path
                      d="M20 185 Q95 130 150 150 T255 105 T390 55"
                      fill="none"
                      stroke="#38BDF8"
                      strokeOpacity=".7"
                      strokeWidth="3"
                    />
                  </svg>
                </div>

                <div className="relative">

                  <div className="flex items-center justify-between gap-3">

                    <div>
                      <p className="text-xs text-slate-400">
                        Integrated coordination
                      </p>
                      <p className="mt-1 text-sm font-semibold text-white">
                        People · Teams · Resources
                      </p>
                    </div>

                    <span className="rounded-full border border-teal-400/30 bg-teal-400/10 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-teal-300">
                      Connected
                    </span>

                  </div>

                  {/* Connection Diagram */}
                  <div className="my-12 flex items-center justify-center gap-2 sm:gap-4">

                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-red-400/30 bg-red-500/15 text-2xl text-red-300">
                      !
                    </div>

                    <div className="h-px w-8 bg-teal-300/60 sm:w-12" />

                    <div className="flex h-20 w-20 items-center justify-center rounded-3xl border border-teal-300/40 bg-teal-400/20 text-4xl text-teal-200 shadow-lg shadow-teal-950/30">
                      ✚
                    </div>

                    <div className="h-px w-8 bg-teal-300/60 sm:w-12" />

                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-blue-400/30 bg-blue-500/15 text-2xl text-blue-300">
                      ♧
                    </div>

                  </div>

                  {/* Process Cards */}
                  <div className="grid grid-cols-3 gap-2">

                    {[
                      {
                        title: "Emergency",
                        desc: "Submit a request",
                      },
                      {
                        title: "Response",
                        desc: "Coordinate support",
                      },
                      {
                        title: "Relief",
                        desc: "Track assistance",
                      },
                    ].map((item) => (
                      <div
                        key={item.title}
                        className="rounded-xl border border-white/10 bg-[#082F38]/80 p-3"
                      >
                        <p className="text-xs font-bold text-white">
                          {item.title}
                        </p>

                        <p className="mt-2 text-[10px] leading-4 text-slate-400">
                          {item.desc}
                        </p>
                      </div>
                    ))}

                  </div>

                </div>

              </div>

              <p className="mt-5 text-center text-xs leading-5 text-slate-400">
                One connected platform for emergency reporting and relief
                coordination.
              </p>

            </div>
          </div>

        </div>
      </section>

      {/* Platform Highlights */}
      <section className="border-b border-slate-200 bg-slate-50">

        <div className="mx-auto grid max-w-7xl gap-0 px-5 sm:px-8 md:grid-cols-3 lg:px-8">

          {highlights.map((item, index) => (
            <div
              key={item.label}
              className={`flex items-center gap-4 py-7 ${
                index !== 2 ? "md:border-r md:border-slate-200 md:pr-6" : ""
              } ${index !== 0 ? "md:pl-6" : ""}`}
            >

              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#0D766F] text-xl text-white shadow-md">
                {item.icon}
              </div>

              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  {item.label}
                </p>

                <p className="mt-1 text-lg font-bold text-[#0B4850]">
                  {item.value}
                </p>
              </div>

            </div>
          ))}

        </div>
      </section>

      {/* Role Selection */}
      <section className="relative overflow-hidden bg-white">

        <div className="pointer-events-none absolute -bottom-32 -left-20 h-80 w-80 rounded-full bg-teal-50 blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:px-8">

          <div className="text-center">

            <p className="text-xs font-bold uppercase tracking-[0.18em] text-teal-700">
              Be Part of the Network
            </p>

            <h2 className="mt-3 font-display text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              How would you like to participate?
            </h2>

            <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-slate-600 sm:text-base">
              Whether you need assistance or want to support affected
              communities, Jeevan Link connects people and organizations
              through coordinated emergency response.
            </p>

          </div>

          <div className="mt-12 grid gap-6 lg:grid-cols-3">

            {roles.map((role) => (
              <article
                key={role.title}
                className="group flex flex-col rounded-2xl border border-slate-200 bg-white p-7 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-teal-300 hover:shadow-xl hover:shadow-teal-900/5"
              >

                <div className="flex items-center justify-between">

                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-teal-50 text-2xl font-bold text-teal-700 transition group-hover:bg-teal-700 group-hover:text-white">
                    {role.icon}
                  </div>

                  <span className="rounded-full bg-slate-100 px-3 py-1.5 text-[10px] font-bold tracking-wider text-slate-500">
                    {role.label}
                  </span>

                </div>

                <h3 className="mt-7 text-lg font-bold text-slate-900">
                  {role.title}
                </h3>

                <p className="mt-3 flex-1 text-sm leading-7 text-slate-600">
                  {role.desc}
                </p>

                <Link
                  to={role.to}
                  className="mt-7 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#0D766F] px-5 py-3.5 text-sm font-bold text-white transition hover:bg-[#095B56]"
                >
                  {role.cta}
                  <span>→</span>
                </Link>

              </article>
            ))}

          </div>
        </div>
      </section>

    </main>
  );
};

export default Home;
