export type EventInfoData = {
  name: string;
  description: string;
  date: string;
  time: string;
  location: string;
  imageSrc: string;
  imageAlt: string;
  speaker?: {
    name: string;
    title: string;
    bio: string;
    imageSrc: string;
  };
  /** Speakers as the event creator typed them; real events have no speaker card. */
  speakersText?: string;
};

export const eventRegistrationMock: EventInfoData = {
  name: "كيف تدار البنية التحتية خلف الأنظمة التي تعتمد عليها كل يوم؟",
  description:
    "في هذه الورشة ستتعرف على ما هو NOC والفرق بينه وبين SOC، وأساليب نظام Nagios وإدارة الحوادث، وقراءة لوحة التحكم (Dashboard)، مع محاكاة وتطبيق عملي.",
  date: "Saturday , Sep12",
  time: "5:00 PM - 8:00 PM",
  location: "Wadi Jeddah",
  imageSrc: "/images/event-image.png",
  imageAlt: "Inside NOC event",
  speaker: {
    name: "د. فواز الحزيمي",
    title: "أستاذ مشارك بجامعة جدة",
    bio: "يمتلك خبرة تتجاوز 10 سنوات في مراكز البيانات والبنية التحتية للشبكات، وله أكثر من 50 بحث علمي.",
    imageSrc: "/images/speaker-image.png",
  },
};