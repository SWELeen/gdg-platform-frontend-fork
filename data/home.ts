//   Mock data, The actual data will be retrieved from database 
export const projects = [
    {
      id: "gdg-gaming-platform",
      img: "/images/project-placeholder.png",
      committeeColor: "var(--committee-web-development)",
      detailsImg: "/images/GDG-game-project.png",
      detailsImages: [
        "/images/GDG-game2-project.png",
      ],
    },
    {
      id: "bracket-click",
      img: "/images/project-placeholder.png",
      committeeColor: "var(--committee-artificial-intelligence)",
      detailsImages: [
        "/images/BracketClick1.png",
      ],
    },
    {
      id: "gdg-air-hockey",
      img: "/images/project-placeholder.png",
      committeeColor: "var(--committee-artificial-intelligence)",
      detailsImages: ["/images/GDG%20Air%20Hockey1.png"],
    },
    {
      id: "gdg-prompt-pilot",
      img: "/images/project-placeholder.png",
      committeeColor: "var(--committee-artificial-intelligence)",
      detailsImages: ["/images/GDG%20Prompt%20Pilot1.jpg"],
    },
    {
      id: "gdg-face-retrieval",
      img: "/images/project-placeholder.png",
      committeeColor: "var(--committee-artificial-intelligence)",
      detailsImages: ["/images/GDG%20Face%20Retrieval1.png"],
    },
    {
      id: "applicant-evaluation-system",
      img: "/images/project-placeholder.png",
      committeeColor: "var(--committee-automation)",
      detailsImages: ["/images/Applicant%20Evaluation%20System1.png"],
    },
    {
      id: "integrated-data-visualization-system",
      img: "/images/project-placeholder.png",
      committeeColor: "var(--committee-data-analysis)",
      detailsImages: ["/images/integrated%20data%20management%20and%20visualization%20system.png"],
    },
    {
      id: "internal-phishing-simulation",
      img: "/images/project-placeholder.png",
      committeeColor: "var(--committee-cybersecurity)",
      detailsImages: ["/images/Internal%20Phishing%20Simulation.png"],
    },
    {
      id: "website-security-assessment",
      img: "/images/project-placeholder.png",
      committeeColor: "var(--committee-cybersecurity)",
      detailsImages: ["/images/website%20security%20assesment.png"],
    },
  ];
    
export const teamMembers = [
  {
    id: "1",
    type: "leader",
    image: "/images/Abdullah-leader.png",
    imageScaleClass: "scale-[1.15]",
    imagePositionClass: "translate-x-2 translate-y-4",
    role: "Lead",
    name: "Abdullah Misar",
    linkedin: "https://www.linkedin.com/in/abdullah-misar",
    x: "https://x.com/abmisar1",
  },
  {
    id: "2",
    type: "leader",
    image: "/images/Jumanah-coleader.png",
    imageScaleClass: "scale-[1.15]",
    imagePositionClass: "translate-y-1",
    role: "Co-Lead",
    name: "Jumanah Alshaibi",
  },
  {
    id: "3",
    type: "advisor",
    image: "/images/Fahad-advisor.png",
    imageScaleClass: "scale-[1.04]",
    imageHoverScaleClass: "group-hover:scale-[1.09]",
    imagePositionClass: "translate-y-3",
    role: "Advisor",
    name: "Fahad Aljudaibi",
        linkedin: "https://www.linkedin.com/in/fahd-aljudaibi?utm_source=share_via&utm_content=profile&utm_medium=member_ios",
    x: "https://x.com/fahadjud?s=11&t=pZ38eq32A3fxP2lOWdg4Fg",
  },
  {
    id: "4",
    type: "advisor",
    image: "/images/Ahmed-advisor.png",
    imageScaleClass: "scale-[1.04]",
    imageHoverScaleClass: "group-hover:scale-[1.09]",
    imagePositionClass: "translate-x-1 translate-y-2",
    role: "Advisor",
    name: "Ahmed Bawazeer",
    linkedin: "https://www.linkedin.com/in/ahmed-bawazeer-285160267",
    x: "https://x.com/ahmedbawza",
  },
];

const allCommittees = [
  {
    id: "content-writing",
    name: "Content Writing",
    color: "#FFD34E",
    description:
      "Creates and manages the group’s written and media content, ensuring content quality, consistency in style and identity, and clarity of messaging across various platforms.",
    lead: {
      name: "Asma Alhasani",
      image: "/images/unknown.png",
      linkedin: "https://www.linkedin.com/in/asma-alhasani-2b12a1317",
      x: "https://x.com/asma_ibrahim8?s=11",
    },
    coLeader:{
      name: "Sameera Radwan",
      image: "/images/sameerah-preview.png",
      linkedin: "https://www.linkedin.com/in/sameera-radwan-b456a9344?utm_source=share_via&utm_content=profile&utm_medium=member_ios",
      x: "https://x.com/tsame_30?s=11",
    },
  },

  {
    id: "project-management",
    name: "Project Management",
    color: "#4285F4",
    description:
      "Where ideas become structured plans with clear owners, clear deadlines, and clear outcomes. We bring together planning, coordination, and follow through to turn vision into execution, and execution into results.",
    lead: {
      name: "Mohammed Elkasabgy",
      image: "/images/PM-lead.png",
      linkedin: "https://www.linkedin.com/in/mohamed-elkasabgy-a610a4387?utm_source=share_via&utm_content=profile&utm_medium=member_ios",
      x: "https://x.com/mksbji?s=11&t=O9bY4C0wj73A4Q7P5zDisA",
    },
    coLeader:{
      name: "Shahad Almazrui",
      image: "/images/PM-colead.png",
      linkedin: "https://www.linkedin.com/in/shahad-almazrui-b50b882a0?utm_source=share_via&utm_content=profile&utm_medium=member_ios",
      x: "https://x.com/IT_ShahadA",
    },
  },

  {
    id: "digital-media",
    name: "Digital Media and Design",
    color: "#EA4335",
    description:
      "A space where ideas transform into creativity through innovative designs, visual storytelling, and purposeful digital content. We bring together design, photography, video editing, and marketing to create content that reflects ideas and leaves an impact.",
    lead: {
      name: "Joud Abdullah",
      image: "/images/unknown.png",
      x: "https://x.com/iiovull?s=11&t=pZ38eq32A3fxP2lOWdg4Fg",
    },
    coLeader:{
      name: "Linda Alminhali",
      image: "/images/DMD-colead.png",
            linkedin: "https://www.linkedin.com/in/linda-alminhali-339745309",
      x: "https://x.com/_33opp?s=11",
      
    },
  },

  {
    id: "public-relations",
    name: "Public Relations",
    color: "#34A853",
    description:
      "Representing the group externally, building strong relationships, and strengthening its image with partners, stakeholders, and the wider community.",
    lead: {
      name: "Layan Mashraie",
      image: "/images/unknown.png",
    },
    coLeader:{
      name: "Abdullah Saif",
      image: "/images/PR-colead.png",
      linkedin: "https://www.linkedin.com/in/abdullahmohammedsaifali",
      x: "https://x.com/abdullahmsaif17?s=11",
    },
  },

  {
    id: "developers",
    name: "Developers",
    color: "#000000",
    description:
      "A space for builders, problem-solvers, and technology enthusiasts to learn, create, and build meaningful solutions together.",
    lead: {
      name: "Shadi Alnajar",
      image: "/images/Developers-Lead.png",
      linkedin: "https://www.linkedin.com/in/engshadi/",
    },
  },
    {
        id: "web-development",
        name: "Web Design & Development",
        color: "var(--committee-web-development)",
        description:
          " A creative space for developers passionate about building modern web experiences. Members explore frontend and backend development, from design to deployment. The committee works with modern technologies to create functional and responsive websites. It encourages collaboration, problem solving, and clean development practices. Members turn ideas into real digital experiences and practical projects. ",
        lead: {
          name: "Leen Alghamdi",
          image: "/images/web-lead.png",
          imageScaleClass: "scale-125",
          imagePositionClass: "translate-y-6",
        },
    },

      {
        id: "artificial-intelligence",
        name: "Artificial Intelligence",
        color: "var(--committee-artificial-intelligence)",
        description:
          "A space for exploring the world of artificial intelligence and emerging technologies. Members learn about AI concepts, machine learning, and intelligent applications. The committee encourages experimentation with AI tools and real-world use cases. Members collaborate on innovative projects that use AI to solve meaningful problems. It aims to make AI more accessible, practical, and impactful. ",
        lead: {
          name: "Atheer Alzahrani",
          image: "/images/unknown.png",
          linkedin: "https://www.linkedin.com/in/atheer-mohammad-39a77a302?utm_source=share_via&utm_content=profile&utm_medium=member_ios",
        },
      },

      {
        id: "robotics-iot",
        name: "Robotics & IOT",
        color: "var(--committee-robotics-iot)",
        description:
          "A hands-on space for building smart systems that connect the physical and digital worlds. Members explore robotics, sensors, embedded systems, and Internet of Things technologies. The committee encourages experimentation, prototyping, and practical problem-solving. Members work together to design and build interactive and connected solutions. It turns ideas into real-world systems through technology and creativity. ",
        lead: {
          name: "Saeed Alghamdi",
          image: "/images/unknown.png",
          linkedin: "https://www.linkedin.com/in/saeed-alghamdi-511bb9348?utm_source=share_via&utm_content=profile&utm_medium=member_ios",
          x: "https://x.com/sa707_p?s=11",
        },
      },

      {
        id: "cybersecurity",
        name: "Cybersecurity",
        color: "var(--committee-cybersecurity)",
        description:
          "A space for learning how to protect systems, applications, networks, and digital information. Members explore cybersecurity concepts, security practices, and common digital threats. The committee promotes awareness of secure development and responsible technology use. Members practice identifying vulnerabilities and understanding how systems can be protected. It builds a strong foundation for creating safer and more secure digital environments. ",
        lead: {
          name: "Shadi Alnajar",
          image: "/images/Developers-Lead.png",
          linkedin: "https://www.linkedin.com/in/engshadi/",
        },
      },

      {
        id: "automation",
        name: "Automation",
        color: "var(--committee-automation)",
        description:
          " A space focused on using technology to simplify tasks and improve workflows. Members explore automation tools, scripting, APIs, and process optimization. The committee encourages finding repetitive tasks that can be transformed into efficient solutions. Members collaborate to build automated workflows and practical productivity tools. It helps turn time-consuming processes into smarter and more efficient systems. ",
        lead: {
          name: "Asma Aldossari",
          image: "/images/unknown.png",
        },
      },

      {
        id: "data-analysis",
        name: "Data Analysis",
        color: "var(--committee-data-analysis)",
        description:
          "A space for turning raw data into meaningful insights and informed decisions. Members explore data collection, cleaning, analysis, visualization, and interpretation. The committee works with real-world datasets to understand patterns and trends. Members develop analytical thinking and learn how to communicate insights effectively. It connects data with practical solutions, helping transform information into knowledge. ",
        lead: {
          name: "Shahad Almazrui",
          image: "/images/PM-colead.png",
        },
      },
    // ],

  // subCommittees: [
  //     {
  //       id: "web-development",
  //       name: "Web Design & Development",
  //       description:
  //         " A creative space for developers passionate about building modern web experiences. Members explore frontend and backend development, from design to deployment. The committee works with modern technologies to create functional and responsive websites. It encourages collaboration, problem solving, and clean development practices. Members turn ideas into real digital experiences and practical projects. ",
  //       lead: {
  //         name: "Leen Alghamdi",
  //         image: "/images/web-lead.png",
  //       },
  //     },

  //     {
  //       id: "artificial-intelligence",
  //       name: "Artificial Intelligence",
  //       description:
  //         "A space for exploring the world of artificial intelligence and emerging technologies. Members learn about AI concepts, machine learning, and intelligent applications. The committee encourages experimentation with AI tools and real-world use cases. Members collaborate on innovative projects that use AI to solve meaningful problems. It aims to make AI more accessible, practical, and impactful. ",
  //       lead: {
  //         name: "Atheer Alzahrani",
  //         image: "/images/leader-default.png",
  //       },
  //     },

  //     {
  //       id: "robotics-iot",
  //       name: "Robotics & IOT",
  //       description:
  //         "A hands-on space for building smart systems that connect the physical and digital worlds. Members explore robotics, sensors, embedded systems, and Internet of Things technologies. The committee encourages experimentation, prototyping, and practical problem-solving. Members work together to design and build interactive and connected solutions. It turns ideas into real-world systems through technology and creativity. ",
  //       lead: {
  //         name: "Saeed Alghamdi",
  //         image: "/images/leader-default.png",
  //       },
  //     },

  //     {
  //       id: "cybersecurity",
  //       name: "Cybersecurity",
  //       description:
  //         "A space for learning how to protect systems, applications, networks, and digital information. Members explore cybersecurity concepts, security practices, and common digital threats. The committee promotes awareness of secure development and responsible technology use. Members practice identifying vulnerabilities and understanding how systems can be protected. It builds a strong foundation for creating safer and more secure digital environments. ",
  //       lead: {
  //         name: "Shadi Alnajar",
  //         image: "/images/Developers-Lead.png",
  //       },
  //     },

  //     {
  //       id: "automation",
  //       name: "Automation",
  //       description:
  //         " A space focused on using technology to simplify tasks and improve workflows. Members explore automation tools, scripting, APIs, and process optimization. The committee encourages finding repetitive tasks that can be transformed into efficient solutions. Members collaborate to build automated workflows and practical productivity tools. It helps turn time-consuming processes into smarter and more efficient systems. ",
  //       lead: {
  //         name: "Asma Aldossari",
  //         image: "/images/leader-default.png",
  //       },
  //     },

  //     {
  //       id: "data-analysis",
  //       name: "Data Analysis",
  //       description:
  //         "A space for turning raw data into meaningful insights and informed decisions. Members explore data collection, cleaning, analysis, visualization, and interpretation. The committee works with real-world datasets to understand patterns and trends. Members develop analytical thinking and learn how to communicate insights effectively. It connects data with practical solutions, helping transform information into knowledge. ",
  //       lead: {
  //         name: "Shahad Almazrui",
  //         image: "/images/PM-colead.png",
  //       },
  //     },
  //   ],
];

const developerSubCommitteeIds = [
  "automation",
  "web-development",
  "data-analysis",
  "artificial-intelligence",
  "robotics-iot",
  "cybersecurity",
];

const developerSubCommittees = developerSubCommitteeIds.flatMap((id) => {
  const committee = allCommittees.find((item) => item.id === id);
  return committee ? [committee] : [];
});

export const committees = allCommittees
  .filter((committee) => !developerSubCommitteeIds.includes(committee.id))
  .map((committee) =>
    committee.id === "developers"
      ? { ...committee, subCommittees: developerSubCommittees }
      : committee,
  );

export const sponsors = [
  {
    id: 1,
    image: "/images/wadi.png",
    name: "Wadi Jeddah",
  },
  {
    id: 2,
    image: "/images/sponsor-bakery.png",
    name: "Bakery",
  },
  {
    id: 3,
    image: "/images/sponsor-lahen.png",
    name: "Lahen",
  },
  {
    id: 4,
    image: "/images/sponsor-noosh.png",
    name: "Noosh",
  },
  {
    id: 5,
    image: "/images/sponsor-print.png",
    name: "Print",
  },
    {
    id: 6,
    image: "/images/sponsor-arena-beans.png",
    name: "Arena Beans",
  },
];

export const offers = [
  {
    number: 1,
    color: "var(--gdg-red)",
    title: "Learn & Grow",
    description: "Access workshops, talks, and learning opportunities.",
  },
  {
    number: 2,
    color: "var(--gdg-blue)",
    title: "Connect",
    description:
      "Meet developers, members, and people who share your interests.",
  },
  {
    number: 3,
    color: "var(--gdg-green)",
    title: "Build Together",
    description: "Collaborate on projects and turn ideas into reality.",
  },
  {
    number: 4,
    color: "var(--gdg-yellow)",
    title: "Join Events",
    description:
      "Discover upcoming events and register to participate.",
  },
];
