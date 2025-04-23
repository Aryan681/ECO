// src/components/FeatureDescription.jsx
const descriptions = [
    {
      title: "Cloud IDE",
      text: "Code directly in the browser with zero setup. Eco’s IDE supports TypeScript, Python, Go, and more with real-time syncing.",
      image: "/assets/cloud-ide.png",
    },
    {
      title: "Integrated Terminal",
      text: "Powerful ZSH terminal embedded inside. Push to git, manage containers, and run apps — all from one place.",
      image: "/assets/integrated-terminal.png",
    },
    {
      title: "GitOps Workflow",
      text: "Push code, trigger builds, and deploy directly using Git. Eco keeps track of everything via version control.",
      image: "/assets/gitops.png",
    },
    {
      title: "Runtime Control",
      text: "Dynamically add/remove language runtimes. Spin up Python 3.11, Node.js, Go etc with a single command.",
      image: "/assets/runtime.png",
    },
  ];
  
  const FeatureDescription = () => {
    return (
      <section id="description" className="bg-gray-950 text-gray-100 py-28">
        <div className="container mx-auto px-6 sm:px-10 lg:px-20 space-y-24">
          {descriptions.map((item, index) => (
            <div
              key={index}
              className={`flex flex-col md:flex-row ${
                index % 2 !== 0 ? "md:flex-row-reverse" : ""
              } items-center gap-12`}
            >
              <img
                src={item.image}
                alt={item.title}
                className="w-full md:w-1/2 rounded-lg shadow-lg border border-gray-800"
              />
              <div className="md:w-1/2 space-y-4">
                <h3 className="text-3xl font-bold text-emerald-400 font-mono">
                  {item.title}
                </h3>
                <p className="text-gray-400 font-mono">{item.text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  };
  
  export default FeatureDescription;
  