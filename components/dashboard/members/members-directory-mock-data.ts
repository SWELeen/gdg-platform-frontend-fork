// MOCK DATA — demonstration only. There is no approved members-directory API contract yet
// (see docs/api-integration.md). This list is scoped to the mock current user's team.

export interface LocalizedMemberText {
  en: string;
  ar: string;
}

export interface DirectoryMember {
  id: string;
  name: string;
  initials: string;
  role: LocalizedMemberText;
  isTeamLead: boolean;
  bio: LocalizedMemberText;
  university: LocalizedMemberText;
  major: LocalizedMemberText;
  phone: string;
  socialLinks: {
    github: string;
    linkedin: string;
    website: string;
  };
}

export const directoryMembers: DirectoryMember[] = [
  {
    id: "m-1",
    name: "Leen Kharraz",
    initials: "LK",
    role: { en: "Frontend Developer", ar: "مطورة واجهات أمامية" },
    isTeamLead: false,
    bio: {
      en: "Passionate about web development, clean UI, and creating impactful solutions. I enjoy turning ideas into accessible experiences.",
      ar: "شغوفة بتطوير الويب وتصميم واجهات واضحة وبناء حلول مؤثرة. أستمتع بتحويل الأفكار إلى تجارب رقمية سهلة الوصول.",
    },
    university: { en: "University of Jeddah", ar: "جامعة جدة" },
    major: { en: "Computer Science", ar: "علوم الحاسب" },
    phone: "+966 50 123 4567",
    socialLinks: {
      github: "https://github.com/",
      linkedin: "https://www.linkedin.com/",
      website: "https://example.com/",
    },
  },
  {
    id: "m-2",
    name: "Omar Haddad",
    initials: "OH",
    role: { en: "Team Lead", ar: "قائد الفريق" },
    isTeamLead: true,
    bio: {
      en: "Interested in full-stack development and leading teams to build meaningful projects. I enjoy working on scalable web applications, exploring new technologies, and helping others grow their skills in the field.",
      ar: "مهتم بتطوير الواجهات والخلفيات وقيادة الفرق لبناء مشاريع ذات أثر. أستمتع بالعمل على تطبيقات ويب قابلة للتوسع واستكشاف التقنيات الجديدة ومساعدة الآخرين على تطوير مهاراتهم.",
    },
    university: { en: "University of Jeddah", ar: "جامعة جدة" },
    major: { en: "Software Engineering", ar: "هندسة البرمجيات" },
    phone: "+966 55 987 6543",
    socialLinks: {
      github: "https://github.com/",
      linkedin: "https://www.linkedin.com/",
      website: "https://example.com/",
    },
  },
  {
    id: "m-3",
    name: "Sara Nasser",
    initials: "SN",
    role: { en: "Backend Developer", ar: "مطورة خلفيات" },
    isTeamLead: false,
    bio: {
      en: "Enjoys building scalable backend systems and learning new technologies. Focused on reliable services and thoughtful API design.",
      ar: "تستمتع ببناء أنظمة خلفية قابلة للتوسع وتعلّم تقنيات جديدة. تهتم بالخدمات الموثوقة وتصميم واجهات برمجية مدروسة.",
    },
    university: { en: "University of Jeddah", ar: "جامعة جدة" },
    major: { en: "Computer Science", ar: "علوم الحاسب" },
    phone: "+966 53 456 7890",
    socialLinks: {
      github: "https://github.com/",
      linkedin: "https://www.linkedin.com/",
      website: "https://example.com/",
    },
  },
  {
    id: "m-4",
    name: "Yazan Khalil",
    initials: "YK",
    role: { en: "UI Engineer", ar: "مهندس واجهات مستخدم" },
    isTeamLead: false,
    bio: {
      en: "Focused on user interface design and building engaging user experiences. Enjoys making complex workflows feel simple and intuitive.",
      ar: "يركز على تصميم واجهات المستخدم وبناء تجارب تفاعلية مميزة. يستمتع بتبسيط مسارات العمل المعقدة وجعلها سهلة وواضحة.",
    },
    university: { en: "University of Jeddah", ar: "جامعة جدة" },
    major: { en: "Information Technology", ar: "تقنية المعلومات" },
    phone: "+966 58 111 2222",
    socialLinks: {
      github: "https://github.com/",
      linkedin: "https://www.linkedin.com/",
      website: "https://example.com/",
    },
  },
];
