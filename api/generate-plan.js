export default function handler(req, res) {
  const { idea } = req.body || {};

  if (!idea || !idea.trim()) {
    return res.status(400).json({
      error: "Project idea is required"
    });
  }

  const text = idea.toLowerCase();

  let responseData = {
    projectTitle: `Generated plan for: ${idea}`,
    projectType: "AI SaaS Project",
    duration: "Estimated timeline: 8-12 weeks",
    priority: "Priority: MVP launch",
    summary: "This is a mock plan for now.",
    phases: [
      {
        title: "Phase 1 – Planning",
        tasks: [
          "Define project goals",
          "Identify target users",
          "Outline MVP scope"
        ]
      },
      {
        title: "Phase 2 – Build",
        tasks: [
          "Design product interface",
          "Develop core features",
          "Test main workflows"
        ]
      }
    ],
    timeline: [
      { task: "Research", start: 0, duration: 2 },
      { task: "Design", start: 2, duration: 2 },
      { task: "Development", start: 4, duration: 4 },
      { task: "Launch", start: 8, duration: 1 }
    ]
  };

  return res.status(200).json(responseData);
}
