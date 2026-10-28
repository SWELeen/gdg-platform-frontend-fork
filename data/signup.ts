export const phoneCountryCodeOptions = [
  { country: "Saudi Arabia", code: "+966" },
] as const;

export const defaultPhoneCountryCode = phoneCountryCodeOptions[0].code;

export const genderOptions = [
  { value: "female", labelKey: "female" },
  { value: "male", labelKey: "male" },
] as const;

export const universityOptions = [
  "University of Jeddah",
  "King Abdulaziz University",
  "University of Business and Technology (UBT)",
  "Dar Al-Hekma University",
  "Effat University",
  "Batterjee Medical College",
  "Ibn Sina National College",
  "Other",
] as const;

export const branchOptions = [
  "Main Campus Al-Faisaliyah (Female)",
  "Main Campus Asfan (Male)",
  "Khulais Branch (Female)",
  "Khulais Branch (Male)",
  "Other",
] as const;

export const collegeOptions = [
  "College of Information Technology",
  "College of Computer Science and Engineering",
  "College of Engineering",
  "College of Science",
  "College of Medicine",
  "College of Business",
  "College of Applied Medical Sciences",
  "College of Education",
  "College of Law and Judicial Studies",
  "College of Sport Sciences",
  "College of Communication and Media",
  "College of Languages and Translation",
  "College of Design and Arts",
  "College of Quran and Islamic Studies",
  "Other",
] as const;

export const majorOptions = [
  "Computer & Network Engineering",
  "Information Systems",
  "Computer Science",
  "Computer Engineering",
  "Software Engineering",
  "Information Technology",
  "Data Science",
  "Cybersecurity",
  "Artificial Intelligence",
  "Chemistry",
  "Industrial Chemistry",
  "Applied Biochemistry",
  "Biology",
  "Accounting",
  "Business Administration",
  "Supply Chain Management",
  "Finance",
  "Industrial Engineering",
  "Graphic Design",
  "Marketing",
  "Digital Media",
  "Human Resources",
  "Other",
] as const;

export const levelOptions = [
  "Level 1", "Level 2", "Level 3", "Level 4", "Level 5", "Level 6",
  "Level 7", "Level 8", "Level 9", "Level 10", "Level 11", "Level 12",
  "Graduated",
] as const;

export const committeeOptions = [
  "Project Management Committee",
  "Public Relations Committee",
  "Digital Media and Design Committee",
  "Content Writing Committee",
  "Artificial Intelligence Committee",
  "Data Analytics Committee",
  "Cybersecurity Committee",
  "Robotics Committee",
  "Automation Committee",
  "Web design and development",
] as const;

export type CommitteeOption = (typeof committeeOptions)[number];

// Committee codes from the backend committee table.
export const committeeCodes: Record<CommitteeOption, string> = {
  "Project Management Committee": "PM",
  "Public Relations Committee": "PR",
  "Digital Media and Design Committee": "DMD",
  "Content Writing Committee": "CONTENT",
  "Artificial Intelligence Committee": "AI",
  "Data Analytics Committee": "DATA",
  "Cybersecurity Committee": "CYBER",
  "Robotics Committee": "ROBOTICS",
  "Automation Committee": "AUTOMATION",
  "Web design and development": "WEB",
};

export const committeeSkillOptions: Record<CommitteeOption, readonly string[]> = {
  "Project Management Committee": [
    "Roadmaps",
    "Planning",
    "Documentation",
    "Risk Tracking",
    "Stakeholder Communication",
  ],
  "Public Relations Committee": [
    "Branding",
    "Event Promotion",
    "Community Outreach",
    "Content Strategy",
    "Media Relations",
  ],
  "Digital Media and Design Committee": [
    "Brand Design",
    "Social Media Design",
    "Video Editing",
    "Poster Design",
    "UX/UI Basics",
  ],
  "Content Writing Committee": [
    "Technical Writing",
    "Copywriting",
    "Campaign Messaging",
    "Blog Editing",
    "Storytelling",
  ],
  "Artificial Intelligence Committee": [
    "AI Research",
    "Prompt Design",
    "Model Evaluation",
    "Machine Learning",
    "Automation Workflows",
  ],
  "Data Analytics Committee": [
    "SQL",
    "Python",
    "Excel",
    "Dashboarding",
    "Data Cleaning",
  ],
  "Cybersecurity Committee": [
    "Security Testing",
    "Threat Analysis",
    "Linux",
    "Network Basics",
    "Documentation",
  ],
  "Robotics Committee": [
    "Arduino",
    "Sensors",
    "Circuit Basics",
    "Robotics Prototyping",
    "Automation",
  ],
  "Automation Committee": [
    "Workflow Automation",
    "No-Code Tools",
    "Process Mapping",
    "System Integration",
    "Optimization",
  ],
  "Web design and development": [
    "HTML/CSS",
    "React",
    "Next.js",
    "UI Implementation",
    "Accessibility",
  ],
};

export const roleOptions = ["Leader", "Co-Leader", "Member"] as const;

