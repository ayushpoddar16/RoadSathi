import { Link } from "react-router-dom";
import heroImage from "../assets/hero-tracking.png";
import { useAuthStore } from "../store/authStore";

const ISSUE_TYPES = [
  { icon: "⛽", label: "Fuel & Charging" },
  { icon: "🔧", label: "Mechanical Breakdown" },
  { icon: "⚡", label: "Electrical Issue" },
  { icon: "🚨", label: "Towing & Accident" },
];

const STEPS = [
  {
    title: "Tell us what happened",
    desc: "Pick your vehicle type and describe the problem — flat tyre, dead battery, out of fuel, whatever it is.",
  },
  {
    title: "We find help nearby",
    desc: "Verified mechanics within your area get notified instantly and race to accept your request.",
  },
  {
    title: "Track them in real time",
    desc: "Watch your mechanic move toward you on a live map, with their name, phone number, and ETA.",
  },
  {
    title: "Pay when it's done",
    desc: "Settle up securely once the job is finished, then rate your experience.",
  },
];

const Home = () => {
  const { user, token } = useAuthStore();
  const isLoggedIn = Boolean(token && user);
  const dashboardPath = user?.role === "customer" ? "/customer" : "/provider";

  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <nav className="border-b border-ink-100">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <span className="text-xl font-bold text-brand-500">RoadSathi</span>
          <div className="flex items-center gap-3">
            {isLoggedIn ? (
              <Link
                to={dashboardPath}
                className="px-4 py-2 rounded-lg bg-brand-500 text-white text-sm font-medium hover:bg-brand-600 transition-colors"
              >
                Go to Dashboard
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-medium text-ink-700 hover:text-ink-900"
                >
                  Log in
                </Link>
                <Link
                  to="/signup"
                  className="px-4 py-2 rounded-lg bg-brand-500 text-white text-sm font-medium hover:bg-brand-600 transition-colors"
                >
                  Get started
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-6 pt-16 pb-20 bg-amber-200">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <span className="inline-block px-3 py-1 rounded-full bg-brand-50 text-brand-600 text-xs font-medium mb-5">
              Roadside assistance, on demand
            </span>
            <h1 className="text-4xl md:text-5xl font-bold text-ink-900 leading-tight mb-5">
              Stuck on the road?
              <br />
              Help is closer than you think.
            </h1>
            <p className="text-ink-500 text-lg mb-8 max-w-md">
              RoadSathi connects you with nearby mechanics for any vehicle
              trouble — 2-wheelers to trucks — with live tracking from the
              moment you ask for help.
            </p>
            <div className="flex flex-wrap items-center gap-3">
              {isLoggedIn ? (
                <Link
                  to={dashboardPath}
                  className="px-6 py-3 rounded-lg bg-brand-500 text-white font-medium hover:bg-brand-600 transition-colors"
                >
                  Go to Dashboard
                </Link>
              ) : (
                <>
                  <Link
                    to="/signup"
                    className="px-6 py-3 rounded-lg bg-brand-500 text-white font-medium hover:bg-brand-600 transition-colors"
                  >
                    Request help now
                  </Link>
                  <Link
                    to="/login"
                    className="px-6 py-3 rounded-lg border border-ink-300 text-ink-700 font-medium hover:border-brand-400 transition-colors"
                  >
                    I already have an account
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* Signature visual: live tracking illustration */}
          <div className="relative">
            <img
              src={heroImage}
              alt="Live map showing a customer's location connected by a route to an approaching mechanic"
              className="w-full h-auto rounded-2xl"
            />
            <div className="absolute top-4 right-4 bg-white rounded-xl2 shadow-md px-4 py-2.5 text-sm">
              <p className="font-medium text-ink-900">Mechanic matched</p>
              <p className="text-ink-500 text-xs">4 min away</p>
            </div>
          </div>
        </div>
      </section>

      {/* Issue types strip */}
      <section className="max-w-6xl mx-auto bg-gray-600">
        <div className="max-w-6xl mx-auto px-6 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {ISSUE_TYPES.map((issue) => (
              <div
                key={issue.label}
                className="bg-white rounded-xl2 p-4 text-center border border-ink-100"
              >
                <div className="text-2xl mb-2">{issue.icon}</div>
                <p className="text-sm font-medium text-ink-700">
                  {issue.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="max-w-6xl mx-auto px-6 py-20 bg-amber-200">
        <h2 className="text-2xl md:text-3xl font-bold text-ink-900 mb-2">
          How it works
        </h2>
        <p className="text-ink-500 mb-12">
          Four steps, from stranded to sorted.
        </p>

        <div className="border border-ink-200 rounded-lg p-6">
          <div className="grid md:grid-cols-2 gap-8">
            {STEPS.map((step, i) => (
              <div key={step.title} className="flex gap-4">
                <div className="shrink-0 w-9 h-9 rounded-full border border-black bg-brand-500 text-white text-sm font-semibold flex items-center justify-center">
                  {i + 1}
                </div>
                <div>
                  <h3 className="font-semibold text-ink-900 mb-1">
                    {step.title}
                  </h3>
                  <p className="text-ink-500 text-sm">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* For mechanics */}
      <section className="bg-ink-900 text-white">
        <div className="max-w-6xl mx-auto px-6 py-16 grid md:grid-cols-2 gap-8 items-center">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold mb-3">
              Are you a mechanic?
            </h2>
            <p className="text-ink-300 mb-6 max-w-md">
              Join RoadSathi to pick up nearby jobs, set your own service area,
              and get paid directly for every request you complete.
            </p>
            <Link
              to="/signup"
              className="inline-block px-6 py-3 rounded-lg bg-brand-500 text-white font-medium hover:bg-brand-600 transition-colors"
            >
              Sign up as a mechanic
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white/5 rounded-xl2 p-5 border border-white/10">
              <p className="text-2xl font-bold text-brand-400 mb-1">5 km</p>
              <p className="text-sm text-ink-300">matching radius</p>
            </div>
            <div className="bg-white/5 rounded-xl2 p-5 border border-white/10">
              <p className="text-2xl font-bold text-brand-400 mb-1">Live</p>
              <p className="text-sm text-ink-300">GPS tracking</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-ink-100">
        <div className="max-w-6xl mx-auto px-6 py-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <span className="text-sm text-ink-500">
            © {new Date().getFullYear()} RoadSathi. Built for the road.
          </span>
        </div>
      </footer>
    </div>
  );
};

export default Home;
